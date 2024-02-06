/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(
    [
        './KBS_CreditMemoOnInvoice_LIB'
    ],
    function (
        cmOnInvLib
    ) {

        /**
        * @param {UserEventContext.beforeLoad} context
        */
        function beforeLoad(context) {
            var newRec = context.newRecord;
            var type = context.type;
            log.debug('type: ' + type);
            if (type === context.UserEventType.COPY) {
                newRec.setValue('custbody_kbs_credit_memo_json_obj', ''); // reset credit memo json field during invoice copy
            }
        }

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
            var newRec = context.newRecord;
            var type = context.type;
            var cmObjVal;

            try {
                // Should only run for Edit context.
                if (type === context.UserEventType.EDIT) {
                    cmObjVal = newRec.getValue('custbody_kbs_credit_memo_json_obj');

                    if (!cmObjVal) {
                        cmOnInvLib.updateInvoiceCreditMemoData(newRec.id);
                    }
                }

            } catch (ex) {
                log.error(ex.name, JSON.stringify(ex));
            }
        }

        return {
            beforeLoad: beforeLoad,
            // beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    }
);
