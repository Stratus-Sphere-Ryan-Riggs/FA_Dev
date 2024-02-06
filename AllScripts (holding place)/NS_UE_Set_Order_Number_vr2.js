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
*  Purpose:  Set the Order Prefix
*/
function aftersubmit_setordernumber(stType)
{

    nlapiLogExecution('DEBUG','beforesubmit_setauction','|------------SCRIPT STARTED------------||');
    if(stType!='create')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        return;
    }
	
    var recTrans    = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());
	var ordernumber = recTrans.getFieldValue('tranid');
	var ordertype   = recTrans.getFieldText('custbody_order_type');
	
	if (ordertype == 'Produce')
	{ 	
			ordernumber     = ordernumber.replace("SO","PR");
	}		

	if (ordertype == 'Grocery') 
	{ 	
			ordernumber     = ordernumber.replace("SO","GR");
	}		

	if (ordertype == 'Donation - Yellow') 
	{ 	
			ordernumber     = ordernumber.replace("SO","DO");
	}		

	if (ordertype == 'Donation - Maroon') 
	{ 	
			ordernumber     = ordernumber.replace("SO","ML");
	}		

	if (ordertype == 'Donation - Blue') 
	{ 	
			ordernumber     = ordernumber.replace("SO","DO");
	}		

	var id = recTrans.setFieldValue('tranid',ordernumber)
    nlapiLogExecution('DEBUG','Tran ID ' + ordernumber);
	var id = nlapiSubmitRecord(recTrans, true);
	
	
    return true;
  
	
}
