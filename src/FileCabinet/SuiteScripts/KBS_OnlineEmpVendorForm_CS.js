/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(
    [
        'N/url'
    ],
    /**
     * @param {N_url} nsUrl
     */
    function (
        nsUrl
    ) {

        /**
        * @param {ClientScriptContext.saveRecord} context
        */
        function saveRecord(context) {
            var currentRecord = context.currentRecord;
            var relQuestion = currentRecord.getValue('custrecord_kbs_relationshipquestion');
            var ifYesRel = currentRecord.getValue('custrecord_kbs_ifyesrelationship');
            var reqEmail = currentRecord.getValue('custrecord_kbs_reqapproveremail');
            var conReqEmail = currentRecord.getValue('custrecord_kbs_confirm_req_approver_emai');
            if (relQuestion === '1' && ifYesRel.trim() === '') {
                // alert('List of Relatioship is required since you answered "Yes" to Vendor Relationship Status ');
                alert('Please list relationship.');
                return false;
            }
            if (reqEmail !== conReqEmail) {
                alert('Email entered and confirmed are not the same.');
                return false;
            }

            return true;

        }

        return {
            saveRecord: saveRecord
        };
    }
);
