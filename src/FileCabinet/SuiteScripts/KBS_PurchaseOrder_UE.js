/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(
    [

    ],
    /**
     */
    function (
    ) {

        /**
        * @param {UserEventContext.beforeLoad} context
        */
        function beforeLoad(context) {
            var rec = context.newRecord;
            var customform = rec.getValue('customform');
            var form = context.form;
            var sublist;
            var columnMemo;
            var columnProgram;
            var columnProject;
            var columnFund;

            if (customform === '192') {
                sublist = form.getSublist('expense');
                columnMemo = sublist.getField('memo');
                columnProgram = sublist.getField('department');
                columnProject = sublist.getField('custcol_cseg_projects_cseg');
                columnFund = sublist.getField('location');
                columnMemo.isMandatory = true;
                columnProgram.isMandatory = true;
                columnProject.isMandatory = true;
                columnFund.isMandatory = true;
            }
        }

        // /**
        // * @param {UserEventContext.beforeSubmit} context
        // */
        // function beforeSubmit(context) {
        //
        // }

        // /**
        // * @param {UserEventContext.afterSubmit} context
        // */
        // function afterSubmit(context) {

        // }

        return {
            beforeLoad: beforeLoad
            // beforeSubmit: beforeSubmit,
            // afterSubmit: afterSubmit
        };
    }
);
