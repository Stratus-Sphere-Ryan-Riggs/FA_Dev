/**
* Copyright (c) 1998-2016 NetSuite, Inc.
* 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
* All Rights Reserved.
*
* This software is the confidential and proprietary information of
* NetSuite, Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with NetSuite.
*/

/**
* Module Description
* 
* Version 1.00 Date 07/13/2016 Author Diego Gasaniga
* Type Scheduled Script
*
* 10/10/2016  1) For the opportunity and sales order set storage requirements = handling code
*             2) for the sales order set the line item pickup location
* 10/18/2016  If Pounds and qty are zero - do not add the line
* 11/02/2016  1) Ensure first item date carried to all items
*             2) Add In Entity pointer for Members and donors
*			  3) Handling Code Lookup - check if valid and set storage requirements
* 12/1/2016   1) Fixed the zero qty processing
*             2) For memmbers/vendor added lookup based on entity id or oddyssey
*             3) Added a Fulfillment date check
* 12/12/2016  Add in additional explications for the exceptions - specifically blocked and missing
* 01/18/2017  Added exceptions for zero units, zero pounds and no pickup date
* 02/06/2017  Revised the Pickup date setting
* 02/23/2017  If a donation has no shipment number - bypass duplicate checks
* 04/11/2017  For Item Dates Carry forward date 1

*/

//var savedSearch = 'customsearch_blue_receipt_donations';  
var recordType = 'customrecord_donation_import';
var itemsException = false;

