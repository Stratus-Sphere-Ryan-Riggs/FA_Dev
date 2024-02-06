/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/task'], function(task) {
    function onAction(scriptContext){
        var newRecord = scriptContext.newRecord;
		var order_status = newRecord.getValue({fieldId:'custbody_order_status'});
		var RecType = "SalesOrd";//newRecord.type;
		var RecId = newRecord.id;
      	log.error({
            title: 'order_status@RecType@RecId',
          	details:order_status+"@"+RecType+"@"+RecId
        });
   
		var mrTask = task.create({
			taskType: task.TaskType.SCHEDULED_SCRIPT,
			scriptId: 282,
			//deploymentId: 'customdeploy1',
			params: {
				custscript_opp_trans_type: RecType,
				custscript_opp_trans_internal_id:RecId,
				custscript_modified_order_status:order_status,
				custscript_opp_email_sent_from:''
			}
		});
		mrTask.submit();
    }
    return {
        onAction: onAction
    }
}); 

        
