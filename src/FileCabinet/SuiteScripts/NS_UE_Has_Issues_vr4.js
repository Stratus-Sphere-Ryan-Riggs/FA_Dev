nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
 * 
 *//**
* Copyright (c) 2016 NetSuite, Inc.
* 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
* All Rights Reserved.
* 
* This software is the confidential and proprietary information of
* NetSuite, Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with NetSuite.
* This after submit script set the external id of the item on create.
* 
* @version 1.0
*  Purpose:  Manage the Has Issue Setting.  Ensure the following
*            - When HAs issue is set cascase to all associated transactions - including the has issue reason
*            - When the has issue is unset - cascade to all associated transactions
*
* 02/01/2017 - Added Invoice to the transaction list
* 03/14/2017 - Updated the has issue reason update/array
* 06/04/2018 - Added new function to create/add PO number for each Pick Up under Multi Pick/Drop, which is the same as the PO# attached to the vendor under the item list.
*/
function beforesubmit_checkhasissues(stType)
{

    if(stType!='edit' && stType!='xedit')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        return;
    }
	
    var recType     = nlapiGetRecordType();
    nlapiLogExecution('DEBUG','Transaction Type ',' Type= ' + recType);
    var oldRecord = nlapiGetOldRecord();
	
	var updateHasIssues = false;
	
	if ((oldRecord.getFieldValue('custbody_order_has_issues')         != nlapiGetFieldValue('custbody_order_has_issues'))        ||
	    (oldRecord.getFieldValues('custbody_order_has_issues_reason') != nlapiGetFieldValues('custbody_order_has_issues_reason')) ||
	    (oldRecord.getFieldValue('custbody_has_issues_comments')      != nlapiGetFieldValue('custbody_has_issues_comments')))
	{
		  updateHasIssues = true;
		  var newIssueTag       = nlapiGetFieldValue('custbody_order_has_issues');
  		  var newIssueReason    = new Array;
		  newIssueReason    = nlapiGetFieldValues('custbody_order_has_issues_reason');
		  var newIssueComment   = nlapiGetFieldValue('custbody_has_issues_comments');
	}
	
	
	if (updateHasIssues)
	{
  	  
	  var icFilters = new Array();
	  var soId = nlapiGetFieldValue('custbody_associated_salesorder');
	  if (soId == '' || soId == null)
      {
 	   var soId =  nlapiGetRecordId();
      }		

	  // First update the master sales order 
      if (nlapiGetFieldValue('custbody_associated_salesorder') != '' && nlapiGetFieldValue('custbody_associated_salesorder') != null)
      {		
        nlapiSubmitField('salesorder', nlapiGetFieldValue('custbody_associated_salesorder'), ['custbody_order_has_issues', 'custbody_has_issues_comments', 'custbody_order_has_issues_reason'], [newIssueTag, newIssueComment, newIssueReason ] );	   
      }
	  
	  // Now Update all associated PO's and Vendor Bills 
      icFilters.push(new nlobjSearchFilter('custbody_associated_salesorder', null, 'is' , soId));
        var icSearchResults = nlapiSearchRecord('transaction', 'customsearch_has_issue_search', icFilters);
      if (icSearchResults != null && icSearchResults.length != 0) 
      {
            nlapiLogExecution('DEBUG','In find all' + icSearchResults.length);
        	for (var i = 0; i < icSearchResults.length; i++)
        	{
			   var tranId   = icSearchResults[i].getId();
			   var tranType = icSearchResults[i].getValue('type');
               nlapiLogExecution('DEBUG','Type ' + tranType + ' id ' + tranId);
			   
			   if (tranId != nlapiGetRecordId())
			   {	   
			      if (tranType == 'PurchOrd')
			      {
	               nlapiSubmitField('purchaseorder', tranId, ['custbody_order_has_issues', 'custbody_has_issues_comments', 'custbody_order_has_issues_reason'], [newIssueTag, newIssueComment, newIssueReason]);	   
			      }

			      if (tranType == 'VendBill') // CustInvc
			      {
	               nlapiSubmitField('vendorbill', tranId, ['custbody_order_has_issues', 'custbody_has_issues_comments', 'custbody_order_has_issues_reason'], [newIssueTag, newIssueComment, newIssueReason]);	   
			      }

			      if (tranType == 'CustInvc')
			      {
	               nlapiSubmitField('invoice', tranId, ['custbody_order_has_issues', 'custbody_has_issues_comments', 'custbody_order_has_issues_reason'], [newIssueTag, newIssueComment, newIssueReason]);	   
			      }
			   }	  
           		
            }
  	   } 
		
    }
	

    return true;
  
	
}

