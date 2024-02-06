/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(
    [
        'N/redirect'
    ],
    /**
     * @param {N_redirect} nsRedirect
     */
    function (
        nsRedirect
    ) {

        /**
        * @param {SuiteletContext.onRequest} context
        */
        function onRequest(context) {
            var recId = context.request.parameters.custpage_cus_id;

            nsRedirect.toTaskLink({
                id: 'EDIT_VENDOR',
                parameters: { custparam_id: recId }
            });

        }
        return {
            onRequest: onRequest
        };
    }
);
