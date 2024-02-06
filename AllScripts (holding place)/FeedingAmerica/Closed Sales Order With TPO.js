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
* @event/Type: Schedule script for Sales Order
*/



function closedSOwithTPO(){
	try
	{
		nlapiLogExecution('DEBUG', '***START***');
//		var salesSearch = nlapiLoadSearch('salesorder', 'customsearch_closed_so_with_tpo');
		var salesSearch = nlapiSearchRecord('salesorder', 'customsearch_closed_so_with_tpo');
		nlapiLogExecution('DEBUG', 'sales length : ' + salesSearch.length);		
		var emailsSearch = nlapiSearchRecord('employee', 'customsearch_transportation_team_search');
		var destinationMails = [];
		for(var j = 0; j< emailsSearch.length; j++){
			destinationMails.push(emailsSearch[j].getValue('email'));
		}
		for (var i = 0; i< salesSearch.length; i++)
		{
			var salesOrderID = salesSearch[i].getId();
			nlapiLogExecution('DEBUG', 'inside for, i = ' + i );			
			var salesOrder = nlapiLoadRecord('salesorder', salesOrderID);
			var purchaseOrderID = salesOrder.getFieldValue('custbody_associated_transaction');
			var purchaseOrder = nlapiLoadRecord('purchaseorder', purchaseOrderID);
			purchaseOrder.setFieldValue('custbody_order_has_issues', 'T');
			purchaseOrder.setFieldValue('custbody_order_has_issues_reason', 6);
			var author = nlapiGetContext().getSetting('SCRIPT', 'custscript_author_email_param');
			var subject = 'Attention, Suspicious Order';
			var body = 'Attention, the Sales Order : ' + salesOrderID + ' was closed and has an associated Purchase Order ( ' + 
			salesOrder.getFieldValue('custbody_associated_transaction') + ' ) ';

			if(emailsSearch != '')
			{
				/*
				nlapiLogExecution('DEBUG', 'author : ' + author);
				nlapiLogExecution('DEBUG', 'detinationMail : ',destinationMails);
				nlapiLogExecution('DEBUG', 'subject : ' + subject);
				nlapiLogExecution('DEBUG', 'body : ' + body);
				*/
				nlapiSendEmail(author, destinationMails, subject, body);	//WARNING!! : COMMENT WHILE DEBUGING!! (to prevent spam)
				nlapiSubmitRecord(purchaseOrder);
			}
		}
		nlapiLogExecution('DEBUG', '***END**','***END**' );
	}catch(error){
		nlapiLogExecution('ERROR', 'Error', error);
	}
}

function isEmpty(stValue) {   
	if ((stValue == '') || (stValue == null) || (typeof stValue == "undefined"))  
	{        
		return true;   
	}
	return false; 
}