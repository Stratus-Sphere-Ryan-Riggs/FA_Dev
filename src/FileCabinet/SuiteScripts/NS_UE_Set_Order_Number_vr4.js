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
*  Purpose:  Set the Order Prefix
*/
function aftersubmit_setordernumber(stType)
{

    nlapiLogExecution('DEBUG','beforesubmit_setauction','|------------SCRIPT STARTED------------||');
    if(stType!='create' && stType!='edit')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        return;
    }
	
    var recTrans    = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());
  var ordertype   = recTrans.getFieldText('custbody_order_type').trim();
  var odysseyOfferDate= nlapiGetFieldValue('custbody_odyssey_offer_date');
    nlapiLogExecution('DEBUG','Inside Order Type=' + ordertype+" odysseyOfferDate="+odysseyOfferDate+" ID="+nlapiGetRecordId());
  if(stType=='create'){
	var ordernumber = recTrans.getFieldValue('tranid');
	nlapiLogExecution('DEBUG','Order Type=' + ordertype+" order number="+ordernumber);
	
	if (ordertype == 'Produce' && (odysseyOfferDate == "" || odysseyOfferDate == null))
	{ 	
			//ordernumber     = ordernumber.replace("SO","PR");
			ordernumber = "PR" + nlapiGetRecordId();
	}		

	if (ordertype == 'Grocery' && (odysseyOfferDate == "" || odysseyOfferDate == null)) 
	{ 	
			//ordernumber     = ordernumber.replace("SO","GR");
			ordernumber = "GR" + nlapiGetRecordId();
	}		

	if (ordertype == 'Donation - Yellow' && (odysseyOfferDate == "" || odysseyOfferDate == null)) 
	{ 	
			//ordernumber     = ordernumber.replace("SO","DO");
      
			ordernumber = "DO" + nlapiGetRecordId();
      nlapiLogExecution('DEBUG','Inside Order Type=' + ordertype+" "+ordernumber);
	}		

	if (ordertype == 'Donation - Maroon' && (odysseyOfferDate == "" || odysseyOfferDate == null)) 
	{ 	
			//ordernumber     = ordernumber.replace("SO","ML");
			ordernumber = "ML" + nlapiGetRecordId();
	}		

	if (ordertype == 'Donation - Blue' && (odysseyOfferDate == "" || odysseyOfferDate == null)) 
	{ 	
			//ordernumber     = ordernumber.replace("SO","DO");
			ordernumber = "DO" + nlapiGetRecordId();
	}
  	if (ordertype == 'Disaster' && (odysseyOfferDate == "" || odysseyOfferDate == null)) 
	{ 	
			//ordernumber     = ordernumber.replace("SO","DO");
			ordernumber = "DO" + nlapiGetRecordId();
	}	
 	if (ordertype == 'Seafood' && (odysseyOfferDate == "" || odysseyOfferDate == null)) 
	{ 	
			//ordernumber     = ordernumber.replace("SO","DO");
			ordernumber = "DO" + nlapiGetRecordId();
	}	

	var id = recTrans.setFieldValue('tranid',ordernumber)
    nlapiLogExecution('DEBUG','Tran ID ' + ordernumber);
  }
  
  	if(ordertype != 'Donation - Blue'){
    nlapiLogExecution('DEBUG','Inside' + 'mag ref' + stType);
	var lineCount = recTrans.getLineItemCount('item');
  	for(var i=1;i<=lineCount;i++){
      
      var prodChannel = recTrans.getLineItemText('item','custcol_product_channel',i);
      var magRef = recTrans.getLineItemValue('item','custcol_mag_ref_no',i);
      nlapiLogExecution('DEBUG','Mag Ref=' + magRef);
//Edited for ticket #6368 by Thilaga - edited for 6470/6504 
      if(stType=='create' && (magRef==null || magRef=='')){
        magRef='';
      }
      if((prodChannel=='Grocery' || prodChannel=='Produce' || prodChannel=='Donation')&& (magRef==null || magRef=='')){
    	recTrans.setLineItemValue('item','custcol_mag_ref_no',i,new Number(i*1001));
      }
      nlapiLogExecution('DEBUG','Mag Ref=' +recTrans.getLineItemValue('item','custcol_mag_ref_no',i)+ new Number(i*1001));
  	}
  	}
  
	var id = nlapiSubmitRecord(recTrans, true);
	
	
    return true;
  
	
}
