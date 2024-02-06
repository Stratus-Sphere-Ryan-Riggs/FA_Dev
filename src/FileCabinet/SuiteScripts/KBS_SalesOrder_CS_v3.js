/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 *@NModuleScope SameAccount
 */


/**
    * Company           Feeding America
    * Type  NetSuite Client-Side SuiteScript
    * Version   2.0
    * Description   This script will clear out fields on a copy
    *
    * Change History
    * 10/20/2016 - Add in check for warehouse pricingClear
    * 01/29/2019 - DB - began converting to SuiteScript 2.0
* */

define(
    [
        './KBS_MODULE',
        'N/search',
        'N/format',
        'N/record',
        'N/ui/dialog',
        'N/url',
        'N/currentRecord'
    ],
    /**
     * @param {KBS_MODULE} kbsMod
     * @param {N_search} nsSearch
     * @param {N_format} nsFormat
     * @param {N_record} nsRecord
     * @param {N_ui_dialog} nsDialog
     * @param {N_url} nsUrl
     * @param {N_currentrecord} nsCurrentRecord
     */
    function (
        kbsMod,
        nsSearch,
        nsFormat,
        nsRecord,
        nsDialog,
        nsUrl,
        nsCurrentRecord
    ) {
        function cancelOrderClick() {
            var suiteUrl;

            var options = {
                title: 'Confirm Cancellation',
                message: 'To Cancel this Sales Order Press OK Otherwise Press Cancel'
            };

            function success(result) {
                if (result) {
                    suiteUrl = nsUrl.resolveScript({
                        scriptId: 'customscript_kbs_cancelso_sl',
                        deploymentId: 'customdeploy_kbs_cancelso_sl',
                        returnExternalUrl: false,
                        params: { custpage_soid: nsCurrentRecord.get().id }
                    });
                    window.open(suiteUrl, '_self');

                }

            }

            nsDialog.confirm(options).then(success);
        }

        /**
        * @param {ClientScriptContext.fieldChanged} context
        * @param {string} context.sublistId - Sublist name
        * @param {string} context.fieldId - Field name
        */
        function fieldChanged(context) {
            var currentRecord = context.currentRecord;
            var sublistType = context.sublistId;
            var sublistFieldId = context.fieldId;
            var povendor;
            var pickuplocationText;
            var pickuplocation;
            var masterItem;
            var warehouseSearch;
            var searchResults;
            var newrate;
            var nbrPallets;
            var casePerPallet;
            var totalWeight;
            var qty;
            var grossWeight;
            var orderType;
            var itemId;
            var vendor;
            var fieldLookup;
            var type;
            var itemRec;
            var lineCount;
            var x;
            var itemVendor;
            var code;
            var dlvdRate;

            if (sublistType === 'item') {

                if (sublistFieldId === 'povendor' || sublistFieldId === 'porate') {
                    povendor = currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'povendor'
                    });
                    if (povendor) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_vendor',
                            value: povendor
                        });
                    }
                }

                // custcolmation, added another comment
                if (sublistFieldId === 'povendor' || sublistFieldId === 'custcol_pickup_location') {
                    povendor = currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'povendor'
                    });
                    if (!povendor) {
                        povendor = currentRecord.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_vendor'
                        });
                    }
                    pickuplocationText = currentRecord.getCurrentSublistText({
                        sublistId: 'item',
                        fieldId: 'custcol_pickup_location'
                    });
                    pickuplocation = currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_pickup_location'
                    });

                    log.debug({
                        title: 'IN Warehouse Lookup 1' + pickuplocationText + ' po ' + povendor
                    });

                    if (pickuplocationText) {
                        if (povendor) {
                            log.debug({
                                title: 'IN Warehouse Lookup 2' + pickuplocationText + ' po ' + povendor
                            });

                            masterItem = currentRecord.getCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'item'
                            });

                            warehouseSearch = nsSearch.load({ id: 'customsearch_vendor_warehouse_price' });
                            warehouseSearch.filters.push(nsSearch.createFilter({
                                name: 'custrecord_master_item',
                                operator: nsSearch.Operator.IS,
                                values: masterItem
                            }));
                            warehouseSearch.filters.push(nsSearch.createFilter({
                                name: 'custrecord_item_wareouse_vendor',
                                operator: nsSearch.Operator.IS,
                                values: povendor
                            }));
                            warehouseSearch.filters.push(nsSearch.createFilter({
                                name: 'custrecord_vendor_warehouse',
                                operator: nsSearch.Operator.IS,
                                values: pickuplocation
                            }));
                            warehouseSearch.filters.push(nsSearch.createFilter({
                                name: 'isinactive',
                                operator: nsSearch.Operator.IS,
                                values: 'F'
                            }));
                            searchResults = warehouseSearch.run().getRange(0, 1);


                            log.debug({
                                title: 'IN Warehouse Lookup 3 Search Results Length' + searchResults.length
                            });
                            if (searchResults && searchResults.length > 0) {
                                newrate = parseFloat(searchResults[0].getValue({
                                    name: 'custrecord_vendor_warehouse_price'
                                })); // Add an Inactive Check
                              log.debug({
                                title: 'newrate' + newrate
                            });
                                currentRecord.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'porate',
                                    value: newrate,
                                    ignoreFieldChange: true,
                                    fireSlavingSync: false
                                });
                                currentRecord.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'rate',
                                    value: newrate,
                                    ignoreFieldChange: true,
                                    fireSlavingSync: false
                                });

                                log.debug({
                                    title: 'New Rate 3: ' + newrate
                                });
                            }
                        }
                    }
                }
                // Added by Thilaga for Bug 5194 && 5486
                if (sublistFieldId === 'quantity' || sublistFieldId === 'custcol_cases_per_pallet') {
                    log.debug({
                        title: 'field changed:type    ' + sublistType + ' name ' + sublistFieldId
                    });
                    nbrPallets = 0;
                    casePerPallet = parseFloat(currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_cases_per_pallet'
                    }));
                    if (casePerPallet > 0) {

                        nbrPallets = parseFloat(currentRecord.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity'
                        })) / parseFloat(casePerPallet);

                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_nbr_pallets',
                            value: nsFormat.format({
                                value: nbrPallets,
                                type: nsFormat.Type.CURRENCY
                            }),
                            ignoreFieldChange: true,
                            fireSlavingSync: false
                        });
                    }
                }
                if (sublistFieldId === 'quantity' || sublistFieldId === 'custcol_item_gross_weight') {
                    log.debug({
                        title: 'field changed:type    ' + sublistType + ' name ' + sublistFieldId
                    });
                    qty = parseFloat(currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity'
                    }));
                    grossWeight = parseFloat(currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_item_gross_weight'
                    }));
                    
                    //added by Elizabeth for Task 7282
                    dlvdRate = parseFloat(currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_adj_invoice_rate'
                    }));
                  orderType = currentRecord.getValue({
                    fieldId: 'custbody_order_type'
                  });
                    // Need to account for Javascript floating point math
                    totalWeight = Math.round((qty * 100) * (grossWeight * 100)) / 10000;
                    
                   
                  if (orderType === '1') {
                    adjInvoiceAmt = Math.round((qty * 100) * (dlvdRate * 100)) / 10000;
                  
                  
                    
                    currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_adj_invoice_amount',
                            value: adjInvoiceAmt,
                            ignoreFieldChange: true,
                            fireSlavingSync: false
                    });
                  }

                    if (totalWeight) {
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_total_weight',
                            value: totalWeight,
                            ignoreFieldChange: true,
                            fireSlavingSync: false
                        });
                        currentRecord.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_total_pounds',
                            value: totalWeight,
                            ignoreFieldChange: true,
                            fireSlavingSync: false
                        });
                    }
                }
                if (sublistFieldId === 'povendor') {
                    // If order type is Grocery (id = 1) then set the Vendor code to vendor on item record
                    orderType = currentRecord.getValue('custbody_order_type');
                    if (orderType === '1') {

                        vendor = currentRecord.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'povendor'
                        });
                        itemId = currentRecord.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item'
                        });
                        if (vendor !== '' && itemId) {
                            fieldLookup = nsSearch.lookupFields({ type: nsSearch.Type.ITEM, id: itemId, columns: 'type' });
                            type = fieldLookup.type[0].value;
                            // TODO - see what types there can be
                            if (type === 'NonInvtPart') {
                                itemRec = nsRecord.load({
                                    type: nsRecord.Type.NON_INVENTORY_ITEM,
                                    id: itemId
                                });
                                lineCount = itemRec.getLineCount({ sublistId: 'itemvendor' });
                                for (x = 0; x < lineCount; x += 1) {
                                    itemVendor = itemRec.getSublistValue({
                                        sublistId: 'itemvendor',
                                        fieldId: 'vendor',
                                        line: x
                                    });
                                    if (itemVendor === vendor) {
                                        code = itemRec.getSublistValue({
                                            sublistId: 'itemvendor',
                                            fieldId: 'vendorcode',
                                            line: x
                                        });
                                        currentRecord.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'custcol_vendor_item_no',
                                            value: code,
                                            // ignoreFieldChange: true,
                                            fireSlavingSync: false
                                        });
                                        break;
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }

        // /**
        // * @param {ClientScriptContext.lineInit} context
        // * @param {string} context.sublistId - Sublist name
        // * @param {string} context.fieldId - Field name
        // */
        // function lineInit(context) {
        //     log.debug({
        //         title: 'lineinit-postsource    ' + context.sublistId + ' name ' + context.fieldId
        //     });
        // }

        // /**
        // * @param {ClientScriptContext.pageInit} context
        // */
        // function pageInit(context) {
        //
        // }

        /**
        * @param {ClientScriptContext.postSourcing} context
        */
        function postSourcing(context) {
            var currentRecord = context.currentRecord;
            var sublistType = context.sublistId;
            var sublistFieldId = context.fieldId;
            var lineId;
            var tempDataString;
            var tempDataObject = {};
            var curObj = {};
            var orderType;
            var itemId;
            var vendor;
            var fieldLookup;
            var type;
            var itemRec;
            var lineCount;
            var x;
            var itemVendor;
            var code;

            if (sublistType === 'item') {
                // Only proceed if line item
                if (sublistFieldId === 'item') {
                    // If order type is Grocery (id = 1) then set the Vendor code to vendor on item record
                    orderType = currentRecord.getValue('custbody_order_type');
                    if (orderType === '1') {

                        vendor = currentRecord.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'povendor'
                        });
                        itemId = currentRecord.getCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'item'
                        });
                        // log.debug({
                        //     title: 'vendor & itemId: ' + vendor + ' ' + itemId
                        // });
                        if (vendor !== '' && itemId) {
                            fieldLookup = nsSearch.lookupFields({ type: nsSearch.Type.ITEM, id: itemId, columns: 'type' });
                            type = fieldLookup.type[0].value;
                            // log.debug('type', type);
                            // TODO - see what types there can be
                            if (type === 'NonInvtPart') {
                                itemRec = nsRecord.load({
                                    type: nsRecord.Type.NON_INVENTORY_ITEM,
                                    id: itemId
                                });
                                lineCount = itemRec.getLineCount({ sublistId: 'itemvendor' });
                                // log.debug('lineCount', lineCount);
                                for (x = 0; x < lineCount; x += 1) {
                                    itemVendor = itemRec.getSublistValue({
                                        sublistId: 'itemvendor',
                                        fieldId: 'vendor',
                                        line: x
                                    });
                                    // log.debug('itemVendor', itemVendor);
                                    // log.debug('vendor', vendor);
                                    if (itemVendor === vendor) {
                                        code = itemRec.getSublistValue({
                                            sublistId: 'itemvendor',
                                            fieldId: 'vendorcode',
                                            line: x
                                        });
                                        // log.debug('code', code);
                                        currentRecord.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'custcol_vendor_item_no',
                                            value: code,
                                            ignoreFieldChange: true,
                                            fireSlavingSync: false
                                        });
                                        break;
                                    }
                                }
                            }

                        }
                    }
                    lineId = currentRecord.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'line'
                    });

                    if (lineId) {

                        tempDataString = currentRecord.getValue('custbody_kbs_tempitem_data');
                        tempDataObject = tempDataString && JSON.parse(tempDataString);

                        if (tempDataObject && tempDataObject[lineId]) {
                            curObj = tempDataObject[lineId];

                            Object.keys(curObj).forEach(function (fieldId) {
                                currentRecord.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: fieldId,
                                    value: curObj[fieldId],
                                    ignoreFieldChange: true,
                                    fireSlavingSync: false
                                });
                            });
                        }
                    }
                }
            }
        }

        // /**
        // * @param {ClientScriptContext.saveRecord} context
        // */
        // function saveRecord(context) {
        //
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

        /**
        * @param {ClientScriptContext.validateLine} context
        */
        function validateLine(context) {
            var currentRecord = context.currentRecord;
            var custVendor;
            var povendor;

            povendor = currentRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'povendor'
            });
            custVendor = currentRecord.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_vendor'
            });

            if (povendor && (povendor !== custVendor)) {
                currentRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_vendor',
                    value: povendor,
                    ignoreFieldChange: true,
                    fireSlavingSync: false
                });
            }

            return true;
        }

        return {
            cancelOrderClick: cancelOrderClick,
            fieldChanged: fieldChanged,
            // lineInit: lineInit,
            // pageInit: pageInit,
            postSourcing: postSourcing,
            // saveRecord: saveRecord,
            // sublistChanged: sublistChanged,
            // validateDelete: validateDelete,
            // validateField: validateField,
            // validateInsert: validateInsert,
            validateLine: validateLine
        };
    }

);
