/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(
    [
        'N/record',
        'N/task',
        'N/redirect'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_task} nsTask
     * @param {N_redirect} nsRedirect
     */
    function (
        nsRecord,
        nsTask,
        nsRedirect
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
            var ssTask;

            soRec = nsRecord.load({ type: 'salesorder', id: soId });
            soRec.setValue({ fieldId: 'custbody_order_status', value: '3' });
            tranId = soRec.getValue({ fieldId: 'tranid' });
            lineCount = soRec.getLineCount({ sublistId: 'item' });
            for (x = 0; x < lineCount; x += 1) {
                soRec.setSublistValue({
                    sublistId: 'item', fieldId: 'custcol_item_status_field', line: x, value: '4'
                });
            }
          	log.debug('Sales order status->'+soRec.getValue('status'));
            if (soRec.getValue('status') === 'Pending Fulfillment') {
                for (x = 0; x < lineCount; x += 1) {
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
            ssTask = nsTask.create({
                taskType: nsTask.TaskType.SCHEDULED_SCRIPT,
                scriptId: 'customscript_fa_ss_update_so_related_rec',
                deploymentId: 'customdeploy_sch_update_relatedrecords',
                params: param
            });
            ssTask.submit();
            param = {
                custscript_transtype: 'salesorder',
                custscript_transintid: soId,
                custscript_transid: tranId
            };
            ssTask = nsTask.create({
                taskType: nsTask.TaskType.SCHEDULED_SCRIPT,
                scriptId: 'customscript_scheduled_order_email_trigg',
                deploymentId: 'customdeploy_scheduled_trigger',
                params: param
            });
            ssTask.submit();
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
