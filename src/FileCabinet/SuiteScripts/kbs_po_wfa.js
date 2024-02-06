/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 */
define(['N/record', 'N/log'], function (record, log) {

    function onAction(context) {
        var newRecord = context.newRecord;
        var prApprovalRecord = newRecord.getValue('custbody_kbs_prapprovalrecord');
        var nonProcurementPO = newRecord.getValue('custbody_non_procurement_po');

        // Check if the other conditions are met
        if (prApprovalRecord && nonProcurementPO) {
            try {
                var customRecord = record.load({
                    type: 'customrecord_kbs_prapproval',
                    id: prApprovalRecord
                });

                customRecord.setValue('custrecord_purchreq_approvalstatus', 4);
                customRecord.save();
                log.debug('Record Updated', 'Custom Record ' + prApprovalRecord + ' has been updated.');
            } catch (e) {
                log.error('Error Updating Record', e);
            }
        }
    }

    return {
        onAction: onAction
    };
});
