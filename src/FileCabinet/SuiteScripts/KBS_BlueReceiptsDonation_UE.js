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

        currentErrorMessage = exceptionMsg;
        if (currentErrorMessage.indexOf(errorMessage) === -1) {
            if (currentErrorMessage && currentErrorMessage !== '') {
                // newMessage = currentErrorMessage + ', ' + errorMessage;
                exceptionMsg = currentErrorMessage + ', ' + errorMessage;
            } else {
                exceptionMsg = errorMessage;
            }
            log.debug('exception', newMessage);
        }

    }
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
        var weightOverride;

        weightOverride = rec.getValue('custrecord_kbs_weightoverride');
        // loop through each of the 8 item fields on the donation import record
        for (itemIndex = 1; itemIndex <= 8; itemIndex += 1) {
            suffixForField = '_' + itemIndex;
            objItem = {};
            itemHandlingField = 'custrecord_item_handling' + suffixForField;
            item = rec.getValue('custrecord_donation_item' + suffixForField);
            donationUnits = rec.getValue('custrecord_donation_units' + suffixForField);
            pounds = rec.getValue('custrecord_donation_pounds' + suffixForField) || 0;
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
            } else if (isEmpty(itemDesc) && (pounds !== '' && pounds != '0') && (donationUnits !== '' && donationUnits != '0')) {
                log.debug('debug', 'NO ITEM DATA');
                exception('Missing Item #' + itemIndex + ' Exception', donationID);
            }
        }
        if (itemFound === false) {
            exception('No Items found', donationID);
        } else if (donationUnitsTotal === 0 && poundsTotal === 0) {
            exception('Total Pounds & Donation Units are zero', donationID);
        } else if (poundsTotal >= 100000 && !weightOverride) {
            exception('Total Pounds exceeds 100,000.', donationID);
        } else if (poundsTotal <= -100000 && !weightOverride) {
            exception('Total Pounds exceeds -100,000.', donationID);
        }
        return arrayItems;
    }
    function searchDuplicateDonations(donorID, memberID, shipmentNbr, arrayItems, recId, pickUpDate) {
        var arrayItem = arrayItems;
        var filters = [];
        var searchResultCount;
        var donationItemField;
        var donationPoundsField;
        var donationItem;
        var donationPounds;
        var duplicate = false;
        var status;
        var processedCheckBox;
        var arrayItemsToCompare;
        var itemIndex;
        var donationImportSearchObj;
        var pickUpDateFormatted = nsFormat.format({ value: pickUpDate, type: nsFormat.Type.DATE });
        var x;
        filters = [];
        filters.push(nsSearch.createFilter({ name: 'internalidnumber', operator: nsSearch.Operator.NOTEQUALTO, values: recId }));
        filters.push(nsSearch.createFilter({ name: 'custrecord_donation_shipment_no', operator: nsSearch.Operator.IS, values: shipmentNbr }));
        // filters.push(nsSearch.createFilter({ name: 'custrecord_full_date', operator: nsSearch.Operator.ON, values: fullDate }));
        filters.push(nsSearch.createFilter({ name: 'custrecord_item_date_1', operator: nsSearch.Operator.ON, values: pickUpDateFormatted }));
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
            arrayItemsToCompare = arrayItem.slice();

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
                for (x = 0; x < arrayItemsToCompare.length; x += 1) {
                    if (donationItem === arrayItemsToCompare[x].item && donationPounds === arrayItemsToCompare[x].pounds) {
                        arrayItemsToCompare.splice(x, 1);
                        break;
                    }
                }
                log.debug('donationPounds', donationPounds);

            }
            // see if all values in array were found and removed - if not, then not a duplicate
            if (arrayItemsToCompare.length !== 0) {
                duplicate = false;
            }
            // If all criteria match for duplicate check to see if record is ready to process or processed, if not, then not duplicate
            if (duplicate === true && status !== '3' && status !== '2' && processedCheckBox !== true) {
                duplicate = false;
            }

            log.debug('duplicate', duplicate);
            if (duplicate === true) {

                submitFieldsObj.custrecord_kbs_duplicate_bluereceipt = true;
                exception('Duplicate Donation Import record Id: ' + result.id, recId);
            }
            // .run().each has a limit of 4,000 results
            return true;
        });

    }
    function lookWarehouse(donationID, memberDonor) {
        var donationRecord = nsRecord.load({
            type: recordType,
            id: donationID,
            isDynamic: false
        });

        // get address fields
        // get warehouseIntId below for mealconnect integration - when valid internal id is passed to NetSuite, do not complete address lookup
        var warehouseIntId = donationRecord.getValue({ fieldId: 'custrecord_ns_warehouse' });
        log.audit('warehouseIntId', warehouseIntId);
        // Determine if warehouse is active.
        if(warehouseIntId) {
            var inactiveWarehouseSearch = nsSearch.lookupFields({type: 'customrecord_address_contact_association', id: warehouseIntId, columns: 'isinactive'});
            var inactiveWarehouse = inactiveWarehouseSearch.isinactive;
            log.audit('isinactive', inactiveWarehouse);
        }
        // Only complete remainder below when warehouseIntID isEmpty or is inactive warehouse record
        if (inactiveWarehouse || isEmpty(warehouseIntId)) {
        log.audit('null warehouse or inactive warehouse',   isEmpty(warehouseIntId)  + ' ' + warehouseIntId + ' ' + inactiveWarehouse);
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

            exceptionResultValue = searchResults[0].getValue('custrecord_fa_address_record');
            log.debug('found in customrecord_warehouse_address_exception', searchResults[0].getValue('custrecord_fa_address_record'));
            return exceptionResultValue;
        }
        exception('Warehouse Exception: Invalid Entity and/or Mapping', donationID);
        return false;
    }
        else {
            log.audit('warehouseIdFinal', warehouseIntId);
            return warehouseIntId;
        }
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
        var duplicateOverride;

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
                submitFieldsObj.custrecord_ns_donor = memberDonor;
                log.debug('submitted custrecord_ns_donor field', donationID + ' ' + memberDonor);
                // Make sure there is a valid customer
                memberEntityId = getEntity('customer', memberNumber, donationID, 'Member ');
                log.debug('memberEntityId', memberEntityId);
                if (!(isEmpty(memberEntityId))) {
                    submitFieldsObj.custrecord_ns_member = memberEntityId;

                }
            }
            if (!pickUpDate) {
                exception('Item Date 1 is empty', donationID);
            } else if (pickUpDate > new Date() || pickUpDate > rec.getValue('created')) {
                exception('Item Date 1 (Pickup Date) is greater than date Donation Import record was created', donationID);
            }
            log.debug('shipmentNbr and pickUpDate', shipmentNbr + ' ' + pickUpDate);
            // Check if we need to search for duplicates
            duplicateOverride = rec.getValue('custrecord_kbs_duplicate_override');
            if (!isEmpty(shipmentNbr) && pickUpDate && !duplicateOverride) {
                log.debug('Searching Duplicates');
                searchDuplicateDonations(memberDonor, memberEntityId, shipmentNbr, arrayItems, rec.id, pickUpDate);
            } else {
                log.debug('Skipping Duplicate search');
            }
            // Sets NS Warehouse here as well
            addressRecReturned = lookWarehouse(donationID, memberDonor);
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
