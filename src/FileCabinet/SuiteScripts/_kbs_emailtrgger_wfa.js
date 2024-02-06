/**
 *@NApiVersion 2.x
 *@NScriptType WorkflowActionScript
 */
define(['N/record'], function(record) {
    function onAction(context) {
        var recordId = context.newRecord.id;
        var recordType = context.newRecord.type;

        // Load the custom record
        var customRecord = record.load({
            type: recordType, // or 'customrecord_kbs_tfs'
            id: recordId,
        });

        // Get the current value of the custrecord_tfs_emailtrigger field
        var currentValue = customRecord.getValue({
            fieldId: 'custrecord_tfs_emailtrigger'
        });

        // Toggle the value
        customRecord.setValue({
            fieldId: 'custrecord_tfs_emailtrigger',
            value: !currentValue,
        });

        customRecord.save();
    }

    return {
        onAction: onAction
    };
});
