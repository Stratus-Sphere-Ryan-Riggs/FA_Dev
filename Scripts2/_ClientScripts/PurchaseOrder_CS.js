/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(
    [
        'N/ui/dialog',
        'N/search'
    ],
    /**
     * @param {N_ui_dialog} nsDialog
     * @param {N_search} nsSearch
     */
    function (
        nsDialog, nsSearch
    ) {

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
            var rec = context.currentRecord;
            var nonProcurementCheckbox = rec.getValue('custbody_non_procurement_po');
            var form = rec.getValue('customform');

            if (form === '183' && nonProcurementCheckbox === true) {
                nsDialog.alert({
                    title: 'Confirmation',
                    message: 'Please attach vendor invoice to Purchase Request prior to submitting for approval. File Drag and Drop can be used in top right of form, otherwise attach via communication sublist.'
                });
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
        // function saveRecord(context) {
        // var rec = context.currentRecord;
        // var fileId;
        // var purchaseorderSearchObj = nsSearch.create({
        //     type: 'purchaseorder',
        //     filters:
        //     [
        //         ['type', 'anyof', 'PurchOrd'],
        //         'AND',
        //         ['internalidnumber', 'equalto', rec.id],
        //         'AND',
        //         ['mainline', 'is', 'T']
        //     ],
        //     columns:
        //     [
        //         nsSearch.createColumn({
        //             name: 'internalid',
        //             join: 'file',
        //             label: 'Internal ID'
        //         })
        //     ]
        // });
        // var searchResultCount = purchaseorderSearchObj.runPaged().count;
        // log.debug('purchaseorderSearchObj result count', searchResultCount);
        // if (searchResultCount > 0) {
        //     purchaseorderSearchObj.run().each(function (result) {
        //         // .run().each has a limit of 4,000 results
        //         fileId = result.getValue({
        //             name: 'internalid',
        //             join: 'file'
        //         });
        //         return false;
        //     });
        //     console.log('id: ' + fileId);
        //     if (fileId) {
        //         return true;
        //     }
        //     nsDialog.alert({
        //         title: 'No Attachments',
        //         message: 'No vendor invoice attachments found, please add invoice to record prior to saving.'
        //     });
        //     return false;
        // }
        // nsDialog.alert({
        //     title: 'No Attachments',
        //     message: 'No vendor invoice attachments found, please add invoice to record prior to saving.'
        // });

        // return false;
        // }

        // /**
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
            pageInit: pageInit
            // postSourcing: postSourcing,
            // saveRecord: saveRecord
            // sublistChanged: sublistChanged,
            // validateDelete: validateDelete,
            // validateField: validateField,
            // validateInsert: validateInsert,
            // validateLine: validateLine
        };
    }
);