function _processBlueDonations()
{
	try
	{
		var context = nlapiGetContext();
		var donationsSavedSearch = context.getSetting('SCRIPT', 'custscript_donations_saved_search');
		var storagerequirements  = context.getSetting('SCRIPT', 'custscript_storage_requirements');
		var processafterdate     = context.getSetting('SCRIPT', 'custscript_process_after_date');
        var defCarrier = context.getSetting('SCRIPT','custscript_carrier_default');
        nlapiLogExecution('debug', 'storage 1 ' + storagerequirements);
		var ARR_STORAGE_TYPES = [];
	    ARR_STORAGE_TYPES = storagerequirements.split(',');
        nlapiLogExecution('debug', 'storage 1 ' + ARR_STORAGE_TYPES);
		//added for test
         currentDate = new Date(); // returns the date
         nlapiLogExecution('EMERGENCY', 'Start Date/Time', nlapiDateToString(currentDate,'datetimetz')); 
		if (!isEmpty(processafterdate))
		{
		  var filtersDonation = [];
 	      filtersDonation.push(new nlobjSearchFilter('custrecord_full_date', null, 'onorafter', processafterdate));

		}
		
		if (isEmpty(processafterdate))
	    {
 	 	 var resultsSavedSearch = nlapiSearchRecord(recordType, donationsSavedSearch, null, null);
        }

		if (!isEmpty(processafterdate))
	    {
 	 	 var resultsSavedSearch = nlapiSearchRecord(recordType, donationsSavedSearch, filtersDonation, null);
        }
		
		if(resultsSavedSearch && resultsSavedSearch.length > 0)
		{
			for(var i = 0; i < resultsSavedSearch.length; i++) 
			{
               //added for test
         currentDate = new Date(); // returns the date
         nlapiLogExecution('EMERGENCY', 'Before Item and WH validations Date/Time', nlapiDateToString(currentDate,'datetimetz')); 
				try
				{
					var donorNumber = resultsSavedSearch[i].getValue('custrecord_donation_donor_no');
                   nlapiLogExecution('debug', 'Step Thi ' + donorNumber);
					var shipmentNumber = resultsSavedSearch[i].getValue('custrecord_donation_shipment_no');
					var memberNumber =  resultsSavedSearch[i].getValue('custrecord_donation_a2haffiliateid');
					var donationID = resultsSavedSearch[i].getId(); 
					var donationEmail = resultsSavedSearch[i].getValue('custrecord_donation_email');
					var title = resultsSavedSearch[i].getValue('custrecord_donation_title');
					var userName = resultsSavedSearch[i].getValue('custrecord_user_name');
					var totalPounds = resultsSavedSearch[i].getValue('formulanumeric');
					var pickUpDate = resultsSavedSearch[i].getValue('custrecord_item_date_1');
					var orderType   = resultsSavedSearch[i].getValue('custbody_order_type');
					var shipmentNbr = resultsSavedSearch[i].getValue('custrecord_donation_shipment_no');
					var donationUnits = [];
					//get donation items
					var item1 = resultsSavedSearch[i].getValue('custrecord_donation_item_1');
					var item2 = resultsSavedSearch[i].getValue('custrecord_donation_item_2');
					var item3 = resultsSavedSearch[i].getValue('custrecord_donation_item_3');
					var item4 = resultsSavedSearch[i].getValue('custrecord_donation_item_4');
					var item5 = resultsSavedSearch[i].getValue('custrecord_donation_item_5');
					var item6 = resultsSavedSearch[i].getValue('custrecord_donation_item_6');
					var item7 = resultsSavedSearch[i].getValue('custrecord_donation_item_7');
					var item8 = resultsSavedSearch[i].getValue('custrecord_donation_item_8');
					//create item records and search for item internal id
					var arrayItems = [];
					arrayItems = createItemRecords(item1, arrayItems, resultsSavedSearch[i], '_1', donationID, 1, ARR_STORAGE_TYPES, pickUpDate);
					arrayItems = createItemRecords(item2, arrayItems, resultsSavedSearch[i], '_2', donationID, 2, ARR_STORAGE_TYPES, pickUpDate);
					arrayItems = createItemRecords(item3, arrayItems, resultsSavedSearch[i], '_3', donationID, 3, ARR_STORAGE_TYPES, pickUpDate);
					arrayItems = createItemRecords(item4, arrayItems, resultsSavedSearch[i], '_4', donationID, 4, ARR_STORAGE_TYPES, pickUpDate);
					arrayItems = createItemRecords(item5, arrayItems, resultsSavedSearch[i], '_5', donationID, 5, ARR_STORAGE_TYPES, pickUpDate);
					arrayItems = createItemRecords(item6, arrayItems, resultsSavedSearch[i], '_6', donationID, 6, ARR_STORAGE_TYPES, pickUpDate);
					arrayItems = createItemRecords(item7, arrayItems, resultsSavedSearch[i], '_7', donationID, 7, ARR_STORAGE_TYPES, pickUpDate);
					arrayItems = createItemRecords(item8, arrayItems, resultsSavedSearch[i], '_8', donationID, 8, ARR_STORAGE_TYPES, pickUpDate);
					//control Donor
					var memberDonor_check = getEntity('vendor', donorNumber, donationID, 'Donor Exception');
					var memberEntityId_check = getEntity('customer', memberNumber, donationID, 'Member Exception');

					var memberDonor = getEntity('vendor', donorNumber, donationID, 'Donor Exception');
			        nlapiLogExecution('debug', 'Step 1 ' + memberDonor);
					if(!(isEmpty(memberDonor))) 
					{
						nlapiSubmitField('customrecord_donation_import', donationID, 'custrecord_ns_donor', memberDonor);
						//control Entity
						var memberEntityId = getEntity('customer', memberNumber, donationID, 'Member Exception');
			            //nlapiLogExecution('debug', 'Step 2');
						if(!(isEmpty(memberEntityId))) 
						{
						    nlapiSubmitField('customrecord_donation_import', donationID, 'custrecord_ns_member', memberEntityId);
							//search opportunity
			                nlapiLogExecution('debug', 'Step 3');
							var opportunitiesFound = searchOportunity(memberDonor, memberEntityId, title, pickUpDate,shipmentNbr);
							var foundException = false;
							var foundDuplicate = false;
							
							if (isEmpty(shipmentNbr))
							{
								opportunitiesFound = null;
							}
							
							if(!(isEmpty(opportunitiesFound))) 
							{
								for (var j = 0; j < opportunitiesFound.length && !foundException; j++) 
								{
									var totalPoundsOpp = opportunitiesFound[j].getValue('custcol_total_pounds', null, 'sum');
									var itemsInOpp = opportunitiesFound[j].getValue('item', null, 'count');
									var opportunityID = opportunitiesFound[j].getValue('internalid', null, 'group');
									var opportunityRecord = nlapiLoadRecord('opportunity', opportunityID);
									var itemsInDonation = arrayItems.length;
									var itemsInOpportunity = opportunityRecord.getLineItemCount('item');
									var totalPoundsInDonation = calculateDonationPounds(arrayItems);
									var totalPoundsInOpportunity = calculateOpportunityPounds(opportunityRecord);
									//nlapiLogExecution('debug', 'Step 3-A Items ' + itemsInDonation + ' ' + itemsInOpportunity );
									//nlapiLogExecution('debug', 'Step 3-B Pounds ' + totalPoundsInDonation + ' ' + totalPoundsInOpportunity);
									if(itemsInDonation == itemsInOpportunity && totalPoundsInDonation == totalPoundsInOpportunity)
									{
										exception('Duplicate', donationID);
										foundException = true;
										foundDuplicate = true;
									}
								}
							}
							nlapiLogExecution('debug', 'Step 4');
							if(itemsException)
							{
								foundException = true;
						    }
			                //nlapiLogExecution('debug', 'Step 5' + foundException);
							if(!foundDuplicate)
							{
								var addressRecReturned = lookWarehouse(donationID, memberDonor);
			                    //nlapiLogExecution('debug', 'Step 5 Address ' + addressRecReturned);
								if(addressRecReturned && !foundException && !itemsException)
								{
			                        nlapiLogExecution('debug', 'Step 6 Created Opportunity ' + addressRecReturned);
									createOpportunity(donationID, memberDonor, memberEntityId, arrayItems, addressRecReturned);
						         //   nlapiSubmitField('customrecord_donation_import', donationID, 'custrecord_ns_warehouse', addressRecReturned.getId());
								}
							}
						}
					}
				}
				catch(e)
				{
					nlapiLogExecution('ERROR', 'e line', e);
				}
				yieldScript();
			}
		}
	} 
	catch(error)
	{
		nlapiLogExecution('DEBUG', error);
	}
}

