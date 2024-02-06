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
* @author Peter August
* @version 1.0
* 
* 08/20/2016 Call the schedule script to send the Opportunity Emails. 
* 
*/


function afterSubmit_SendEmails(type)
{   
     var ec = nlapiGetContext().getExecutionContext();
     nlapiLogExecution('DEBUG', 'execution context', ec);
     nlapiLogExecution('DEBUG', 'type execution context ', type);
     if (ec != 'userinterface' && ec != 'webservices' && ec != 'userevent') 
	 {
        return;
     }

    //allow only create, edit, delete and cancel
    if(type!='create'   && 
       type!='edit'     &&
       type!='approved' &&
       type!='dropship' &&
       type!='approve'	   )
    {
        return;
    }
     nlapiLogExecution('DEBUG', 'post approved type execution context ', type);
	 
  
    var stMainLog = 'afterSubmit_EmailOpportunity_Main';
    var recBill    = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());
 	var rectype    = nlapiGetRecordType();
    nlapiLogExecution('DEBUG','Scheduled Script Called','Rec type ' + rectype + ' ' + recBill.getFieldValue('orderstatus') );
    nlapiLogExecution('DEBUG','Scheduled Script Called','Status Rec type ' + rectype + ' ' + recBill.getFieldValue('status') );
   
    if (rectype.toLowerCase() == 'salesorder' && recBill.getFieldValue('status') == 'Pending Approval')
	{
      nlapiLogExecution('DEBUG','Bill Not Approved - returning' );
      return true;
    }	  

 
   nlapiLogExecution('DEBUG','Scheduled Script Called','Status Rec type ' + type + ' ' + recBill.getId() );
    var arrParam = [];
	       arrParam['custscript_opp_trans_type']           = type;
           arrParam['custscript_opp_trans_internal_id']    = recBill.getId();
    
	var status = nlapiScheduleScript('customscript_ns_ss_opportunity_email','customdeploy_opportunity_email',arrParam);
    nlapiLogExecution('DEBUG','Scheduled Script Called','Scheduled Script Queue Status= ' + status);
    if (status == 'INPROGRESS')
	{
		status = nlapiScheduleScript('customscript_ns_ss_opportunity_email','customdeploy_email_2',arrParam);
        nlapiLogExecution('DEBUG','Scheduled Script Called 2','Scheduled Script Queue Status= ' + status);
    }		
    if (status == 'INPROGRESS')
	{
		status = nlapiScheduleScript('customscript_ns_ss_opportunity_email','customdeploy_email_3',arrParam);
        nlapiLogExecution('DEBUG','Scheduled Script Called 2','Scheduled Script Queue Status= ' + status);
    }		
       

}
