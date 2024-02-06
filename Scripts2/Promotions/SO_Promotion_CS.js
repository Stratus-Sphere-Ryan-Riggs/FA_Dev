/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(
    [
        'N/ui/dialog'
    ],
    /**
     * @param {N_ui_dialog} nsDialog
     */
    function (
        nsDialog
    ) {

        /**
        * @param {ClientScriptContext.pageInit} context
        */
        // function pageInit(context) {
        //     var rec = context.currentRecord;
        //     var type = context.mode;

        //     if ((type === 'copy' || type === 'create')) {
        //         // Add promotions to SO for related Campaign if there is an order type
        //         if (rec.getValue('custbody_order_type')) {
        //             kbsApplyPromo.applyPromotionsClient(rec);
        //         }
        //     }
        // }

        /**
         * Function to be executed when field is changed.
         *
         * @param {ClientScriptContext.fieldChanged} context
         */
        function fieldChanged(context) {
            var currentRecord = context.currentRecord;
            var sublistFieldId = context.fieldId;
            var lineCount;

            if (sublistFieldId === 'entity') {
                lineCount = currentRecord.getLineCount({
                    sublistId: 'promotions'
                });
                if (lineCount > 0) {
                    nsDialog.alert({ title: 'Cannot Change Customer', message: 'Cannot change customer until all promotions are cleared' });
                }
            }
            // try {
            //     var exeContext = runtime.executionContext;
            //     if (exeContext != 'USERINTERFACE') {
            //         return;
            //     }
            //     var field = context.fieldId;
            //     if (field == 'shipaddress') {
            //         var rec = context.currentRecord;
            //         kbsLib.validateAddresses(rec, 'userinterface', dialog, false, true);
            //     } else if (field == 'billaddress') {
            //         var rec = context.currentRecord;
            //         kbsLib.validateAddresses(rec, 'userinterface', dialog, true, false);
            //     }
            // } catch (e) {
            //     kbsLib.errLog(e);
            // }
        }

        // /**
        // * @param {ClientScriptContext.lineInit} context
        // */
        // function lineInit(context) {
        //
        // }

        // /**
        // * @param {ClientScriptContext.postSourcing} context
        // */
        // function postSourcing(context) {
        //
        // }

        // /**
        // * @param {ClientScriptContext.saveRecord} context
        // */
        // function saveRecord(context) {
        //
        // }

        // /**
        // * @param {ClientScriptContext.sublistChanged} context
        // */
        // function sublistChanged(context) {

        // }

        // /**
        // * @param {ClientScriptContext.validateDelete} context
        // */
        // function validateDelete(context) {
        //    return true;
        // }

        // /**
        // * @param {ClientScriptContext.validateField} context
        // */
        // function validateField(context) {
        //    return true;
        // }

        // /**
        // * @param {ClientScriptContext.validateInsert} context
        // */
        // function validateInsert(context) {
        //    return true;
        // }

        // /**
        // * @param {ClientScriptContext.validateLine} context
        // */
        // function validateLine(context) {
        //    return true;
        // }

        return {
            // pageInit: pageInit,
            fieldChanged: fieldChanged
            // lineInit: lineInit,
            // postSourcing: postSourcing,
            // saveRecord: saveRecord,
            // sublistChanged: sublistChanged,
            // validateDelete: validateDelete,
            // validateField: validateField,
            // validateInsert: validateInsert,
            // validateLine: validateLine
        };
    }
);