function createItemRecords(itemName, arrayItems, itemInSearch, suffixForField, donationID, itemIndex, ARR_STORAGE_TYPES, itemDate1)
{
	var objItem = {};
	objItem.id = itemInSearch.getId();
	objItem.handCode = itemInSearch.getValue('custrecord_item_handling' + suffixForField);
	objItem.item = itemInSearch.getValue('custrecord_donation_item' + suffixForField);
	objItem.donationUnits = itemInSearch.getValue('custrecord_donation_units' + suffixForField);
	objItem.pounds = itemInSearch.getValue('custrecord_donation_pounds' + suffixForField);
	objItem.itemDesc = itemInSearch.getValue('custrecord_donation_item_description' + suffixForField);
	objItem.itemDate = itemInSearch.getValue('custrecord_item_date' + suffixForField);
	objItem.itemID = searchItemID(objItem.item, donationID, itemIndex);
	//nlapiLogExecution('debug', 'Item Date ' + itemIndex + ' item ' +  objItem.item + ' desc ' + objItem.itemDesc + ' date ' + objItem.itemDate);
	//nlapiLogExecution('debug', 'Item Date ' + itemIndex + ' item ' +  objItem.item + ' pounds ' + objItem.pounds + ' Units ' + objItem.donationUnits);

	if(objItem.item && objItem.item != '')
	{
		    arrayItems.push(objItem);	
			nlapiLogExecution('debug', 'Step 99 Storage' + ARR_STORAGE_TYPES);
			
		    if(objItem.handCode == '' || objItem.handCode == null)
			{	
			  exception('Missing Item Handling Code for #' + itemIndex + ' Exception', donationID, true);
			  itemsException = true;
			}

			nlapiLogExecution('debug', 'Item Date ' + itemIndex + ' date ' +  itemDate1);
		    if ((objItem.itemDate == '' || objItem.itemDate == null) && (itemDate1 == '' || itemDate1 == null) )
			{	
     		  nlapiLogExecution('debug', 'IN ITEM DATE EXCEPTION Item Date ' + objItem.itemDate + ' date ' +  itemDate1);
		      exception('Missing Item Pick Date for #' + itemIndex + ' Exception', donationID, true);
			  itemsException = true;
			}

			objItem.handCode = objItem.handCode.toUpperCase();
            if(objItem.handCode != '' && objItem.handCode != null)
			{	
			  if (!Eval.inArray(objItem.handCode, ARR_STORAGE_TYPES)) 
			  {
			    nlapiLogExecution('debug', 'Step 99-A Storage');
			    exception('Invalid Item Handling Code for #' + itemIndex + ' Exception', donationID, true);
			    itemsException = true;
			  }
            }			  
			
			if (objItem.pounds == '' || objItem.pounds == null)
            {
			  exception('Invalid Item Missing a Pound Value for #' + itemIndex + ' Exception', donationID, true);
			  itemsException = true;
            }				

			if (objItem.donationUnits == '' || objItem.donationUnits == null)
            {
			  exception('Invalid Item Missing a Donation Unit Value for #' + itemIndex + ' Exception', donationID, true);
			  itemsException = true;
            }				

		    nlapiLogExecution('debug', 'Items ' + objItem.pounds + ' units ' +  objItem.donationUnits);
			if (parseFloat(objItem.pounds) == 0 && parseFloat(objItem.donationUnits) > 0)
            {
			  nlapiLogExecution('debug', 'zero pounds');
			  exception('Item Exception: Item Zero Pound for #' + itemIndex + ' Exception', donationID, true);
			  itemsException = true;
            }				

			if (parseFloat(objItem.pounds) < 0 && parseFloat(objItem.donationUnits) > 0)
            {
			  exception('Item Exception: Negative Pounds and Positive Units for #' + itemIndex + ' Exception', donationID, true);
			  itemsException = true;
            }				

			if (parseFloat(objItem.pounds) > 0 && parseFloat(objItem.donationUnits) == 0)
            {
			  nlapiLogExecution('debug', 'zero donations');
			  exception('Item Exception: Item Zero Unit for #' + itemIndex + ' Exception', donationID, true);
			  itemsException = true;
            }				

			if (parseFloat(objItem.pounds) > 0 && parseFloat(objItem.donationUnits) < 0)
            {
			  nlapiLogExecution('debug', 'zero donations');
			  exception('Item Exception: Negative Units and Positive Pounds for #' + itemIndex + ' Exception', donationID, true);
			  itemsException = true;
            }				
			
	}
	else
	{
		//if(objItem.itemDesc || objItem.donationUnits || objItem.pounds || objItem.itemDate)

	    if (objItem.itemDesc) {
			exception('Missing Item #' + itemIndex + ' Exception', donationID, true);
			itemsException = true;
		}

	    if ( isEmpty(objItem.itemDesc) && !isEmpty(objItem.handCode) && !isEmpty(objItem.pounds) && !isEmpty(objItem.donationUnits)) {
			nlapiLogExecution('debug', 'NO ITEM DATA');
			exception('Missing Item #' + itemIndex + ' Exception', donationID, true);
			itemsException = true;
		}

	}
	return arrayItems;
}

