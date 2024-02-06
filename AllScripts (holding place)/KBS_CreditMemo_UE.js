/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(
    [
        './KBS_CreditMemoOnInvoice_LIB'
    ],
    function (
        cmOnInvLib
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
            var invIds = [];
            var i;

            try {
                // Only enter if type is create, edit or delete
                if (type === context.UserEventType.CREATE || type === context.UserEventType.EDIT || type === context.UserEventType.DELETE) {
                    // Loop through the apply sublist to find all invoice id's that are or were associated to this credit memo
                    invIds = cmOnInvLib.getInvoiceIds(context);
                    log.debug('invIds', invIds);

                    if (invIds.length > 0) {
                        for (i = 0; i < invIds.length; i += 1) {
                            cmOnInvLib.updateInvoiceCreditMemoData(invIds[i]);
                        }
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
