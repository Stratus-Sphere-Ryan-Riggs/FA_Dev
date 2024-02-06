/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(
    [

    ],
    function () {

        // /**
        // * @param {ClientScriptContext.fieldChanged} context
        // */
        // function fieldChanged(context) {
        //
        // }

        // /**
        // * @param {ClientScriptContext.lineInit} context
        // */
        // function lineInit(context) {
        //
        // }

        /**
        * @param {ClientScriptContext.pageInit} context
        */
        function pageInit(context) {
            var rec = context.currentRecord;
            var customForm;

            customForm = rec.getValue('customform');
            if (customForm !== '92') {
                rec.setValue({
                    fieldId: 'customform',
                    value: 92,
                    ignoreFieldChange: false,
                    forceSyncSourcing: false
                });
            }
        }

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
        //
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
            // fieldChanged: fieldChanged,
            // lineInit: lineInit,
            pageInit: pageInit
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
