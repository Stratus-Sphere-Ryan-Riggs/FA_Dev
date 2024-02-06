/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(
    [
        'N/record',
        'N/task',
        'N/ui/serverWidget',
        'N/redirect'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_task} nsTask
     * @param {N_iu_serverwidget} nsUi
     * @param {N_redirect} nsRedirect
     */
    function (
        nsRecord,
        nsTask,
        nsUi,
        nsRedirect
    ) {

        function doGet(context) {
            var objForm;

            objForm = nsUi.createForm({ title: 'Prophix Transaction Data Export' });
            objForm.addSubmitButton({
                label: 'Prophix Send Data'
            });

            context.response.writePage(objForm);
        }
        function doPost(context) {
            var objForm;
            var scriptTask = nsTask.create({
                taskType: nsTask.TaskType.MAP_REDUCE
            });

            scriptTask.scriptId = 'customscript_kbs_prophix_create_table';
            scriptTask.deploymentId = 'customdeploy_kbs_prophix_create_table';
            scriptTask.submit();

            objForm = nsUi.createForm({ title: 'Prophix' });
            objForm.addField({ id: 'custpage_confirmation', type: nsUi.FieldType.LABEL, label: 'Data Sent' });

            context.response.writePage(objForm);
        }
        /**
        * @param {SuiteletContext.onRequest} context
        */
        function onRequest(context) {
            var method = context.request.method;

            if (method === 'GET') {
                doGet(context);
            }
            if (method === 'POST') {
                doPost(context);
            }
        }
        return {
            onRequest: onRequest
        };
    }
);
