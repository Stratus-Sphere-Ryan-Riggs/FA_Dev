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
     * @param {Array} array
     */

        function findIndex(array, value) {
            var index = parseInt('-1');
            for(var iter in array) {
                if(array[iter]==value) {
                    index=iter;
                }
            }
            return index;
        }

        /**
     * @param {N_record} nsRecord
     */
        function calculateDeliveredPrice(rec,transFeeRate) {
            var lineCount;
            var i;
            var itemId;
            var lineId;
            var objArray = [];
            var lineNumber;
            var objString;
            var objRecord;
            var calcDlvPrice = false;
            var totalQty = parseFloat(0);
            var headerQty = parseFloat(0);
            var orderType = rec.getValue('custbody_order_type');
            var headerCus = rec.getValue('entity');
            var totalTransCost = parseFloat(0);
            if(orderType == '1') {
                objRecord = nsRecord.load({
                    type: nsRecord.Type.SALES_ORDER,
                    id: rec.id,
                });
                lineCount = objRecord.getLineCount({ sublistId: 'item' });
                // to check if delivered price needs to be calculated
                for (var i = 0; i < lineCount; i += 1) {
                    var dlvRate = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'custcol_adj_invoice_rate', line: i });
                    var prodChannel = objRecord.getSublistText({ sublistId: 'item', fieldId: 'custcol_product_channel', line: i });
                    if((dlvRate==null || dlvRate == '') && prodChannel == 'Grocery') {
                        calcDlvPrice = true;
                        break;
                    }
                }
                log.debug('calcDlvPrice', 'calcDlvPrice = ' + calcDlvPrice);
                if(calcDlvPrice) {
                    for (var i = 0; i < lineCount; i += 1) {
                        //   var customer;
                        var cusAdjRate = 0;
                        var prodChannel = objRecord.getSublistText({ sublistId: 'item', fieldId: 'custcol_product_channel', line: i });
                        if(prodChannel=='Grocery') {
                            var quantity = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'quantity', line: i });
                            totalQty = totalQty + quantity;
                        }
                        else{
                  	var item = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
                            log.debug('item', 'item = ' + item);
                            //set item and percentage as parameters : TO-DO
                  	if(item == '4038') {
                    	var transCost = parseFloat(objRecord.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i }));
                                totalTransCost = transCost + transFeeRate*transCost/100;
                  	}
                        }

              	}
                    log.debug('totalTransCost', 'totalTransCost = ' + totalTransCost);
                    if(totalTransCost>0) {

                 	 cusAdjRate = (totalTransCost /totalQty).toFixed(2);

                    }
                    for (var i = 0; i < lineCount; i += 1) {
                        var rate = parseFloat(objRecord.getSublistValue({ sublistId: 'item', fieldId: 'rate', line: i }));
                        objRecord.setSublistValue(
                            {
                                sublistId: 'item',
                                fieldId: 'custcol_adj_invoice_rate',
                                line: i,
                                value: parseFloat(rate)+parseFloat(cusAdjRate)
                            }
                        );
                    }
                    objRecord.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                }
            }
        }

	//Added by Elizabeth per ticket #7302 - updating PO when drop off member and contacts are updated on the SO
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
              },{
                name: 'mainline',
                operator: 'IS',
                values: ['T']}]
            });
             POSearch.run().each(function(result) {
               var intID = result.getValue({
                 name: 'internalid'
               });
                log.debug('POintID=',intID);
                log.debug('i', i);
                log.debug('dropoffloc', newDropoffField);

               if (i == 0) {
                        nsRecord.submitFields({
                                type: nsRecord.Type.PURCHASE_ORDER,
                              	id: parseInt(intID, 10),
                                values: {'custbody_dropoff_shipto_contact1_name': newDropoffConNameValue,
                                         'custbody_dropoff_shipto_contact1_email': newDropoffConEmailValue,
                                         'custbody_dropoff_shipto_contact1_phone': newDropoffConPhoneValue,
                                         'custbody_drop_off_location1': newDropoffField}
                            });
               }
               if (i == 1) {
                        nsRecord.submitFields({
                                type: nsRecord.Type.PURCHASE_ORDER,
                              	id: parseInt(intID, 10),
                                values: {'custbody_dropoff_shipto_contact2_name': newDropoffConNameValue,
                                         'custbody_dropoff_shipto_contact2_email': newDropoffConEmailValue,
                                         'custbody_dropoff_shipto_contact2_phone': newDropoffConPhoneValue,
                                         'custbody_drop_off_location_2': newDropoffField}
                            });
               }
               if (i == 2) {
                        nsRecord.submitFields({
                                type: nsRecord.Type.PURCHASE_ORDER,
                              	id: parseInt(intID, 10),
                                values: {'custbody_dropoff_shipto_contact3_name': newDropoffConNameValue,
                                         'custbody_dropoff_shipto_contact3_email': newDropoffConEmailValue,
                                         'custbody_dropoff_shipto_contact3_phone': newDropoffConPhoneValue,
                                         'custbody_drop_off_location_3': newDropoffField}
                            });
               }
               if (i == 4) {
                        nsRecord.submitFields({
                                type: nsRecord.Type.PURCHASE_ORDER,
                              	id: parseInt(intID, 10),
                                values: {'custbody_dropoff_shipto_contact4_name': newDropoffConNameValue,
                                         'custbody_dropoff_shipto_contact4_email': newDropoffConEmailValue,
                                         'custbody_dropoff_shipto_contact4_phone': newDropoffConPhoneValue,
                                         'custbody_drop_off_location_4': newDropoffField}
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

        /**
    * @param {UserEventContext.beforeLoad} context
    */
        function beforeLoad(context) {
            var type = context.type;
            var rec = context.newRecord;
            var form = context.form;
            var status;

            status = rec.getValue('status');
            if (status === 'Pending Fulfillment' && type !== context.UserEventType.DELETE) {
                log.debug('entered if', status);
                form.addButton({ id: 'custpage_cancelorderbtn', label: 'Cancel Order', functionName: 'cancelOrderClick' });
                form.clientScriptModulePath = 'SuiteScripts/KBS_SalesOrder_CS.js';
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



            orderType = rec.getValue('custbody_order_type');
            // only run if order type is not Transportation (id = 7)
            if (type === context.UserEventType.EDIT && orderType !== '7') {
                for (i = 0; i < dropoffFields.length; i += 1) {
                    oldDropoffField = oldRec.getValue(dropoffFields[i]);
                    newDropoffField = rec.getValue(dropoffFields[i]);
                    if (oldDropoffField !== newDropoffField && newDropoffField!=null && newDropoffField!='') {
                        newMemberField = rec.getValue(dropoffMemberFields[i]);
                        // log.debug('old vs new', oldDropoffField + ' vs ' + newDropoffField + ' position' + i);
                        updateLineDropoffFields(rec, oldRec, oldDropoffField, newDropoffField, newMemberField);
                    }
                }
                for (i = 0; i < warehouseFields.length; i += 1) {
                    oldWarehouseValue = oldRec.getValue(warehouseFields[i]);
                    newWarehosueValue = rec.getValue(warehouseFields[i]);
                    if (oldWarehouseValue !== newWarehosueValue && newWarehosueValue!=null && newWarehosueValue!='') {
                        //Added for ticket #7103
                        if(orderType == '1' || orderType == '2'){
                            if(oldWarehouseValue!=null && oldWarehouseValue!=''){
                                updateLineWarehouseFields(rec, oldRec, oldWarehouseValue, newWarehosueValue, orderType);
                            }
                        } else{
                        	updateLineWarehouseFields(rec, oldRec, oldWarehouseValue, newWarehosueValue, orderType);
                        }
                    }

                }
            }

	  //Added by Elizabeth per ticket #7302 - updating PO when drop off member and contacts are updated on the SO
          if (type === context.UserEventType.EDIT) {
            for (i = 0; i < dropoffConNameFields.length; i += 1) {
                    oldDropoffConNameValue = oldRec.getValue(dropoffConNameFields[i]);
                    newDropoffConNameValue = rec.getValue(dropoffConNameFields[i]);
                    if (oldDropoffConNameValue !== newDropoffConNameValue && newDropoffConNameValue!=null && newDropoffConNameValue!='') {
                    	newDropoffField = rec.getValue(dropoffFields[i]);
                        newDropoffConEmailValue = rec.getValue(dropoffConEmailFields[i]);
                        newDropoffConPhoneValue = rec.getValue(dropoffConPhoneFields[i]);
                        updatePOContactFields(rec, oldRec, oldDropoffConNameValue, newDropoffConNameValue, newDropoffConEmailValue, newDropoffConPhoneValue, newDropoffField, i);
                    }

                }
          }

          	if(orderType == '2'){
              var shipMethod = rec.getValue('custbody_shipping_method_code');
              var total = rec.getValue('total');
              var status = rec.getValue('status');
              var readyForApprov = rec.getValue('custbody_ready_for_approval');
              log.debug('shipMethod=',shipMethod+' total='+total+' status='+status+' type='+type+' readyForApprov='+readyForApprov);
              if(shipMethod=='1' && total==0 && (status=='Pending Approval' || type=='create') && readyForApprov){
               rec.setText({ fieldId: 'orderstatus', text: 'Pending Fulfillment' });
                log.debug('orderstatus=',rec.getText('orderstatus'));
              }
              //log.debug('orderstatus=',rec.getText('orderstatus'));
              //Added for PO admin fee ticket
              var admin_rec_1 = rec.getValue('custbodycustbody_admin_fee_recipient');
              var createFlatFeePO_1 = false;
              log.debug('admin_rec_1=',admin_rec_1);
              if(admin_rec_1!=null && admin_rec_1!=''){
                createFlatFeePO_1 = nsSearch.lookupFields({
                  type:nsSearch.Type.VENDOR,
                  id:admin_rec_1,
                  columns:['custentity_adm_flat_fee_rec']
                });
                log.debug('createFlatFeePO_1=',createFlatFeePO_1);
              }
              if(!createFlatFeePO_1.custentity_adm_flat_fee_rec){
                log.debug('inside createFlatFeePO_1=',createFlatFeePO_1);
                 rec.setValue({ fieldId: 'custbody_admin_qty_based_po', value: true });
              }
             }
          
        }

        /**
         * @param {UserEventContext.afterSubmit} context
         */
        function afterSubmit(context) {
            var rec = context.newRecord;
            var type = context.type;
            var scriptObj = nsRuntime.getCurrentScript();
          	var transFeeRate = scriptObj.getParameter({name: 'custscript_trans_fee_percent'});

            try {
                // Only enter if type is create or edit
                if (type === context.UserEventType.CREATE || type === context.UserEventType.EDIT) {

                    captureUnkItemLineData(rec);
                    //Added for ticket #6513
                    calculateDeliveredPrice(rec,transFeeRate);
                }
            } catch (ex) {
                log.error('Error', ex);
            }

        }
        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    }
);
