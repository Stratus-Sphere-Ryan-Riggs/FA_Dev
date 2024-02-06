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
*/
function wfaction_sendemail(stTemplate,eMailAddress)
{

            nlapiLogExecution('DEBUG', 'Email');
            var emailMerger = nlapiCreateEmailMerger(102);
            //emailMerger.setTransaction(stTranId);
            //emailMerger.setCustomRecord('customrecord_tsg_po_approver_list', arrAppList[0].getId());
            var mergeResult = emailMerger.merge();
            var emailBody = mergeResult.getBody();
            //emailBody += '
            //<p class="text" style="font-weight:bold"><a href="' + nlapiResolveURL('record', stTranType, stTranId) + '">View Record</a></p>';
            var emailSubject = mergeResult.getSubject();
            nlapiSendEmail('4', 'NSAdmin@feedingamerica.org', emailSubject, emailBody, null, null, null);
            nlapiLogExecution('DEBUG', 'Email', emailSubject + ":: " + emailBody);
            //close the window and redirect to the current po

           return true;
	
}