function createOpportunity(donationID, donorID, memberID, items, addressRecReturned) 
{
	try
	{
		var context = nlapiGetContext();
		var oppProgram = context.getSetting('SCRIPT', 'custscript_opp_program');
		var oppClass = context.getSetting('SCRIPT', 'custscript_opp_class');
		var oppFund = context.getSetting('SCRIPT', 'custscript_opp_fund');
		var numberBlueDonation = context.getSetting('SCRIPT', 'custscript_blue_donation_order_type');
		var soReceiptedStatus = context.getSetting('SCRIPT', 'custscript_so_status');//	custscript_default_status
		var donationRecord = nlapiLoadRecord(recordType, donationID);
        var defCarrier = context.getSetting('SCRIPT','custscript_carrier_default');
		//var createdDate = donationRecord.getFieldValue('created');
		var shipmentNumber = donationRecord.getFieldValue('custrecord_donation_shipment_no');
		var fullDate = donationRecord.getFieldValue('custrecord_full_date');
       var dateCreated = donationRecord.getFieldValue('custrecord_created_date');
		var pickUpDate = donationRecord.getFieldValue('custrecord_item_date_1');
		var title = donationRecord.getFieldValue('custrecord_donation_title');
		var donationEmail = donationRecord.getFieldValue('custrecord_donation_email');
		var userName = donationRecord.getFieldValue('custrecord_user_name');
		var userID = getEntity('employee', userName, donationID, '');
		var oppRecord = nlapiCreateRecord('opportunity');
		nlapiLogExecution('debug', 'Step thi ' + oppRecord);
		if (fullDate == '' || fullDate == null)
		{
		   var today_d = new Date();
	       fullDate    = nlapiDateToString(today_d);
		   //nlapiLogExecution('debug', 'Full Date ' + fullDate);

	    }
		
		
		oppRecord.setFieldValue('custbody_opportunity_donor', donorID);
		oppRecord.setFieldValue('custbody_donation_reference_number', shipmentNumber);
		oppRecord.setFieldValue('entity', memberID);
		oppRecord.setFieldValue('expectedclosedate', pickUpDate);
		oppRecord.setFieldValue('custbody_receipt_received_date', fullDate);
      //changed for ticket #5395
		oppRecord.setFieldValue('custbody_donationdate', pickUpDate);
      	oppRecord.setFieldValue('trandate', new Date(dateCreated));
		oppRecord.setFieldValue('title', title);
		oppRecord.setFieldValue('custbody_opp_email', donationEmail);
		oppRecord.setFieldValue('custbody_associated_blue_import', donationID);
		//oppRecord.setFieldValue('custbody_offer_date', createdDate);
		if(userID)
		{
			oppRecord.setFieldValue('custbody_createdby', userName);
		}
		oppRecord.setFieldValue('custbody_order_type', numberBlueDonation);

		var recType = addressRecReturned.getRecordType();
		var stWarehouseName = '';
		var stWarehouseAdress = '';
		var stWarehouseAdress2 = '';
		var stWarehouseCity = '';
		var stWarehouseState = '';
		var stWarehouseZip = '';
		var addressID = '';
      nlapiLogExecution('debug', 'Step Thi ' + recType);
		if (recType == 'customrecord_address_contact_association')
		{
			
			addressID = addressRecReturned.getId();
          nlapiLogExecution('debug', 'Step Thi>addressID ' + addressID);
			oppRecord.setFieldValue('custbody_warehouse_id', addressID);
            nlapiSubmitField('customrecord_donation_import', donationID, 'custrecord_ns_warehouse', addressID);
nlapiLogExecution('debug', 'Step Thi>addressID ' + addressID);
			
		}
		else
		{
		
			var addressID = addressRecReturned.getValue('custrecord_fa_address_record');
			oppRecord.setFieldValue('custbody_warehouse_id', addressID);
            nlapiSubmitField('customrecord_donation_import', donationID, 'custrecord_ns_warehouse', addressID);

		
		}		
		//Create lines
		var totalpounds_opp = parseFloat('0');
		for (var i = 0; i < items.length; i++)
		{
			
			//if (parseFloat(items[i].donationUnits) > 0 && parseFloat(items[i].pounds) > 0)
			if (parseFloat(items[i].donationUnits) != 0 && parseFloat(items[i].pounds) != 0)
		    {		
			   oppRecord.selectNewLineItem('item');
			   oppRecord.setCurrentLineItemValue('item', 'item', items[i].itemID);
		  	   oppRecord.setCurrentLineItemValue('item', 'quantity', items[i].donationUnits);
			   oppRecord.setCurrentLineItemValue('item', 'rate', 0);
			   oppRecord.setCurrentLineItemValue('item', 'amount', 0);
			   oppRecord.setCurrentLineItemValue('item', 'description', items[i].itemDesc);
			   oppRecord.setCurrentLineItemValue('item', 'custcol_total_pounds', items[i].pounds);
			   oppRecord.setCurrentLineItemValue('item', 'custcol_total_weight', items[i].pounds);
			   oppRecord.setCurrentLineItemValue('item', 'class', oppClass);
			   oppRecord.setCurrentLineItemValue('item', 'department', oppProgram);
			   oppRecord.setCurrentLineItemValue('item', 'location', oppFund);
              			oppRecord.setCurrentLineItemText('item','custcol_donation_reason','UNKNOWN');
			   totalpounds_opp = parseFloat(totalpounds_opp) + parseFloat(items[i].pounds);
			   if(items[0].itemDate)
			   {
				oppRecord.setCurrentLineItemValue('item', 'custcolcustcol_usebydate', items[0].itemDate);	
			   } else
			   if(items[i].itemDate)
			   {
				oppRecord.setCurrentLineItemValue('item', 'custcolcustcol_usebydate', items[i].itemDate);	
			   }
				   
			   if(addressID)
			   {
				oppRecord.setCurrentLineItemValue('item', 'custcol_pickup_location', addressID);	
			   }
			//oppRecord.setCurrentLineItemValue('item', 'units', i, items[i].donationUnits);
			//oppRecord.setCurrentLineItemValue('item', 'custcol_handing_code', items[i].handCode);
			//oppRecord.setCurrentLineItemValue('item', 'custcol_storage_requirements', items[i].handCode);
			   oppRecord.setCurrentLineItemText('item', 'custcol_storage_requirements', items[i].handCode.toUpperCase());
			   oppRecord.commitLineItem('item');
			}
		}
		try
		{
			oppRecord.setFieldValue('custbody_total_gross_weight_fulfilled', totalpounds_opp);
			oppRecord.setFieldValue('custbody_total_pounds', totalpounds_opp);
			if (parseFloat(totalpounds_opp) == 0)
			{
				nlapiSubmitField(donationRecord.getRecordType(), donationRecord.getId(), 'custrecord_processed', 'T');
                return true;

            }				
			
			var oppID = nlapiSubmitRecord(oppRecord, true, true);
          //added for test
         currentDate = new Date(); // returns the date
         nlapiLogExecution('EMERGENCY', 'After Opp create Date/Time', nlapiDateToString(currentDate,'datetimetz')); 
			if(oppID)
			{
				var newSalesOrder = nlapiTransformRecord('opportunity', oppID, 'salesorder');
 				newSalesOrder.setFieldValue('custbody_order_status', soReceiptedStatus);
				newSalesOrder.setFieldValue('custbody_fa_opportunity', oppID);
				newSalesOrder.setFieldValue('opportunity', oppID);
             
             			//newSalesOrder.setFieldValue('custbody_total_gross_weight_fulfilled',totalpounds_opp);
				try
				{
                     // code 10/10/2016
					var poslines = 0; 
				    for (var l = 1; l <= newSalesOrder.getLineItemCount('item'); l++ ) 
                    {
					  newSalesOrder.setLineItemValue('item', 'custcol_pickup_location', l, addressID );	//custcol_vendor
					  newSalesOrder.setLineItemValue('item', 'custcol_vendor', l, newSalesOrder.getFieldValue('custbody_opportunity_donor') );
                      newSalesOrder.setLineItemValue('item', 'custcol_gross_wt_received',l,newSalesOrder.getFieldValue('quantity') );
					  if (parseFloat(newSalesOrder.getLineItemValue('item', 'quantity', l)) > 0)
					  {
						  poslines++
					  }	  
				    }		 
                  //commented for ticket #5395
//newSalesOrder.setFieldValue('trandate',new Date(dateCreated));
					newSalesOrder.setFieldValue('custbody_release_date', newSalesOrder.getFieldValue('trandate'));
					newSalesOrder.setFieldValue('custbody_order_status', soReceiptedStatus); //soOrderNSStatus
					newSalesOrder.setFieldValue('custbody_pickup_date',  donationRecord.getFieldValue('custrecord_item_date_1')); 
					newSalesOrder.setFieldValue('orderstatus', 'B'); //soOrderNSStatus
                    //added by Thilaga
                  newSalesOrder.setFieldValue('entity',memberID);
                  //newSalesOrder.setFieldValue('custbody_member_name',nlapiLookupField('customer',memberID,'companyname'));
                    newSalesOrder.setFieldValue('custbody_please_wait_no_tms', 'T');
                    newSalesOrder.setFieldText('custbody_donation_reason_code','UNKNOWN');
                    newSalesOrder.setFieldValue('custbody_receipted_by',donationRecord.getFieldValue('custrecord_user_name'));
                    newSalesOrder.setFieldText('custbody_shipping_method_code','Member Arranged');
                    newSalesOrder.setFieldText('custbodycustbody_shipment_method_code','Pickup');
                    newSalesOrder.setFieldValue('custbody_donor_1',donorID);
                    newSalesOrder.setFieldValue('custbody_warehouse_1',addressID);
                    newSalesOrder.setFieldValue('custbody_drop_off_member_1',memberID);
                    newSalesOrder.setFieldValue('custbody_carrier_code',defCarrier);
					newSalesOrder.setFieldValue('custbody_donation_category','1');
                    var filterWH = new Array();
                    filterWH[0]= new nlobjSearchFilter('custrecord_member_association', null, 'is', memberID);
                    filterWH[1]= new nlobjSearchFilter('custrecord_retail_donation_location', null, 'is', 'T');
                  
                    var resultsSavedSearchWH = nlapiSearchRecord('customrecord_address_contact_association', null, filterWH, null);
      		        
		            if(resultsSavedSearchWH && resultsSavedSearchWH.length > 0)
		            {
			             newSalesOrder.setFieldValue('custbody_drop_off_location1',resultsSavedSearchWH[0].getId());
                                                    
                     }

                   /* var filter = new Array();
                    filter[0]= new nlobjSearchFilter('company', null, 'is', memberID);
                  
                    var resultsSavedSearch = nlapiSearchRecord('Contact', 'customsearch_contact_role_search', filter, null);
      		
		            if(resultsSavedSearch && resultsSavedSearch.length > 0)
		            {
			            for(var i = 0; i < resultsSavedSearch.length; i++) 
			            {
                        newSalesOrder.setFieldValue('custbody_member_contact_name',resultsSavedSearch[0].getValue('entityid'));
                          newSalesOrder.setFieldValue('custbody_member_contact_email',resultsSavedSearch[0].getValue('email'));
                          newSalesOrder.setFieldValue('custbody_member_contact_phone_number',resultsSavedSearch[0].getValue('phone'));
                          nlapiLogExecution('debug', 'role',resultsSavedSearch[0].getValue('formulatext'));
                        }
                     }*/

					try {
					     var soID = nlapiSubmitRecord(newSalesOrder, true, true);
                      }
                    catch(e)
                    {
                     nlapiLogExecution('ERROR', 'error', e);
                    }					
					nlapiSubmitField('opportunity', oppID, 'custbody_associated_salesorder', soID);
					nlapiSubmitField(donationRecord.getRecordType(), donationRecord.getId(), 'custrecord_processed', 'T');
                     
                    // Now transform the sales order into a fulfillment					 
					nlapiLogExecution('debug', 'Step 199 Before Total Fullfillment Lines ' + poslines);
					if (poslines > 0)
					{	
					  nlapiLogExecution('debug', 'Step 200 Pre Fulfillment ' + poslines);
	  				  var newFulfillment = nlapiTransformRecord('salesorder', soID, 'itemfulfillment');
					  var ifID = nlapiSubmitRecord(newFulfillment, true, true);
					  nlapiLogExecution('debug', 'Step 201 Post Fulfillment ' + poslines);
                    }

					//var ifID = nlapiSubmitRecord(newFulfillment, true, true);
					var newSalesOrder2 = nlapiLoadRecord('salesorder', soID);
			        nlapiLogExecution('debug', 'Pre CLOSER ' + newSalesOrder2.getFieldValue('status'));
		            for (var l = 1; l <= newSalesOrder2.getLineItemCount('item'); l++ ) 
                    {
                    //added by Thilaga
                      newSalesOrder2.setLineItemValue('item','custcol_member_bank',l,memberID);
                      if(resultsSavedSearchWH && resultsSavedSearchWH.length > 0)
		                {
                           nlapiLogExecution('debug','Inside if' + 'Setting cuscol_drop_off');
			             newSalesOrder2.setLineItemValue('item','custcol_drop_off_location',l,resultsSavedSearchWH[0].getId());
                                                    
                     }
                      newSalesOrder2.setLineItemValue('item','custcol_product_channel',l,'3');
					  newSalesOrder2.setLineItemValue('item', 'isclosed', l, 'T' );	
                     }		 
			        nlapiLogExecution('debug', 'CLOSE SALEES ORDER ' + newSalesOrder2.getFieldValue('status'));
                  //added for bug #5384 by Thilaga
                  newSalesOrder2.setFieldText('custbody_order_status','Receipted');
					var soID2 = nlapiSubmitRecord(newSalesOrder2);
//added for test
         currentDate = new Date(); // returns the date
         nlapiLogExecution('EMERGENCY', 'After SO and ITEM fulfill create Date/Time', nlapiDateToString(currentDate,'datetimetz')); 

				}
				catch(errSO)
				{
					var stErrDetails = 'Error in creating donation sales order: ' + errSO.toString();
            		nlapiSubmitField(donationRecord.getRecordType(), donationRecord.getId(), 'custrecord_donation_exception', stErrDetails);
				}
			}
		}
		catch(errOpp)
		{
			var stErrDetails = 'Error in creating donation opportunity: ' + errOpp.toString();
            nlapiSubmitField(donationRecord.getRecordType(), donationRecord.getId(), 'custrecord_donation_exception', stErrDetails);
		}
		
	} 
	catch(e)
	{
		nlapiLogExecution('ERROR', 'The vendor bill could not be created', e);
	}
}

