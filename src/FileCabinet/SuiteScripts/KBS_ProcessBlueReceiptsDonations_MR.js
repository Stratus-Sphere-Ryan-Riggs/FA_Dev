/* eslint-disable no-param-reassign */
/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define([
    'N/search',
    'N/record',
    'N/runtime',
    'N/format'
],

/**
 * @param {N_search} nsSearch
 * @param {N_record} nsRecord
 * @param {N_runtime} nsRuntime
 * @param {N_format} nsFormat
*/

function (nsSearch, nsRecord, nsRuntime, nsFormat) {
    var recordType = 'customrecord_donation_import';

    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function isEmpty(stValue) {
        if ((stValue === '') || (stValue == null) || (stValue === undefined) || (stValue === false)) {
            return true;
        }
        return false;
    }
    function checkForSalesOrders(donationId) {
        var salesorderSearchObj = nsSearch.create({
            type: 'salesorder',
            filters:
            [
                ['type', 'anyof', 'SalesOrd'],
                'AND',
                ['custbody_associated_blue_import', 'anyof', donationId]
            ],
            columns:
            [
                nsSearch.createColumn({
                    name: 'ordertype',
                    sort: nsSearch.Sort.ASC,
                    label: 'Order Type'
                })
            ]
        });
        var searchResultCount = salesorderSearchObj.runPaged().count;
        if (searchResultCount > 0) {
            return true;
        }
        return false;
    }

    function getEntity(recType, donor, donationID, exceptionTxt) {
        var searchResultCount;
        var searchObj;
        var memberID = null;
        var entityID;
        var odysseyID;
        var blocked = 'F';
        var entityIDMatch;
        var exceptionText = exceptionTxt;
        log.debug('donor in getEntity', donor);
        if (donor) {
            log.debug('donor in getEntity2', donor);
            searchObj = nsSearch.create({
                type: recType,
                filters:
                [
                    ['custentity_blocked', 'is', 'F'],
                    'AND',
                    ['isinactive', 'is', 'F'],
                    'AND',
                    [
                        ['entityid', 'is', donor],
                        'OR',
                        ['custentity_odyssey_number', 'is', donor]
                    ]
                ],
                columns:
                [
                    nsSearch.createColumn({ name: 'entityid' }),
                    nsSearch.createColumn({ name: 'custentity_blocked' }),
                    nsSearch.createColumn({ name: 'custentity_odyssey_number' })
                ]
            });
            searchResultCount = searchObj.runPaged().count;
            log.debug('getEntity searchResultCount', searchResultCount);
            searchObj.run().each(function (result) {
                entityID = result.getValue({
                    name: 'entityid'
                });
                log.debug(entityID, entityID);
                odysseyID = result.getValue({
                    name: 'custentity_odyssey_number'
                });
                if (recType === 'customer' || recType === 'vendor') {
                    blocked = result.getValue('custentity_blocked');
                }
                if ((entityID === donor || odysseyID === donor) && blocked !== 'T') {
                    memberID = result.id;
                    entityIDMatch = true;
                    log.debug('debug', 'member match ');
                }
                // .run().each has a limit of 4,000 results
                return true;
            });

            if (!entityIDMatch) {
                exceptionText += ' - Blocked';
                log.error('No Entity ID Match', exceptionText + ' donationID: ' + donationID);
            }
            log.debug('entityIDMatch', entityIDMatch);
            if (searchResultCount === 0) {
                exceptionText += ' - Unknown';
                log.error('No search results ', exceptionText + ' donationID: ' + donationID);
            }
            // log.debug('searchResultCount', searchResultCount);
        } else {
            log.error('Unknown Error', exceptionText + ' donationID: ' + donationID);
        }
        // log.debug('memberID', memberID);
        return memberID;
    }

    function searchItemID(itemName, donationChannel) {
        var searchItemId = null;
        var itemsFound;
        var itemSearchObj;
        var searchResultCount;
        var filters;
        var columns;

        if (itemName) {
            log.debug('in searchitemID', itemName);
            itemSearchObj = nsSearch.create({
                type: 'item',
                filters:
            [
                ['name', 'is', itemName],
                'AND',
                ['isinactive', 'is', 'F'],
                'AND',
                ['custitem_product_channel', 'anyof', donationChannel],
                'AND',
                ['custitem_retail_item', 'is', 'T']
            ],
                columns:
            [
                nsSearch.createColumn({
                    name: 'itemid',
                    sort: nsSearch.Sort.ASC,
                    label: 'Name'
                }),
                nsSearch.createColumn({ name: 'displayname', label: 'Display Name' })
            ]
            });
            searchResultCount = itemSearchObj.runPaged().count;
            log.debug('itemSearchObj result count', searchResultCount);
            itemsFound = itemSearchObj.run().getRange(0, 1);
            log.debug('itemsFound', itemsFound.length);
            if (itemsFound.length > 0) {
                searchItemId = itemsFound[0].id;
                log.debug('item found id', searchItemId);
            } else {
                columns = [];
                columns.push(nsSearch.createColumn({ name: 'custrecord_fa_associated_item' }));
                filters = [];
                filters.push(nsSearch.createFilter({ name: 'custrecord_donation_item_name', operator: nsSearch.Operator.IS, values: itemName }));
                itemSearchObj = nsSearch.create({
                    type: 'customrecord_item_exceptions',
                    filters: filters,
                    columns: columns
                });
                itemsFound = itemSearchObj.run().getRange(0, 1);
                if (itemsFound) {
                    searchItemId = itemsFound[0].getValue({
                        name: 'custrecord_fa_associated_item'
                    });
                    // log.debug('searchItem', searchItemId);
                    // log.debug('Item found in item mapping ', itemsFound[0]);
                    // log.debug('Item found in item mapping ', itemsFound[0].getValue({
                    //     name: 'custrecord_fa_associated_item'
                    // }));
                } else {
                    log.debug('No Items found', 'No items found');
                }
            }
        }
        return searchItemId;
    }
    function lookWarehouse(donationID, memberDonor) {
        var donationRecord = nsRecord.load({
            type: recordType,
            id: donationID,
            isDynamic: true
        });

        // get address fields
        var warehouseCode = donationRecord.getValue({ fieldId: 'custrecord_donation_warehouse_code' });
        var warehouseAddress = donationRecord.getValue({ fieldId: 'custrecord_warehouse_address' });
        var warehouseAddress2 = donationRecord.getValue({ fieldId: 'custrecord_warehouse_address_2' });
        var warehouseCity = donationRecord.getValue({ fieldId: 'custrecord_warehouse_city' });
        var warehouseZip = donationRecord.getValue({ fieldId: 'custrecord_warehouse_zip' });
        var warehouseName = donationRecord.getValue({ fieldId: 'custrecord_warehouse_name' });
        var warehouseSearch;
        var filters = [];
        var columns = [];
        var searchResults;

        log.debug('warehouse', warehouseCode);
        log.debug('debug', 'Inside lookup warehouse>memberDonor ' + memberDonor);
        log.debug('debug', 'Inside lookup warehouse>warehouseAddress ' + warehouseAddress);
        log.debug('debug', 'Inside lookup warehouse>warehouseAddress2 ' + warehouseAddress2);
        log.debug('debug', 'Inside lookup warehouse>warehouseCity ' + warehouseCity);
        log.debug('debug', 'Inside lookup warehouse>warehouseZip ' + warehouseZip);
        log.debug('debug', 'Inside lookup warehouse>warehouseName ' + warehouseName);

        if (memberDonor) {
            filters.push(nsSearch.createFilter({ name: 'custrecord_member_association', operator: nsSearch.Operator.IS, values: memberDonor }));
        }
        if (warehouseName) {
            filters.push(nsSearch.createFilter({ name: 'custrecord_entity_warehouse_name', operator: nsSearch.Operator.IS, values: warehouseName }));
        }
        if (warehouseAddress) {
            filters.push(nsSearch.createFilter({ name: 'custrecord_addr_line_1', operator: nsSearch.Operator.IS, values: warehouseAddress }));
        }
        if (warehouseAddress2) {
            filters.push(nsSearch.createFilter({ name: 'custrecord_address_line_2', operator: nsSearch.Operator.IS, values: warehouseAddress2 }));
        }
        if (warehouseCity) {
            filters.push(nsSearch.createFilter({ name: 'custrecord_address_city', operator: nsSearch.Operator.IS, values: warehouseCity }));
        }
        filters.push(nsSearch.createFilter({ name: 'isinactive', operator: nsSearch.Operator.IS, values: 'F' }));
        warehouseSearch = nsSearch.create({
            type: 'customrecord_address_contact_association',
            filters: filters,
            columns: null
        });
        searchResults = warehouseSearch.run().getRange(0, 1);
        log.debug('debug', 'warehouse results', searchResults);
        if (searchResults && searchResults.length > 0) {
            return searchResults[0];
        }

        filters = [];
        columns = [];
        columns.push(nsSearch.createColumn({ name: 'custrecord_fa_address_record' }));

        if (memberDonor) {
            filters.push(nsSearch.createFilter({ name: 'custrecord_address_exception_entity', operator: nsSearch.Operator.IS, values: memberDonor }));
        }
        // included warehouse name filter for ticket #6363 by Thilaga
        if (warehouseName) {
            filters.push(nsSearch.createFilter({ name: 'custrecord_warehouse_code', operator: nsSearch.Operator.IS, values: warehouseName }));
        }
        if (warehouseAddress) {
            filters.push(nsSearch.createFilter({ name: 'custrecord_address_line_1', operator: nsSearch.Operator.IS, values: warehouseAddress }));
        }
        if (warehouseAddress2) {
            filters.push(nsSearch.createFilter({ name: 'custrecord_exception_address_line_2', operator: nsSearch.Operator.IS, values: warehouseAddress2 }));
        }
        filters.push(nsSearch.createFilter({ name: 'isinactive', operator: nsSearch.Operator.IS, values: 'F' }));
        warehouseSearch = nsSearch.create({
            type: 'customrecord_warehouse_address_exception',
            filters: filters,
            columns: columns
        });
        searchResults = warehouseSearch.run().getRange(0, 1);

        log.debug('debug', 'warehouse exception results', searchResults);
        if (searchResults && searchResults.length > 0) {
            return searchResults[0];
        }
        log.error('Warehouse Exception', donationID);
        return false;
    }

    function checkItemRecords(itemInSearch, donationChannel) {
        var itemIndex;
        var suffixForField;
        var itemID;
        var objItem;
        var arrayItems = [];
        var lookup;
        var handCodeObj;

        // loop through each of the 8 item fields on the donation import record
        for (itemIndex = 1; itemIndex <= 8; itemIndex += 1) {
            log.debug('TEST entering item loop', itemIndex);
            suffixForField = '_' + itemIndex;
            objItem = {};
            objItem.id = itemInSearch.id;
            objItem.handCode = itemInSearch[('custrecord_item_handling' + suffixForField)];
            objItem.item = itemInSearch[('custrecord_donation_item' + suffixForField)];
            objItem.donationUnits = itemInSearch[('custrecord_donation_units' + suffixForField)];
            objItem.pounds = itemInSearch[('custrecord_donation_pounds' + suffixForField)];
            objItem.itemDesc = itemInSearch[('custrecord_donation_item_description' + suffixForField)];
            objItem.itemDate = itemInSearch[('custrecord_item_date' + suffixForField)];
            // log.debug('searchItemID args', item + ' ' + donationID + ' ' + itemIndex + ' ' + donationChannel);
            log.debug('item + donationChannel', objItem.item + ' ' + donationChannel);
            objItem.itemID = searchItemID(objItem.item, donationChannel);
            log.debug('returned itemID', itemID);
            if (objItem.handCode === '' && objItem.itemID && objItem.itemID !== '') {
                // Get handling code form item record if blank
                log.debug('before lookup');
                log.debug('id', objItem.itemID);
                lookup = nsSearch.lookupFields({ type: 'item', id: objItem.itemID, columns: ['custitem_storage_requirements'] });
                log.debug('after lookup', lookup);
                handCodeObj = lookup.custitem_storage_requirements[0];
                objItem.handCode = handCodeObj.text;
                log.debug('handCodeObj.text', handCodeObj.text);
            }

            if (objItem.item && objItem.item !== '' && objItem.itemID && objItem.itemID !== '') {
                arrayItems.push(objItem);
            }
        }
        return arrayItems;

    }
    function createSalesOrder(donationID, donorID, memberID, items, addressRecReturned) {
        // var donationsSavedSearch = context.getParameter({ name: 'custscript_donations_saved_search2' });
        var runtime = nsRuntime.getCurrentScript();
        var oppFund = runtime.getParameter({ name: 'custscript_opp_fund2' });
        var oppProgram = runtime.getParameter({ name: 'custscript_opp_program2' });
        var oppClass = runtime.getParameter({ name: 'custscript_opp_class2' });
        var numberBlueDonation = runtime.getParameter({ name: 'custscript_blue_donation_order_type2' });
        var soReceiptedStatus = runtime.getParameter({ name: 'custscript_so_status2' });
        var defCarrier = runtime.getParameter({ name: 'custscript_carrier_default2' });
        var salesOrderRec;
        var salesOrderId;
        var fieldLookUp;
        var shipmentNumber;
        var fullDate;
        var dateCreated;
        var pickUpDate;
        var todayDate;
        // var recType;
        var addressID = '';
        var totalpoundsSO;
        var x = 0;
        var filterWH;
        var warehouseSearch;
        var resultsSavedSearchWH;
        var addressIDFromDonationRec;
        var y;

        log.debug('inside create SO function');
        log.debug('oppFund', oppFund);
        log.debug('oppProgram', oppProgram);
        try {
            salesOrderRec = nsRecord.create({
                type: nsRecord.Type.SALES_ORDER
            });

            fieldLookUp = nsSearch.lookupFields({
                type: recordType,
                id: donationID,
                columns: ['custrecord_donation_shipment_no', 'custrecord_full_date', 'created',
                    'custrecord_item_date_1', 'custrecord_donation_title', 'custrecord_donation_email', 'custrecord_user_name', 'custrecord_ns_warehouse']
            });
            shipmentNumber = fieldLookUp.custrecord_donation_shipment_no;
            addressIDFromDonationRec = fieldLookUp.custrecord_ns_warehouse;
            addressID = addressIDFromDonationRec[0].value;
            log.debug('addressIDFromDonationRec', addressIDFromDonationRec);
            log.debug('addressID', addressID);
            fullDate = fieldLookUp.custrecord_full_date;
            if (fullDate === '' || fullDate == null) {
                todayDate = new Date();
                fullDate = nsFormat.format({ value: todayDate, type: nsFormat.Type.DATE });
                log.debug('Full Date ', fullDate);
            } else {
                fullDate = new Date(fullDate);
            }
            log.debug('fieldLookUp.custrecord_item_date_1', fieldLookUp.custrecord_item_date_1);
            dateCreated = fieldLookUp.created;
            pickUpDate = nsFormat.format({ value: fieldLookUp.custrecord_item_date_1, type: nsFormat.Type.DATE });
            // userName = fieldLookUp.custrecord_user_name;
            // log.debug('userName', userName);
            // userID = getEntity('employee', userName, donationID, '');

            // log.debug('shipNum, fullDate, dateCreated', pickUpDate + ' ' + title + ' ' + donationEmail + ' ' + userName);

            salesOrderRec.setValue({ fieldId: 'custbody_opportunity_donor', value: donorID });
            salesOrderRec.setValue({ fieldId: 'custbody_donation_reference_number', value: shipmentNumber });
            salesOrderRec.setValue({ fieldId: 'entity', value: memberID });
            salesOrderRec.setValue({ fieldId: 'custbody_receipt_received_date', value: fullDate });
            salesOrderRec.setValue({ fieldId: 'custbody_donationdate', value: new Date(pickUpDate) });
            salesOrderRec.setValue({ fieldId: 'custbody_release_date', value: new Date(dateCreated) });
            // changed for ticket #5395 - from old code
            // salesOrderRec.setValue({ fieldId: 'trandate', value: new Date(dateCreated) });
            salesOrderRec.setValue({ fieldId: 'custbody_associated_blue_import', value: donationID });
            // if (userID) {
            //     salesOrderRec.setText({ fieldId: 'custbody_createdby', value: userName });
            // }
            salesOrderRec.setValue({ fieldId: 'custbody_order_type', value: numberBlueDonation });
            salesOrderRec.setValue({ fieldId: 'custbody_order_status', value: soReceiptedStatus });
            salesOrderRec.setValue({ fieldId: 'department', value: oppProgram });
            salesOrderRec.setValue({ fieldId: 'location', value: oppFund });
            salesOrderRec.setValue({ fieldId: 'class', value: oppClass });
            filterWH = [];

            filterWH.push(nsSearch.createFilter({ name: 'custrecord_member_association', operator: nsSearch.Operator.IS, values: memberID }));
            filterWH.push(nsSearch.createFilter({ name: 'custrecord_retail_donation_location', operator: nsSearch.Operator.IS, values: 'T' }));
            filterWH.push(nsSearch.createFilter({ name: 'isinactive', operator: nsSearch.Operator.IS, values: 'F' }));
            warehouseSearch = nsSearch.create({
                type: 'customrecord_address_contact_association',
                filters: filterWH,
                columns: null
            });
            resultsSavedSearchWH = warehouseSearch.run().getRange(0, 1);
            if (resultsSavedSearchWH && resultsSavedSearchWH.length > 0) {
                salesOrderRec.setValue({ fieldId: 'custbody_drop_off_location1', value: resultsSavedSearchWH[0].id });
            }

            // recType = addressRecReturned.recordType;

            // The mappings below were to the Opp but the fields aren't on the SO
            //     oppRecord.setFieldValue('expectedclosedate', pickUpDate);
            //     oppRecord.setFieldValue('title', title);
            //     oppRecord.setFieldValue('custbody_opp_email', donationEmail);
            //     oppRecord.setFieldValue('custbody_offer_date', createdDate);


            // log.debug('debug', 'Step Thi ' + recType);
            // if (recType === 'customrecord_address_contact_association') {

            //     addressID = addressRecReturned.id;
            //     log.debug('debug', 'Step Thi>addressRecReturned ' + addressRecReturned);
            //     // Sales Order does not have field 'custbody_warehouse_id'
            //     salesOrderRec.setValue({ fieldId: 'custbody_warehouse_1', value: addressID });
            //     // oppRecord.setFieldValue('custbody_warehouse_id', addressID);
            //     log.debug('debug', 'Step Thi>addressID ' + addressID);

            // } else {

            //     addressID = addressRecReturned.getValue({
            //         name: 'custrecord_fa_associated_item'
            //     });
            //     // Sales Order does not have field 'custbody_warehouse_id'
            //     salesOrderRec.setValue({ fieldId: 'custbody_warehouse_1', value: addressID });
            //     // oppRecord.setFieldValue('custbody_warehouse_id', addressID);

            // }

            // Create lines
            totalpoundsSO = parseFloat('0');
            for (y = 0; y < items.length; y += 1) {
                // if (parseFloat(items[x].donationUnits) > 0 && parseFloat(items[x].pounds) > 0)
                if (parseFloat(items[y].donationUnits) !== 0 && parseFloat(items[y].pounds) !== 0) {
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: x,
                        value: items[y].itemID
                    });
                    // log.debug('items[x].itemID', items[x].itemID);
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: x,
                        value: parseFloat(items[y].donationUnits)
                    });
                    // log.debug('items[x].donationUnits', items[x].donationUnits);
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: x,
                        value: 0
                    });
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: x,
                        value: 0
                    });
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
                        line: x,
                        value: items[y].itemDesc
                    });
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcolfa_vendor_item_name',
                        line: x,
                        value: items[y].itemDesc
                    });
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_total_pounds',
                        line: x,
                        value: items[y].pounds
                    });
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_total_weight',
                        line: x,
                        value: items[y].pounds
                    });
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'class',
                        line: x,
                        value: oppClass
                    });
                    log.debug('oppClass', oppClass);
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'department',
                        line: x,
                        value: oppProgram
                    });
                    // log.debug('oppProgram', oppProgram);

                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        line: x,
                        value: oppFund
                    });
                    // log.debug('oppFund', oppFund);

                    salesOrderRec.setSublistText({
                        sublistId: 'item',
                        fieldId: 'custcol_donation_reason',
                        line: x,
                        text: 'UNKNOWN'
                    });

                    totalpoundsSO = parseFloat(totalpoundsSO) + parseFloat(items[y].pounds);
                    if (items[0].itemDate) {
                        salesOrderRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcolcustcol_usebydate',
                            line: x,
                            value: new Date(items[0].itemDate)
                        });

                    } else if (items[y].itemDate) {
                        salesOrderRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcolcustcol_usebydate',
                            line: x,
                            value: new Date(items[y].itemDate)
                        });
                    }
                    log.debug('addressID', addressID);
                    if (addressID) {
                        salesOrderRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_pickup_location',
                            line: x,
                            value: addressID
                        });

                    }
                    salesOrderRec.setSublistText({
                        sublistId: 'item',
                        fieldId: 'custcol_storage_requirements',
                        line: x,
                        text: items[y].handCode.toUpperCase()
                    });
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_vendor',
                        line: x,
                        value: donorID
                    });
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_gross_wt_received',
                        line: x,
                        value: parseFloat(items[y].donationUnits)
                    });
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_member_bank',
                        line: x,
                        value: memberID
                    });
                    if (resultsSavedSearchWH && resultsSavedSearchWH.length > 0) {
                        salesOrderRec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_drop_off_location',
                            line: x,
                            value: resultsSavedSearchWH[0].id
                        });
                    }
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_product_channel',
                        line: x,
                        value: '3'
                    });
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'isclosed',
                        line: x,
                        value: true
                    });
                    // Set to Receipted (internal id: 5)
                    salesOrderRec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_item_status_field',
                        line: x,
                        value: '5'
                    });

                    // Following commented out in old script as well
                    // oppRecord.setCurrentLineItemValue('item', 'units', i, items[x].donationUnits);
                    // oppRecord.setCurrentLineItemValue('item', 'custcol_handing_code', items[x].handCode);
                    // oppRecord.setCurrentLineItemValue('item', 'custcol_storage_requirements', items[x].handCode);
                    // salesOrderRec.commitLine({
                    //     sublistId: 'item'
                    // });
                    x += 1;
                }

            }

            log.debug('totalpoundsSO', totalpoundsSO);
            if (parseFloat(totalpoundsSO) === 0) {
                nsRecord.submitFields({
                    type: recordType,
                    id: donationID,
                    values: {
                        custrecord_processed: true,
                        custrecord_kbs_processingstatus: 3
                    }
                });
                return true;
            }
            salesOrderRec.setValue({ fieldId: 'custbody_total_gross_weight_fulfilled', value: totalpoundsSO });
            salesOrderRec.setValue({ fieldId: 'custbody_total_receipted_qty', value: totalpoundsSO });
            salesOrderRec.setValue({ fieldId: 'custbody_total_pounds', value: totalpoundsSO });
            salesOrderRec.setValue({ fieldId: 'custbody_pickup_date', value: new Date(fieldLookUp.custrecord_item_date_1) });
            salesOrderRec.setValue({ fieldId: 'orderstatus', value: 'B' });
            salesOrderRec.setValue({ fieldId: 'custbody_please_wait_no_tms', value: true });
            salesOrderRec.setText({ fieldId: 'custbody_donation_reason_code', text: 'UNKNOWN' });
            salesOrderRec.setValue({ fieldId: 'custbody_receipted_by', value: fieldLookUp.custrecord_user_name });
            salesOrderRec.setText({ fieldId: 'custbody_shipping_method_code', text: 'Member Arranged' });
            salesOrderRec.setText({ fieldId: 'custbodycustbody_shipment_method_code', text: 'Pickup' });
            salesOrderRec.setValue({ fieldId: 'custbody_donor_1', value: donorID });
            salesOrderRec.setValue({ fieldId: 'custbody_warehouse_1', value: addressID });
            salesOrderRec.setValue({ fieldId: 'custbody_drop_off_member_1', value: memberID });
            salesOrderRec.setValue({ fieldId: 'custbody_carrier_code', value: defCarrier });
            salesOrderRec.setValue({ fieldId: 'custbody_donation_category', value: '1' });

            // THE TWO FIELDS BELOW ARE OBSOLETE IF NO OPPORTUNITIES
            //             newSalesOrder.setFieldValue('custbody_fa_opportunity', oppID);
            //             newSalesOrder.setFieldValue('opportunity', oppID);

            try {
                salesOrderId = salesOrderRec.save({
                    enablesourcing: false,
                    ignoremandatoryfields: true
                });
                log.debug('Sales Order Created', 'Sales Order ID: ' + salesOrderId);
                nsRecord.submitFields({
                    type: recordType,
                    id: donationID,
                    values: {
                        custrecord_processed: true,
                        custrecord_kbs_processingstatus: 3
                    }
                });
            } catch (e) {
                log.error('ERROR', e);
            }

        } catch (e) {
            log.error('The Sales Order could not be created for donation id: ' + donationID, e);
        }
        return true;
    }

    function getInputData() {
        var context = nsRuntime.getCurrentScript();
        var donationsSavedSearch = context.getParameter({ name: 'custscript_donations_saved_search2' });
        var processafterdate = context.getParameter({ name: 'custscript_process_after_date2' });
        var donationSearch;

        donationSearch = nsSearch.load({ id: donationsSavedSearch });
        if (!isEmpty(processafterdate)) {
            donationSearch.filters.push(nsSearch.createFilter({ name: 'custrecord_full_date', operator: nsSearch.Operator.ONORAFTER, values: processafterdate }));
        }
        return donationSearch;
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
        var result = JSON.parse(context.value);
        var donorNumber;
        var memberNumber;
        var donationID;
        var memberDonor;
        var memberEntityId;
        var runtime = nsRuntime.getCurrentScript();
        var donationChannel = runtime.getParameter({ name: 'custscript_donation_channel2' });
        var addressRecReturned;
        var arrayItems = [];
        var soExists = false;


        // log.debug('result values', result.values);
        donorNumber = result.values.custrecord_donation_donor_no;
        // log.debug('debug', 'Step Thi ' + donorNumber);
        memberNumber = result.values.custrecord_donation_a2haffiliateid;
        donationID = result.values.id;
        soExists = checkForSalesOrders(donationID);
        if (soExists) {
            nsRecord.submitFields({
                type: recordType,
                id: donationID,
                values: {
                    custrecord_processed: true,
                    custrecord_kbs_processingstatus: 3
                }
            });
        } else {
            // create item records and search for item internal id
            arrayItems = checkItemRecords(result.values, donationChannel);
            memberDonor = getEntity('vendor', donorNumber, donationID, 'Donor Exception');
            log.debug('memberDonor', 'Step 1 ' + memberDonor);
            if (!(isEmpty(memberDonor))) {
                memberEntityId = getEntity('customer', memberNumber, donationID, 'Member Exception');
                log.debug('memberEntityId', memberEntityId);
                if (!(isEmpty(memberEntityId))) {
                    addressRecReturned = lookWarehouse(donationID, memberDonor);
                    log.debug('addressRecReturned', addressRecReturned);
                    createSalesOrder(donationID, memberDonor, memberEntityId, arrayItems, addressRecReturned);
                }
            }
        }
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
        // handleErrorIfAny(summary);
        // createSummaryRecord(summary);
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };

});
