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
* This after submit script set the external id of the item on create.
* 
* @version 1.0
*  Purpose:  Manage the Has Issue Setting.  Ensure the following
*            - When HAs issue is set cascase to all associated transactions - including the has issue reason
*            - When the has issue is unset - cascade to all associated transactions
*
* 02/01/2017 - Added Invoice to the transaction list
* 03/14/2017 - Updated the has issue reason update/array
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
