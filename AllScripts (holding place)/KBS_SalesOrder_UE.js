/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(
    [
        'N/record'
    ],
    /**
     * @param {N_record} nsRecord
     */
    function (
        nsRecord
    ) {
        /** Order Type Ids: 2, 3, 5, 8, 9 (Produce, Yellow, Maroon, Seafood, Disaster) */
        /** Per Ryan Riggs - excluding Produce and Seafood (internal ids 2 and 8) */
        var validOrderTypes = ['3', '5', '9'];

        /**
         * Looks for lines with item 'UNK Temporary Item'. For each line found, values from certain
         * column fields are retrieved and stored in hidden custom field 'custbody_kbs_tempitem_data' in JSON format.
         * @param {N_record.Record} rec
         */
        function captureUnkItemLineData(rec) {
            var lineCount;
            var i;
            var itemId;
            var lineId;
            var objArray = {};
            var lineNumber;
            var objString;
            var objRecord;
            var customForm = rec.getValue('customform');
            var orderType = rec.getValue('custbody_order_type');

            // Process should only trigger if custom form is FA Sales Order-Grocery All Supply Chain (id: 160) AND
            // if order type is any of the following internal ids: 2, 3, 5 (Produce, Yellow, Maroon)
            if (customForm === '160' && validOrderTypes.indexOf(orderType) > -1) {
                orderType = rec.getValue('custbody_order_type');

                // Do a search of the line items to see if any are UNK Temporary Items
                lineNumber = rec.findSublistLineWithValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: 4047
                });

                // Process should only trigger if UNK Temporary Items are found
                if (lineNumber > -1) {
                    // load record so that line Id comes through for a new record
                    objRecord = nsRecord.load({
                        type: nsRecord.Type.SALES_ORDER,
                        id: rec.id,
                        isDynamic: true
                    });
                    log.debug('testScript', ' recID = ' + rec.id);
                    // Loop through line items
                    lineCount = objRecord.getLineCount({ sublistId: 'item' });
                    log.debug('testScript', 'item length = ' + lineCount);

                    for (i = lineNumber; i < lineCount; i += 1) {
                        // Check to see if item is UNK Temporary Item (id: 4047) and if so add to object
                        itemId = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
                        lineId = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'line', line: i });
                        log.debug('testScript', 'itemId: ' + itemId + ' : lineId: ' + lineId);

                        if (itemId === '4047') {

                            // add object to the array
                            objArray[lineId] = {
                                description: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'description', line: i }),
                                custcol_pickup_location: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pickup_location', line: i }),
                                custcol_vendor_item_no: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_vendor_item_no', line: i }),
                                custcolfa_vendor_item_name: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcolfa_vendor_item_name', line: i }),
                                quantity: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i }),
                                units: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'units', line: i }),
                                units_display: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'units_display', line: i }),
                                custcol_item_gross_weight: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_item_gross_weight', line: i }),
                                povendor: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'povendor', line: i }),
                                custcol_nbr_pallets: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_nbr_pallets', line: i }),
                                custcol_cases_per_pallet: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_cases_per_pallet', line: i })
                            };
                        }
                    }
                    objString = JSON.stringify(objArray);
                    log.debug('testScript', 'objString: ' + objString);

                    objRecord.setValue({
                        fieldId: 'custbody_kbs_tempitem_data',
                        value: objString,
                        ignoreFieldChange: true
                    });
                    objRecord.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                }
            }
        }

        /**
         * @param {UserEventContext.afterSubmit} context
         */
        function afterSubmit(context) {
            var rec = context.newRecord;
            var type = context.type;

            try {
                // Only enter if type is create or edit
                if (type === context.UserEventType.CREATE || type === context.UserEventType.EDIT) {

                    captureUnkItemLineData(rec);
                }
            } catch (ex) {
                log.error('Error', ex);
            }

        }
        return {
            afterSubmit: afterSubmit
        };
    }
);
