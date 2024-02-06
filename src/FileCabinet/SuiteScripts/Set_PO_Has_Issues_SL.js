/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(
    [
        'N/record',
        'N/redirect',
        'N/ui/serverWidget',
        'N/search',
        'N/currentRecord'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_redirect} nsRedirect
     * @param {N_ui_serverWidget} nsUi
     */
    function (
        nsRecord,
        nsRedirect,
        nsUi,
        nsSearch,
        nsCurrentRecord
    ) {
        function onGet(context) {
            var url = context.request.parameters;
            var poId = url.custparam_recid;
            var invId = url.custparam_inv_id;
            var vendorId = url.custparam_vendor_id;
            var pdfId;
            var objForm;

            log.error('invId', invId);
            pdfId = nsSearch.lookupFields({
                type: 'customrecord_sw_abm_invoice_doc',
                id: invId,
                columns: ['custrecord_sw_abm_invoice_doc']
            });

            objForm = nsUi.createForm({ title: 'Set PO Has Issues' });
            objForm.addSubmitButton({
                label: 'Submit'
            });
            objForm.addField({ id: 'custpage_issue_comments', type: nsUi.FieldType.TEXTAREA, label: 'Has Issue Comments' }).defaultValue = '';
            log.debug('poId', poId);
            objForm.addField({
                id: 'custpage_issue_reason', type: nsUi.FieldType.MULTISELECT, source: 'customlist_order_has_issues_reason', label: 'ORDER HAS ISSUES REASON'
            });
            if (poId) {
                var poId_field = objForm.addField({ id: 'custpage_po_id', type: nsUi.FieldType.TEXT, label: 'PO ID' });
                poId_field.defaultValue = poId;
                poId_field.updateDisplayType({ displayType: 'HIDDEN' });
                var poText = nsSearch.lookupFields({ type: nsSearch.Type.PURCHASE_ORDER, id: poId, columns: ['tranid', 'custbody_associated_salesorder', 'custbody_product_offer_no'] });
                var poText_field = objForm.addField({ id: 'custpage_po_text', type: nsUi.FieldType.TEXT, label: 'Purchase Order ID' });
                var poTextDisplay = poText.custbody_associated_salesorder[0].text + ' - ' + poText.tranid;
                if (poText.custbody_product_offer_no) {
                    var poTextDisplay = poTextDisplay + ' - ' + poText.custbody_product_offer_no;
                }
                poText_field.defaultValue = poTextDisplay;
                poText_field.updateDisplayType({ displayType: 'INLINE' });
            } else {
                var poId_field = objForm.addField({ id: 'custpage_po_id', type: nsUi.FieldType.SELECT, label: 'Purchase Order ID' });
                var poSearch = nsSearch.create({ type: nsSearch.Type.PURCHASE_ORDER, filters: [['entity', 'is', vendorId], 'AND', ['mainline', 'is', 'T'], 'AND', ['status', 'anyof', 'PurchOrd:F', 'PurchOrd:E', 'PurchOrd:B', 'PurchOrd:D', 'PurchOrd:A']], columns: ['tranid', nsSearch.createColumn({ name: 'formulatext', formula: '(CASE WHEN (substr({custbody_associated_salesorder},14,2))=\'DO\' THEN ({custbody_product_offer_no} || \' - \') ELSE (substr({custbody_associated_salesorder} || \' - \',14)) END)', sort: nsSearch.Sort.ASC })] });
                var poSearchResults = poSearch.run().getRange({ start: 0, end: 1000 });
                if (poSearchResults.length != 0) {
                    poSearchResults.forEach(function (rec) {
                        poId_field.addSelectOption({
                            value: rec.id,
                            text: rec.getValue('formulatext') + rec.getValue('tranid')
                        });
                    });
                }
            }
            var pdfId_field = objForm.addField({ id: 'custpage_pdf_id', type: nsUi.FieldType.TEXT, label: 'Invoice ID' });
            pdfId_field.defaultValue = pdfId.custrecord_sw_abm_invoice_doc[0].value;
            pdfId_field.updateDisplayType({ displayType: 'HIDDEN' });

            // poRec = nsRecord.load({ type: nsRecord.Type.PURCHASE_ORDER, id: poId });
            context.response.writePage(objForm);
        }

        function onPost(context) {
            var request = context.request;
            var poId = request.parameters.custpage_po_id;
            var issueComments = request.parameters.custpage_issue_comments;
            var issueReasons = request.parameters.custpage_issue_reason.split('');
            var prevIssueReasons;
            var prevIssueComments;
            var pdfId = request.parameters.custpage_pdf_id;
            var poRec;
            var x;

            poRec = nsRecord.load({ type: nsRecord.Type.PURCHASE_ORDER, id: poId });
            prevIssueComments = poRec.getValue({
                fieldId: 'custbody_has_issues_comments'
            });
            prevIssueReasons = (poRec.getValue({
                fieldId: 'custbody_order_has_issues_reason'
            }));
            if (issueReasons[0] === '') {
                issueReasons = [];
            }
            log.debug('prevIssueReasons', prevIssueReasons);
            if (prevIssueReasons && prevIssueReasons[0]) {
                for (x = 0; x < prevIssueReasons.length; x += 1) {
                    if (issueReasons.indexOf(prevIssueReasons[x]) === -1) {
                        issueReasons.push(prevIssueReasons[x]);
                    }
                }
            }
            issueComments = issueComments + ' ' + prevIssueComments;
            poRec.setValue({
                fieldId: 'custbody_has_issues_comments',
                value: issueComments,
                ignoreFieldChange: true
            });
            poRec.setValue({
                fieldId: 'custbody_order_has_issues',
                value: true,
                ignoreFieldChange: true
            });
            log.debug('issueReasons', issueReasons);

            poRec.setValue({
                fieldId: 'custbody_order_has_issues_reason',
                value: issueReasons,
                ignoreFieldChange: true
            });
            nsRecord.attach({
                record: {
                    type: 'file',
                    id: pdfId
                },
                to: {
                    type: 'purchaseorder',
                    id: poId
                }
            });

            poRec.save({
                enableSourcing: false,
                ignoreMandatoryFields: true
            });

            nsRedirect.toRecord({
                type: nsRecord.Type.PURCHASE_ORDER,
                id: poId,
                isEditMode: false
            });
        }

        /**
        * @param {SuiteletContext.onRequest} context
        */
        function onRequest(context) {
            if (context.request.method === 'GET') {
                onGet(context);
            } else {
                onPost(context);
            }

        }
        return {
            onRequest: onRequest
        };
    }
);
