/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(
    [
        'N/record',
        'N/search',
      	'N/format',
      	'N/runtime'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_search} nsSearch
     */
    function (
        nsRecord,
        nsSearch,
        nsformat,
        nsRuntime
    ) {


       function swapSeafoodItem(rec) {
        var lineCount;
        var i;
        var itemId;
        var lineId;
        var venItemNum;
        var objArray = {};
        var objString;
        var objRecord;
        var orderType = rec.getValue('custbody_order_type');

        // if order type is any of the following internal ids: 8 Seafood
        /**
         * Looks for lines with item 'FISH - OTHER'. For each line found, values from certain
         * column fields are retrieved and stored in hidden custom field 'custbody_kbs_tempitem_data' in JSON format.
         * @param {N_record.Record} rec
         */
        if (orderType == 8) {

                // load record
                objRecord = nsRecord.load({
                    type: nsRecord.Type.SALES_ORDER,
                    id: rec.id,
                    isDynamic: true
                });
                log.debug('testScript', ' recID = ' + rec.id);
                // Loop through line items
                lineCount = objRecord.getLineCount({ sublistId: 'item' });
                log.debug('testScript', 'item length = ' + lineCount);

                for (i = 0; i < lineCount; i += 1) {
                    itemId = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
                    lineId = i;
                    venItemNum = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_vendor_item_no', line: i });
                    log.debug('testScript', 'itemId: ' + itemId + ' : lineId: ' + lineId + venItemNum);

                  if (itemId == '7275') {
                    
                        // add object to the array
                        objArray[lineId] = {
                            description: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'description', line: i }),
                            custcol_pickup_location: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pickup_location', line: i }),
                            custcol_vendor_item_no: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_vendor_item_no', line: i }),
                            custcolfa_vendor_item_name: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcolfa_vendor_item_name', line: i }),
                            quantity: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i }),
                            units: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'units', line: i }),
                            dlvd_rate: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_adj_invoice_rate', line: i }),
                            units_display: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'units_display', line: i }),
                            custcol_item_gross_weight: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_item_gross_weight', line: i }),
                            povendor: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'povendor', line: i }),
                            custcol_nbr_pallets: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_nbr_pallets', line: i }),
                            custcol_cases_per_pallet: objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_cases_per_pallet', line: i })
                        };

                        var vapItem = '9903';
                        var donorVendor = objRecord.getValue({fieldId: 'custbody_opportunity_donor'});
                        
                        objString = JSON.stringify(objArray);
                        log.debug('testScript', 'objString: ' + objString + objArray[lineId].custcol_pickup_location + objArray[lineId].description + donorVendor);

                    	objRecord.selectLine({
                            sublistId: 'item',
                          	line: (lineId)
                        });
                        objRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            value: vapItem,
                          	ignoreFieldChange: true
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_pickup_location',
                            value: objArray[lineId].custcol_pickup_location,
                          	ignoreFieldChange: true
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_vendor_item_no',
                            value: objArray[lineId].custcol_vendor_item_no,
                          	ignoreFieldChange: true
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_vendor_item_name',
                            value: objArray[lineId].custcol_vendor_item_name,
                          	ignoreFieldChange: true
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            value: objArray[lineId].dlvd_rate,
                          	ignoreFieldChange: true
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_adj_invoice_rate',
                            value: objArray[lineId].dlvd_rate,
                          	ignoreFieldChange: true
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'porate',
                            value: objArray[lineId].dlvd_rate,
                          	ignoreFieldChange: true
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'description',
                            value: objArray[lineId].description,
                          	ignoreFieldChange: true
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_vendor',
                            value: donorVendor,
                          	ignoreFieldChange: true
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: objArray[lineId].quantity,
                          	ignoreFieldChange: true
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'units_display',
                            value: objArray[lineId].units_display,
                          	ignoreFieldChange: true
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_item_gross_weight',
                            value: objArray[lineId].custcol_item_gross_weight,
                          	ignoreFieldChange: true
                        }).setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            value: ((objArray[lineId].dlvd_rate)*(objArray[lineId].quantity)),
                          	ignoreFieldChange: true
                        });
                    	objRecord.commitLine({
                            sublistId: 'item'
                        });
                }
                }

                objRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
        }
    }


        /**
         * @param {UserEventContext.afterSubmit} context
         */
        function afterSubmit(context) {
            var rec = context.newRecord;
            var type = context.type;

            try {
                // Only enter if type is create
                if (type === context.UserEventType.CREATE) {
                    swapSeafoodItem(rec);
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
