/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(
    [
        'N/record',
        'N/redirect',
        './KBS_ScriptScheduler_2'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_redirect} nsRedirect
     */
    function (
        nsRecord,
        nsRedirect,
        scriptScheduler
    ) {

        /**
        * @param {SuiteletContext.onRequest} context
        */
        function onRequest(context) {
            var url = context.request.parameters;
            var soId = url.custpage_soid;
            var soRec;
            var tranId;
            var lineCount;
            var x;
            var param;
            var status;

            soRec = nsRecord.load({ type: 'salesorder', id: soId });
            soRec.setValue({ fieldId: 'custbody_order_status', value: '3' });
            tranId = soRec.getValue({ fieldId: 'tranid' });
            lineCount = soRec.getLineCount({ sublistId: 'item' });
            status = soRec.getValue('status');
            for (x = 0; x < lineCount; x += 1) {
                soRec.setSublistValue({
                    sublistId: 'item', fieldId: 'custcol_item_status_field', line: x, value: '4'
                });
                if (status === 'Pending Fulfillment') {
                    soRec.setSublistValue({
                        sublistId: 'item', fieldId: 'isclosed', line: x, value: true
                    });
                }
            }
            soRec.save();
            param = {
                custscript_idsalesorder: soId,
                custscript_is_cancelled: true
            };
            scriptScheduler.schedule(param, 'customscript_ss_related_rec', 'SCHEDULED_SCRIPT');

            param = {
                custscript_transtype: 'salesorder',
                custscript_transintid: soId,
                custscript_transid: tranId
            };
            // customscript_ss_order_email
            scriptScheduler.schedule(param, 'customscript_ss_order_email', 'SCHEDULED_SCRIPT');

            nsRedirect.toRecord({
                type: 'salesorder',
                id: soId,
                isEditMode: false
            });
        }
        return {
            onRequest: onRequest
        };
    }
);
