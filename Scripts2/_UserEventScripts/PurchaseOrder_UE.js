/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(
    [
        'N/search'
    ],
    /**
     * @param {N_search} nsSearch
     */
    function (
        nsSearch
    ) {

        /**
        * @param {UserEventContext.beforeLoad} context
        */
        function beforeLoad(context) {
            var rec = context.newRecord;
            var nonProcurementCheckbox = rec.getValue('custbody_non_procurement_po');
            var customform = rec.getValue('customform');
            var form = context.form;
            var sublist;
            var column;

            if (customform === '183' && nonProcurementCheckbox === true) {
                sublist = form.getSublist('item');
                column = sublist.getField('description');
                column.isMandatory = true;
            }
        }

        // /**
        // * @param {UserEventContext.beforeSubmit} context
        // */
        // function beforeSubmit(context) {
        //
        // }

        /**
        * @param {UserEventContext.afterSubmit} context
        */
        function afterSubmit(context) {
            var rec = context.newRecord;
            var fileId;
            var purchaseorderSearchObj = nsSearch.create({
                type: 'purchaseorder',
                filters:
                [
                    ['type', 'anyof', 'PurchOrd'],
                    'AND',
                    ['internalidnumber', 'equalto', rec.id],
                    'AND',
                    ['mainline', 'is', 'T']
                ],
                columns:
                [
                    nsSearch.createColumn({
                        name: 'internalid',
                        join: 'file',
                        label: 'Internal ID'
                    })
                ]
            });
            var searchResultCount = purchaseorderSearchObj.runPaged().count;
            log.debug('purchaseorderSearchObj result count', searchResultCount);
            purchaseorderSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                fileId = result.getValue({
                    name: 'internalid',
                    join: 'file'
                });
                log.debug('fileId', fileId);
                rec.setValue({ fieldId: 'custbody_kbs_prpdf', value: fileId });
                return false;
            });
        }

        return {
            beforeLoad: beforeLoad,
            // beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    }
);
