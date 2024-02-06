nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
 * Copyright (c) 1998-2014 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 * 
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 * 
 * @author Marco Pannone
 * @version 1.0
 * @event/Type: Scheduled Script
 * 10/4/2016  - Changed the disable for auto receiving to a != 'T' Condition
 * 10/18/2016 - Corrected the Product Passing issue
 * 10/25/2016 - If FA Arranged - then Bill to freight needs to be set to FANO
 * 5/22/2018 - Added a change to 'Actual/Receipted Pick Up Date' when auto-receipted. 'Actual/Receipted Pick Up Date' (custbody_pickup_date) will be equal to 'Requested Pick Up Date' (custbodycustbody_requested_pickup_date).
 */

var SS_POURCHASE_ORDERS = 'customsearch_orders_to_receipt';
var _MS_PER_DAY = 1000 * 60 * 60 * 24;
var SS_SALES_ORDERS = 'customsearch_donation_orders_to_receipt';

function schRecivePurchaseOrderFA() {
	try {
		var posProcessed = [];
      	var sosProcessed = [];
		var CONTEXT = nlapiGetContext();
		var SENDER_ID = CONTEXT.getSetting('SCRIPT', 'custscript_sender_error_email');
		var EMAIL_TO = CONTEXT.getSetting('SCRIPT', 'custscriptcontactemail');
		var poList = nlapiSearchRecord('purchaseorder', SS_POURCHASE_ORDERS);
      	var bReschedule = false;

		var shippingMethodFA = CONTEXT.getSetting('SCRIPT', 'custscript_shipping_method_fa');
		var shippingMethodVA = CONTEXT.getSetting('SCRIPT', 'custscript_shipping_method_va');
		shippingMethodFA = shippingMethodFA.split(",");
		shippingMethodVA = shippingMethodVA.split(",");

		nlapiLogExecution('DEBUG', 'shippingMethodFA', shippingMethodFA[0]);
		nlapiLogExecution('DEBUG', 'shippingMethodFA', shippingMethodFA[1]);
		nlapiLogExecution('DEBUG', 'shippingMethodVA', shippingMethodVA[0]);

		var intNumToProcess = parseInt('0');
      if(poList != null){
        intNumToProcess = poList.length;
      }
      	var intMaxNumToProcess = parseInt('100');
		if (intNumToProcess > intMaxNumToProcess)
		{
			intNumToProcess = intMaxNumToProcess;
			bReschedule = true;
		}

		for (var i = 0; poList != null && i < intNumToProcess; i++) {
			var POid = poList[i].getId();
			var daysForAutoReceipting = CONTEXT.getSetting('SCRIPT', 'custscriptdaysautoreceipting');
			if (posProcessed.indexOf(POid) == -1) {

				var deliveryDate = poList[i].getValue('custbody_actual_carrier_delivery_date', 'createdFrom');

				var SOid = poList[i].getValue('internalid', 'createdFrom');
				var FArrangedTrans = nlapiLookupField('salesorder', SOid, 'custbody_shipping_method_code');
              //Edited for task 6325 by Thilaga
				var requested_pick_date = nlapiLookupField('salesorder', SOid, 'custbodycustbody_requested_pickup_date');
				nlapiLogExecution('DEBUG', 'FArrangedTrans', FArrangedTrans);

				if (shippingMethodVA.indexOf(FArrangedTrans) != -1) {
					daysForAutoReceipting = CONTEXT.getSetting('SCRIPT', 'custscript_daysautoreceipting_va');
					deliveryDate = requested_pick_date;
					nlapiLogExecution('DEBUG', 'deliveryDate va', deliveryDate);
				}

                nlapiLogExecution('DEBUG', 'delivery date', deliveryDate);
				if (!isEmpty(deliveryDate)) {
					

					nlapiLogExecution('DEBUG', 'SOid', SOid);
					if (SOid) {
						var SORecord = nlapiLoadRecord('salesorder', SOid);
					}
					if (SORecord) {
						var SOItemsLenght = SORecord.getLineItemCount('item');
					}
					for (var j = 1;
						((SOid) && (j <= SOItemsLenght)); j++) {
						// First step determine if any vendor is disabled
                        var masterDisableAutoReceiting = false;
                        var soPoVendor = '';
                        for (var idx = 1; idx <= SORecord.getLineItemCount('item'); idx++ ) 
                        {
							 var lineVendor = SORecord.getLineItemValue('item', 'povendor', idx);
							 if (lineVendor != soPoVendor && (!isEmpty(lineVendor)) )
							 {
								var vendorAutoRecepting = nlapiLookupField('vendor', lineVendor, 'custentity_approvedvendorforgrfreight');
								if (vendorAutoRecepting == 'T')
								{
									masterDisableAutoReceiting = true;
								}	
							 }
                        } 							
						
						nlapiLogExecution('DEBUG', 'Step 1 Master Disable ' + masterDisableAutoReceiting);

						if (!isEmpty(FArrangedTrans) && (shippingMethodFA.indexOf(FArrangedTrans) != -1 || shippingMethodVA.indexOf(FArrangedTrans) != -1)) {
//							var vendorID = SORecord.getLineItemValue('item', 'povendor', j);
							var vendorID =  poList[i].getValue('name');
							
							if (vendorID) {
								nlapiLogExecution('DEBUG', 'Step 2');
								var disableAutoRecepting = nlapiLookupField('vendor', vendorID, 'custentity_approvedvendorforgrfreight');
								var soBillToFreight      = SORecord.getFieldValue('custbody_bill_to_freight');
								var paramBillToFreight   = CONTEXT.getSetting('SCRIPT', 'custscript_autoreceipt_billtofreight');
								nlapiLogExecution('DEBUG', 'Step 2-A ' + soBillToFreight + ' param ' + paramBillToFreight );
								if (!isEmpty(FArrangedTrans) && shippingMethodFA.indexOf(FArrangedTrans) != -1 && soBillToFreight != paramBillToFreight)
								{
								    nlapiLogExecution('DEBUG', 'Step 2-B Disabled');
									disableAutoRecepting = 'T';
                                }								
								
                                nlapiLogExecution('DEBUG', 'Step 2-C Disabled ' + disableAutoRecepting + ' vendor id ' + vendorID);
								if (disableAutoRecepting != 'T' && !masterDisableAutoReceiting) {
									nlapiLogExecution('DEBUG', 'Step 3');
									var date = new Date();
									var days = getBusinessDatesCount(deliveryDate, date);
									nlapiLogExecution('DEBUG', 'Step 4');
									nlapiLogExecution('DEBUG', 'date', date);
									nlapiLogExecution('DEBUG', 'deliveryDate', deliveryDate);
									nlapiLogExecution('DEBUG', 'days', days);
									if (days >= daysForAutoReceipting) {

										var soOrderType    = SORecord.getFieldText('custbody_order_type')
										var producePassing = SORecord.getFieldValue('custbody_produce_passing');
                                        nlapiLogExecution('DEBUG', 'Step 4-A Product ' + soOrderType + ' ' + producePassing);
										if (soOrderType == 'Produce' && producePassing != 'T') {

											nlapiLogExecution('DEBUG', 'PO not processed');
											continue;

										} else {

											//var POid = poList[i].getValue('internalid');
											if (POid) {
												var PORecord = nlapiLoadRecord('purchaseorder', POid);
											}
											if (PORecord) {
												var POItemsLenght = PORecord.getLineItemCount('item');
											}
											for (var k = 1;
												((POid) && (k <= POItemsLenght)); k++) {
												var POquantity = PORecord.getLineItemValue('item', 'quantityreceived', k);
												var currentItemId = PORecord.getLineItemValue('item', 'item', k);
												if (currentItemId) {
													var itemNameType = nlapiLookupField('item', currentItemId, 'recordtype');
													if (itemNameType) {
														var itemRecord = nlapiLoadRecord(itemNameType, currentItemId);
														if (itemRecord) {
															var dropShipItem = itemRecord.getFieldValue('isdropshipitem');
															if (POquantity == 0) {
																var itemQuantity = PORecord.getLineItemValue('item', 'quantity', k);
																var trecord = nlapiTransformRecord('salesorder', SOid, 'itemfulfillment');
																var ifLines = trecord.getLineItemCount('item');
																for (var itemLines = ifLines; itemLines > 0; itemLines--) {
																	var poIDIFLine = trecord.getLineItemValue('item', 'podoc', itemLines);
																	nlapiLogExecution('DEBUG', 'poIDIFLine', poIDIFLine);
																	nlapiLogExecution('DEBUG', 'POid', POid);
																	if (poIDIFLine != POid) {
																		//trecord.removeLineItem('item', itemLines);
																		trecord.setLineItemValue('item', 'quantity', itemLines, 0);
																		nlapiLogExecution('DEBUG', 'remove line', itemLines);
																	}
                                                                  
                                                                  trecord.setLineItemValue('item','custcol_gross_wt_received',itemLines,trecord.getLineItemValue('item', 'custcol_total_weight', itemLines));
                                                                  
                                                                }
																posProcessed.push(POid);
																nlapiLogExecution('DEBUG', 'count', trecord.getLineItemCount('item'));
																if (trecord.getLineItemCount('item') != 0) {
                                                                    var idl = nlapiSubmitRecord(trecord, true);
																}
																j = SOItemsLenght;
															}
														}
													}
												}
                                              
											}
										}

									}
								}
							}
						}
					}
				}
			}
          //Added for Bug 5358:NetSuite/Receipted pounds not populate for auto-receipted sales orders
          if(SORecord && PORecord){
          	if (SORecord.getFieldValue('custbody_pickup_date') == null) {
                     PORecord.setFieldValue('custbody_pickup_date', PORecord.getFieldValue('custbodycustbody_requested_pickup_date'));
                     var SOpickup = nlapiSubmitField('salesorder', SOid, 'custbody_pickup_date', SORecord.getFieldValue('custbodycustbody_requested_pickup_date'));
                     var POpickup = nlapiSubmitField('purchaseorder', POid, 'custbody_pickup_date',PORecord.getFieldValue('custbodycustbody_requested_pickup_date'))
			}
          }
		}
      //Added for Task 6258 by Thilaga:Auto receipt donation orders 
      var donationList = nlapiSearchRecord('salesorder', SS_SALES_ORDERS);
      intNumToProcess = donationList.length;
      	if (intNumToProcess > intMaxNumToProcess)
		{
			intNumToProcess = intMaxNumToProcess;
			bReschedule = true;
		}
      for (var i = 0; donationList != null && i < intNumToProcess; i++) {
			var SOid = donationList[i].getId();
			var daysForDonationAutoReceipting = CONTEXT.getSetting('SCRIPT', 'custscript_days_donation_receipting');
			if (sosProcessed.indexOf(SOid) == -1) {

				var outByDate = donationList[i].getValue('custbody_outbydate');

				
                nlapiLogExecution('DEBUG', 'outByDate', outByDate);
				if (!isEmpty(outByDate)) {
					
                  var soDonor = donationList[i].getValue('custbody_opportunity_donor');

					
							 if (!isEmpty(soDonor))
							 {
								var vendorAutoRecepting = nlapiLookupField('vendor', soDonor, 'custentity_approvedvendorforgrfreight');
								if (vendorAutoRecepting == 'T')
								{
									masterDisableAutoReceiting = true;
								}	
							 }
                  if (!masterDisableAutoReceiting) {
						nlapiLogExecution('DEBUG', 'Step 3');
						var date = new Date();
						var days = getBusinessDatesCount(outByDate, date);
						nlapiLogExecution('DEBUG', 'Step 4');
						nlapiLogExecution('DEBUG', 'date', date);
						nlapiLogExecution('DEBUG', 'outByDate', outByDate);
						nlapiLogExecution('DEBUG', 'days', days);
						if (days >= daysForDonationAutoReceipting) {

							var trecord = nlapiTransformRecord('salesorder', SOid, 'itemfulfillment');
                          if (trecord.getLineItemCount('item') != 0) {
                                                                    var idl = nlapiSubmitRecord(trecord, true);
																}
                        }
                  }
                        } 							
						
						nlapiLogExecution('DEBUG', 'Step 1 Master Disable ' + masterDisableAutoReceiting);
            }
      }
      
      if (bReschedule)
	{
		nlapiLogExecution('DEBUG', 'System', 'ScriptID: ' + CONTEXT.getScriptId() + ' DeployID: ' + CONTEXT.getDeploymentId());
		//nlapiLogExecution('DEBUG', 'System', 'Rescheduled: ' + nlapiScheduleScript(CONTEXT.getScriptId(), CONTEXT.getDeploymentId()));
	}
	} catch (error) {
		nlapiLogExecution('ERROR', error);
		//nlapiSendEmail(SENDER_ID, EMAIL_TO, 'Error: In script Receive Purchase Orders for FA', error, null, null, null);
	}
}

