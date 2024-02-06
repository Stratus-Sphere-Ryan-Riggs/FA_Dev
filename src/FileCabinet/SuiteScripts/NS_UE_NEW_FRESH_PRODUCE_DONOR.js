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
* 
* @version 1.0
*  Purpose:  Upon setting vendor as a Fresh Produce Donor, scheduled script is triggered to add donor to the donor list for each produce item.
*/

function aftersubmit_addproducedonor(stType) {

	var scriptcontext = nlapiGetContext().getExecutionContext();
  
    var arrParam = [];
	    arrParam['custscript_first_record_type']           = 'vender';
        arrParam['custscript_vendor_id']    = nlapiGetRecordId();
	
    nlapiLogExecution('DEBUG','aftersubmit_addproducedonor','|------------SCRIPT STARTED------------||' + stType + ' ' + scriptcontext);	
    		
    			if (stType != 'edit' && stType != 'create') {
          			//do nothing
          			nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        				return;
    				}

           if (stType == 'edit' || stType == 'create') {

			var status = nlapiScheduleScript('customscript_sch_add_new_produce_donor','customdeploy1', arrParam);
			nlapiLogExecution('DEBUG','Scheduled Script Called','Scheduled Script Queue Status= ' + status);
           			
				if (status == 'INPROGRESS') {
					
					nlapiLogExecution('DEBUG','Scheduled Script Called','2ndScheduled Script Queue Status= ' + status);
}
}
}
             
              