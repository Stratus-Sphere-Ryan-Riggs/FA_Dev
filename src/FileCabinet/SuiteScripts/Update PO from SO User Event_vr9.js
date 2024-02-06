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
* @event/Type: User Event Before Submit on Sales Order
* Change the accessorial Field
*/


function closedSalesOrder(){
	nlapiLogExecution('debug', 'After Submit beign');
}



function updatePurchaseOrderFromSalesOrder(type){ 
	try
	{
		nlapiLogExecution('DEBUG', '***START*** ');
		nlapiLogExecution('DEBUG', 'type : ' + type);
		if(type == 'delete')
		{
			var oldSalesOrder = nlapiGetOldRecord();
			var associated = oldSalesOrder.getFieldValue('custbody_associated_transaction');
			nlapiLogExecution('DEBUG', 'associated : ' + associated);
			if(!isEmpty(associated))
			{
				nlapiLogExecution('DEBUG', 'associated : ' + associated);
				var purchaseOrder = nlapiLoadRecord('purchaseorder', associated);
				var deletedReason = nlapiGetContext().getSetting('SCRIPT', 'custscript_master_so_deleted');
				purchaseOrder.setFieldValue('custbody_order_has_issues', 'T');
				purchaseOrder.setFieldValue('custbody_order_issues', 'Master Sales Order Deleted');
				purchaseOrder.setFieldValue('custbody_order_has_issues_reason',deletedReason);
				nlapiLogExecution('DEBUG', 'submitting');
				nlapiSubmitRecord(purchaseOrder);
			}
			return;
		}
		var oldSalesOrder = nlapiGetOldRecord();

		var thisSalesOrder = nlapiGetNewRecord();

		var status1 =thisSalesOrder.getFieldValue('status');
		if(type != 'approve' && (status1 == 'Pending Approval' || isEmpty(status1) ))
		{
			nlapiLogExecution('debug','Sales Order Not being Approved');
			return;
		}		

		if(isEmpty(oldSalesOrder)){
			nlapiLogExecution('DEBUG', 'Sales Order Create Script should handle this');
			nlapiLogExecution('DEBUG', '***END***');
			return;
		}
		if(isEmpty(thisSalesOrder.getFieldValue('custbody_associated_transaction')))
		{			
			nlapiLogExecution('DEBUG', 'Sales Order Create Script should handle this');
			nlapiLogExecution('DEBUG', '***END***');
			return;
		}
		if(isEmpty(oldSalesOrder.getFieldValue('custbody_associated_transaction'))){
			nlapiLogExecution('DEBUG', 'Empty Purchase Order Number');
			var oldSalesOrder = nlapiGetOldRecord();	
			nlapiLogExecution('DEBUG', '***END***');
			return;
		}
		var thisSalesOrderID = thisSalesOrder.getId();
		var actualFreightCost =thisSalesOrder.getFieldValue('custbody_actual_freight_cost');
		if(isEmpty(actualFreightCost))
		{
			nlapiLogExecution('debug', '***EMPTY ACTUAL COST***');
			return;
		}
		var estimatedCost = thisSalesOrder.getFieldValue('custbody_benchmark_freight_cost');
		if(isEmpty(estimatedCost)){
			nlapiLogExecution('debug', '***EMPTY ESTIMATED (BENCHMARK) COST***');
			return;
		}
	
		var billToFreight =  thisSalesOrder.getFieldValue('custbody_bill_to_freight');	
		nlapiLogExecution('Debug', 'update PO', 'Update PO');
		var purchaseOrder = nlapiLoadRecord('purchaseorder', thisSalesOrder.getFieldValue('custbody_associated_transaction'));
		var paramBillToFreight = nlapiGetContext().getSetting('SCRIPT', 'custscript_bill_to_freight_2');
			
		if(billToFreight != paramBillToFreight){
			nlapiLogExecution('debug', 'Transport Not Arranged');
			nlapiLogExecution('DEBUG', '***END***');
			return;
		}
		if(isEmpty(purchaseOrder)){
			nlapiLogExecution('Debug', 'Sales Order has inexistent Purchase Order Number', details)
			return;//
		}else{
			nlapiLogExecution('Debug', 'Purchse order Found', 'PO ID : ' + purchaseOrder.getId());
		}
		if(isEmpty(thisSalesOrder.getFieldValue('custbody_actual_carrier_delivery_date'))){
			nlapiLogExecution('Debug', 'Delivery date empty');
		}else{
			nlapiLogExecution('Debug', 'Delivery date found');		
		}
		var sOvendor = thisSalesOrder.getFieldValue('custbody_transporation_vendor');
		var pOvendor = purchaseOrder.getFieldValue('entity');
		var issues = thisSalesOrder.getFieldValue('custbody_order_has_issues');
		var transpoertationIssues = nlapiGetContext().getSetting('SCRIPT', 'custscript_transportation_issues');
		nlapiLogExecution('debug', 'transpoertationIssues : ' + transpoertationIssues);
		//if((issues == 'T') && (thisSalesOrder.getFieldValue('custbody_order_has_issues_reason') == transpoertationIssues)){
		//	purchaseOrder.setFieldValue('custbody_order_has_issues', issues);
		//	purchaseOrder.setFieldValue('custbody_order_issues', 'Sales Order Has Issues');
		//	purchaseOrder.setFieldValue('custbody_order_has_issues_reason',transpoertationIssues);
		//}
		var context = nlapiGetContext();
		var cancelled = context.getSetting('SCRIPT', 'custscript_cancelled_2');
		var cancelled_reason = context.getSetting('SCRIPT', 'custscript_reason_cancelled_2');
		var closed = context.getSetting('SCRIPT', 'custscriptcustscript_closed_2');
		var closed_reason = context.getSetting('SCRIPT', 'custscript_reason_closed');
		var oldStatus = oldSalesOrder.getFieldValue('status');
		var status = thisSalesOrder.getFieldValue('status');

		cancelled = 'C';
		closed = 'H';

		if( (oldStatus != status) && 
		(status == cancelled || status == closed) &&
		(!isEmpty(thisSalesOrder.getFieldValue('custbody_associated_transaction')) ) ){

			purchaseOrder.setFieldValue('custbody_order_has_issues','T');
			thisSalesOrder.setFieldValue('custbody_order_has_issues','T');
			if(status == cancelled)
			{
				purchaseOrder.setFieldValue('custbody_order_issues', 'Sales Order Cancelled');
				purchaseOrder.setFieldValue('custbody_order_has_issues_reason',cancelled_reason);
				var body = 'Attention, the Sales Order : ' + thisSalesOrderID + ' was cancelled and has an associated Purchase Order ( ' + 
				thisSalesOrder.getFieldValue('custbody_associated_transaction') + ' ) ';	
				thisSalesOrder.setFieldValue('custbody_order_issues', 'Sales Order Cancelled');
				thisSalesOrder.setFieldValue('custbody_order_has_issues_reason',cancelled_reason);
			}else{
				purchaseOrder.setFieldValue('custbody_order_issues','Sales Order Closed');
				purchaseOrder.setFieldValue('custbody_order_has_issues_reason',closed_reason);				
				var body = 'Attention, the Sales Order : ' + thisSalesOrderID + ' was closed and has an associated Purchase Order ( ' + 
				thisSalesOrder.getFieldValue('custbody_associated_transaction') + ' ) ';
			}
			nlapiSubmitRecord(purchaseOrder);			
			var author = nlapiGetContext().getSetting('SCRIPT', 'custscript_author_email_parameter');
			var subject = 'Attention, orphan Order';
			var emailsSearch = nlapiSearchRecord('employee', 'customsearch_transportation_team_search');
			var destinationMails = [];
			for(var i = 0; i< emailsSearch.length; i++){
				destinationMails.push(emailsSearch[i].getValue('email'));
			}
			if(emailsSearch != '')
			{
				nlapiLogExecution('DEBUG', 'author : ' + author);
				nlapiLogExecution('DEBUG', 'detinationMail : ',destinationMails);
				nlapiLogExecution('DEBUG', 'subject : ' + subject);
				nlapiLogExecution('DEBUG', 'body : ' + body);
				nlapiSendEmail(author, destinationMails, subject, body);	//WARNING!! : COMMENT WHILE DEBUGING!! (to prevent spam)
			}
			nlapiLogExecution('debug', 'Sales Order Cancelled or Closed' ,'***END***');
			return;
		}

		var today = new Date();
		var dd    = today.getDate();
		var mm    = today.getMonth() + 1; //January is 0!
		var yyyy  = today.getFullYear();
		var date  = mm+'/'+dd+'/'+yyyy;

		var yellow = nlapiGetContext().getSetting('SCRIPT', 'custscript_order_type_dy_2');
		var blue = nlapiGetContext().getSetting('SCRIPT', 'custscript_order_type_db_2');
		var maroon = nlapiGetContext().getSetting('SCRIPT', 'custscript_order_type_dm_2');
		var produce = nlapiGetContext().getSetting('SCRIPT', 'custscript_order_type_pr_2');
		var grocery = nlapiGetContext().getSetting('SCRIPT', 'custscript_order_type_gr_2');		

		//begin
		var disaster = nlapiGetContext().getSetting('SCRIPT', 'custscript_order_type_disaster');	 
		var seafood  = nlapiGetContext().getSetting('SCRIPT', 'custscriptorder_type_seafood');

		var disasterProgram = nlapiGetContext().getSetting('SCRIPT', 'custscript_disaster_program');
		var groceryProgram = nlapiGetContext().getSetting('SCRIPT', 'custscript_grocery_program');
		var produceProgram = nlapiGetContext().getSetting('SCRIPT', 'custscript_produce_program');
		var seafoodProgram = nlapiGetContext().getSetting('SCRIPT', 'custscript_seafood_program');
		var thisOrderType = nlapiGetFieldValue('custbody_order_type');
		var program = null;
		if (thisOrderType == disaster)
			program = disasterProgram;

		if(thisOrderType == grocery)
			program = groceryProgram;

		if(thisOrderType == seafood)
			program = seafoodProgram;

		if(thisOrderType == produce)
			program = produceProgram;
		
		if(isEmpty(program)){
			program = nlapiGetContext().getSetting('SCRIPT', 'custscript_default_program2');
		}		
		//end
		purchaseOrder.setFieldValue('department', program);

		var newPosition = 1;
		var description = "";
		
		var itemToInsert = nlapiGetContext().getSetting('SCRIPT', 'custscript_item_parameter_2');
		description = "Transportation estimated for Sales Order : " + thisSalesOrder.getFieldValue('tranid');
		setLine(purchaseOrder, itemToInsert, 1, date, description, estimatedCost, estimatedCost, newPosition,program);
		newPosition++;

		var defApproval    = nlapiGetContext().getSetting('SCRIPT', 'custscript_default_approval_status_2');
		var approvedStatus = nlapiGetContext().getSetting('SCRIPT', 'custscript_approved_status');
		var tolerance      = nlapiGetContext().getSetting('SCRIPT', 'custscript_variance');	 
		var transportVariance = nlapiGetContext().getSetting('SCRIPT', 'custscript_transport_variance');	 		
		var freightCostDiff = actualFreightCost - estimatedCost;
		nlapiLogExecution('debug', ' freightCostDiff : ' + freightCostDiff);
		nlapiLogExecution('debug', ' transportVariance : ' + transportVariance);

		if(Math.abs(freightCostDiff) >tolerance)
		{
			purchaseOrder.setFieldValue('approvalstatus', defApproval);
			//purchaseOrder.setFieldValue('custbody_order_has_issues', 'T');
			//purchaseOrder.setFieldValue('custbody_order_issues', 'Transportation Variance');
			//purchaseOrder.setFieldValue('custbody_order_has_issues_reason',transportVariance);
		}
		
		if(Math.abs(freightCostDiff) <tolerance)
		{
			purchaseOrder.setFieldValue('approvalstatus', approvedStatus);
			nlapiLogExecution('debug', ' transportVariance : ' + transportVariance);

			if(thisOrderType == grocery)
			{
			 	var grItem = nlapiGetContext().getSetting('SCRIPT', 'custscript_transport_error_item');
		        description = "Transportation variance for Sales Order : " + thisSalesOrder.getFieldValue('tranid');
			    var foundItem = purchaseOrder.findLineItemValue('item', 'item', grItem);
				if (foundItem != '-1')
			    {	
			      purchaseOrder.setLineItemValue('item', 'rate', foundItem, freightCostDiff);			
	              purchaseOrder.setLineItemValue('item', 'amount', foundItem, freightCostDiff);
			    }
                else {
					   setLine(purchaseOrder,grItem, 1,date,description, freightCostDiff,freightCostDiff,newPosition,program);
					   newPosition++;
                } 
            }
		}

		var memberFees = forceParseFloat(thisSalesOrder.getFieldValue('custbody_addl_freight_member'));
		var accessorialFees = parseFloat(memberFees) ;
		if(!isEmpty(accessorialFees)){
//			if(pOvendor != sOvendor) {

//			}else{
			itemToInsert = nlapiGetContext().getSetting('SCRIPT', 'custscript_fees_error_and_omission_item');
			var foundEO = purchaseOrder.findLineItemValue('item', 'item', itemToInsert);
		    nlapiLogExecution('DEBUG', 'Found EO: ' + foundEO);
		    nlapiLogExecution('DEBUG', 'Found EO fees: ' + accessorialFees);
			if (foundEO != '-1')
			{	
			  purchaseOrder.setLineItemValue('item', 'rate', foundEO, accessorialFees);			
	          purchaseOrder.setLineItemValue('item', 'amount', foundEO, accessorialFees);
			}
			if (foundEO == '-1' && accessorialFees > 0)
			{	
			   purchaseOrder.setFieldValue('approvalstatus', defApproval);
			   description = "Member Accessorial Fees for Sales Order : " + thisSalesOrder.getFieldValue('tranid');
			   thisSalesOrder.setFieldValue('custbody_accessorial_comments', description);
			   setLine(purchaseOrder,itemToInsert, 1,date,description, accessorialFees,accessorialFees,newPosition,program);
			}   
//			}
		}
		var vAccessorialFees = forceParseFloat(thisSalesOrder.getFieldValue('custbodycustbody_addlfreightcostvendor'));
		if(!isEmpty(vAccessorialFees)){
			itemToInsert = nlapiGetContext().getSetting('SCRIPT', 'custscript_va_accessorial_fees');
			var foundEO = purchaseOrder.findLineItemValue('item', 'item', itemToInsert);
		    nlapiLogExecution('DEBUG', 'Found EO: ' + foundEO);
		    nlapiLogExecution('DEBUG', 'Found EO fees: ' + vAccessorialFees);
			if (foundEO != '-1')
			{	
			  purchaseOrder.setLineItemValue('item', 'rate', foundEO, vAccessorialFees);			
	          purchaseOrder.setLineItemValue('item', 'amount', foundEO, vAccessorialFees);
			}
			if (foundEO == '-1' && accessorialFees > 0)
			{	
			   purchaseOrder.setFieldValue('approvalstatus', defApproval);
			   description = "Vendor Accessorial Fees for Sales Order : " + thisSalesOrder.getFieldValue('tranid');
			   thisSalesOrder.setFieldValue('custbody_accessorial_comments', description);
			   setLine(purchaseOrder,itemToInsert, 1,date,description, vAccessorialFees,vAccessorialFees,newPosition,program);
			}   
//			}
		}
		var accessorialFA = (forceParseFloat(thisSalesOrder.getFieldValue('custbody_addl_freight_fa'))) ;
		if(!isEmpty(accessorialFA)){
//			if(pOvendor != sOvendor) {

//			}else{
			itemToInsert = nlapiGetContext().getSetting('SCRIPT', 'custscript_transport_eo_item');
			var foundEO = purchaseOrder.findLineItemValue('item', 'item', itemToInsert);
		    nlapiLogExecution('DEBUG', 'Found EO: ' + foundEO);
		    nlapiLogExecution('DEBUG', 'Found EO fees: ' + accessorialFA);
			if (foundEO != '-1')
			{	
			  purchaseOrder.setLineItemValue('item', 'rate', foundEO, accessorialFA);			
	          purchaseOrder.setLineItemValue('item', 'amount', foundEO, accessorialFA);
			}
			if (foundEO == '-1' && accessorialFA > 0)
			{	
			   purchaseOrder.setFieldValue('approvalstatus', defApproval);
			   description = "Accessorial E&O Fees for Sales Order : " + thisSalesOrder.getFieldValue('tranid');
			   thisSalesOrder.setFieldValue('custbody_accessorial_comments', description);
			   setLine(purchaseOrder,itemToInsert, 1,date,description, accessorialFA,accessorialFA,newPosition,program);
			}   
//			}
		}

		if(pOvendor != sOvendor) 
		{
			thisSalesOrder.setFieldValue('custbody_order_has_issues','T');
			purchaseOrder.setFieldValue('custbody_order_has_issues','T');
			var transportIssues =  context.getSetting('SCRIPT', 'custscript_transportation_issues');
			thisSalesOrder.setFieldValue('custbody_order_has_issues_reason',transportIssues);
			thisSalesOrder.setFieldValue('custbody_order_issues','Transportation Vendor Changed');
			purchaseOrder.setFieldValue('custbody_order_has_issues_reason',transportIssues);
			purchaseOrder.setFieldValue('custbody_order_issues','Transportation Vendor Changed');
		}

		purchaseOrder.setFieldValue('createdfrom', thisSalesOrderID);
		var newCarrierCode = thisSalesOrder.getFieldValue('custbody_carrier_code');
		var oldCarrierCode = oldSalesOrder.getFieldValue('custbody_carrier_code');
		if((isEmpty(newCarrierCode) && !isEmpty(oldCarrierCode)) ||
		(!isEmpty(oldCarrierCode) && isEmpty(newCarrierCode)) ||
		(!isEmpty(newCarrierCode) && !isEmpty(oldCarrierCode) && newCarrierCode != oldCarrierCode)
		&& (!isEmpty(accessorialFeesDifference) && accessorialFeesDifference!= 0))
		{
			var author = nlapiGetContext().getSetting('SCRIPT', 'custscript_author_email_parameter');
			var subject = 'Attention, suspicious order';
			var body = 'Accessorial Fees anc Carriers have changed. The order must be reviewed. A new manual purchase order would be created by either finance or the transportation team';
			var emailsSearch = nlapiSearchRecord('employee', 'customsearch_transport_finance_emails');
			var destinationMails = [];
			for(var i = 0; i< emailsSearch.length; i++){
				destinationMails.push(emailsSearch[i].getValue('email'));
			}
			if(emailsSearch != '')
			{
				nlapiSendEmail(author, destinationMails, subject, body);	//WARNING!! : COMMENT WHILE DEBUGING!! (to prevent spam)
			}
		}
		nlapiSubmitRecord(purchaseOrder);
		nlapiLogExecution('DEBUG', 'PO Id : ' + purchaseOrder.getId());
		nlapiLogExecution('DEBUG', '***END***');

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
function setLine(order,itemToInsert,quantity,expectedDate,description,rate,amount,newPosition,program)
{
	order.setLineItemValue('item', 'item', newPosition, itemToInsert);
	order.setLineItemValue('item', 'quantityreceived', newPosition, quantity);
	order.setLineItemValue('item', 'expectedreceiptdate', newPosition, expectedDate);	
	order.setLineItemValue('item', 'description', newPosition, description);
	order.setLineItemValue('item', 'rate', newPosition, rate);			
	order.setLineItemValue('item', 'amount', newPosition, amount);
	order.setLineItemValue('item','department',newPosition, program);
}
function forceParseFloat(stValue)
{
     var flValue = parseFloat(stValue);
   
     if (isNaN(flValue) || (Infinity == stValue))
     {
         return 0.00;
     }
   
     return flValue;
}
