/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define([
    'N/search',
    'N/record',
    'N/runtime',
    'N/format'
],

/**
 * @param {N_record} nsRecord
 * @param {N_search} nsSearch
 * @param {N_runtime} nsRuntime
 * @param {N_format} nsFormat
*/

function (nsSearch, nsRecord, nsRuntime, nsFormat) {
    var recordType = 'customrecord_donation_import';
    var bIsValueFound;
    var i;
    var exceptionMsg = '';
    var submitFieldsObj = {};
    // ------------------------------------------------- UTILITY FUNCTIONS -------------------------------------------------
    var Eval = {
        /**
         * Evaluate if the given string is empty string, null or undefined.
         *
         * @param {String}
         *            stValue - Any string value
         * @returns {Boolean}
         * @memberOf Eval
         * @author memeremilla
         */
        isEmpty: function (stValue) {
            if ((stValue === '') || (stValue == null) || (stValue === undefined)) {
                return true;
            }

            return false;
        },
        /**
        * Evaluate if the given string is an element of the array
        *
        * @param {String}
        *            stValue - String to find in the array.
        * @param {Array}
        *            arr - Array to be check for components.
        * @returns {Boolean}
        * @memberOf Eval
        * @author memeremilla
        */
        inArray: function (stValue, arr) {
            if (this.isEmpty(arr)) {
                return false;
            }

            bIsValueFound = false;

            for (i = 0; i < arr.length; i += 1) {
                if (stValue === arr[i]) {
                    bIsValueFound = true;
                    break;
                }
            }

            return bIsValueFound;
        }
    };

    // var Parse = {
    //     /**
    //      * Converts String to Float
    //      *
    //      * @author asinsin
    //      */
    //     forceFloat: function (stValue) {
    //         var flValue = parseFloat(stValue);

    //         if (isNaN(flValue)) {
    //             return 0.00;
    //         }

    //         return flValue;
    //     },

    //     forceNegative: function (stVal) {
    //         return this.forceFloat(stVal) * (-1);
    //     }
    // };
    function isEmpty(stValue) {
        if ((stValue === '') || (stValue == null) || (stValue === undefined) || (stValue === false)) {
            return true;
        }
        return false;
    }

    function exception(errorMessage, donationID) {
        var fieldLookUp;
        var currentErrorMessage;
        var newMessage = errorMessage;

        // fieldLookUp = nsSearch.lookupFields({
        //     type: recordType,
        //     id: donationID,
        //     columns: ['custrecord_donation_exception']
        // });
        // currentErrorMessage = fieldLookUp.custrecord_donation_exception;
        currentErrorMessage = exceptionMsg;
        if (currentErrorMessage.indexOf(errorMessage) === -1) {
            if (currentErrorMessage && currentErrorMessage !== '') {
                // newMessage = currentErrorMessage + ', ' + errorMessage;
                exceptionMsg = currentErrorMessage + ', ' + errorMessage;
            } else {
                exceptionMsg = errorMessage;
            }
            // nsRecord.submitFields({
            //     type: recordType,
            //     id: donationID,
            //     values: {
            //         custrecord_donation_exception: newMessage
            //     }
            // });
            // submitFieldsObj.custrecord_donation_exception = newMessage;
            log.debug('exception', newMessage);
        }

    }
    // function calculateDonationPounds(donationItems) {
    //     var totalPounds = 0;
    //     var x;
    //     for (x = 0; x < donationItems.length; x += 1) {
    //         totalPounds += parseFloat(donationItems[x].pounds);
    //     }
    //     return totalPounds;
    // }
    // function calculateSOPounds(soRec) {
    //     var totalPounds = 0;
    //     var linePounds;
    //     var x;
    //     var soItems = soRec.getLineCount({ sublistId: 'item' });
    //     for (x = 0; x < soItems; x += 1) {
    //         linePounds = soRec.getSublistValue({
    //             sublistId: 'item',
    //             fieldId: 'custcol_total_pounds',
    //             line: x
    //         });
    //         log.debug('soRecId', soRec.id);
    //         log.debug('linePounds', linePounds);
    //         if (linePounds) {
    //             totalPounds += parseFloat(linePounds);
    //         }
    //     }
    //     return totalPounds;
    // }
    function setFields(rec, fieldsObj) {
        var keys = Object.keys(fieldsObj);
        var len = keys.length;
        var x = 0;
        var prop;
        var value;

        while (x < len) {
            prop = keys[x];
            value = fieldsObj[prop];
            rec.setValue({
                fieldId: prop,
                value: value
            });
            x += 1;
        }
        rec.save();
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

        if (donor) {
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
                    'entityid',
                    'custentity_blocked',
                    'custentity_odyssey_number'
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
                // exceptionText += ' - Blocked';
                exception(exceptionText + 'Exception', donationID);
            }
            log.debug('entityIDMatch', entityIDMatch);
            if (searchResultCount === 0) {
                exceptionText += '- Unknown';
                exception(exceptionText, donationID);
            }
            // log.debug('searchResultCount', searchResultCount);
        } else {
            exception(exceptionText, donationID);
        }
        log.debug('memberID', memberID);
        return memberID;
    }
    function searchItemID(itemName, donationID, itemIndex, donationChannel) {
        var searchItemId = null;
        var itemsFound;
        var itemSearchObj;
        var searchResultCount;
        var filters;
        var columns;

        if (itemName) {
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
                if (itemsFound.length > 0) {
                    searchItemId = itemsFound[0].getValue({
                        name: 'custrecord_fa_associated_item'
                    });
                    // log.debug('searchItem', searchItemId);
                    // log.debug('Item found in item mapping ', itemsFound[0]);
                    // log.debug('Item found in item mapping ', itemsFound[0].getValue({
                    //     name: 'custrecord_fa_associated_item'
                    // }));
                } else {
                    exception('Item # ' + itemIndex + ' Name: ' + itemName + ' not found', donationID);
                }
            }
        }
        return searchItemId;
    }

    function checkItemRecords(rec, ARR_STORAGE_TYPES, itemDate1, donationChannel) {
        var itemIndex;
        var donationID = rec.id;
        var item;
        var donationUnits;
        var pounds;
        var itemDesc;
        var itemDate;
        var itemID;
        var suffixForField;
        var handCode;
        var arrayItems = [];
        var objItem;
        var fullDate;
        var handCodeUpperCase;
        var handlingCodeMappingKbsSearchObj;
        var searchResult;
        var itemHandlingField;
        var itemFound = false;
        var donationUnitsTotal = 0;
        var poundsTotal = 0;

        // loop through each of the 8 item fields on the donation import record
        for (itemIndex = 1; itemIndex <= 8; itemIndex += 1) {
            suffixForField = '_' + itemIndex;
            objItem = {};
            itemHandlingField = 'custrecord_item_handling' + suffixForField;
            item = rec.getValue('custrecord_donation_item' + suffixForField);
            donationUnits = rec.getValue('custrecord_donation_units' + suffixForField);
            pounds = rec.getValue('custrecord_donation_pounds' + suffixForField);
            objItem.item = item;
            objItem.pounds = rec.getValue('custrecord_donation_pounds' + suffixForField);
            itemDesc = rec.getValue('custrecord_donation_item_description' + suffixForField);
            itemDate = rec.getValue('custrecord_item_date' + suffixForField);
            handCode = rec.getValue('custrecord_item_handling' + suffixForField);
            fullDate = rec.getValue('custrecord_full_date');
            donationUnitsTotal += parseFloat(donationUnits);
            poundsTotal += parseFloat(pounds);
            log.debug('fullDate', fullDate);
            arrayItems.push(objItem);
            if (item && item !== '') {
                itemFound = true;
                log.debug('item, itemDate, itemDate1', item + ' ' + itemDate + ' ' + itemDate1);
                // if ((itemDate === '' || itemDate == null) && (itemDate1 === '' || itemDate1 == null)) {
                //     log.debug('debug', 'IN ITEM DATE EXCEPTION Item Date ' + itemDate + ' date ' + itemDate1);
                //     exception('Missing Item Pick Date for #' + itemIndex + ' Exception', donationID);
                // }
                if (fullDate === '' || fullDate == null) {
                    log.debug('debug', 'FULL DATE field is empty ');
                    exception('Missing Full Date', donationID);
                }
                if (pounds === '' || pounds == null) {
                    exception('Invalid Item Missing a Pound Value for #' + itemIndex + ' Exception', donationID);
                }
                if (donationUnits === '' || donationUnits == null) {
                    exception('Invalid Item Missing a Donation Unit Value for #' + itemIndex + ' Exception', donationID);
                }
                log.debug('debug', 'Items pounds ' + pounds + ' units ' + donationUnits);
                if (parseFloat(pounds) === 0 && parseFloat(donationUnits) > 0) {
                    log.debug('debug', 'zero pounds');
                    exception('Item Exception: Item Zero Pound for #' + itemIndex + ' Exception', donationID);
                }
                if (parseFloat(pounds) < 0 && parseFloat(donationUnits) > 0) {
                    exception('Item Exception: Negative Pounds and Positive Units for #' + itemIndex + ' Exception', donationID);
                }
                if (parseFloat(pounds) > 0 && parseFloat(donationUnits) === 0) {
                    log.debug('debug', 'zero donations');
                    exception('Item Exception: Item Zero Unit for #' + itemIndex + ' Exception', donationID);
                }

                if (parseFloat(pounds) > 0 && parseFloat(donationUnits) < 0) {
                    log.debug('debug', 'zero donations');
                    exception('Item Exception: Negative Units and Positive Pounds for #' + itemIndex + ' Exception', donationID);
                }

            } else {
                log.debug('no item for index', 'Index: ' + itemIndex);
                if (itemDesc) {
                    exception('Missing Item #' + itemIndex + ' Exception', donationID);
                }
            }
            itemID = searchItemID(item, donationID, itemIndex, donationChannel);
            log.debug('item info', item + ' ' + donationID + ' ' + itemIndex + ' ' + donationChannel);
            log.debug('returned itemID', itemID);

            if (item && item !== '' && itemID) {
                log.debug('debug', 'Step 99 Storage' + ARR_STORAGE_TYPES);
                // Edited to ticket #5435
                // fieldLookUp = nsSearch.lookupFields({
                //     type: nsSearch.Type.NON_INVENTORY_ITEM,
                //     id: itemID,
                //     columns: ['custitem_storage_requirements']
                // });
                // itemHandling = fieldLookUp.custitem_storage_requirements[0].text;
                // log.debug('debug', 'itemHandling: ' + itemID + ' ' + itemHandling);

                // log.debug('debug', 'Item Date ' + itemIndex + ' date ' + itemDate1);

                handCodeUpperCase = handCode.toUpperCase();
                log.debug('handCode', handCode);
                if (handCode !== '' && handCode != null) {
                    if (!Eval.inArray(handCodeUpperCase, ARR_STORAGE_TYPES)) {
                        // Check to see if in custom list customrecord_handling_code_mapping_kbs
                        handlingCodeMappingKbsSearchObj = nsSearch.create({
                            type: 'customrecord_handling_code_mapping_kbs',
                            filters:
                            [
                                ['custrecord_kbs_don_hc_name', 'is', handCode]
                            ],
                            columns:
                            [
                                nsSearch.createColumn({ name: 'custrecord_fa_associated_hc_kbs' })
                            ]
                        });
                        searchResult = handlingCodeMappingKbsSearchObj.run().getRange(0, 1);
                        if (searchResult && searchResult.length > 0) {
                            handCode = searchResult[0].getText({
                                name: 'custrecord_fa_associated_hc_kbs'
                            });
                            submitFieldsObj[itemHandlingField] = handCode;
                        } else {
                            submitFieldsObj[itemHandlingField] = '';
                        }
                        log.debug('debug', 'Step 99-A Storage');

                    }
                }
                // if (handCode === '' || handCode == null) {
                //     // handCode = itemHandling;
                //     // itemHandlingField = 'custrecord_item_handling' + suffixForField;
                //     // nsRecord.submitFields({
                //     //     type: recordType,
                //     //     id: donationID,
                //     //     values: {
                //     //         itemHandlingField: itemHandling
                //     //     }
                //     // });
                //     exception('Missing Item Handling Code for item #' + itemIndex, donationID);
                // }
            } else if (isEmpty(itemDesc) && (pounds !== '' && pounds !== '0') && (donationUnits !== '' && donationUnits !== '0')) {
                log.debug('debug', 'NO ITEM DATA');
                exception('Missing Item #' + itemIndex + ' Exception', donationID);
            }
        }
        if (itemFound === false) {
            exception('No Items found', donationID);
        } else if (donationUnitsTotal === 0 && poundsTotal === 0) {
            exception('Total Pounds & Donation Units are zero', donationID);
        }
        return arrayItems;
    }
    function searchDuplicateDonations(donorID, memberID, shipmentNbr, arrayItems, recId) {
        // var context = nsRuntime.getCurrentScript();
        // var salesOrderSearch = context.getParameter({ name: 'custscript_salesorder_search' });
        var arrayItem = arrayItems;
        var filters = [];
        var searchResultCount;
        // var itemsInSearch;
        // var itemsInSO;
        // var soId;
        // var soRec;
        // var totalPoundsInDonation;
        // var totalPoundsInSO;
        // var totalItemsInSearch = 0;
        // var totalPoundsInSearch = 0;
        var donationItemField;
        var donationPoundsField;
        var donationItem;
        var donationPounds;
        var duplicate = false;
        var status;
        var readyToProcessOrProcessed = false;
        var processedCheckBox;
        // var mandatorySearch = nsSearch.load({
        //     id: salesOrderSearch
        // });
        var itemIndex;
        var donationImportSearchObj;
        // var pickUpDateFormatted = nsFormat.format({ value: pickUpDate, type: nsFormat.Type.DATE });
        filters = [];
        filters.push(nsSearch.createFilter({ name: 'internalidnumber', operator: nsSearch.Operator.NOTEQUALTO, values: recId }));
        filters.push(nsSearch.createFilter({ name: 'custrecord_donation_shipment_no', operator: nsSearch.Operator.IS, values: shipmentNbr }));
        // filters.push(nsSearch.createFilter({ name: 'custrecord_full_date', operator: nsSearch.Operator.ON, values: fullDate }));
        // filters.push(nsSearch.createFilter({ name: 'custrecord_item_date_1', operator: nsSearch.Operator.ON, values: pickUpDateFormatted }));
        if (!(isEmpty(donorID))) {
            filters.push(nsSearch.createFilter({ name: 'custrecord_ns_donor', operator: nsSearch.Operator.ANYOF, values: donorID }));
        }
        if (!(isEmpty(memberID))) {
            filters.push(nsSearch.createFilter({ name: 'custrecord_ns_member', operator: nsSearch.Operator.ANYOF, values: memberID }));
        }
        donationImportSearchObj = nsSearch.create({
            type: 'customrecord_donation_import',
            filters: filters,
            columns:
            [
                nsSearch.createColumn({
                    name: 'id',
                    sort: nsSearch.Sort.ASC,
                    label: 'ID'
                }),
                nsSearch.createColumn({ name: 'custrecord_donation_pounds_1', label: 'Pounds 1' }),
                nsSearch.createColumn({ name: 'custrecord_donation_pounds_2', label: 'Pounds 2' }),
                nsSearch.createColumn({ name: 'custrecord_donation_pounds_3', label: 'Pounds 3' }),
                nsSearch.createColumn({ name: 'custrecord_donation_pounds_4', label: 'Pounds 4' }),
                nsSearch.createColumn({ name: 'custrecord_donation_pounds_5', label: 'Pounds 5' }),
                nsSearch.createColumn({ name: 'custrecord_donation_pounds_6', label: 'Pounds 6' }),
                nsSearch.createColumn({ name: 'custrecord_donation_pounds_7', label: 'Pounds 7' }),
                nsSearch.createColumn({ name: 'custrecord_donation_pounds_8', label: 'Pounds 8' }),
                nsSearch.createColumn({ name: 'custrecord_donation_item_1', label: 'Item 1' }),
                nsSearch.createColumn({ name: 'custrecord_donation_item_2', label: 'Item 2' }),
                nsSearch.createColumn({ name: 'custrecord_donation_item_3', label: 'Item 3' }),
                nsSearch.createColumn({ name: 'custrecord_donation_item_4', label: 'Item 4' }),
                nsSearch.createColumn({ name: 'custrecord_donation_item_5', label: 'Item 5' }),
                nsSearch.createColumn({ name: 'custrecord_donation_item_6', label: 'Item 6' }),
                nsSearch.createColumn({ name: 'custrecord_donation_item_7', label: 'Item 7' }),
                nsSearch.createColumn({ name: 'custrecord_donation_item_8', label: 'Item 8' }),
                nsSearch.createColumn({ name: 'custrecord_kbs_processingstatus', label: 'status' }),
                nsSearch.createColumn({ name: 'custrecord_processed' })
            ]
        });
        searchResultCount = donationImportSearchObj.runPaged().count;
        log.debug('customrecord_donation_importSearchObj result count', searchResultCount);
        donationImportSearchObj.run().each(function (result) {
            duplicate = true;
            status = result.getValue('custrecord_kbs_processingstatus');
            processedCheckBox = result.getValue('custrecord_processed');

            for (itemIndex = 1; itemIndex <= 8; itemIndex += 1) {
                donationItemField = 'custrecord_donation_item_' + itemIndex;
                donationPoundsField = 'custrecord_donation_pounds_' + itemIndex;
                donationItem = result.getValue(donationItemField) || '';
                // Search returns 'Untitled' for empty item
                if (donationItem === 'Untitled') {
                    donationItem = '';
                }
                donationPounds = parseFloat(result.getValue(donationPoundsField) || 0);
                if (arrayItem[itemIndex - 1].pounds === '') {
                    arrayItem[itemIndex - 1].pounds = 0;
                }
                if (arrayItem[itemIndex - 1].pounds === 0 && donationPounds === 0) {
                    continue;
                }
                log.debug('donation and array lbs', donationPounds + ' ' + arrayItem[itemIndex - 1].pounds);
                if (donationPounds !== arrayItem[itemIndex - 1].pounds) {
                    log.debug('Duplicate check at index', '1: index: ' + itemIndex);
                    duplicate = false;
                    log.debug('different lbs', donationPounds + ' ' + arrayItem[itemIndex - 1].pounds);
                }
                log.debug('donation and array items', donationItem + ' ' + arrayItem[itemIndex - 1].item);
                if (donationItem !== arrayItem[itemIndex - 1].item) {
                    log.debug('Duplicate check', '2: index: ' + itemIndex);
                    duplicate = false;
                    log.debug('diff items', donationItem + ' ' + arrayItems[itemIndex - 1].item);
                }
                log.debug('donationPounds', donationPounds);

            }
            // If all criteria match for duplicate check to see if record is ready to process or processed, if not, then not duplicate
            if (duplicate === true && status !== '3' && status !== '2' && processedCheckBox !== true) {
                duplicate = false;
            }
            // totalPoundsInDonation = calculateDonationPounds(arrayItems);

            log.debug('duplicate', duplicate);
            if (duplicate === true) {

                // nsRecord.submitFields({
                //     type: recordType,
                //     id: recId,
                //     values: {
                //         custrecord_kbs_duplicate_bluereceipt: true
                //     }
                // });
                submitFieldsObj.custrecord_kbs_duplicate_bluereceipt = true;
                exception('Duplicate Donation Import record Id: ' + result.id, recId);
            }
            // .run().each has a limit of 4,000 results
            return true;
        });

        // filters = [];
        // log.debug('pickUpDateFormatted', pickUpDateFormatted);
        // if (!(isEmpty(donorID))) {
        //     filters.push(nsSearch.createFilter({ name: 'custbody_opportunity_donor', operator: nsSearch.Operator.IS, values: donorID }));
        // }
        // if (!(isEmpty(memberID))) {
        //     filters.push(nsSearch.createFilter({ name: 'entity', operator: nsSearch.Operator.IS, values: memberID }));
        // }
        // // The title field doesn't exist on the Sales Order record
        // // if (!(isEmpty(title))) {
        // //     filters.push(nsSearch.createFilter({ name: 'title', operator: nsSearch.Operator.IS, values: title }));
        // // }
        // // if (!(isEmpty(pickUpDateFormatted))) {
        // //     filters.push(nsSearch.createFilter({ name: 'expectedclosedate', operator: nsSearch.Operator.ON, values: pickUpDateFormatted }));
        // // }
        // if (!isEmpty(shipmentNbr)) {
        //     filters.push(nsSearch.createFilter({ name: 'custbody_donation_reference_number', operator: nsSearch.Operator.IS, values: shipmentNbr }));
        // }
        // mandatorySearch.filters = filters;
        // // mandatorySearch.columns = columns;
        // searchResultCount = mandatorySearch.runPaged().count;
        // log.debug('Sales Order searchResultCount', searchResultCount);
        // mandatorySearch.run().each(function (result) {

        //     itemsInSearch = result.getValue({ name: 'item', summary: 'COUNT' });
        //     soId = result.getValue({ name: 'internalid', summary: 'GROUP' });
        //     soRec = nsRecord.load({ type: 'salesorder', id: soId });
        //     itemsInSO = soRec.getLineCount({ sublistId: 'item' });
        //     totalPoundsInDonation = calculateDonationPounds(arrayItems);
        //     totalPoundsInSO = calculateSOPounds(soRec);
        //     log.debug('totalPoundsInSO', totalPoundsInSO);
        //     log.debug(' item # match', itemsInSearch === itemsInSO);
        //     log.debug('pounds match', totalPoundsInDonation === totalPoundsInSO);
        //     if (parseFloat(itemsInSearch) === itemsInSO && totalPoundsInDonation === totalPoundsInSO) {
        //         exception('Duplicate SO Id: ' + soId, recId);
        //     }
        //     return true;
        // });
    }
    function lookWarehouse(donationID, memberDonor) {
        var donationRecord = nsRecord.load({
            type: recordType,
            id: donationID,
            isDynamic: false
        });

        // get address fields
        var warehouseCode = donationRecord.getValue({ fieldId: 'custrecord_donation_warehouse_code' });
        var warehouseAddress = donationRecord.getValue({ fieldId: 'custrecord_warehouse_address' });
        var warehouseAddress2 = donationRecord.getValue({ fieldId: 'custrecord_warehouse_address_2' });
        var warehouseCity = donationRecord.getValue({ fieldId: 'custrecord_warehouse_city' });
        var warehouseZip = donationRecord.getValue({ fieldId: 'custrecord_warehouse_zip' });
        var warehouseName = donationRecord.getValue({ fieldId: 'custrecord_warehouse_name' });
        var warehouseSearch;
        var exceptionResultValue;
        var filters = [];
        var columns = [];
        var searchResults;

        if (warehouseName !== '' && warehouseName !== null && (warehouseAddress === '' || warehouseAddress === null)) {
            exception('Warehouse Exception: Name present but no Address', donationID);
        }
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
            // donationRecord.setValue({ fieldId: 'custrecord_ns_warehouse', value: searchResults[0].id });
            // donationRecord.save();
            log.debug('found in customrecord_address_contact_association', searchResults[0].id);
            return searchResults[0].id;
        }

        filters = [];
        columns = [];
        columns.push(nsSearch.createColumn({ name: 'custrecord_fa_address_record' }));

        if (memberDonor) {
            filters.push(nsSearch.createFilter({ name: 'custrecord_address_exception_entity', operator: nsSearch.Operator.IS, values: memberDonor }));
        }
        // included warehouse name filter for ticket #6363 by Thilaga - from old code
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


        if (searchResults && searchResults.length > 0) {

            // donationRecord.setValue({ fieldId: 'custrecord_ns_warehouse', value: exceptionResultValue });
            // donationRecord.save();
            exceptionResultValue = searchResults[0].getValue('custrecord_fa_address_record');
            log.debug('found in customrecord_warehouse_address_exception', searchResults[0].getValue('custrecord_fa_address_record'));
            return exceptionResultValue;
            // exception('Warehouse Exception: Inactive Entity with Active Mapping', donationID);
            // return false;
        }
        exception('Warehouse Exception: Invalid Entity and/or Mapping', donationID);
        return false;
    }

    // /**
    // * @param {UserEventContext.beforeLoad} context
    // */
    // function beforeLoad(context) {
    //
    // }

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
        var type = context.type;
        var pickUpDate;
        var runtime = nsRuntime.getCurrentScript();
        var storagerequirements = runtime.getParameter({ name: 'custscript_storage_requirements3' });
        var donationChannel = runtime.getParameter({ name: 'custscript_donation_channel3' });
        var ARR_STORAGE_TYPES = [];
        var memberDonor;
        var donorNumber;
        var memberNumber;
        var donationID = rec.id;
        var processingStatus;
        var fieldLookUp;
        var currentErrorMessage;
        var memberEntityId;
        var shipmentNbr;
        var addressRecReturned;
        var arrayItems = [];
        var x;
        var itemDateField;

        if (type === context.UserEventType.XEDIT) {
            rec = nsRecord.load({
                type: recordType,
                id: rec.id,
                isDynamic: false
            });
        }
        processingStatus = rec.getValue('custrecord_kbs_processingstatus');
        if (processingStatus !== '3' && type !== context.UserEventType.DELETE) {

            pickUpDate = rec.getValue('custrecord_item_date_1');
            donorNumber = rec.getValue('custrecord_donation_donor_no');
            memberNumber = rec.getValue('custrecord_donation_a2haffiliateid');
            shipmentNbr = rec.getValue('custrecord_donation_shipment_no');
            // fullDate = rec.getText('custrecord_full_date');
            ARR_STORAGE_TYPES = storagerequirements.split(',');

            arrayItems = checkItemRecords(rec, ARR_STORAGE_TYPES, pickUpDate, donationChannel);
            log.debug('arrayItems', arrayItems.length);
            // If no pickup date then look through rest of fields for one
            if (!pickUpDate) {
                for (x = 2; x <= arrayItems.length; x += 1) {
                    itemDateField = 'custrecord_item_date_' + x;
                    pickUpDate = rec.getValue(itemDateField);
                    if (pickUpDate) {
                        submitFieldsObj.custrecord_item_date_1 = pickUpDate;
                        break;
                    }
                }

            }
            log.debug('pickUpDate', pickUpDate);
            // checkItemRecords(rec, pickUpDate);

            // Make sure there is a member donor
            memberDonor = getEntity('vendor', donorNumber, donationID, 'Donor ');


            if (!(isEmpty(memberDonor))) {
                // nsRecord.submitFields({
                //     type: recordType,
                //     id: donationID,
                //     values: {
                //         custrecord_ns_donor: memberDonor
                //     }
                // });
                submitFieldsObj.custrecord_ns_donor = memberDonor;
                log.debug('submitted custrecord_ns_donor field', donationID + ' ' + memberDonor);
                // Make sure there is a valid customer
                memberEntityId = getEntity('customer', memberNumber, donationID, 'Member ');
                log.debug('memberEntityId', memberEntityId);
                if (!(isEmpty(memberEntityId))) {
                    // nsRecord.submitFields({
                    //     type: recordType,
                    //     id: donationID,
                    //     values: {
                    //         custrecord_ns_member: memberEntityId
                    //     }
                    // });
                    submitFieldsObj.custrecord_ns_member = memberEntityId;

                }
            }
            if (!pickUpDate) {
                exception('Item Date 1 is empty', donationID);
            }
            log.debug('shipmentNbr and pickUpDate', shipmentNbr + ' ' + pickUpDate);
            if (!isEmpty(shipmentNbr) && pickUpDate) {
                log.debug('Searching Duplicates');
                searchDuplicateDonations(memberDonor, memberEntityId, shipmentNbr, arrayItems, rec.id);
            }
            // Sets NS Warehouse here as well
            addressRecReturned = lookWarehouse(donationID, memberDonor);
            // if (!(isEmpty(addressRecReturned))) {
            //     nsRecord.submitFields({
            //         type: recordType,
            //         id: donationID,
            //         values: {
            //             custrecord_ns_warehouse: addressRecReturned.id
            //         }
            //     });
            // }
            // log.debug('addressRecReturned', addressRecReturned);

            // fieldLookUp = nsSearch.lookupFields({
            //     type: recordType,
            //     id: donationID,
            //     columns: ['custrecord_donation_exception']
            // });
            // currentErrorMessage = fieldLookUp.custrecord_donation_exception;
            currentErrorMessage = exceptionMsg;
            if (type !== context.UserEventType.XEDIT) {
                if (currentErrorMessage && currentErrorMessage !== '' && processingStatus !== '3') {
                    submitFieldsObj.custrecord_kbs_processingstatus = 1;
                    submitFieldsObj.custrecord_donation_exception = currentErrorMessage;
                    nsRecord.submitFields({
                        type: recordType,
                        id: donationID,
                        values: submitFieldsObj
                    });
                } else if (processingStatus === '1' || processingStatus === '') {
                    submitFieldsObj.custrecord_kbs_processingstatus = 2;
                    submitFieldsObj.custrecord_ns_warehouse = addressRecReturned;
                    submitFieldsObj.custrecord_donation_exception = '';
                    submitFieldsObj.custrecord_kbs_duplicate_bluereceipt = false;
                    nsRecord.submitFields({
                        type: recordType,
                        id: donationID,
                        values: submitFieldsObj
                    });
                }
                log.debug('submitFieldsObj', submitFieldsObj);
            } else if (currentErrorMessage && currentErrorMessage !== '' && processingStatus !== '3') {
                submitFieldsObj.custrecord_donation_exception = currentErrorMessage;
                submitFieldsObj.custrecord_kbs_processingstatus = 1;
                log.debug('submitFieldsObj', submitFieldsObj);
                setFields(rec, submitFieldsObj);
            } else if (processingStatus === '1' || processingStatus === '') {
                submitFieldsObj.custrecord_kbs_processingstatus = 2;
                submitFieldsObj.custrecord_ns_warehouse = addressRecReturned;
                submitFieldsObj.custrecord_donation_exception = '';
                submitFieldsObj.custrecord_kbs_duplicate_bluereceipt = false;
                log.debug('submitFieldsObj', submitFieldsObj);
                setFields(rec, submitFieldsObj);
            }


        }
    }


    return {
        // beforeLoad: beforeLoad,
        // beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
});
