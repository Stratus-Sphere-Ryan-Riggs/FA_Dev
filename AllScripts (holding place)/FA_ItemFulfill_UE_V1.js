/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(
    [
        'N/record',
        'N/search',
        'N/runtime',
        'N/task'
    ],
    function (
        nsRecord,
        nsSearch,
        nsRuntime,
        nsTask
    ) {

        // /**
        // * @param {UserEventContext.beforeLoad} context
        // */
        // function beforeLoad(context) {
        //
        // }

        // /**
        // * @param {UserEventContext.beforeSubmit} context
        // */
        // function beforeSubmit(context) {
        //
        // }

        /**
         * @param {UserEventContext.afterSubmit} context
         */
        function afterSubmit(context) {
            var type = context.type;
            log.debug('Context type=',type);
            try {
                // Only enter if type is create, edit or delete
                if (type === context.UserEventType.CREATE || type === context.UserEventType.EDIT || type === context.UserEventType.DELETE) {
                    
                    var rec = context.newRecord;
                    var adminFeeAmt = rec.getValue('custbody_admin_fees');
                    log.debug('adminFeeAmt=',adminFeeAmt);
                    if(adminFeeAmt!=0.00){
                        var soId = rec.getValue('createdfrom');
                        log.debug('soId=',soId);
                      	var tranid = '';
                        if(type === context.UserEventType.EDIT){
                          tranid = rec.getValue('tranid');
                        }
                        param = {
                            custscript_produce_adm_fee_so: soId,
                          	custscript_item_fulfill_id: tranid
                        };
                        ssTask = nsTask.create({
                            taskType: nsTask.TaskType.SCHEDULED_SCRIPT,
                            scriptId: 'customscript_produce_admin_fee_po',
                            deploymentId: 'customdeploy_produce_adm_fee_po',
                            params: param
                        });
                        ssTask.submit();
                    }
                }
            } catch (ex) {
                log.error(ex.name, JSON.stringify(ex));
            }
        }

        return {
            // beforeLoad: beforeLoad,
            // beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    }
);
