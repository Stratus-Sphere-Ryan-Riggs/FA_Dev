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
*  Purpose:  When a PO Is Created perform a few checks
*  Check if Admin Fee total, Receipient and Individual pounds are set - if not exit
*     - If so check if the items on the PO are subject to admin fee - if not clear the ADMIN Fields
*     - If one is checked keep the values
*     - If more than one is checked - set the has issues and multiple admin fees
*
*/
function beforesubmit_setValue(stType){
   nlapiLogExecution('DEBUG','beforesubmit_checkadmin','|------------SCRIPT STARTED------------||'+stType);
}
function aftersubmit_checkadmin(stType)
{

    nlapiLogExecution('DEBUG','beforeload_checkadmin','|------------SCRIPT STARTED------------||'+stType);
	var receipt_status = nlapiGetContext().getSetting('SCRIPT', 'custscript_admin_fee_reason');
    if(stType!='dropship')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        return true;
    }
	
	var recTrans   = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId()); 
    var recId      = nlapiGetRecordId();
  nlapiLogExecution('DEBUG','beforeload_checkadmin','|------------SCRIPT STARTED------------||'+stType+' '+recTrans.getFieldValue('tranid'));
	
    var createdfrom         = recTrans.getFieldValue('createdfrom');
    if(createdfrom == '' || createdfrom == null)
    {
        nlapiLogExecution('DEBUG','Script Exit: Created From ');
        return true;
    }

    // set has issues reason
    //var hasissues = new Array();
	//hasissues = nlapiLookupField('salesorder', createdfrom, 'custbody_order_has_issues_reason', false);
    //nlapiLogExecution('DEBUG','Script Exit: Issues ','stType= ' + createdfrom + ' ' + hasissues);
     nlapiSubmitField('purchaseorder', recId, 'custbody_po_status', '2', false);
 
  var arrParam = [];
	        arrParam['custscript_transtype']           = 'purchaseorder';
            arrParam['custscript_transintid']    = recId;
        	arrParam['custscript_transid'] = recTrans.getFieldValue('tranid');
  			arrParam['custscript_trans_status']='2';
    		
        
	        var status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger',arrParam);
	nlapiLogExecution('DEBUG','status','status= ' + status);
  if (status == 'INPROGRESS')
	{
		status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger_2',arrParam);
        nlapiLogExecution('DEBUG','Scheduled Script Called 2','Scheduled Script Queue Status= ' + status);
    }
   if (status == 'INPROGRESS')
	{
		status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger_3',arrParam);
        nlapiLogExecution('DEBUG','Scheduled Script Called 3','Scheduled Script Queue Status= ' + status);
    }	
    if (status == 'INPROGRESS')
	{
		status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger_4',arrParam);
        nlapiLogExecution('DEBUG','Scheduled Script Called 4','Scheduled Script Queue Status= ' + status);
    }		
    if (status == 'INPROGRESS')
	{
		status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger_5',arrParam);
        nlapiLogExecution('DEBUG','Scheduled Script Called 5','Scheduled Script Queue Status= ' + status);
    }
    if ( isEmpty('custbodycustbody_admin_fee_recipient') && isEmpty('custbody_admin_fee_recp_2') && isEmpty('custbody_admin_fee_recp_3'))
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: No Admin Fee','stType= ' + stType);
        return true;
    }
		
	var foundIndex = recTrans.findLineItemValue('item', 'custcol_admin_fee_vendor', '1');
	
	if (foundIndex == -1)
	{
		nlapiSubmitField('purchaseorder', recId, ['custbodycustbody_admin_fee_recipient','custbody_admin_fees','custbody_admin_fee_per_pound_rate','custbody_admin_fee_for_rec1'], [null,nlapiFormatCurrency(0),nlapiFormatCurrency(0),nlapiFormatCurrency(0)], false);
    }		
	
	var foundIndex = recTrans.findLineItemValue('item', 'custcol_admin_fee_vendor', '2');
	if (foundIndex == -1)
	{
		nlapiSubmitField('purchaseorder', recId, ['custbody_admin_fee_recp_2','custbody_admin_fee_per_lb_rate_2','custbody_admin_fee_for_rec2'], [null,nlapiFormatCurrency(0),nlapiFormatCurrency(0)], false);
    }		
    		
	var foundIndex = recTrans.findLineItemValue('item', 'custcol_admin_fee_vendor', '3');
	if (foundIndex == -1)
	{
		nlapiSubmitField('purchaseorder', recId, ['custbody_admin_fee_recp_3','custbody_admin_fee_per_lb_rate_3','custbody_admin_fee_for_rec3'], [null,nlapiFormatCurrency(0),nlapiFormatCurrency(0)], false);
    }		
	nlapiLogExecution('DEBUG','Script Exit: IN Processing','found Index' + foundIndex);
    return true;
  
	
}
function forceParseFloat(stValue)
{
     var flValue = parseFloat(stValue);
   
     if (isNaN(flValue) || (Infinity == stValue))
     {
         return 0.00;
     }
   
     return flValue;
}

function isEmpty(stValue) {   
	if ((stValue == '') || (stValue == null) || (typeof stValue == "undefined"))  
	{        
		return true;   
	}
	return false; 
}