function lookWarehouse(donationID, memberDonor) 
{
	var addressToReturn = null;
	var donationRecord = nlapiLoadRecord(recordType, donationID);

	//get address fields
	var warehouseCode = donationRecord.getFieldValue('custrecord_donation_warehouse_code');
	var warehouseAddress = donationRecord.getFieldValue('custrecord_warehouse_address');
	var warehouseAddress2 = donationRecord.getFieldValue('custrecord_warehouse_address_2'); 
	var warehouseCity = donationRecord.getFieldValue('custrecord_warehouse_city');
	var warehouseState = donationRecord.getFieldValue('custrecord_warehouse_state');
	var warehouseZip = donationRecord.getFieldValue('custrecord_warehouse_zip');
	var warehouseName = donationRecord.getFieldValue('custrecord_warehouse_name');
	var filters = [];
  nlapiLogExecution('debug', 'Inside lookup warehouse>memberDonor ' + memberDonor);
  nlapiLogExecution('debug', 'Inside lookup warehouse>warehouseAddress ' + warehouseAddress);
  nlapiLogExecution('debug', 'Inside lookup warehouse>warehouseAddress2 ' + warehouseAddress2);
  nlapiLogExecution('debug', 'Inside lookup warehouse>warehouseCity ' + warehouseCity);
  nlapiLogExecution('debug', 'Inside lookup warehouse>warehouseZip ' + warehouseZip);
  nlapiLogExecution('debug', 'Inside lookup warehouse>warehouseName ' + warehouseName);
	if(memberDonor)
	{
		filters.push(new nlobjSearchFilter('custrecord_member_association', null, 'is', memberDonor));	
	}
	if(warehouseCode)
	{
		//filters.push(new nlobjSearchFilter('custrecord_addr_warehouse_code', null, 'is', warehouseCode));	
	}
	if(warehouseAddress)
	{
		filters.push(new nlobjSearchFilter('custrecord_addr_line_1', null, 'is', warehouseAddress));	
	}
	if(warehouseAddress2)
	{
		filters.push(new nlobjSearchFilter('custrecord_address_line_2', null, 'is', warehouseAddress2));	
	}
	if(warehouseCity)
	{
		filters.push(new nlobjSearchFilter('custrecord_address_city', null, 'is', warehouseCity));	
	}
	if(warehouseState)
	{
		/*var states = nlapiSearchRecord('state', null, null, null);
		nlapiLogExecution('debug', 'states', states);
		if(states)
		{
			nlapiLogExecution('debug', 'states', states.length);
		}*/
		//filters.push(new nlobjSearchFilter('custrecord_address_state', null, 'is', warehouseState));	
	}
//Commented for ticket #5014	
  /*if(warehouseZip)
	{
		filters.push(new nlobjSearchFilter('custrecord_zip_code', null, 'is', warehouseZip));	
	}*/
  filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	var results = nlapiSearchRecord('customrecord_address_contact_association', null, filters);
	nlapiLogExecution('debug', 'warehouse results', results);
	if (results && results.length > 0) 
	{
		return results[0];
	} 
	else 
	{
		filters = [];
		var columns = [];
		columns.push(new nlobjSearchColumn('custrecord_fa_address_record'));
		if(memberDonor)
		{
			filters.push(new nlobjSearchFilter('custrecord_address_exception_entity', null, 'is', memberDonor));
		}
		/*if(warehouseCode)
		{
			filters.push(new nlobjSearchFilter('custrecord_warehouse_code', null, 'is', warehouseCode));
		}*/
		//if(warehouseName)
		//{
		//	filters.push(new nlobjSearchFilter('custrecord_warehouse_code', null, 'is', warehouseName));
		//}
		if(warehouseAddress)
		{
			filters.push(new nlobjSearchFilter('custrecord_address_line_1', null, 'is', warehouseAddress));	
		}
		if(warehouseAddress2)
		{
			filters.push(new nlobjSearchFilter('custrecord_exception_address_line_2', null, 'is', warehouseAddress2));	
		}	
      filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		/*if(warehouseCity)
		{
			filters.push(new nlobjSearchFilter('custrecord_city', null, 'is', warehouseCity));	
		}
		if(warehouseState)
		{
			filters.push(new nlobjSearchFilter('custrecord_state', null, 'is', warehouseState));	
		}
		if(warehouseZip)
		{
			filters.push(new nlobjSearchFilter('custrecord_zip', null, 'is', warehouseZip));	
		}*/
		results = nlapiSearchRecord('customrecord_warehouse_address_exception', null, filters, columns);
	     nlapiLogExecution('debug', 'warehouse exception results', results);
		if (results && results.length > 0) 
		{
			return results[0];
		}
		else 
		{
			exception ('Warehouse Exception', donationID);
			return false;
		}
	}
}