function isEmpty(value) {
	if (value == null)
		return true;
	if (value == undefined)
		return true;
	if (value == 'undefined')
		return true;
	if (value == '')
		return true;
	if (value == 'NaN')
		return true;
	return false;
}

function dateDiffInDays(a, b) {
	nlapiLogExecution('Debug', 'Step dateDiffInDays 1');
	var utc1 = new Date(a);
	var utc2 = b;
	nlapiLogExecution('Debug', 'Step dateDiffInDays 2');
	utc1 = Date.UTC(utc1.getFullYear(), utc1.getMonth(), utc1.getDate());
	nlapiLogExecution('Debug', 'Step dateDiffInDays 3');
	return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

function getBusinessDatesCount(startDate, endDate) {
	startDate = new Date(startDate);
	var count = 0;
	var curDate = startDate;
	while (curDate <= endDate) {
		var dayOfWeek = curDate.getDay();
		if (validateDate(curDate)) {
			count++;
		}
		curDate.setDate(curDate.getDate() + 1);
	}
	return count;
}

function validateDate(stDate) {
    var newDate = new Date(stDate);
    var dayOfWeek = newDate.getDay();
   nlapiLogExecution('DEBUG', 'newDate>>dayOfWeek',newDate+' '+dayOfWeek);
    if (dayOfWeek == 6) {
        return false;
    }
    if (dayOfWeek == 0) {
        return false;
    }
    var filters = new Array();
    filters[0] = new nlobjSearchFilter('custrecord_holiday_date', null, 'on', nlapiDateToString(newDate)); // add in item type value
    filters[1] = new nlobjSearchFilter('isinactive', null, 'is', 'F');

    var searchResults = nlapiSearchRecord('customrecord_auction_holiday', null, filters);
    if (searchResults != null) {
        return false;
    } else {
        return true;
    }

}