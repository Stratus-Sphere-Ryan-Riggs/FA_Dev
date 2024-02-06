/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search', 'N/url', 'N/redirect', 'N/record'],
    /**
     * @param {N_ui_serverWidget} serverWidget
     * @param {N_search} search
     * @param {N_url} url
     * @param {N_redirect} nsRedirect
     * @param {N_record} nsRecord
     */
    function (serverWidget, search, url, nsRedirect, nsRecord) {
        function programApproverAddSelectOptions(programId, programApproverField) {
            var secondaryBudgetName;
            var secondaryBudgetId;
            var x;
            var departmentSearchObj = search.create({
                type: 'department',
                filters:
                [
                    ['internalid', 'anyof', programId]
                ],
                columns:
                [
                    search.createColumn({ name: 'custrecord_kbs_secondarybudgetowner', label: 'Seconday Budget Owners' })
                ]
            });
            var searchResultCount = departmentSearchObj.runPaged().count;
            log.debug('departmentSearchObj result count', searchResultCount);
            departmentSearchObj.run().each(function (result) {
                secondaryBudgetId = result.getValue({ name: 'custrecord_kbs_secondarybudgetowner' }).split(',');
                secondaryBudgetName = result.getText({ name: 'custrecord_kbs_secondarybudgetowner' }).split(',');
                // log.debug('secondaryBudgetId', secondaryBudgetId + ' length ' + secondaryBudgetId.length);
                // log.debug('secondaryBudgetName', secondaryBudgetName);
                if (secondaryBudgetId.length > 0) {
                    programApproverField.addSelectOption({
                        value: '',
                        text: ''
                    });
                }
                for (x = 0; x < secondaryBudgetId.length; x += 1) {
                    programApproverField.addSelectOption({
                        value: secondaryBudgetId[x],
                        text: secondaryBudgetName[x]
                    });
                }
                // .run().each has a limit of 4,000 results
                return false;
            });

            /*
             departmentSearchObj.id="customsearch1685464102664";
             departmentSearchObj.title="DB Temp for Suitelet Program Search (copy)";
             var newSearchId = departmentSearchObj.save();
             */
        }
        function doPost(context) {
            var parameters = context.request.parameters;
            var fieldsToMap = {};
            var customRec;
            var customRecId;
            var nameString;
            var fileObj;
            var fileId;
            var lineCount;
            var x;
            var lineAmount;
            var line;
            var amountFieldPrefix = 'custrecord_pobillapproval_lineba';
            var lineFiledPrefix = 'custrecord_pobillapproval_line';
            var amountField;
            var lineField;
            var suffix;

            lineCount = context.request.getLineCount({ group: 'custpage_linesublist' });
            log.debug('lineCount', lineCount);
            for (x = 0; x < lineCount; x += 1) {
                lineAmount = context.request.getSublistValue({ group: 'custpage_linesublist', name: 'custpage_new_bill_amount', line: x });
                line = context.request.getSublistValue({ group: 'custpage_linesublist', name: 'custpage_line', line: x });
                if (lineAmount) {
                    suffix = x + 1;
                    amountField = amountFieldPrefix + suffix;
                    lineField = lineFiledPrefix + suffix;
                    log.debug('amountField', amountField);
                    log.debug('lineField', lineField);
                    fieldsToMap[amountField] = lineAmount;
                    fieldsToMap[lineField] = line;
                }
            }
            nameString = parameters.custpage_selectedpo + '-' + parameters.custpage_vendor_invoice_number;

            fileObj = context.request.files.custpage_new_bill_attachment;
            fileObj.folder = 13280031;
            fileId = fileObj.save();
            log.debug('fileId', fileId);
            customRec = nsRecord.create({
                type: 'customrecord_kbs_contractpobillapproval'
            });

            fieldsToMap.custrecord_pobillapproval_program = parameters.custpage_program;
            fieldsToMap.custrecord_pobillapproval_programapprove = parameters.custpage_program_approver;
            fieldsToMap.custrecord_pobillapproval_vendor = parameters.custpage_vendor;
            fieldsToMap.custrecord_pobillapproval_pototal = parameters.custpage_po_amount;
            fieldsToMap.custrecord_pobillapproval_poamtremaing = parameters.custpage_po_amount_remaining;
            fieldsToMap.custrecord_pobillapproval_amtbilled = parameters.custpage_po_amount_billed;
            fieldsToMap.custrecord_pobillapproval_billnotes = parameters.custpage_new_bill_notes;
            fieldsToMap.custrecord_pobillapproval_venbillnum = parameters.custpage_vendor_invoice_number;
            fieldsToMap.custrecord_pobillapproval_billpdf = fileId;
            fieldsToMap.custrecord_pobillapproval_billamt = parameters.custpage_header_bill_amount;
            fieldsToMap.custrecord_pobillapproval_nspo = parameters.custpage_selectedpo;
            fieldsToMap.name = nameString;

            // fieldsToMap.custrecord_pobillapproval_approvalstatus
            // fieldsToMap.custrecord_pobillapproval_yesno
            // fieldsToMap.custrecord_pobillapproval_approvalnotes

            Object.keys(fieldsToMap).forEach(function (field) {
                if (fieldsToMap[field]) {
                    log.debug('field', field);
                    log.debug('value', fieldsToMap[field]);
                    customRec.setValue({ fieldId: field, value: fieldsToMap[field] });
                }
            });
            customRecId = customRec.save();
            log.debug('fieldsToMap', fieldsToMap);
            log.debug('Created new custom record', 'customRecId' + customRecId);
            nsRedirect.toRecord({
                type: 'customrecord_kbs_contractpobillapproval',
                id: customRecId
            });




            // nsRedirect.toSuitelet({
            //     scriptId: 'customscript_kbs_eccontractsl2',
            //     deploymentId: 'customdeploy_kbs_eccontractsl2'
            // });
        }
        function addLineSublistFields(lineSublist) {
            var newBillAmountField;
            lineSublist.addField({
                id: 'custpage_account',
                type: serverWidget.FieldType.TEXT,
                label: 'Account'
            });
            lineSublist.addField({
                id: 'custpage_line',
                type: serverWidget.FieldType.TEXT,
                label: 'Line'
            });
            lineSublist.addField({
                id: 'custpage_amount',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Amount'
            });
            lineSublist.addField({
                id: 'custpage_rate',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Rate'
            });
            lineSublist.addField({
                id: 'custpage_amount_billed',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Amount Billed'
            });
            lineSublist.addField({
                id: 'custpage_amount_remaining',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Amount Remaining'
            });
            newBillAmountField = lineSublist.addField({
                id: 'custpage_new_bill_amount',
                type: serverWidget.FieldType.CURRENCY,
                label: 'New Bill Amount'
            });
            newBillAmountField.updateDisplayType({ displayType: 'ENTRY' });
            lineSublist.addField({
                id: 'custpage_linememo',
                type: serverWidget.FieldType.TEXT,
                label: 'Memo'
            });
            lineSublist.addField({
                id: 'custpage_program',
                type: serverWidget.FieldType.TEXT,
                label: 'Program (no hierarchy)'
            });
            lineSublist.addField({
                id: 'custpage_restclass',
                type: serverWidget.FieldType.TEXT,
                label: 'Restriction Class (no hierarchy)'
            });
            lineSublist.addField({
                id: 'custpage_fund',
                type: serverWidget.FieldType.TEXT,
                label: 'Fund (no hierarchy)'
            });
        }

        function populateLineSublist(lineSublist, selectedPOId) {
            var i = 0;
            var totalAmt = 0;
            var totalAmtBilled = 0;
            var totalAmtRemaining = 0;
            var purchaseorderSearchObj = search.create({
                type: 'purchaseorder',
                filters:
                [
                    ['type', 'anyof', 'PurchOrd'],
                    'AND',
                    ['mainline', 'is', 'F'],
                    'AND',
                    ['internalidnumber', 'equalto', selectedPOId]
                ],
                columns:
                [
                    search.createColumn({ name: 'account', label: 'Account' }),
                    search.createColumn({ name: 'amount', label: 'Amount' }),
                    search.createColumn({
                        name: 'formulanumeric',
                        formula: '{rate}',
                        label: 'Rate'
                    }),
                    search.createColumn({
                        name: 'formulanumeric2',
                        formula: '{quantitybilled}*{rate}',
                        label: 'Amount Billed'
                    }),
                    search.createColumn({
                        name: 'formulanumeric3',
                        formula: '{amount}-({quantitybilled}*{rate})',
                        label: 'Amount Remaining'
                    }),
                    // search.createColumn({ name: 'formulanumeric', label: 'NEW BILL AMOUNT' }),
                    search.createColumn({ name: 'memo', label: 'Memo' }),
                    search.createColumn({ name: 'departmentnohierarchy', label: 'Program (no hierarchy)' }),
                    search.createColumn({ name: 'classnohierarchy', label: 'Restriction Class (no hierarchy)' }),
                    search.createColumn({ name: 'locationnohierarchy', label: 'Fund (no hierarchy)' }),
                    search.createColumn({ name: 'line', label: 'Line' })
                ]
            });
            var searchResultCount = purchaseorderSearchObj.runPaged().count;
            log.debug('purchaseorderSearchObj result count', searchResultCount);
            purchaseorderSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                var account = result.getText({ name: 'account' });
                var amount = result.getValue({ name: 'amount' });
                var rate = result.getValue({ name: 'formulanumeric', formula: '{rate}' });
                var amountBilled = result.getValue({ name: 'formulanumeric2', formula: '{quantitybilled}*{rate}' });
                var amountRemaining = result.getValue({ name: 'formulanumeric3', formula: '{amount}-({quantitybilled}*{rate})' });
                // var newBillAmount = result.getValue({ name: 'formulanumeric' });
                var resultMemo = result.getValue({ name: 'memo' }) || '';
                var program = result.getText({ name: 'departmentnohierarchy' }) || '';
                var restrictionClass = result.getText({ name: 'classnohierarchy' }) || '';
                var fund = result.getText({ name: 'locationnohierarchy' }) || '';
                var line = result.getValue({ name: 'line' });

                totalAmt += parseFloat(amount);
                totalAmtBilled += parseFloat(amountBilled);
                totalAmtRemaining += parseFloat(amountRemaining);

                lineSublist.setSublistValue({
                    id: 'custpage_account',
                    line: i,
                    value: account || null
                });
                lineSublist.setSublistValue({
                    id: 'custpage_amount',
                    line: i,
                    value: amount || null
                });
                lineSublist.setSublistValue({
                    id: 'custpage_rate',
                    line: i,
                    value: rate || null
                });
                lineSublist.setSublistValue({
                    id: 'custpage_amount_billed',
                    line: i,
                    value: amountBilled || null
                });
                lineSublist.setSublistValue({
                    id: 'custpage_amount_remaining',
                    line: i,
                    value: amountRemaining || null
                });
                // log.debug('resultMemo', resultMemo);
                lineSublist.setSublistValue({
                    id: 'custpage_linememo',
                    line: i,
                    value: resultMemo || null
                });
                lineSublist.setSublistValue({
                    id: 'custpage_program',
                    line: i,
                    value: program || null
                });
                lineSublist.setSublistValue({
                    id: 'custpage_restclass',
                    line: i,
                    value: restrictionClass || null
                });
                lineSublist.setSublistValue({
                    id: 'custpage_fund',
                    line: i,
                    value: fund || null
                });
                lineSublist.setSublistValue({
                    id: 'custpage_line',
                    line: i,
                    value: line || null
                });

                i += 1;
                return true;
            });

            /*
             purchaseorderSearchObj.id="customsearch1689349451135";
             purchaseorderSearchObj.title="Add New Bill to Existing PO Contract - Purchase Order Line Sublist (copy)";
             var newSearchId = purchaseorderSearchObj.save();
             */
            return { totalAmt: totalAmt, totalAmtBilled: totalAmtBilled, totalAmtRemaining: totalAmtRemaining };
        }
        function onRequest(context) {
            var vendorIdValue;
            var form;
            var sublist;
            var vendorId;
            var poSearch;
            var searchResult;
            var i;
            var recordId;
            var recordUrl;
            var amountUnbilled;
            var programField;
            var programId;
            var programApproverField;
            var approverId;
            var poNum;
            var selectedPOfield;
            var lineSublist;
            var selectedPOId;
            var amtField;
            var amtRemainingField;
            var amtBilledField;
            var newBillAmountField;
            var headerDataObj;

            if (context.request.method === 'POST') {
                doPost(context);
            } else {
                selectedPOId = context.request.parameters.custparam_selectedpo;
                form = serverWidget.createForm({
                    title: 'Add New Bill to Existing PO Contract'
                });
                // Fields from Suitelet Field Mapping
                form.addFieldGroup({
                    id: 'custpage_lookupsection',
                    label: 'Vendor Contract Lookup Section'
                });
                form.addFieldGroup({
                    id: 'custpage_addsection',
                    label: 'Add New Bill Section'
                });
                programField = form.addField({
                    id: 'custpage_program',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Program',
                    source: 'department',
                    container: 'custpage_lookupsection'
                });
                programField.isMandatory = true;
                programId = context.request.parameters.custparam_program;
                if (programId) {
                    programField.defaultValue = programId;
                }
                programApproverField = form.addField({
                    id: 'custpage_program_approver',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Program Approver',
                    container: 'custpage_lookupsection'
                });
                programApproverField.isMandatory = true;
                if (programId) {
                    programApproverAddSelectOptions(programId, programApproverField);
                }
                approverId = context.request.parameters.custparam_approver;
                if (approverId) {
                    programApproverField.defaultValue = approverId;
                }
                vendorId = form.addField({
                    id: 'custpage_vendor',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Vendor',
                    source: 'vendor',
                    container: 'custpage_lookupsection'
                });
                vendorId.isMandatory = true;
                amtField = form.addField({
                    id: 'custpage_po_amount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'PO Amount',
                    container: 'custpage_lookupsection'
                }).updateDisplayType({ displayType: 'INLINE' });
                amtRemainingField = form.addField({
                    id: 'custpage_po_amount_remaining',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'PO Amount Remaining',
                    container: 'custpage_lookupsection'
                }).updateDisplayType({ displayType: 'INLINE' });

                amtBilledField = form.addField({
                    id: 'custpage_po_amount_billed',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'PO Amount Billed',
                    container: 'custpage_lookupsection'
                }).updateDisplayType({ displayType: 'INLINE' });
                selectedPOfield = form.addField({
                    id: 'custpage_selectedpo',
                    type: serverWidget.FieldType.SELECT,
                    source: 'purchaseorder',
                    label: 'Selected Purchase Order',
                    container: 'custpage_lookupsection'
                });
                selectedPOfield.isMandatory = true;
                selectedPOfield.updateDisplayType({ displayType: 'DISABLED' });
                if (selectedPOId) {
                    selectedPOfield.defaultValue = selectedPOId;
                }
                form.addField({
                    id: 'custpage_otherrefnum',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Vendor PO#',
                    container: 'custpage_lookupsection'
                }).updateDisplayType({ displayType: 'INLINE' });
                form.addField({
                    id: 'custpage_new_bill_attachment',
                    type: serverWidget.FieldType.FILE,
                    label: 'New Bill Attachment'
                }).isMandatory = true;
                // form.addField({
                //     id: 'custpage_new_bill_amount',
                //     type: serverWidget.FieldType.CURRENCY,
                //     label: 'New Bill Amount',
                //     container: 'custpage_addsection'
                // }).isMandatory = true;
                form.addField({
                    id: 'custpage_new_bill_notes',
                    type: serverWidget.FieldType.TEXTAREA,
                    label: 'New Bill Notes',
                    container: 'custpage_addsection'
                }).isMandatory = true;
                form.addField({
                    id: 'custpage_vendor_invoice_number',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Vendor Invoice #',
                    container: 'custpage_addsection'
                }).isMandatory = true;
                newBillAmountField = form.addField({
                    id: 'custpage_header_bill_amount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'New Bill Amount',
                    container: 'custpage_addsection'
                });
                newBillAmountField.updateDisplayType({ displayType: 'INLINE' });
                // Create a sublist to hold the search results
                sublist = form.addSublist({
                    id: 'custpage_sublist',
                    type: serverWidget.SublistType.LIST,
                    label: 'Open Purchase Orders'
                });
                // Add a checkbox field as the first field in the sublist
                sublist.addField({
                    id: 'custpage_selectpo',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Select PO'
                });
                // Add a field for the hyperlink to the Purchase Order record
                sublist.addField({
                    id: 'viewpo',
                    type: serverWidget.FieldType.TEXT,
                    label: 'View PO'
                });
                // Add other fields to the sublist
                sublist.addField({
                    id: 'internalid',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Internal ID'
                }).updateDisplayType({ displayType: 'HIDDEN' });
                sublist.addField({
                    id: 'tranid',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Document Number'
                });
                sublist.addField({
                    id: 'otherrefnum',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Vendor PO#'
                });
                sublist.addField({
                    id: 'trandate',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date'
                });
                sublist.addField({
                    id: 'custpage_amount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Amount'
                });
                sublist.addField({
                    id: 'fxamountunbilled',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Amount Unbilled'
                });
                sublist.addField({
                    id: 'amountbilled',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Amount Billed'
                });

                form.addTab({
                    id: 'tabid',
                    label: 'Tab'
                });
                // Create a second sublist to hold the search results
                lineSublist = form.addSublist({
                    id: 'custpage_linesublist',
                    type: serverWidget.SublistType.LIST,
                    tab: 'tabid',
                    label: 'Purchase Order Line Sublist'
                });
                // add line sublist fields
                addLineSublistFields(lineSublist);
                if (selectedPOId) {
                    headerDataObj = populateLineSublist(lineSublist, selectedPOId);
                    amtField.defaultValue = headerDataObj.totalAmt;
                    amtRemainingField.defaultValue = headerDataObj.totalAmtRemaining;
                    amtBilledField.defaultValue = headerDataObj.totalAmtBilled;
                }
                // Create Submit button
                form.addSubmitButton({
                    label: 'Submit'
                });
                // Add client script file reference here. Replace with your own script file id.
                form.clientScriptModulePath = 'SuiteScripts/KBS_EmployeeCtrContract_CS.js';

                vendorIdValue = context.request.parameters.custparam_vendor;
                log.debug('vendorIdValue: ', vendorIdValue);
                if (vendorIdValue) {
                    vendorId.defaultValue = vendorIdValue; // Set the vendorId field value

                    // Perform a search to find the open purchase orders for the selected vendor
                    poSearch = search.create({
                        type: search.Type.PURCHASE_ORDER,
                        filters: [
                            ['status', 'anyof', 'PurchOrd:A', 'PurchOrd:B', 'PurchOrd:F', 'PurchOrd:E', 'PurchOrd:D'], // Open Purchase Orders
                            'and',
                            ['mainline', 'is', 'T'],
                            'and',
                            ['entity', 'anyof', vendorIdValue]
                        ],
                        columns: ['internalid', 'tranid', 'trandate', 'amount', 'fxamountunbilled', 'memomain', 'otherrefnum']
                    });
                    searchResult = poSearch.run().getRange({ start: 0, end: 1000 });

                    if (searchResult.length > 0) {
                        // Update the sublist with the search results
                        for (i = 0; i < searchResult.length; i += 1) {
                            poNum = searchResult[i].getValue('otherrefnum');
                            recordId = searchResult[i].getValue('internalid');
                            if (selectedPOId === recordId) {
                                sublist.setSublistValue({
                                    id: 'custpage_selectpo',
                                    line: i,
                                    value: 'T'
                                });
                            }
                            // var tranid = searchResult[i].getValue('tranid');
                            recordUrl = url.resolveRecord({
                                recordType: 'purchaseorder',
                                recordId: recordId
                            });

                            sublist.setSublistValue({
                                id: 'viewpo',
                                line: i,
                                value: '<a href="' + recordUrl + '" target="_blank">View PO</a>'
                            });
                            sublist.setSublistValue({
                                id: 'internalid',
                                line: i,
                                value: recordId
                            });
                            sublist.setSublistValue({
                                id: 'tranid',
                                line: i,
                                value: searchResult[i].getValue('tranid')
                            });
                            // log.debug('poNum: ', poNum);
                            if (poNum) {
                                sublist.setSublistValue({
                                    id: 'otherrefnum',
                                    line: i,
                                    value: poNum
                                });
                            }
                            sublist.setSublistValue({
                                id: 'trandate',
                                line: i,
                                value: searchResult[i].getValue('trandate')
                            });
                            sublist.setSublistValue({
                                id: 'custpage_amount',
                                line: i,
                                value: searchResult[i].getValue('amount')
                            });
                            amountUnbilled = Math.abs(searchResult[i].getValue('fxamountunbilled'));
                            sublist.setSublistValue({
                                id: 'fxamountunbilled',
                                line: i,
                                value: amountUnbilled
                            });
                            sublist.setSublistValue({
                                id: 'amountbilled',
                                line: i,
                                value: searchResult[i].getValue('amount') - Math.abs(searchResult[i].getValue('fxamountunbilled'))
                            });
                        }
                    }
                }

                context.response.writePage(form);
            }
        }

        return {
            onRequest: onRequest
        };
    });
