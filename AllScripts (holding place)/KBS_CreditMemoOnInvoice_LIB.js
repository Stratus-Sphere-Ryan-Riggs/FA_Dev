/**
 * KBS_CreditMemoOnInvoice_LIB.js
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 *
 * Developer Notes:
 * Created a new custom field in the invoice record, to store the credit memo number and amount that is related to the invoice.
 * The custom field name is “Credit Memo Json Obj”, which is of Free Form Type, Display Type is Disabled, and this field is shown at
 * the System Information tab of the invoice..
 */
define(
    [
        'N/record',
        'N/search',
        './KBS_MODULE'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_search} nsSearch
     * @param {KBS_MODULE} kbsMod
     */
    function (
        nsRecord,
        nsSearch,
        kbsMod
    ) {

        /**
         * @param {UserEventContext.afterSubmit} context
         */
        function getInvoiceIds(context) {
            var newRec = context.newRecord;
            var oldRec = context.oldRecord;
            var type = context.type;
            var invcIds = [];
            var applyLen;
            var apply;
            var curId;
            var i;

            if (type !== context.UserEventType.CREATE) {
                applyLen = oldRec.getLineCount({
                    sublistId: 'apply'
                });

                for (i = 0; i < applyLen; i += 1) {
                    apply = oldRec.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'apply',
                        line: i
                    });

                    if (apply === true) {
                        curId = oldRec.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'internalid',
                            line: i
                        });

                        if (curId && invcIds.indexOf(curId) < 0) {
                            invcIds.push(curId);
                        }
                    }
                }
            }

            // Now add invoice id's from the newRecord;
            applyLen = newRec.getLineCount({
                sublistId: 'apply'
            });

            for (i = 0; i < applyLen; i += 1) {
                apply = newRec.getSublistValue({
                    sublistId: 'apply',
                    fieldId: 'apply',
                    line: i
                });
                if (apply === true) {
                    curId = newRec.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'internalid',
                        line: i
                    });

                    if (curId && invcIds.indexOf(curId) < 0) {
                        invcIds.push(curId);
                    }
                }
            }

            return invcIds;
        }

        /**
         * @param {Number} invId
         */
        function updateInvoiceCreditMemoData(invId) {
            var search;
            var cmFieldVal;
            var pmntObj = {
                creditMemoPymnts: []
            };

            search = nsSearch.create({
                type: 'invoice',
                filters: [
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['internalid', 'anyof', invId.toString()],
                    'AND',
                    ['applyingtransaction.type', 'anyof', 'CustCred'], // Limits results to only Credit Memos
                    'AND',
                    ['applyinglinkamount', 'greaterthan', '0.00']
                ],
                columns: [
                    'applyinglinkamount',
                    nsSearch.createColumn({
                        name: 'tranid',
                        join: 'applyingtransaction'
                    })
                ]
            });

            kbsMod.searchForEachResult(search, function (result) {
                var cmData = {
                    tranid: result.getValue({
                        name: 'tranid',
                        join: 'applyingtransaction'
                    }),
                    amount: parseFloat(result.getValue('applyinglinkamount'))
                };

                pmntObj.creditMemoPymnts.push(cmData);
            });

            // If credit memo data was found, stringify the object so it can be set in the field.
            // If none was found, set value empty.
            if (pmntObj.creditMemoPymnts.length > 0) {
                cmFieldVal = JSON.stringify(pmntObj);
            } else {
                cmFieldVal = '';
            }

            nsRecord.submitFields({
                type: 'invoice',
                id: invId,
                values: {
                    custbody_kbs_credit_memo_json_obj: cmFieldVal
                },
                options: {
                    enablesourcing: true,
                    ignoreMandatoryFields: true
                }
            });
        }

        return {
            getInvoiceIds: getInvoiceIds,
            updateInvoiceCreditMemoData: updateInvoiceCreditMemoData
        };
    }
);
