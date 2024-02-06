/**
 *@NApiVersion 2.x
 *@NScriptType WorkflowActionScript
 */
define(['N/record'], function(record) {
    function onAction(context) {
        var recordId = context.newRecord.id;
        var recordType = context.newRecord.type;

        var salesOrder = record.load({
            type: recordType,
            id: recordId,
        });

        // Set the value of the custbody_kbs_removetfs field
        salesOrder.setValue({
            fieldId: 'custbody_kbs_removetfs',
            value: true,
        });

        salesOrder.save();
    }

    return {
        onAction: onAction
    };
});