/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(
    [
        'N/ui/dialog',
        'N/search',
        'N/runtime'
    ],
    /**
     * @param {N_ui_dialog} nsDialog
     * @param {N_search} nsSearch
     * @param {N_runtime} nsRuntime
     */
    function (
        nsDialog, nsSearch, nsRuntime
    ) {
        var rec;
        function success(result) {
            console.log('Success with value ' + result);

            if (result === true) {
                window.location.href = 'https://4069301-sb2.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1435&deploy=2';
            } else {
                // Do nothing or show a different dialog/alert
                nsDialog.alert({
                    title: 'Notice',
                    message: 'Please continue filling out the form.'
                });
            }
        }
        // /**
        // * @param {ClientScriptContext.fieldChanged} context
        // */
        // function fieldChanged(context) {
        //
        // }

        // /**
        // * @param {ClientScriptContext.lineInit} context
        // */
        // function lineInit(context) {

        // }

        /**
        * @param {ClientScriptContext.pageInit} context
        */
        function pageInit(context) {
            var form;
            var userRole;
            var formField;
            var url;
            var recId = context.currentRecord.id;
            rec = context.currentRecord;
            formField = rec.getField('customform');
            formField.isVisible = true;
            // var nonProcurementCheckbox = rec.getValue('custbody_non_procurement_po');
            form = rec.getValue('customform');
            userRole = nsRuntime.getCurrentUser().role;
            console.log('form: ' + form);
            url = window.location.href;
            console.log(url);
            if (form === '192' && !recId) {
                // Then trigger the second alert
                nsDialog.alert({
                    title: 'Confirmation',
                    message: 'Please attach vendor provided Invoice in the Purchase Request PDF field prior to submitting for approval.'
                });
                // nsDialog.create({
                //     title: 'Contract For Purchase Request?',
                //     message: 'Is there an existing Contract for this Purchase Request? (An existing Contract means a Purchase Order already in NetSuite that can be billed against)',
                //     buttons: [
                //         { label: 'YES', value: true },
                //         { label: 'NO', value: false }
                //     ]
                // }).then(function (result) {
                //     console.log('Success with value ' + result);

                //     if (result === true) {
                //         window.location.href = 'https://4069301-sb2.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1435&deploy=2';
                //     }

                // });
            }
        }

        // /**
        // * @param {ClientScriptContext.postSourcing} context
        // */
        // function postSourcing(context) {
        //
        // }

        /**
        * @param {ClientScriptContext.saveRecord} context
        */
        function saveRecord(context) {
            // var rec = context.currentRecord;
            var form = rec.getValue('customform');
            var totalBillAmount;
            var total;

            if (form === '192') {
                totalBillAmount = rec.getValue('custbody_total_bill_amount');
                total = rec.getValue('total');

                if (totalBillAmount !== total) {
                    nsDialog.alert({
                        title: 'Validation Error',
                        message: 'Total Bill Amount must match summarized line amounts. Please validate before saving.'
                    });
                    return false; // Prevents the record from being saved
                }
            }
            return true; // Allows the record to be saved
        }
        // * @param {ClientScriptContext.sublistChanged} context
        // */
        // function sublistChanged(context) {
        //
        // }

        // /**
        // * @param {ClientScriptContext.validateDelete} context
        // */
        // function validateDelete(context) {
        //    return true;
        // }

        // /**
        // * @param {ClientScriptContext.validateField} context
        // */
        // function validateField(context) {
        //    return true;
        // }

        // /**
        // * @param {ClientScriptContext.validateInsert} context
        // */
        // function validateInsert(context) {
        //    return true;
        // }

        // /**
        // * @param {ClientScriptContext.validateLine} context
        // */
        // function validateLine(context) {
        //    return true;
        // }

        return {
            // fieldChanged: fieldChanged,
            // lineInit: lineInit,
            pageInit: pageInit,
            // postSourcing: postSourcing,
            saveRecord: saveRecord
            // sublistChanged: sublistChanged,
            // validateDelete: validateDelete,
            // validateField: validateField,
            // validateInsert: validateInsert,
            // validateLine: validateLine
        };
    }
);
