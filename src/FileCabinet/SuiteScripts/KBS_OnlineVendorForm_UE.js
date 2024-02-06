/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(
    [
        'N/record',
        'N/runtime'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_runtime} nsRuntime
     */
    function (
        nsRecord,
        nsRuntime
    ) {

        /**
        * @param {UserEventContext.beforeLoad} context
        */
        function beforeLoad(context) {
            var form = context.form;
            var rec = context.newRecord;
            var userRole = nsRuntime.getCurrentUser().role;
            var rolesToDisplay = [3, 1024, 1023, 1022, 1076]; // Administrator, FA Transaction Manager, FA Controller, FA VP Financial Reporting & Budgeting, FA CFO

            log.debug('userRole', userRole);
            if (rolesToDisplay.indexOf(userRole) === -1) {
                form.getField({
                    id: 'custrecord_kbs_fein_ssn'
                }).updateDisplayType({
                    displayType: 'hidden'
                });
                form.getField({
                    id: 'custrecord_kbs_w9attachment'
                }).updateDisplayType({
                    displayType: 'hidden'
                });
            }
            // Pending Vendor Creation (internal id: 5)
            if (rec.getValue('custrecord_kbs_vendorrequeststatus') === '5' && (rolesToDisplay.indexOf(userRole) > -1)) {
                form.addButton({ id: 'custpage_createvendorbtn', label: 'Create Vendor', functionName: 'createVendorClick' });
                form.clientScriptModulePath = 'SuiteScripts/KBS_OnlineVendorForm_CS.js';
            }
        }

        // /**
        // * @param {UserEventContext.beforeSubmit} context
        // */
        // function beforeSubmit(context) {

        // }

        // /**
        // * @param {UserEventContext.afterSubmit} context
        // */
        // function afterSubmit(context) {

        // }

        return {
            beforeLoad: beforeLoad
            // beforeSubmit: beforeSubmit
            // afterSubmit: afterSubmit
        };
    }
);
