/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(
    [
        'N/record',
        'N/redirect'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_redirect} nsRedirect
     */
    function (
        nsRecord,
        nsRedirect
    ) {

        /**
        * @param {SuiteletContext.onRequest} context
        */
        function onRequest(context) {
            var url = context.request.parameters;
            var soId = url.custpage_soid;
            var soRec;
            var lineCount;
            var x;

            soRec = nsRecord.load({ type: 'salesorder', id: soId });
            // soRec.setValue({ fieldId: 'custbody_order_status', value: '3' });
            lineCount = soRec.getLineCount({ sublistId: 'item' });

            for (x = 0; x < lineCount; x += 1) {
                soRec.setSublistValue({
                    sublistId: 'item', fieldId: 'isclosed', line: x, value: false
                });
            }
            soRec.save();

            nsRedirect.toRecord({
                type: 'salesorder',
                id: soId,
                isEditMode: false
            });
        }
        return {
            onRequest: onRequest
        };
    }
);