function aftersubmit_addreleasenumber(stType)
{
  
  var CONTEXT = nlapiGetContext();
  var scriptContext = nlapiGetContext().getExecutionContext();
  var transType = nlapiGetRecordType();
  var orderID = nlapiGetRecordId();
  var orderType = nlapiLookupField('salesorder',orderID,'custbody_order_type');
  var orderStatus = nlapiLookupField('salesorder',orderID,'status');
  nlapiLogExecution('DEBUG', 'Script Started', scriptContext + ' ' + stType + ' ' + transType + ' ' + orderType + ' ' + orderStatus);
      if(stType!='approve')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        return;
    }
      
  else {
	  
    if (orderType == '1' && transType == 'salesorder' && orderStatus == 'pendingFulfillment') {
      
    	nlapiLogExecution('DEBUG', 'Script Started', scriptContext + ' ' + stType + ' ' + transType + ' ' + orderType + ' ' + orderStatus);
    	var groceryRecord = nlapiLoadRecord('salesorder',orderID);
    	nlapiLogExecution('DEBUG', 'orderID', 'orderID= ' + ' ' + orderID);
    	if (groceryRecord) {
			var soRelNo1 = groceryRecord.getFieldValue('custbody_release_no_donor1');
            var soRelNo2 = groceryRecord.getFieldValue('custbody_release_no_donor2');
            var soRelNo3 = groceryRecord.getFieldValue('custbody_release_no_donor3');
    		var vendorID1 = groceryRecord.getFieldValue('custbody_donor_1');
    		var vendorID2 = groceryRecord.getFieldValue('custbody_donor_2');
    		var vendorID3 = groceryRecord.getFieldValue('custbody_donor_3');
            var tranID = groceryRecord.getFieldValue('tranid');
            nlapiLogExecution('DEBUG', 'tranID', 'tranID= ' + tranID);

      		var filter = new Array();
      	    filter[0] = new nlobjSearchFilter('tranid','createdfrom','contains',tranID);
            filter[1] = new nlobjSearchFilter('mainline','null','is','T');
      		var column = new Array();
            column[0]= new nlobjSearchColumn('createdfrom');
      		var results = nlapiSearchRecord('purchaseorder',null,filter,column);
     		if(results!=null){
      	for (var i = 0; i < results.length; i++ )
               {

            var POid = results[i].getId();
            var POSOid = results[i].getValue('createdfrom');
              if (POSOid == orderID) {
                
              if (POid) {
                var POrecord = nlapiLoadRecord('purchaseorder',POid);
              }


    		if (vendorID1 != null && POid != null) {
    			var POVendorID1 = POrecord.getFieldValue('entity');
    				if (POVendorID1 == vendorID1 && soRelNo1 == null) {
    					var releaseNo1 = POrecord.getFieldValue('tranid');
    						if (releaseNo1) {
    							var setReleaseNo1 = nlapiSubmitField('salesorder',orderID,'custbody_release_no_donor1',releaseNo1);
                              	nlapiLogExecution('DEBUG', 'setReleaseNo1', 'setReleaseNo1= ' + ' ' + setReleaseNo1 + ' ' + releaseNo1 + ' ' + POid + ' ' + POSOid);
    						}
    				}
    		}
            if (vendorID2 != null && POid != null) {
    			var POVendorID2 = POrecord.getFieldValue('entity');
    				if (POVendorID2 == vendorID2 && soRelNo2 == null) {
    					var releaseNo2 = POrecord.getFieldValue('tranid');
    						if (releaseNo2) {
    							var setReleaseNo2 = nlapiSubmitField('salesorder',orderID,'custbody_release_no_donor2',releaseNo2);
                              	nlapiLogExecution('DEBUG', 'setReleaseNo2', 'setReleaseNo2= ' + ' ' + setReleaseNo2 + ' ' + releaseNo2 + ' ' + POid + ' ' + POSOid);
    						}
    				}
    		}
            if (vendorID3 != null && POid != null) {
    			var POVendorID3 = POrecord.getFieldValue('entity');
    				if (POVendorID3 == vendorID3 && soRelNo3 == null) {
    					var releaseNo3 = POrecord.getFieldValue('tranid');
    						if (releaseNo3) {
    							var setReleaseNo3 = nlapiSubmitField('salesorder',orderID,'custbody_release_no_donor3',releaseNo3);
                              	nlapiLogExecution('DEBUG', 'setReleaseNo3', 'setReleaseNo3= ' + ' ' + setReleaseNo3 + ' ' + releaseNo3 + ' ' + POid + ' ' + POSOid);
    						}
    				}
    		 }
}
}
}
}
}
}
  return true;
}