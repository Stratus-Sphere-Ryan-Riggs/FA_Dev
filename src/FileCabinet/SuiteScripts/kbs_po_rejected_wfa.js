/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/log'], function (record, log) {

    function onAction(context) {
        var newRecord = context.newRecord;

        try {
            // Updating using submitFields with the assumed correct internal ID
            record.submitFields({
                type: newRecord.type,
                id: newRecord.id,
                values: {
                    approvalstatus: 3 // Assumed internal ID for 'Rejected'
                },
                options: {
                    ignoreMandatoryFields: true
                }
            });
            log.debug('Record Updated', 'Purchase Order ' + newRecord.id + ' has been set to Rejected.');
        } catch (e) {
            log.error('Error Updating Record', e.name + ': ' + e.message);
        }
    }

    return {
        onAction: onAction
    };
});
