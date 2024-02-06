/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(
    [

    ],
    function () {

        /**
        * @param {ClientScriptContext.fieldChanged} context
        */
        function fieldChanged(context) {
            var selected;
            var rec = context.currentRecord;
            var lineCount;
            var x;

            if (context.fieldId === 'custpage_selectall') {
                selected = rec.getValue('custpage_selectall');
                lineCount = rec.getLineCount({ sublistId: 'custpage_iflist' });
                for (x = 0; x < lineCount; x += 1) {
                    if (selected) {

                        rec.selectLine({ sublistId: 'custpage_iflist', line: x });
                        rec.setCurrentSublistValue({
                            sublistId: 'custpage_iflist', fieldId: 'custpage_select', value: true, ignoreFieldChange: true
                        });
                        rec.commitLine({ sublistId: 'custpage_iflist' });
                    } else {
                        rec.selectLine({ sublistId: 'custpage_iflist', line: x });
                        rec.setCurrentSublistValue({
                            sublistId: 'custpage_iflist', fieldId: 'custpage_select', value: false, ignoreFieldChange: true
                        });
                        rec.commitLine({ sublistId: 'custpage_iflist' });
                    }
                }

            }
        }

        // /**
        // * @param {ClientScriptContext.lineInit} context
        // */
        // function lineInit(context) {
        //
        // }

        // /**
        // * @param {ClientScriptContext.pageInit} context
        // */
        // function pageInit(context) {
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
            fieldChanged: fieldChanged
            // lineInit: lineInit,
            // pageInit: pageInit,
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
