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
*  Purpose:  Set the free form company/member name whenever a contact is created custentity_member_name  company companyname
*/
function beforesubmit_setcompanyname(stType)
{

    nlapiLogExecution('DEBUG','beforesubmit_setcustomerstatusauction','|------------SCRIPT STARTED------------||');
    if(stType!='create' && stType!='edit')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        return;
    }
	
    var companyName = nlapiGetFieldValue('company');
	
	if (companyName != ''&& companyName != null)
	{ 	
		var companyType = nlapiLookupField('entity', companyName, 'type');
		if (companyType == 'Vendor')
		{
			var companyName = nlapiLookupField('vendor', companyName, 'companyname');
		}	
		if (companyType == 'CustJob')
		{
			var companyName = nlapiLookupField('customer', companyName, 'companyname');
		}	
        nlapiLogExecution('DEBUG','Script Exit: Company Name','stType= ' + companyName);
		nlapiSetFieldValue('custentity_member_name',companyName);
	}		
	
    return true;
  
	
}