function searchItemID(itemName, donationID, itemIndex)
{
	var searchItemID = null;
	if(itemName)
	{
		var context = nlapiGetContext();
		var donationChannel = context.getSetting('SCRIPT', 'custscript_donation_channel');
		var filters = [];
		filters.push(new nlobjSearchFilter('itemid', null, 'is', itemName));
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		filters.push(new nlobjSearchFilter('custitem_product_channel', null, 'is', donationChannel));
      	filters.push(new nlobjSearchFilter('custitem_retail_item', null, 'is', 'T'));
		var itemsFound = nlapiSearchRecord('item', null, filters);
		if(itemsFound)
		{
			searchItemID = itemsFound[0].getId();
		}
		else
		{
			var columns = [];
			columns.push(new nlobjSearchColumn('custrecord_fa_associated_item'));
			filters = [];
			filters.push(new nlobjSearchFilter('custrecord_donation_item_name', null, 'is', itemName));
			itemsFound = nlapiSearchRecord('customrecord_item_exceptions', null, filters, columns);
			if(itemsFound)
			{
				searchItemID = itemsFound[0].getValue('custrecord_fa_associated_item');
              nlapiLogExecution('debug', 'Item found in item mapping ', searchItemID);
			}
			else
			{
				exception('Item # ' + itemIndex + ' Name: ' + itemName + ' not found', donationID, true);
				itemsException = true;
			}
		}
	}
	return searchItemID;
}

