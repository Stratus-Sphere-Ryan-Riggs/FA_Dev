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
*  Purpose:  if the customer is created from a vendor - set the customers status to Closed 
*  09/29/2016:  When the Customers Status is 'Suspended' if there is an associated donor - inactivate
*/
function beforesubmit_setcustomerstatus(stType)
{

    nlapiLogExecution('DEBUG','beforesubmit_setcustomerstatusauction','|------------SCRIPT STARTED------------||');
    if(stType!='create' && stType!='edit')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        return;
    }
	
    var entitystatus = nlapiGetFieldValue('entitystatus');
	
	if (entitystatus == 6 || entitystatus == 7)
	{ 	
		entitystatus = 	nlapiSetFieldValue('entitystatus',13);
	}		
	
	 var associatedDonor  = nlapiGetFieldValue('custentity_associated_donor');
	 if (associatedDonor != '' && associatedDonor != null)
     {		 
	   nlapiSubmitField('vendor', associatedDonor, 'isinactive', nlapiGetFieldValue('isinactive'));
	 } 
	
    return true;
  
	
}
