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
* @author Pedro Barrios
* @version 1.0
* @event/Type: User Before Submit on VB
*/
function setIssuesWhenMasterBillDeleted(mode)
{
	try
	{
		nlapiLogExecution('DEBUG', '***START*** ');
		nlapiLogExecution('debug', 'Mode : ' + mode);
		var oldBill = nlapiGetOldRecord();
		if(mode == 'delete')
		{
			var sonID = oldBill.getFieldValue('custbody_associated_transaction');
			nlapiLogExecution('debug', 'sonID : ' + sonID);
			if(!isEmpty(sonID)){
				nlapiLogExecution('debug', 'has son with ID : ' + sonID);
				//DELETED BILL IS MASTER, UPDATE SON WITH ISSUES
				var sonBill = nlapiLoadRecord('vendorbill', sonID);
				if(!isEmpty(sonBill))
				{
					nlapiLogExecution('debug', 'setting son issues');
					sonBill.setFieldValue('custbody_order_has_issues', 'T');
					var reason = nlapiGetContext().getSetting('SCRIPT', 'custscript_transportation_issues');
				    var hasIssues = new Array;
	                hasIssues     = sonBill.getFieldValues('custbody_order_has_issues_reason');
					nlapiLogExecution('debug', 'setting son issues 1' + hasIssues);
                    if (isEmpty(hasIssues))
		            {
					 nlapiLogExecution('debug', 'Null issues 1' + hasIssues);
		             hasIssues = reason;
    	            } else
                    {				   
					 nlapiLogExecution('debug', 'Value issues 1' + hasIssues);
		             hasIssues = hasIssues.concat(reason);
                    }				 

					nlapiLogExecution('debug', 'setting son issues 2' + hasIssues);
					sonBill.setFieldValue ('custbody_order_has_issues_reason', reason);
					sonBill.setFieldValue ('custbody_order_issues', 'Master Bill Was Deleted');
					nlapiSubmitRecord(sonBill,false);
					nlapiLogExecution('debug', 'sonBill Issues Set (ID : ' + sonID);
				}
			}
	 	}
	}catch(error)
	{
		nlapiLogExecution('ERROR', 'Error', error);
	}
	nlapiLogExecution('DEBUG', '***END***');
} 
function isEmpty(stValue) {   
 if ((stValue == '') || (stValue == null) || (typeof stValue == "undefined"))  
   {        return true;   
   }    
   return false; 
}