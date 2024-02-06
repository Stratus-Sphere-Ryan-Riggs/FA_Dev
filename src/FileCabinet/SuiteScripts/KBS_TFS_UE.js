/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/log', 'N/record'], function (search, log, record) {

    /**
        * @param {UserEventContext.beforeSubmit} context
        */
    function beforeSubmit(context) {
        var newRec = context.newRecord;
        var budgetTotal;
        var budgetUsed;
        var type = context.type;

        if (type === context.UserEventType.EDIT) {
            budgetTotal = parseFloat(newRec.getValue('custrecord_tfs_budgettotal') || 0);
            budgetUsed = parseFloat(newRec.getValue('custrecord_tfs_budgetused') || 0);
            newRec.setValue('custrecord_tfs_budgetremaining', budgetTotal - budgetUsed);

        }

    }
    function afterSubmit(context) {
        var salesorderSearchObj;
        // var searchResultCount;
        var currentRecordId;
        var tableContent;

        currentRecordId = context.newRecord.id;

        // Create a sales order search object
        salesorderSearchObj = search.create({
            type: 'salesorder',
            filters: [
                ['type', 'anyof', 'SalesOrd'],
                'AND',
                ['item', 'anyof', '11136'],
                'AND',
                ['custbody_order_type', 'anyof', '5', '3', '2', '8'],
                'AND',
                ['amount', 'notequalto', '0.00'],
                'AND',
                ['mainline', 'is', 'F'],
                'AND',
                ['custbody_kbs_tfs.internalid', 'anyof', currentRecordId]
            ],
            columns: [
                search.createColumn({ name: 'trandate', label: 'Date' }),
                search.createColumn({ name: 'tranid', label: 'Document Number' }),
                search.createColumn({ name: 'custbody_actual_freight_cost', label: 'Order Freight Cost' }),
                search.createColumn({ name: 'amount', label: 'Order Freight Support Amount' }),
                search.createColumn({ name: 'custbody_product_offer_no', label: 'Offer No (PDQ)' })
            ]
        });

        // Initialize the table content with headers
        tableContent = '<table border="1"><tr><th>Date</th><th>Document Number</th><th>Offer Number</th><th>Order Freight Cost</th><th>Order Freight Support Amount</th></tr>';

        // Execute the search and build table rows
        salesorderSearchObj.run().each(function (result) {
            tableContent += '<tr>'
                            + '<td>' + result.getValue({ name: 'trandate' }) + '</td>'
                            + '<td>' + result.getValue({ name: 'tranid' }) + '</td>'
                            + '<td>' + result.getValue({ name: 'custbody_product_offer_no' }) + '</td>'
                            + '<td>' + result.getValue({ name: 'custbody_actual_freight_cost' }) + '</td>'
                            + '<td>' + result.getValue({ name: 'amount' }) + '</td>'
                            + '</tr>';
            return true;
        });

        tableContent += '</table>'; // Close the table

        // Update the custom record with the table content
        record.submitFields({
            type: 'customrecord_kbs_tfs',
            id: currentRecordId,
            values: {
                custrecord_tfs_transactiondetails: tableContent
            }
        });

        log.debug('Updated customrecord_kbs_tfs', 'ID: ' + currentRecordId);
    }

    return {
        // beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
});