function validateItem(donationRecord, itemFieldID, poundsFieldID, itemTotalDonation, poundsTotalDonation)
{
	var itemName = donationBlue.getFieldValue(fieldID);
	if (!(isEmpty(itemName))) 
	{
		itemTotalDonation =+ 1;
		poundsTotalDonation =+  donationBlue.getFieldValue(poundsFieldID);
	}
}

function searchOportunity(donorID, memberID, title, pickUpDate, shipmentNbr) 
{
	var context = nlapiGetContext();
	var opportunitySearch = context.getSetting('SCRIPT', 'custscript_opp_search');
	var filtersOpp = [];
	if (!(isEmpty(donorID))) 
	{
		filtersOpp.push(new nlobjSearchFilter('custbody_opportunity_donor', null, 'is', donorID));
	}
	if (!(isEmpty(memberID))) 
	{
		filtersOpp.push(new nlobjSearchFilter('entity', null, 'is', memberID));
	}
	if (!(isEmpty(title))) 
	{
		filtersOpp.push(new nlobjSearchFilter('title', null, 'is', title));
	}
	if (!(isEmpty(pickUpDate))) 
	{
		filtersOpp.push(new nlobjSearchFilter('expectedclosedate', null, 'on', pickUpDate));
    }
	if (!(isEmpty(shipmentNbr))) 
	{
		filtersOpp.push(new nlobjSearchFilter('custbody_donation_reference_number', null, 'is', shipmentNbr));
    }
    var opportunitiesFound = nlapiSearchRecord('transaction', opportunitySearch, filtersOpp);
	return opportunitiesFound;
}

