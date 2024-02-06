/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(
    [
        'N/record',
        'N/task',
        'N/redirect',
        './KBS_ScriptScheduler_2'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_task} nsTask
     * @param {N_redirect} nsRedirect
     */
    function (
        nsRecord,
        nsTask,
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
            var ssTask;
            var taskId;
            var status;

            soRec = nsRecord.load({ type: 'salesorder', id: soId });
            soRec.setValue({ fieldId: 'custbody_order_status', value: '3' });
          	tranId = soRec.getValue({fieldId:'tranid'});
            lineCount = soRec.getLineCount({ sublistId: 'item' });
            status = soRec.getValue('status');
            for (x = 0; x < lineCount; x += 1) {
                soRec.setSublistValue({
                    sublistId: 'item', fieldId: 'custcol_item_status_field', line: x, value: '4'
                });
            }
            if (status === 'Pending Fulfillment') {
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
            scriptScheduler.schedule(param, 'customscript_ss_related_rec', 'SCHEDULED_SCRIPT');
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
          ssTask2 = nsTask.create({
                taskType: nsTask.TaskType.SCHEDULED_SCRIPT,
                scriptId: 'customscript_scheduled_order_email_trigg',
                deploymentId: 'customdeploy_scheduled_trigger_2',
                params: param
            });
          ssTask3 = nsTask.create({
                taskType: nsTask.TaskType.SCHEDULED_SCRIPT,
                scriptId: 'customscript_scheduled_order_email_trigg',
                deploymentId: 'customdeploy_scheduled_trigger_3',
                params: param
            });
          ssTask4 = nsTask.create({
                taskType: nsTask.TaskType.SCHEDULED_SCRIPT,
                scriptId: 'customscript_scheduled_order_email_trigg',
                deploymentId: 'customdeploy_scheduled_trigger_4',
                params: param
            });
          ssTask5 = nsTask.create({
                taskType: nsTask.TaskType.SCHEDULED_SCRIPT,
                scriptId: 'customscript_scheduled_order_email_trigg',
                deploymentId: 'customdeploy_scheduled_trigger_5',
                params: param
            });
           try{
           		taskId = ssTask.submit();
           	}catch(e){
             try{
               taskId = ssTask2.submit();
             }catch(e){
               try{
               		taskId = ssTask3.submit();
             	}catch(e){
               		try{
               			taskId = ssTask4.submit();
             		}catch(e){
               			try{
               				taskId = ssTask5.submit();
             			}catch(e){
               				log.debug('ERROR',e);
             			}
             		}
             	}
             }
           }
          log.debug(nsTask.checkStatus(taskId));
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
