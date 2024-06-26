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
        'N/runtime',
        './KBS_ApplyPromotions_LIB'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_search} nsSearch
     */
    function (
        nsRecord,
        nsSearch,
        nsformat,
        nsRuntime,
        kbsApplyPromo
    ) {
        /** Order Type Ids: 2, 3, 5, 8, 9 (Produce, Yellow, Maroon, Seafood, Disaster) */
        /** Per Ryan Riggs - excluding Produce and Seafood (internal ids 2 and 8) */
        var validOrderTypes = ['3', '5', '9'];

        /**
         * @param {N_record.Record} rec
         */
        function setMemberRateDiscount(objRecord) {
            var i;
            var lineCount;
            var memberDiscountRate;
            var nextItem;
            var rate;
            var quantity;
            var discountAmt;
            var orderType = objRecord.getValue('custbody_order_type');
            var lookup;
            var item;
            var project;
            var memberBank;
            var dropOffLocation;
            var fieldAmt;

            if (orderType === '1') {
                lineCount = objRecord.getLineCount({ sublistId: 'item' });
                for (i = 0; i < lineCount; i += 1) {
                    memberDiscountRate = parseFloat(objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_kbs_memberdiscrate', line: i }));
                    rate = parseFloat(objRecord.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i }));
                    if (memberDiscountRate && (memberDiscountRate !== rate)) {
                        if ((i + 1) <= lineCount) {
                            nextItem = objRecord.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                line: i + 1
                            });
                        }
                        log.debug('nextItem', nextItem + typeof nextItem);
                        if (nextItem !== '10153') {
                            item = objRecord.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                line: i
                            });
                            lookup = nsSearch.lookupFields({ type: 'item', id: item, columns: ['custitem_cseg_projects_cseg'] });
                            if (lookup.custitem_cseg_projects_cseg && lookup.custitem_cseg_projects_cseg[0]) {
                                project = lookup.custitem_cseg_projects_cseg[0].value;
                            }
                            log.debug('project', project);
                            quantity = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
                            log.debug('inserting discount item');
                            discountAmt = -1 * (rate - memberDiscountRate) * quantity;
                            memberBank = objRecord.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_member_bank',
                                line: i
                            });
                            dropOffLocation = objRecord.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_drop_off_location',
                                line: i
                            });
                            objRecord.insertLine({
                                sublistId: 'item',
                                line: i + 1
                            });
                            objRecord.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                line: i + 1,
                                value: 10153
                            });
                            objRecord.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_member_bank',
                                line: i + 1,
                                value: memberBank
                            });
                            objRecord.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_drop_off_location',
                                line: i + 1,
                                value: dropOffLocation
                            });
                            objRecord.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                line: i + 1,
                                value: discountAmt
                            });
                            objRecord.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'location',
                                line: i + 1,
                                value: 224
                            });
                            if (project) {
                                objRecord.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_cseg_projects_cseg',
                                    line: i + 1,
                                    value: project
                                });
                            }
                            objRecord.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                line: i + 1,
                                value: discountAmt
                            });
                            log.debug('discountAmt', discountAmt);
                            lineCount = objRecord.getLineCount({ sublistId: 'item' });
                        } else {
                            log.debug('in else');
                            quantity = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
                            discountAmt = -1 * (rate - memberDiscountRate) * quantity;
                            fieldAmt = objRecord.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                line: i + 1
                            });
                            log.debug('discountAmt | fieldAmt', discountAmt + ' | ' + fieldAmt);
                            if (discountAmt !== fieldAmt) {
                                objRecord.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'rate',
                                    line: i + 1,
                                    value: discountAmt
                                });
                                objRecord.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    line: i + 1,
                                    value: discountAmt
                                });
                                log.debug('Setting value', 'value: ' + discountAmt);
                                lineCount = objRecord.getLineCount({ sublistId: 'item' });
                            }
                        }

                    }
                }
            }

        }
        /**
         * Looks for lines with item 'UNK Temporary Item'. For each line found, values from certain
         * column fields are retrieved and stored in hidden custom field 'custbody_kbs_tempitem_data' in JSON format.
         * @param {N_record.Record} rec
         */
        function captureUnkItemLineData(rec, objRecord) {
            var lineCount;
            var i;
            var itemId;
            var lineId;
            var objArray = {};
            var lineNumber;
            var objString;
            // var objRecord;
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
                    // objRecord = nsRecord.load({
                    //     type: nsRecord.Type.SALES_ORDER,
                    //     id: rec.id,
                    //     isDynamic: true
                    // });
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
                    // objRecord.save({
                    //     enableSourcing: true,
                    //     ignoreMandatoryFields: true
                    // });
                }
            }
        }
        /**
     * @param {Array} array
     */

        function findIndex(array, value) {
            var index = parseInt('-1');
            for (var iter in array) {
                if (array[iter] == value) {
                    index = iter;
                }
            }
            return index;
        }

        /**
     * @param {N_record} nsRecord
     */
        function calculateDeliveredPrice(rec, transFeeRate, objRecord) {
            var lineCount;
            var i;
            var itemId;
            var lineId;
            var objArray = [];
            var lineNumber;
            var objString;
            // var objRecord;
            var calcDlvPrice = false;
            var totalQty = parseFloat(0);
            var headerQty = parseFloat(0);
            var orderType = rec.getValue('custbody_order_type');
            var headerCus = rec.getValue('entity');
            var totalTransCost = parseFloat(0);
            var memberDiscountRate;
            var nextItem;
            var rate;
            var quantity;
            var discountAmt;

            if (orderType == '1') {
                // objRecord = nsRecord.load({
                //     type: nsRecord.Type.SALES_ORDER,
                //     id: rec.id
                // });
                lineCount = objRecord.getLineCount({ sublistId: 'item' });
                // to check if delivered price needs to be calculated
                for (var i = 0; i < lineCount; i += 1) {
                    var dlvRate = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_adj_invoice_rate', line: i });
                    var prodChannel = objRecord.getSublistText({ sublistId: 'item', fieldId: 'custcol_product_channel', line: i });
                    if ((dlvRate == null || dlvRate == '') && prodChannel == 'Grocery') {
                        calcDlvPrice = true;
                        break;
                    }
                }
                log.debug('calcDlvPrice', 'calcDlvPrice = ' + calcDlvPrice);
                if (calcDlvPrice) {
                    for (var i = 0; i < lineCount; i += 1) {
                        //   var customer;
                        var cusAdjRate = 0;
                        var prodChannel = objRecord.getSublistText({ sublistId: 'item', fieldId: 'custcol_product_channel', line: i });
                        if (prodChannel == 'Grocery') {
                            quantity = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
                            totalQty += quantity;
                        } else {
                            var item = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
                            log.debug('item', 'item = ' + item);
                            // set item and percentage as parameters : TO-DO
                            if (item == '4038') {
                                var transCost = parseFloat(objRecord.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i }));
                                totalTransCost = transCost + transFeeRate * transCost / 100;
                            }
                        }

                    }
                    log.debug('totalTransCost', 'totalTransCost = ' + totalTransCost);
                    if (totalTransCost > 0) {

                        cusAdjRate = (totalTransCost / totalQty).toFixed(2);

                    }
                    for (var i = 0; i < lineCount; i += 1) {
                        rate = parseFloat(objRecord.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i }));
                        var prodChannel = objRecord.getSublistText({ sublistId: 'item', fieldId: 'custcol_product_channel', line: i });
                        memberDiscountRate = parseFloat(objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_kbs_memberdiscrate', line: i }));
                        if (prodChannel == 'Grocery' && !memberDiscountRate) {
                            objRecord.setSublistValue(
                                {
                                    sublistId: 'item',
                                    fieldId: 'custcol_adj_invoice_rate',
                                    line: i,
                                    value: parseFloat(rate) + parseFloat(cusAdjRate)
                                }
                            );
                        } else if (prodChannel === 'Grocery') {
                            objRecord.setSublistValue(
                                {
                                    sublistId: 'item',
                                    fieldId: 'custcol_adj_invoice_rate',
                                    line: i,
                                    value: parseFloat(memberDiscountRate) + parseFloat(cusAdjRate)
                                }
                            );
                        }
                    }
                    // objRecord.save({
                    //     enableSourcing: true,
                    //     ignoreMandatoryFields: true
                    // });
                }

            }
        }

        // Added by Elizabeth per ticket #7302 - updating PO when drop off member and contacts are updated on the SO
        function updatePOContactFields(rec, oldRec, oldDropoffConNameValue, newDropoffConNameValue, newDropoffConEmailValue, newDropoffConPhoneValue, newDropoffField, i) {
            var POSearch = nsSearch.create({
                type: nsSearch.Type.PURCHASE_ORDER,
                columns: [{
                    name: 'internalid'
                }],
                filters: [{
                    name: 'createdfrom',
                    operator: 'IS',
                    values: [rec.id]
                }, {
                    name: 'mainline',
                    operator: 'IS',
                    values: ['T']
                }]
            });
            POSearch.run().each(function (result) {
                var intID = result.getValue({
                    name: 'internalid'
                });
                log.debug('POintID=', intID);
                log.debug('i', i);
                log.debug('dropoffloc', newDropoffField);

                if (i == 0) {
                    nsRecord.submitFields({
                        type: nsRecord.Type.PURCHASE_ORDER,
                        id: parseInt(intID, 10),
                        values: {
                            custbody_dropoff_shipto_contact1_name: newDropoffConNameValue,
                            custbody_dropoff_shipto_contact1_email: newDropoffConEmailValue,
                            custbody_dropoff_shipto_contact1_phone: newDropoffConPhoneValue,
                            custbody_drop_off_location1: newDropoffField
                        }
                    });
                }
                if (i == 1) {
                    nsRecord.submitFields({
                        type: nsRecord.Type.PURCHASE_ORDER,
                        id: parseInt(intID, 10),
                        values: {
                            custbody_dropoff_shipto_contact2_name: newDropoffConNameValue,
                            custbody_dropoff_shipto_contact2_email: newDropoffConEmailValue,
                            custbody_dropoff_shipto_contact2_phone: newDropoffConPhoneValue,
                            custbody_drop_off_location_2: newDropoffField
                        }
                    });
                }
                if (i == 2) {
                    nsRecord.submitFields({
                        type: nsRecord.Type.PURCHASE_ORDER,
                        id: parseInt(intID, 10),
                        values: {
                            custbody_dropoff_shipto_contact3_name: newDropoffConNameValue,
                            custbody_dropoff_shipto_contact3_email: newDropoffConEmailValue,
                            custbody_dropoff_shipto_contact3_phone: newDropoffConPhoneValue,
                            custbody_drop_off_location_3: newDropoffField
                        }
                    });
                }
                if (i == 4) {
                    nsRecord.submitFields({
                        type: nsRecord.Type.PURCHASE_ORDER,
                        id: parseInt(intID, 10),
                        values: {
                            custbody_dropoff_shipto_contact4_name: newDropoffConNameValue,
                            custbody_dropoff_shipto_contact4_email: newDropoffConEmailValue,
                            custbody_dropoff_shipto_contact4_phone: newDropoffConPhoneValue,
                            custbody_drop_off_location_4: newDropoffField
                        }
                    });
                }
                return true;
            });
        }

        function updateLineDropoffFields(rec, oldRec, oldDropoffValue, newDropoffValue, newMemberValue) {
            var lineCount;
            var firstLine;
            var x;
            var oldRecLineDropoffValue;
            var oldLineMemberValue;
            lineCount = rec.getLineCount({ sublistId: 'item' });
            firstLine = oldRec.findSublistLineWithValue({
                sublistId: 'item',
                fieldId: 'custcol_drop_off_location',
                value: oldDropoffValue
            });
            for (x = firstLine; x < lineCount; x += 1) {
                oldRecLineDropoffValue = oldRec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_drop_off_location', line: x });
                if (oldRecLineDropoffValue === oldDropoffValue) {
                    oldLineMemberValue = oldRec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_member_bank', line: x });
                    if (oldLineMemberValue !== newMemberValue) {
                        rec.setSublistValue(
                            {
                                sublistId: 'item',
                                fieldId: 'custcol_member_bank',
                                line: x,
                                value: newMemberValue
                            }
                        );
                    }
                    rec.setSublistValue(
                        {
                            sublistId: 'item',
                            fieldId: 'custcol_drop_off_location',
                            line: x,
                            value: newDropoffValue
                        }
                    );
                }
            }
        }
        /**
        * @param {N_record} nsRecord
        * @param {N_search} nsSearch
        */
        function getRate(itemId, newWarehosueValue) {
            var rate = 0;
            var priceSearchObj = nsSearch.create({
                type: 'customrecord_vendor_warehouse_price',
                filters:
                    [
                        [['custrecord_item_start_date', 'isempty', ''], 'OR', ['custrecord_item_start_date', 'onorbefore', 'today']],
                        'AND',
                        [['custrecord_end_date', 'isempty', ''], 'OR', ['custrecord_end_date', 'onorafter', 'today']],
                        'AND',
                        ['custrecord_master_item', 'anyof', itemId],
                        'AND',
                        ['custrecord_vendor_warehouse.internalidnumber', 'equalto', newWarehosueValue]
                    ],
                columns:
                    [
                        nsSearch.createColumn({ name: 'custrecord_master_item', label: 'Master Item' }),
                        nsSearch.createColumn({ name: 'custrecord_item_wareouse_vendor', label: 'Vendor' }),
                        nsSearch.createColumn({ name: 'custrecord_vendor_warehouse', label: 'Vendor Warehouse' }),
                        nsSearch.createColumn({ name: 'custrecord_vendor_warehouse_price', label: 'Price' }),
                        nsSearch.createColumn({ name: 'custrecord_dilvery_pricing', label: 'Delivery Pricing' })
                    ]
            });
            var searchResultCount = priceSearchObj.runPaged().count;
            log.debug('customrecord_vendor_warehouse_priceSearchObj result count', searchResultCount);
            priceSearchObj.run().each(function (result) {
                rate = result.getValue({
                    name: 'custrecord_vendor_warehouse_price'
                });
                // .run().each has a limit of 4,000 results
                return true;
            });
            return rate;
        }

        /**
        * @param {N_record} nsRecord
        * @param {N_search} nsSearch
        */
        function getVendorPeriod(donorId, pickupDate) {
            var vendorPeriod = '';
            var venInternalID = '';
            var venFiscObj = {
                venPeriod: vendorPeriod,
                venIntid: venInternalID
            };
            var pickDate = new Date(pickupDate);
            var pickDateMonth = '0' + (pickDate.getMonth() + 1);
            var pickDateDate = '0' + pickDate.getDate();
            var pickDateStr = pickDate.getFullYear() + '-' + pickDateMonth.substring(pickDateMonth.length - 2, pickDateMonth.length) + '-' + pickDateDate.substring(pickDateDate.length - 2, pickDateDate.length);
            log.debug('pickDate=', pickDateStr);
            var formatPickDate = nsformat.format({ value: pickDate, type: nsformat.Type.DATE });
            log.debug('formatPickDate=', formatPickDate);
            var parentDonor = nsSearch.lookupFields({ type: 'vendor', id: donorId, columns: ['custentity_parent_vendor'] });
            log.debug('parentDonor=', parentDonor.custentity_parent_vendor);
            if (parentDonor.custentity_parent_vendor[0] != null) {
                var vendPeriodObj = nsSearch.create({
                    type: 'customrecord_ven_fiscal_dates',
                    filters:
                        [
                            ['custrecord_vendor', 'anyof', parentDonor.custentity_parent_vendor[0].value],
                            'AND',
                            ['custrecord_date_text', 'is', pickDateStr]
                        ],
                    columns:
                        [
                            nsSearch.createColumn({ name: 'custrecord_fiscal_period', label: 'Period' }),
                            nsSearch.createColumn({ name: 'custrecord_fiscal_year', label: 'Fiscal Year' }),
                            nsSearch.createColumn({ name: 'internalid', label: 'internalid' })
                        ]
                });
                var searchResultCount = vendPeriodObj.runPaged().count;
                log.debug('customrecord_ven_fiscal_dates_vendPeriodObj result count', searchResultCount);
                vendPeriodObj.run().each(function (result) {
                    var fiscalPeriod = result.getValue({
                        name: 'custrecord_fiscal_period'
                    });
                    var fiscalYear = result.getValue({
                        name: 'custrecord_fiscal_year'
                    });
                    vendorPeriod = fiscalYear + '_pd_' + fiscalPeriod;
                    venInternalID = result.getValue({
                        name: 'internalid'
                    });
                    venFiscObj.venPeriod = vendorPeriod;
                    venFiscObj.venIntid = venInternalID;
                    // .run().each has a limit of 4,000 results
                    return true;
                });
                log.debug('vendorPeriod=' + vendorPeriod);
            }
            return venFiscObj;
        }

        /**
     * @param {N_record} rec
     */
        function updateLineWarehouseFields(rec, oldRec, oldWarehouseValue, newWarehosueValue, orderType) {
            var lineCount;
            var firstLine;
            var x;
            var oldRecLineWarehouseValue;
            var rate;
            var itemId;

            lineCount = rec.getLineCount({ sublistId: 'item' });
            firstLine = oldRec.findSublistLineWithValue({
                sublistId: 'item',
                fieldId: 'custcol_pickup_location',
                value: oldWarehouseValue
            });
            for (x = firstLine; x < lineCount; x += 1) {
                oldRecLineWarehouseValue = oldRec.getSublistValue({ sublistId: 'item', fieldId: 'custcol_pickup_location', line: x });
                if (oldRecLineWarehouseValue === oldWarehouseValue) {
                    rec.setSublistValue(
                        {
                            sublistId: 'item',
                            fieldId: 'custcol_pickup_location',
                            line: x,
                            value: newWarehosueValue
                        }
                    );
                    // If order type is Grocery (id = 1) set PO Rate and Rate
                    if (orderType === '1') {
                        itemId = oldRec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: x });
                        rate = getRate(itemId, newWarehosueValue);
                        log.debug('rate', rate);
                        rec.setSublistValue(
                            {
                                sublistId: 'item',
                                fieldId: 'porate',
                                line: x,
                                value: rate
                            }
                        );
                        rec.setSublistValue(
                            {
                                sublistId: 'item',
                                fieldId: 'rate',
                                line: x,
                                value: rate
                            }
                        );
                    }
                }
            }
        }

        function potentialDuplicateCheck(rec, orderType) {
            var donorReferenceNumber = rec.getValue('custbody_donation_reference_number'); // required
            log.audit('donorReferenceNumber', donorReferenceNumber);
            if (orderType == '6' && donorReferenceNumber) {
                var member = rec.getValue('entity'); // required
                var warehouse1 = rec.getValue('custbody_warehouse_1'); // not required
                var actualPickupDate = nsformat.format({ value: rec.getValue('custbody_pickup_date'), type: nsformat.Type.DATE }); // not required
                var errorMsg = '';
                var salesorderSearchObj = nsSearch.create({
                    type: 'salesorder',
                    filters:
                        [
                            ['type', 'anyof', 'SalesOrd'],
                            'AND',
                            ['entity', 'anyof', member],
                            'AND',
                            ['custbody_order_type', 'anyof', '6'],
                            'AND',
                            ['custbody_warehouse_1', 'anyof', warehouse1],
                            'AND',
                            ['custbody_pickup_date', 'on', actualPickupDate],
                            'AND',
                            ['mainline', 'is', 'T'],
                            'AND',
                            ['custbody_donation_reference_number', 'is', donorReferenceNumber]
                        ],
                    columns:
                        [
                            nsSearch.createColumn({ name: 'transactionname', label: 'Transaction Name' })
                        ]
                });
                var searchResultCount = salesorderSearchObj.runPaged().count;
                log.debug('salesorderSearchObj result count', searchResultCount);
                salesorderSearchObj.run().each(function (result) {
                    log.debug('Duplicate orders', result.getValue('transactionname'));
                    errorMsg += result.getValue('transactionname') + ' is a potential Blue Receipts duplicate.\n';
                    // .run().each has a limit of 4,000 results
                    return true;
                });
                if (searchResultCount > 0) {
                    rec.setValue({ fieldId: 'custbody_order_has_issues', value: true });
                    rec.setValue({ fieldId: 'custbody_order_has_issues_reason', value: '22' });
                    rec.setValue({ fieldId: 'custbody_has_issues_comments', value: errorMsg });
                }

                log.debug('donorRefNum, member, warehouse1, and actualPickupDate',
                    donorReferenceNumber + '-' + member + '-' + warehouse1 + '-' + actualPickupDate);

            }
            return rec;
        }

        function setOrderNumber(objRecord, itemCount, type) {
            var ordertype = objRecord.getText('custbody_order_type').trim();
            var odysseyOfferDate = objRecord.getValue('custbody_odyssey_offer_date');
            var ordernumber;
            var i;
            var prodChannel;
            var magRef;
            var item;

            log.debug('Inside Order Type=' + ordertype + ' odysseyOfferDate=' + odysseyOfferDate + ' ID=' + objRecord.id);
            if (type === 'create') {
                ordernumber = objRecord.getValue('tranid');
                log.debug('Order Type=' + ordertype + ' order number=' + ordernumber);
                if (ordertype === 'Produce' && (odysseyOfferDate === '' || odysseyOfferDate == null)) {
                    ordernumber = 'PR' + objRecord.id;
                }

                if (ordertype === 'Grocery' && (odysseyOfferDate === '' || odysseyOfferDate == null)) {
                    ordernumber = 'GR' + objRecord.id;
                }

                if (ordertype === 'Donation - Yellow' && (odysseyOfferDate === '' || odysseyOfferDate == null)) {
                    ordernumber = 'DO' + objRecord.id;
                }

                if (ordertype === 'Donation - Maroon' && (odysseyOfferDate === '' || odysseyOfferDate == null)) {
                    ordernumber = 'ML' + objRecord.id;
                }

                if (ordertype === 'Donation - Blue' && (odysseyOfferDate === '' || odysseyOfferDate == null)) {
                    ordernumber = 'DO' + objRecord.id;
                }
                if (ordertype === 'Disaster' && (odysseyOfferDate === '' || odysseyOfferDate == null)) {

                    ordernumber = 'DO' + objRecord.id;
                }
                if (ordertype === 'Seafood' && (odysseyOfferDate === '' || odysseyOfferDate == null)) {
                    ordernumber = 'DO' + objRecord.id;
                }
                objRecord.setValue({ fieldId: 'tranid', value: ordernumber, ignoreFieldChange: false });
                log.debug('Tran ID: ' + ordernumber);
            }
            if (ordertype !== 'Donation - Blue') {
                log.debug('Inside mag ref' + type);

                for (i = 0; i < itemCount; i += 1) {

                    prodChannel = objRecord.getSublistText({ sublistId: 'item', fieldId: 'custcol_product_channel', line: i });
                    magRef = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_mag_ref_no', line: i });
                    item = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
                    log.debug('DEBUG', 'Mag Ref=' + magRef);
                    // Edited for ticket #6368 by Thilaga - edited for 6470/6504
                    if (type === 'create' && (magRef == null || magRef === '')) {
                        magRef = '';
                    }
                    if ((prodChannel === 'Grocery' || prodChannel === 'Produce' || prodChannel === 'Donation' || item === '4148') && (magRef == null || magRef === '')) {
                        objRecord.setSublistValue({
                            sublistId: 'item', fieldId: 'custcol_mag_ref_no', line: i, value: ((i + 1) * 1001).toFixed(0)
                        });
                    }
                    log.debug('DEBUG', 'Mag Ref=' + (i + 1) * 1001);
                }
            }
        }

        function setDonationBillToMember(objRecord, itemCount) {
            var lineItemId;
            var orderType;
            var productChannel;
            var headerMember;
            var lineMember;
            orderType = objRecord.getValue('custbody_order_type');
            headerMember = objRecord.getValue('entity');
            log.debug('orderType', orderType + ' ' + itemCount + ' ' + headerMember);
            if (orderType == '5' || orderType == '3' || orderType == '8') {
                for (x = 0; x < itemCount; x += 1) {
                    productChannel = objRecord.getSublistValue({
                        sublistId: 'item', fieldId: 'custcol_product_channel', line: x
                    });
                          	lineMember = objRecord.getSublistValue({
                        sublistId: 'item', fieldId: 'custcol_member_bank', line: x
                    });
                    		log.debug('lineMember', lineMember + ' ' + headerMember);
                    if (productChannel === '3' && (headerMember != lineMember)) {
                        objRecord.setSublistValue({
                            sublistId: 'item', fieldId: 'custcol_bill_to_member', line: x, value: false
                        });
                    }
                }
            }
        }
        function setFundandProjectForNonDiscountItems(objRecord, itemCount) {
            var i;
            var fund;
            var projectCode;
            var itemType;
            var itemId;

            fund = objRecord.getValue('location');
            projectCode = objRecord.getValue('custbody_cseg_projects_cseg');
            for (i = 0; i < itemCount; i += 1) {
                itemId = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
                itemType = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'itemtype', line: i });
                if (itemId !== '8283' && itemId !== '9151' && itemType !== 'Discount') {
                    if (fund) {
                        objRecord.setSublistValue({
                            sublistId: 'item', fieldId: 'location', line: i, value: fund
                        });
                    }
                    if (projectCode) {
                        objRecord.setSublistValue({
                            sublistId: 'item', fieldId: 'custcol_cseg_projects_cseg', line: i, value: projectCode
                        });
                    }
                }
            }
            return objRecord;
        }

        /**
    * @param {UserEventContext.beforeLoad} context
    */
        function beforeLoad(context) {
            var type = context.type;
            var rec = context.newRecord;
            var form = context.form;
            var status;
            var orderType;
            var optionOneOrderTypes = ['3', '5', '9']; // Yellow, Maroon, Disaster
            var optionOneUserRoles = [3, 1061]; // Administrator, FA Customer Service Rep Manager
            var optionTwoOrderTypes = ['1', '2', '8']; // Produce, Grocery, Seafood
            var optionTwoUserRoles = [3, 1061, 1056]; // Administrator, FA Customer Service Rep Manager, FA Grocery Program Manager
            var userObj = nsRuntime.getCurrentUser();
            var entityField;

            if (type === context.UserEventType.COPY || type === context.UserEventType.CREATE) {
                if (type === context.UserEventType.COPY) {
                    rec.setValue({ fieldId: 'custbody_ready_for_approval', value: false });
                }
                kbsApplyPromo.deleteLines(rec);
            }
            // if (!((status === 'Pending Fulfillment' || status === 'Pending Approval') && type === 'edit' && userObj.role === 3) {
            log.debug('role', userObj.role);
            status = rec.getValue('status');
            log.debug('status', status);
            if (type === 'edit' && (userObj.role !== 3 || (status !== 'Pending Fulfillment' && status !== 'Pending Approval'))) {
                log.debug('setting to disabled');
                entityField = form.getField('entity');
                entityField.updateDisplayType({ displayType: 'DISABLED' });
            }
            if (status === 'Pending Fulfillment' && type !== context.UserEventType.DELETE) {
                log.debug('entered if', status);
                form.addButton({ id: 'custpage_cancelorderbtn', label: 'Cancel Order', functionName: 'cancelOrderClick' });
                form.clientScriptModulePath = 'SuiteScripts/KBS_SalesOrder_CS.js';
            } else if (status === 'Closed') {
                orderType = rec.getValue('custbody_order_type');
                log.debug('orderType', orderType + ' type: ' + typeof orderType);
                log.debug('user role', userObj.role + ' type: ' + typeof userObj.role);
                log.debug('optionOneOrderTypes.indexOf(orderType)', optionOneOrderTypes.indexOf(orderType));
                log.debug('optionOneUserRoles.indexOf(userObj.role)', optionOneUserRoles.indexOf(userObj.role));
                if ((optionOneOrderTypes.indexOf(orderType) > -1 && optionOneUserRoles.indexOf(userObj.role) > -1)
                    || (optionTwoOrderTypes.indexOf(orderType) > -1 && optionTwoUserRoles.indexOf(userObj.role) > -1)) {
                    form.addButton({ id: 'custpage_reopenorderbtn', label: 'Re-Open Order', functionName: 'reopenOrderClick' });
                    form.clientScriptModulePath = 'SuiteScripts/KBS_SalesOrder_CS.js';
                }
            }
        }
        /**
        * @param {UserEventContext.beforeSubmit} context
        */
        function beforeSubmit(context) {
            var rec = context.newRecord;
            var oldRec = context.oldRecord;
            var type = context.type;
            var i;
            var dropoffFields = ['custbody_drop_off_location1', 'custbody_drop_off_location_2', 'custbody_drop_off_location_3', 'custbody_drop_off_location_4'];
            var dropoffMemberFields = ['custbody_drop_off_member_1', 'custbody_drop_off_member_2', 'custbody_drop_off_member_3', 'custbody_drop_off_member_4'];
            var warehouseFields = ['custbody_warehouse_1', 'custbody_warehouse_2', 'custbody_warehouse_3'];
            var oldDropoffField;
            var newDropoffField;
            var newMemberField;
            var oldWarehouseValue;
            var newWarehosueValue;
            var dropoffConNameFields = ['custbody_dropoff_shipto_contact1_name', 'custbody_dropoff_shipto_contact2_name', 'custbody_dropoff_shipto_contact3_name', 'custbody_dropoff_shipto_contact4_name'];
            var dropoffConEmailFields = ['custbody_dropoff_shipto_contact1_email', 'custbody_dropoff_shipto_contact2_email', 'custbody_dropoff_shipto_contact3_email', 'custbody_dropoff_shipto_contact4_email'];
            var dropoffConPhoneFields = ['custbody_dropoff_shipto_contact1_phone', 'custbody_dropoff_shipto_contact2_phone', 'custbody_dropoff_shipto_contact3_phone', 'custbody_dropoff_shipto_contact4_phone'];
            var oldDropoffConNameValue;
            var newDropoffConNameValue;
            var newDropoffConEmailValue;
            var newDropoffConPhoneValue;
            var orderType;
            var donorID;
            var status;
            var oldExcludedPromos;
            var excludePromos;
            var allowStatusOverride;
            var amt = rec.getValue('amount') || 0;
            var amtUnbilled = rec.getValue('amountunbilled') || 0;
            var salesorderSearchObj;
            // var orderStatus = rec.getText({ fieldId: 'custbody_order_status' });
            var orderStatus = rec.getValue({ fieldId: 'custbody_order_status' });
            var shippingMethodCode = rec.getValue('custbody_shipping_method_code');
            var removeTFS = rec.getValue('custbody_kbs_removetfs');

            log.debug('before submit>>type', type);
            if (oldRec) {
                oldExcludedPromos = oldRec.getValue('custbody_kbs_excludepromotion');
                excludePromos = rec.getValue('custbody_kbs_excludepromotion');
            }
            status = rec.getValue('status');
            orderType = rec.getValue('custbody_order_type');
            allowStatusOverride = rec.getValue('custbody_kbs_allowstatusoverride');
            if (allowStatusOverride) {
                // run search here to determine if amount - amount unbilled for rec === 0
                salesorderSearchObj = nsSearch.create({
                    type: 'salesorder',
                    filters:
                        [
                            ['type', 'anyof', 'SalesOrd'],
                            'AND',
                            ['mainline', 'is', 'T'],
                            'AND',
                            ['internalidnumber', 'equalto', rec.id]
                        ],
                    columns:
                        [
                            nsSearch.createColumn({ name: 'internalid', label: 'Internal ID' }),
                            nsSearch.createColumn({ name: 'amount', label: 'Amount' }),
                            nsSearch.createColumn({ name: 'amountunbilled', label: 'Amount Unbilled' })
                        ]
                });
                amt = 0;
                amtUnbilled = 0;
                salesorderSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    amt = parseFloat(result.getValue({ name: 'amount' }) || 0);
                    amtUnbilled = parseFloat(result.getValue({ name: 'amountunbilled' }) || 0);
                    return true;
                });
            }

            if ((orderType === '1' || orderType === '2' || orderType === '3' || orderType === '5' || orderType === '8') && shippingMethodCode) {
                log.audit('orderType', orderType + ' ' + typeof orderType);
                if ((status !== 'Billed' && status !== 'Partially Fulfilled' && type !== 'delete' && (amt - amtUnbilled === 0))) {
                    log.audit('going to calc freight subsidy');
                    kbsApplyPromo.calcFreightSubsidy(rec, type, status, orderStatus, oldRec, orderType, shippingMethodCode, removeTFS);
                }
            }
            log.debug('amount', amt);
            log.debug('amount unbilled', amtUnbilled);

            if ((status === 'Closed' || status === 'Cancelled') && orderStatus === '3') { // Cancelled - Id: 3
                kbsApplyPromo.deleteLines(rec);
            } else if (status !== 'Billed' && status !== 'Closed' && status !== 'Partially Fulfilled'
&& status !== 'Pending Billing' && status !== 'Pending Billing/Partially Fulfilled' && type !== context.UserEventType.DELETE) {
                kbsApplyPromo.deleteLines(rec);
                kbsApplyPromo.applyPromotionsUE(rec, type);
                kbsApplyPromo.excludePromoChange(rec, type);
            } else if (allowStatusOverride) {
                if (amt - amtUnbilled === 0) {
                    kbsApplyPromo.deleteLines(rec);
                    kbsApplyPromo.applyPromotionsUE(rec, type);
                    kbsApplyPromo.excludePromoChange(rec, type);
                }
            }

            if (type === context.UserEventType.CREATE || type === context.UserEventType.EDIT) {
                donorID = rec.getValue('custbody_opportunity_donor');
                if (nsRuntime.executionContext === nsRuntime.ContextType.MAP_REDUCE && orderType === '6') {
                    rec = potentialDuplicateCheck(rec, orderType);
                }

                if (orderType == '3' || orderType == '5' || orderType == '6' || orderType == '9' || orderType == '8') {
                    var pickup_date = rec.getValue('custbody_pickup_date');
                    log.debug('pickup_date=', pickup_date);
                    if (pickup_date) {
                        var venFiscObj = getVendorPeriod(donorID, pickup_date);
                        log.debug('venFiscObj=', JSON.stringify(venFiscObj));
                        rec.setValue({ fieldId: 'custbody_vendor_period', value: venFiscObj.venPeriod });
                        rec.setValue({ fieldId: 'custbody_vendor_fiscal_record', value: venFiscObj.venIntid });
                    }
                }

                // Added for ticket #6581 by Elizabeth
                if (orderType !== '6') {
                    shippingMethodCode = rec.getValue('custbody_shipping_method_code');
                    if (shippingMethodCode == '3' || shippingMethodCode == '4' || shippingMethodCode == '5') {
                        var reqPickupDate = rec.getValue('custbodycustbody_requested_pickup_date');
                        if (reqPickupDate) {
                            var reqPickupDateFormat = nsformat.parse({ value: reqPickupDate, type: nsformat.Type.DATE });
                        }
                        var billToFreightStart = nsformat.parse({ value: '10/31/2020', type: nsformat.Type.DATE });
                        var donationReason = rec.getValue('custbody_donation_reason_code');
                        if (orderType !== '3' && orderType !== '5' && orderType !== '8') {
                            rec.setValue({ fieldId: 'custbody_bill_to_freight', value: 19354 });
                        }
                        if (orderType == '3' || orderType == '5') {
                            // if (donationReason !== '5') {
                            if (reqPickupDateFormat) {
                                if (reqPickupDateFormat > billToFreightStart) {
                                    rec.setValue({ fieldId: 'custbody_bill_to_freight', value: 19354 });
                                }
                            }
                            // }
                        }
                        if (orderType == '8') {
                            if (reqPickupDateFormat) {
                                if (reqPickupDateFormat > billToFreightStart) {
                                    rec.setValue({ fieldId: 'custbody_bill_to_freight', value: 19354 });
                                }
                            }
                        }
                    }
                }
            }

            // only run if order type is not Transportation (id = 7)
            if (type === context.UserEventType.EDIT && orderType !== '7') {
                for (i = 0; i < dropoffFields.length; i += 1) {
                    oldDropoffField = oldRec.getValue(dropoffFields[i]);
                    newDropoffField = rec.getValue(dropoffFields[i]);
                    if (oldDropoffField !== newDropoffField && newDropoffField != null && newDropoffField != '') {
                        newMemberField = rec.getValue(dropoffMemberFields[i]);
                        // log.debug('old vs new', oldDropoffField + ' vs ' + newDropoffField + ' position' + i);
                        updateLineDropoffFields(rec, oldRec, oldDropoffField, newDropoffField, newMemberField);
                    }
                    if (oldDropoffField !== newDropoffField && (newDropoffField == null || newDropoffField == '')) {
                        newMemberField = rec.getValue(dropoffMemberFields[i]);
                        // log.debug('old vs new', oldDropoffField + ' vs ' + newDropoffField + ' position' + i);
                        updateLineDropoffFields(rec, oldRec, oldDropoffField, '', newMemberField);
                    }
                }
                for (i = 0; i < warehouseFields.length; i += 1) {
                    oldWarehouseValue = oldRec.getValue(warehouseFields[i]);
                    newWarehosueValue = rec.getValue(warehouseFields[i]);
                    if (oldWarehouseValue !== newWarehosueValue && newWarehosueValue != null && newWarehosueValue != '') {
                        // Added for ticket #7103
                        if (orderType == '1' || orderType == '2') {
                            if (oldWarehouseValue != null && oldWarehouseValue != '') {
                                updateLineWarehouseFields(rec, oldRec, oldWarehouseValue, newWarehosueValue, orderType);
                            }
                        } else {
                            updateLineWarehouseFields(rec, oldRec, oldWarehouseValue, newWarehosueValue, orderType);
                        }
                    }

                }
            }

            // Added by Elizabeth per ticket #7302 - updating PO when drop off member and contacts are updated on the SO
            if (type === context.UserEventType.EDIT) {
                for (i = 0; i < dropoffConNameFields.length; i += 1) {
                    oldDropoffConNameValue = oldRec.getValue(dropoffConNameFields[i]);
                    newDropoffConNameValue = rec.getValue(dropoffConNameFields[i]);
                    log.debug('newDropoffConNameValue', newDropoffConNameValue);
                    log.debug('oldDropoffConNameValue', oldDropoffConNameValue);
                    if (oldDropoffConNameValue !== newDropoffConNameValue && newDropoffConNameValue != null && newDropoffConNameValue != '') {
                        newDropoffField = rec.getValue(dropoffFields[i]);
                        newDropoffConEmailValue = rec.getValue(dropoffConEmailFields[i]);
                        newDropoffConPhoneValue = rec.getValue(dropoffConPhoneFields[i]);
                        updatePOContactFields(rec, oldRec, oldDropoffConNameValue, newDropoffConNameValue, newDropoffConEmailValue, newDropoffConPhoneValue, newDropoffField, i);
                    }

                }
            }

            if (orderType == '2') {
                var shipMethod = rec.getValue('custbody_shipping_method_code');
                var total = rec.getValue('total');
                status = rec.getValue('status');
                var readyForApprov = rec.getValue('custbody_ready_for_approval');
                log.debug('shipMethod=', shipMethod + ' total=' + total + ' status=' + status + ' type=' + type + ' readyForApprov=' + readyForApprov);
                if (shipMethod == '1' && total == 0 && (status == 'Pending Approval' || type == 'create') && readyForApprov) {
                    rec.setText({ fieldId: 'orderstatus', text: 'Pending Fulfillment' });
                    log.debug('orderstatus=', rec.getText('orderstatus'));
                }
                // log.debug('orderstatus=',rec.getText('orderstatus'));
                // Added for PO admin fee ticket
                var admin_rec_1 = rec.getValue('custbodycustbody_admin_fee_recipient');
                var admin_fee_rec_1 = rec.getValue('custbody_admin_fee_for_rec1');
                var createFlatFeePO_1 = false;
                log.debug('admin_rec_1=', admin_rec_1);
                if (admin_rec_1 != null && admin_rec_1 != '') {
                    createFlatFeePO_1 = nsSearch.lookupFields({
                        type: nsSearch.Type.VENDOR,
                        id: admin_rec_1,
                        columns: ['custentity_adm_flat_fee_rec']
                    });
                    log.debug('createFlatFeePO_1=', createFlatFeePO_1);
                }
                if (!createFlatFeePO_1.custentity_adm_flat_fee_rec) {
                    log.debug('inside createFlatFeePO_1=', createFlatFeePO_1);
                    rec.setValue({ fieldId: 'custbody_admin_qty_based_po', value: true });
                } else {
                    rec.setValue({ fieldId: 'custbody_adm_flat_fee_po', value: true });
                    if (admin_fee_rec_1) {
                        rec.setValue({ fieldId: 'custbody_adm_fee_flat_rate', value: admin_fee_rec_1 });
                    }
                }
            }
            setMemberRateDiscount(rec);
            // log.debug('old rec line count at end of beforeSubmit', oldRec.getLineCount('item'));
            // log.debug('rec line count at end of beforeSubmit', rec.getLineCount('item'));
            // for (var x = 0; x < rec.getLineCount('item'); x += 1) {
            //     log.debug('item', rec.getSublistValue({ sublistId: 'item', fieldId: 'item', line: x }));
            // }
        }

        /**
         * @param {UserEventContext.afterSubmit} context
         */
        function afterSubmit(context) {
            var rec = context.newRecord;
            var type = context.type;
            var scriptObj = nsRuntime.getCurrentScript();
            var transFeeRate = scriptObj.getParameter({ name: 'custscript_trans_fee_percent' });
            var promoCount;
            var promoInfo;
            var x;
            var promoCode;
            // var discountItem;
            var purchaseDiscount;
            var itemId;
            var fund;
            var project;
            var promoId;
            var lookup;
            var objRecord;
            var y;
            var itemCount;
            var freightSubsidyRecId = rec.getValue('custbody_kbs_tfs');
            var orderHasIssues;
            var orderHasIssuesReason;
            var orderStatus;
            var status;
            var orderType;

            log.debug('in afterSubmit');
            if (freightSubsidyRecId) {
                log.debug('freightSubsidyRecId', freightSubsidyRecId);
                kbsApplyPromo.updateFreightSubsidy(freightSubsidyRecId, rec, type);
            }
            if (type !== context.UserEventType.DELETE && type !== context.UserEventType.XEDIT) {
                if (type === context.UserEventType.CREATE || type === context.UserEventType.COPY) {
                    // Order Status Accepted = 2,  On Hold For Finance = 9
                    // if ((orderType === '1' || orderType === '2') && (orderStatus === '2' || orderStatus === '4')) {
                    orderStatus = rec.getValue({ fieldId: 'custbody_order_status' });
                    // status = rec.getValue('status');
                    orderType = rec.getValue('custbody_order_type');
                    log.audit('orderType for approval', orderType + ' ' + typeof orderType);
                    log.audit('orderStatus for approval', orderStatus + ' ' + typeof orderStatus);
                    // log.audit('status for approval', status + ' ' + typeof status);
                    if ((orderType === '1' || orderType === '2') && (orderStatus === '2' || orderStatus === '9')) {
                        orderHasIssues = rec.getValue('custbody_order_has_issues');
                        orderHasIssuesReason = rec.getValue('custbody_order_has_issues_reason');
                        log.audit('orderHasIssues', orderHasIssues + ' ' + typeof orderHasIssues);
                        log.audit('orderHasIssuesReason', orderHasIssuesReason + ' ' + typeof orderHasIssuesReason);
                        log.audit('orderHasIssuesReason length', orderHasIssuesReason.length);
                        if (!orderHasIssues && (!orderHasIssuesReason || orderHasIssuesReason.length === 0)) {
                            // objRecord = nsRecord.load({ type: nsRecord.Type.SALES_ORDER, id: context.newRecord.id, isDynamic: false });
                            log.audit('setting custbody_ready_for_approval to true');
                            // rec.setValue({ fieldId: 'custbody_ready_for_approval', value: true });
                            nsRecord.submitFields({
                                type: nsRecord.Type.SALES_ORDER,
                                id: rec.id,
                                values: {
                                    custbody_ready_for_approval: true
                                }
                            });
                            // objRecord.save({ enableSourcing: true, ignoreMandatoryFields: true });
                        }
                    }
                }
                objRecord = nsRecord.load({ type: nsRecord.Type.SALES_ORDER, id: context.newRecord.id, isDynamic: false });
                promoCount = objRecord.getLineCount({
                    sublistId: 'promotions'
                });
                itemCount = objRecord.getLineCount({
                    sublistId: 'item'
                });
                objRecord = setFundandProjectForNonDiscountItems(objRecord, itemCount);
                log.debug('promoCount', promoCount);
                for (x = 0; x < promoCount; x += 1) {
                    // set fund and project on item lines
                    promoId = objRecord.getSublistValue({
                        sublistId: 'promotions', fieldId: 'promocode', line: x
                    });
                    itemId = objRecord.getSublistValue({
                        sublistId: 'promotions', fieldId: 'discount', line: x
                    });
                    lookup = nsSearch.lookupFields({ type: 'promotioncode', id: promoId, columns: ['custrecord_kbs_promo_faproject', 'custrecord_kbs_promotionfund'] });
                    if (lookup.custrecord_kbs_promotionfund && lookup.custrecord_kbs_promotionfund[0]) {
                        fund = lookup.custrecord_kbs_promotionfund[0].value;
                    }
                    if (lookup.custrecord_kbs_promo_faproject && lookup.custrecord_kbs_promo_faproject[0]) {
                        project = lookup.custrecord_kbs_promo_faproject[0].value;
                    }
                    log.debug('project & fund', project + ' ' + fund);
                    for (y = 0; y < itemCount; y += 1) {
                        lineItemId = objRecord.getSublistValue({
                            sublistId: 'item', fieldId: 'item', line: y
                        });
                        if (itemId === lineItemId) {
                            if (fund) {
                                objRecord.setSublistValue({
                                    sublistId: 'item', fieldId: 'location', line: y, value: fund
                                });
                            }
                            if (project) {
                                objRecord.setSublistValue({
                                    sublistId: 'item', fieldId: 'custcol_cseg_projects_cseg', line: y, value: project
                                });
                            }
                        }
                    }
                }

                try {
                    // Only enter if type is create or edit
                    if (type === context.UserEventType.CREATE || type === context.UserEventType.EDIT) {
                        // Merged from old script NS UE Set Order Number Suitescript 1.0
                        setOrderNumber(objRecord, itemCount, type);

                        captureUnkItemLineData(rec, objRecord);
                        // Added for ticket #6513
                        calculateDeliveredPrice(rec, transFeeRate, objRecord);

                        // Added for ticket #12756
                        if (type === context.UserEventType.CREATE) {
                            setDonationBillToMember(objRecord, itemCount);
                        }
                    }
                } catch (ex) {
                    log.error('Error', ex);
                }
                objRecord.save({ enableSourcing: true, ignoreMandatoryFields: true });
            }
        }
        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    }
);