function getEntity(recordType, donor, donationID, exceptionText) 
{
	var columns = [];
	columns.push(new nlobjSearchColumn('entityid'));	
	columns.push(new nlobjSearchColumn('custentity_blocked'));	
	columns.push(new nlobjSearchColumn('custentity_odyssey_number'));	
	var filtersDonorNo = [];
	filtersDonorNo.push(new nlobjSearchFilter('custentity_blocked', null, 'is', 'F'));
	filtersDonorNo.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
	if(donor)
	{
		filtersDonorNo.push(new nlobjSearchFilter('entityid', null, 'is', donor));
		var results = nlapiSearchRecord(recordType, null, filtersDonorNo, columns);
		var memberID = null;
		
		//If no results - search based on oddyseey id
		if (isEmpty(results))
		{
		   nlapiLogExecution('debug', 'getentity 2 donor ', donor);
           var vr2filtersDonorNo = [];
	       vr2filtersDonorNo.push(new nlobjSearchFilter('custentity_blocked', null, 'is', 'F'));
	       vr2filtersDonorNo.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		   vr2filtersDonorNo.push(new nlobjSearchFilter('custentity_odyssey_number', null, 'is', donor));
		   var results = nlapiSearchRecord(recordType, null, vr2filtersDonorNo, columns);
		}
		
		if (results && results.length > 0) 
		{
			var entityIDMatch = false;
			for (var i = 0; i < results.length && !entityIDMatch; i++) 
			{
				var entityID  = results[i].getValue('entityid');
				var odysseyID = results[i].getValue('custentity_odyssey_number');
				var blocked = 'F';
		        nlapiLogExecution('debug', 'getentity 2 entity ', entityID + ' type ' + recordType );
				if(recordType == 'customer' || recordType == 'vendor')
				{
					blocked = results[i].getValue('custentity_blocked');
				}
				if((entityID == donor || odysseyID == donor) && blocked != 'T')
				{
					memberID = results[i].getId();
					entityIDMatch = true;
		            nlapiLogExecution('debug', 'member match ');
				}
			}
			if(!entityIDMatch)
			{
		        exceptionText = exceptionText + ' - Blocked';
				exception(exceptionText, donationID);
			}
		} 
		else 
		{
		    if (!isEmpty(exceptionText))
            {				
			  exceptionText = exceptionText + ' - Unknown';
			  exception(exceptionText, donationID);
            }  
		}	
	}
	else
	{
		exceptionText = exceptionText;
		exception(exceptionText, donationID);
	}
	return memberID;
}

function calculateDonationPounds(donationItems)
{
	var totalPounds = 0;
	for (var i = 0; i < donationItems.length; i++) 
	{
		totalPounds += parseFloat(donationItems[i].pounds);
	}
	return totalPounds;
}

function calculateOpportunityPounds(opportunityRecord)
{
	var totalPounds = 0;
	var oppItems = opportunityRecord.getLineItemCount('item');
	for (var i = 1; i <= oppItems; i++) 
	{
		var linePounds = opportunityRecord.getLineItemValue('item', 'custcol_total_pounds', i);
		if(linePounds)
		{
			totalPounds += parseFloat(linePounds);	
		}
	}
	return totalPounds;	
}

function exception(errorMessage, donationID, isItem) 
{
	
		var currentErrorMessage = nlapiLookupField(recordType, donationID, 'custrecord_donation_exception');
		if(currentErrorMessage && currentErrorMessage != '')
		{
			currentErrorMessage += ', ' + errorMessage;
			nlapiSubmitField(recordType, donationID, 'custrecord_donation_exception', currentErrorMessage);
		}
		else
		{
			var result = nlapiSubmitField(recordType, donationID, 'custrecord_donation_exception', errorMessage);
		}
}

function isEmpty(stValue)
{
   if ((stValue == '') || (stValue == null) || (stValue == undefined) || (stValue == false))
   {
		return true;
   }
   return false;
}

function yieldScript()
{
	var context = nlapiGetContext();
	var intRemainingUsage = context.getRemainingUsage();
	if (intRemainingUsage < 500)
	{
		nlapiYieldScript();
	}
}

// ------------------------------------------------- UTILITY FUNCTIONS -------------------------------------------------
var Eval =
{
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
        if ((stValue == '') || (stValue == null) || (stValue == undefined)) {
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

        var bIsValueFound = false;

        for (var i = 0; i < arr.length; i++) {
            if (stValue == arr[i]) {
                bIsValueFound = true;
                break;
            }
        }

        return bIsValueFound;
    },
};

var Parse =
{
    /**
	 * Converts String to Float
	 * 
	 * @author asinsin
	 */
    forceFloat: function (stValue) {
        var flValue = parseFloat(stValue);

        if (isNaN(flValue)) {
            return 0.00;
        }

        return flValue;
    },

    forceNegative: function (stVal) {
        return this.forceFloat(stVal) * (-1);
    }
};

