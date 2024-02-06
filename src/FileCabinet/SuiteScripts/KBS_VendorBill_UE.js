/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define([
    'N/runtime'
],

/**
 * @param {N_runtime} nsRuntime
*/

function (nsRuntime) {

    /**
        * @param {UserEventContext.beforeLoad} context
        */
    function beforeLoad(context) {
        var rec = context.newRecord;
        var form = context.form;
        var sublist;
        var column;
        var type = context.type;
        var customForm = rec.getValue('customform');
        var executionContext = nsRuntime.executionContext;

        if (type === context.UserEventType.CREATE || type === context.UserEventType.EDIT) {
            log.debug('executionContext', executionContext);
            if (customForm === '136' && executionContext === 'USERINTERFACE') {
                sublist = form.getSublist('item');
                column = sublist.getField('custcol_cseg_projects_cseg');
                column.isMandatory = true;
                sublist = form.getSublist('expense');
                column = sublist.getField('custcol_cseg_projects_cseg');
                column.isMandatory = true;
                log.debug('column', column);
            }
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
    //
    // }

    return {
        beforeLoad: beforeLoad
        // beforeSubmit: beforeSubmit,
        // afterSubmit: afterSubmit
    };
});
