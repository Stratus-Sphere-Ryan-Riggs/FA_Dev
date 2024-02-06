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
* This after submit script set the external id of the item on create.
* 
* @version 1.0
*  Purpose:  Upon Unsetting the TMS Hold - The first time set the auction time
*  03/22/2017:  If the Vendor Credit is created from a sales order - Set the vendor, status and item sublist
*  03/27/2017:  Do not set Vendor and set AP Account
*  04/05/2017:  Change from using the item to an expense account
*/
function beforeLoad(stType)
{

    var transType = nlapiGetRecordType();
	var scriptcontext = nlapiGetContext().getExecutionContext();
	
    nlapiLogExecution('DEBUG','beforeload_calculate','|------------SCRIPT STARTED------------||'  + scriptcontext + ' ' + stType);	
    nlapiLogExecution('DEBUG','beforeload_calculate','|------------SCRIPT STARTED------------||'  + nlapiGetFieldValue('custbody_associated_salesorder'));	
    if (stType != 'create')
	{
		return true;
	}
    var transportAcct      = nlapiGetContext().getSetting('SCRIPT', 'custscript_expense_account');
    var apAccount           = nlapiGetContext().getSetting('SCRIPT', 'custscript_vc_account');
	var createdFrom = nlapiGetFieldValue('custbody_associated_salesorder');
  
	if (createdFrom != '' && createdFrom != null)
	{
      var transportAmt     = parseFloat(nlapiLookupField('salesorder', createdFrom, 'custbodycustbody_addlfreightcostvendor'));
      if(transportAmt>0){
	 		 var vendor           = nlapiLookupField('salesorder', createdFrom, 'custbody_transporation_vendor');
			 // var transportAmt     = parseFloat(nlapiLookupField('salesorder', createdFrom, 'custbodycustbody_addlfreightcostvendor'));
     		 nlapiSetFieldValue('account',apAccount);
      		//nlapiSetFieldValue('custbody_finance_vendor',vendor);
     		 //nlapiSetFieldValue('entity',vendor);
      		nlapiSelectNewLineItem('expense');
      		nlapiSetCurrentLineItemValue('expense','account',transportAcct); 
      		//nlapiSetCurrentLineItemValue('item','quantity','1'); 
      		nlapiSetCurrentLineItemValue('expense','location',  nlapiLookupField('salesorder', createdFrom, 'location')); 
      		nlapiSetCurrentLineItemValue('expense','class',     nlapiLookupField('salesorder', createdFrom, 'class')); 
     		 //nlapiSetCurrentLineItemValue('item','rate',transportAmt); 
	  		nlapiSetCurrentLineItemValue('expense','amount',nlapiFormatCurrency(transportAmt));
	  		nlapiSetCurrentLineItemValue('expense','description', 'Transporation Credit');
      		nlapiSetCurrentLineItemValue('expense','department',nlapiLookupField('salesorder', createdFrom, 'department')); 
      		nlapiSetCurrentLineItemValue('expense','custcol_cseg_projects_cseg',nlapiLookupField('salesorder', createdFrom, 'custbody_project_cseg')); 
      		nlapiCommitLineItem('expense');
      }

	}
	
    return true;  
}


function beforeSubmit(stType)
{
    if (stType != 'create' && stType != 'edit')
	{
		return true;
	}

	nlapiSetFieldValue('tranid',nlapiGetFieldValue('transactionnumber'));
			
	return true
}

//added for ticket #6585 by Thilaga
function afterSubmit(stType)
{
    
   var recType = nlapiGetRecordType();
        var recId = nlapiGetRecordId();
        var myBill = nlapiLoadRecord(recType, recId);
  if(myBill.getFieldValue('tranid')==null || myBill.getFieldValue('tranid')==''){
	myBill.setFieldValue('tranid',myBill.getFieldValue('transactionnumber'));
			nlapiSubmitRecord(myBill);
  }
	
}

function isEmpty(stValue) {   
 if ((stValue == '') || (stValue == null) || (typeof stValue == "undefined"))  
   {        return true;   
   }    
   return false; 
}