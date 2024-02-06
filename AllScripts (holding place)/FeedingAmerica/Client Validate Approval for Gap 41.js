

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
* @event/Type: Client Before Submit on VB
*/
function validateFeeVendorBillApproval(){
	try
	{
		nlapiLogExecution('DEBUG', '***START*** ');
		nlapiLogExecution('DEBUG', 'Step 0 ');
		var approvalStatus = nlapiGetFieldValue('approvalstatus');
		nlapiLogExecution('debug','approval Status : ' + approvalStatus);
		if(approvalStatus == 2){
			var fatherID = nlapiGetFieldValue('custbody_father_bill');			
			if(!isEmpty(fatherID))
			{
				var father = nlapiLoadRecord('vendorbill', fatherID);
				if(isEmpty(father) || father.getFieldValue('approvalstatus')!= 2)
				{
					nlapiLogExecution('debug', 'WARNING !!!!');
					if(isEmpty(father)){
						alert('WARNING: Current Bill was not approved (Master Vendor Bill is not approved yet).');
						return false;
					}else{
						alert('WARNING: Current Bill was not approved (Master Vendor Bill was deleted so it can not be approved).');
						return false;						
					}
					return false;
				}
			}
		}

	}catch(error){
		nlapiLogExecution('ERROR', 'Error', error);
	}
	nlapiLogExecution('DEBUG', '***END***');
	return true;
} 

function isEmpty(stValue) {   
 if ((stValue == '') || (stValue == null) || (typeof stValue == "undefined"))  
   {        return true;   
   }    
   return false; 
}