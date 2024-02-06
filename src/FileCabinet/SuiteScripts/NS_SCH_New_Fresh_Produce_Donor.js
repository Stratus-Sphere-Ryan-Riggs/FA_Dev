nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
* Copyright (c) 2016 NetSuite, Inc.
* 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
* All Rights Reserved.
* 
* This software is the confidential and proprietary information of
* NetSuite, Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with NetSuite.
* 
* @version 1.0
*  Purpose:  Upon setting vendor as a Fresh Produce Donor, this script is triggered by the user event to add the donor to the donor list for each produce item.
*/

function schAddNewFreshProduceDonor() {

             
              var vendorid = nlapiGetContext().getSetting('SCRIPT', 'custscript_vendor_id');
              var loadvendorrecord = nlapiLoadRecord('vendor', vendorid);
              var freshproducedonor = loadvendorrecord.getFieldValue('custentity_freshproducedonor');
              var produceitemList = nlapiGetContext().getSetting('SCRIPT', 'custscript_produce_item_search');
              var proList = nlapiSearchRecord('noninventoryitem', produceitemList);
              nlapiLogExecution('DEBUG','SCRIPT STARTED','vendorid= ' + vendorid);
  
    		if (freshproducedonor == 'T') {
                nlapiLogExecution('DEBUG','freshproducedonor','freshproducedonor= ' + freshproducedonor);
    			for (var i = 0; produceitemList != null && i < proList.length; i++) {
                    var produceitemID = proList[i].getId();
                    nlapiLogExecution('DEBUG','produceitemID','produceitemID= ' + produceitemID);

    		   				if (produceitemID) {
                                var ItemRecord = nlapiLoadRecord('noninventoryitem', produceitemID);
    		   					}
    		   				if (ItemRecord) {
                                var isDuplicate = ItemRecord.findLineItemValue('itemvendor', 'vendor', vendorid);
    		   					}
									if (isDuplicate == -1) {
										ItemRecord.selectNewLineItem('itemvendor');
										ItemRecord.setCurrentLineItemValue('itemvendor', 'vendor', vendorid);
                                        if(produceitemID == '4148'){
										ItemRecord.setCurrentLineItemValue('itemvendor', 'vendorcode', 'Freight');
                                        }
										ItemRecord.setCurrentLineItemValue('itemvendor', 'purchaseprice', 0.00);

										// commit the line to the database
										ItemRecord.commitLineItem('itemvendor');
                                        nlapiSubmitRecord(ItemRecord);
                                        nlapiLogExecution('DEBUG','New donor added','New donor' + vendorid + ' added to' + produceitemID);
                              			}
									}
                				}
                			}



