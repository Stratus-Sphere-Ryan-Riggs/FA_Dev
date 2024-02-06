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
* @event/Type: User Event After Submit on Sales Order
*
* 10/05/2016 - Set the following sales order fields with the PO Number custbody_transporation_po_number & custbody_freight_po_number
* 10/10/2016 - Altered the order status value check to ensure onn approval the transportation po is created
* 10/25/2016 - For the variance check (actual to estimated) - added in check for line and surcharge to ensure set)
* 11/08/2016 - If Non Grocery - No tolerance no has issues check.  If Grocery - only add item if withinn tolerance.  If outside of tolerence set to has issues
* 01/31/2017 - For transporation if outside variance set PO to Pending Approval
* 02/23/2017 - Changed the Accessorial Field Check\\
* 03/12/2017 - Ensured that is the PO was outside the variance - the PO was set to pending approval
*
*/
function createPurchaseOrderFromSalesOrder(type){


	try
	{
		var methodsString = nlapiGetContext().getSetting('SCRIPT', 'custscript_shipping_method_csv');
		var shippingMethodFA = methodsString.split(",");

		var methods = [];
		methods = methodsString.split(",");
		var shippingMethod = nlapiGetFieldValue('custbody_shipping_method_code');
		var validMethod = false;
		for (var i = 0; i< methods.length; i++)
		{
			if(shippingMethod == methods[i])
				validMethod = true;
		}
		if(!validMethod){
			//nlapiLogExecution('debug','Invalid shipping method : ' + shippingMethod);			
			return;
		}
		var orderTypes = nlapiGetContext().getSetting('SCRIPT', 'custscript_accepted_order_type');		
		var validType = false;
		var thisOrderType = nlapiGetFieldValue('custbody_order_type');
		for (var i = 0; i< orderTypes.length; i++)
		{
			//nlapiLogExecution('debug','Order type : ' +orderTypes[i] );	
			if(thisOrderType == orderTypes[i]){
				//nlapiLogExecution('debug','true for type : ' +orderTypes[i] );					
				validType = true;
			}
		}
		if(!validType){
			//nlapiLogExecution('debug','Invalid Order type : ' + thisOrderType);			
			return;
		}		
		var billToFreight =  nlapiGetFieldValue('custbody_bill_to_freight');	
		var paramBillToFreight = nlapiGetContext().getSetting('SCRIPT', 'custscript_bill_to_freight');
			
		if(billToFreight != paramBillToFreight){
			nlapiLogExecution('debug', 'Transport Not Arranged');
			nlapiLogExecution('DEBUG', '***END***');
			return;
		}
		var orderStatus   =nlapiGetFieldValue('orderstatus');
		var orderStatus_t =nlapiGetFieldText('orderstatus');
		var status1 =nlapiGetFieldValue('status');
		nlapiLogExecution('debug','type : ' + type + ' os : ' + orderStatus_t);
		//if(type != 'approve' && (orderStatus_t == 'Pending Approval' || isEmpty(status1) ))
		if(orderStatus_t == 'Pending Approval')
		{
			nlapiLogExecution('debug','Sales Order Not being Approved');
			return;
		}
		var approvalStatus =  nlapiGetContext().getSetting('SCRIPT', 'custscript_status');

		var paramShippingMethod = nlapiGetContext().getSetting('SCRIPT', 'custscript_shipping_method_code');
		var paramShippingMethod2 = nlapiGetContext().getSetting('SCRIPT', 'custscript_shipping_method_code2');
		nlapiLogExecution('debug', ' ship test ' + shippingMethod + ' ' + shippingMethodFA);

		//if(!isEmpty(shippingMethod) && shippingMethodFA.indexOf(shippingMethod) != -1 ){
		//if( !isEmpty(shippingMethod) && shippingMethodFA.indexOf(shippingMethod) != -1) ){
		//if(shippingMethod != paramShippingMethod && shippingMethod != paramShippingMethod2 ){
		//	nlapiLogExecution('debug', 'WRONG SHIPPING METHOD');
		//	return;
		//}
		var estimatedFreightCost = nlapiGetFieldValue('custbody_benchmark_freight_cost');
		if(isEmpty(estimatedFreightCost))
		{
			nlapiLogExecution('debug', 'NO BENCHMARK FREIGHT COST SET');
			return;			
		}
		var transportationVendor = nlapiGetFieldValue('custbody_transporation_vendor');
		if(isEmpty(transportationVendor)){
			nlapiLogExecution('debug', '**** END ***', 'Empty Transportation Vendor');				
			return;
		}
		if(!isEmpty(nlapiGetFieldValue('custbody_associated_transaction')))
		{
//Added for ticket #6286 by Thilaga
          var oldRec = nlapiGetOldRecord();
          if(oldRec.getFieldValue('custbody_carrier_code')!=nlapiGetFieldValue('custbody_carrier_code')){
            nlapiLogExecution('DEBUG', 'Carrier different',oldRec.getFieldValue('custbody_carrier_code')+" "+nlapiGetFieldValue('custbody_carrier_code'));
            var poRec = nlapiLoadRecord('purchaseorder',nlapiGetFieldValue('custbody_associated_transaction'));
            var lineCount = poRec.getLineItemCount('item');
            for(var i=1;i<=lineCount;i++){
              poRec.setLineItemValue('item','isclosed',i,'T');
              poRec.commitLineItem('item');
            }
            var id=nlapiSubmitRecord(poRec,true);
            nlapiSetFieldValue('custbody_associated_transaction','');
            nlapiSetFieldValue('custbody_transporation_po_number','');
          }
          else{
          
			nlapiLogExecution('DEBUG', 'PO already created');
			nlapiLogExecution('DEBUG', '***END***');
			return;

          }
		}

		var yellow = nlapiGetContext().getSetting('SCRIPT', 'custscript_order_type_dy');
		var blue = nlapiGetContext().getSetting('SCRIPT', 'custscript_order_type_db');
		var maroon = nlapiGetContext().getSetting('SCRIPT', 'custscript_order_type_dm');
		var produce = nlapiGetContext().getSetting('SCRIPT', 'custscript_order_type_pr');
		var grocery = nlapiGetContext().getSetting('SCRIPT', 'custscript_order_type_gr');
		var disaster = nlapiGetContext().getSetting('SCRIPT', 'custscript_order_type_disaster2');	 
		var seafood  = nlapiGetContext().getSetting('SCRIPT', 'custscript_type_seafood2');

		var disasterProgram = nlapiGetContext().getSetting('SCRIPT', 'custscript_disaster_program2');
		var groceryProgram = nlapiGetContext().getSetting('SCRIPT', 'custscript_grocery_program2');
		var produceProgram = nlapiGetContext().getSetting('SCRIPT', 'custscript_produce_program2');
		var seafoodProgram = nlapiGetContext().getSetting('SCRIPT', 'custscript_seafood_program2');
		var fund = nlapiGetContext().getSetting('SCRIPT', 'custscript_default_location_fund');

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
			program = nlapiGetContext().getSetting('SCRIPT', 'custscript_default_program');
		}

		nlapiLogExecution('Debug', 'Starting create process');


		var thisSalesOrderID = nlapiGetRecordId();
		var thisSalesOrder = nlapiLoadRecord('salesorder', thisSalesOrderID);			

		if(estimatedFreightCost == 0 )
		{
			var author = nlapiGetContext().getSetting('SCRIPT', 'custscript_email_author_parameter');
			var subject = 'Attention, suspicious sales order';
			var body = 'Warning, the Sales Order ID: '+ nlapiGetFieldValue('tranid') +' has transportation arranged and has a zero dollar Purchase Order';
			var transportationEmailsSearch = nlapiSearchRecord('employee', 'customsearch_transportation_team_search');
			var destinationMails = [];
			for(var i = 0; i< transportationEmailsSearch.length; i++){
				destinationMails.push(transportationEmailsSearch[i].getValue('email'));
			}
			if(transportationEmailsSearch != '')
			{
//				nlapiLogExecution('DEBUG', 'author : ' + author);
//				nlapiLogExecution('DEBUG', 'subject : ' + subject);
//				nlapiLogExecution('DEBUG', 'body : ' + body);
			nlapiSendEmail(author, destinationMails, subject, body);
			nlapiLogExecution('DEBUG', 'Mail sent to : ',destinationMails);	
			}
		}
		var transportBeingArranged = nlapiGetContext().getSetting('SCRIPT', 'custscript_transport_being_arranged');
		//Transportation Status: "Transportation Being Arranged" = 3
		thisSalesOrder.setFieldValue('custbody_transportation_status', transportBeingArranged);
      var project = nlapiLookupField('salesorder', thisSalesOrderID, 'custbody_cseg_projects_cseg');
		var purchaseOrder = nlapiCreateRecord('purchaseorder');
		purchaseOrder.setFieldValue('entity', transportationVendor);
		var transportOrderType = nlapiGetContext().getSetting('SCRIPT', 'custscript_transport_order_type');			
		purchaseOrder.setFieldValue('custbody_order_type', transportOrderType);
		purchaseOrder.setFieldValue('department', program);
		purchaseOrder.setFieldValue('createdFrom', thisSalesOrder);
		purchaseOrder.setFieldValue('location', fund);
        purchaseOrder.setFieldValue('custbody_cseg_projects_cseg',project);
		//
		purchaseOrder.setFieldValue('custbody_associated_salesorder',thisSalesOrderID);			
		var salesOrderNumber = thisSalesOrder.getFieldValue('tranid');
		var salesOrderClass = thisSalesOrder.getFieldValue('class');
		var issues = thisSalesOrder.getFieldValue('custbody_order_has_issues');
		
		var transpoertationIssues = nlapiGetContext().getSetting('SCRIPT', 'custscript_transportation_issues_2');			
		//nlapiLogExecution('debug', 'Reason : ' + thisSalesOrder.getFieldValue('custbody_order_has_issues_reason'));
		//nlapiLogExecution('debug', 'Reason by parameter  : ' + transpoertationIssues);
		//if(issues == 'T' && thisSalesOrder.getFieldValue('custbody_order_has_issues_reason') == transpoertationIssues)
		//{
		//	purchaseOrder.setFieldValue('custbody_order_has_issues','T');
		//	purchaseOrder.setFieldValue('custbody_order_has_issues_reason',transpoertationIssues);
		//	purchaseOrder.setFieldValue('custbody_order_issues','Sales Order has Transportation Issues');
		//}

		var context = nlapiGetContext();
		var cancelled = context.getSetting('SCRIPT', 'custscript_cancelled');
		var cancelled_reason = context.getSetting('SCRIPT', 'custscript_reason_cancelled');
		var closed = context.getSetting('SCRIPT', 'custscript_closed_parameter');
		var closed_reason = context.getSetting('SCRIPT', 'custscript_reason_closed_param');
		var status = thisSalesOrder.getFieldValue('custbody_order_status');
		nlapiLogExecution('DEBUG', 'status : ',status); 
		nlapiLogExecution('DEBUG', 'cancelled : ',cancelled); 
		nlapiLogExecution('DEBUG', 'closed : ',closed);

		// Cancelled = 3
		if(status == cancelled || status == closed)
		{
		   var hasIssues = new Array;
	       hasIssues     = thisSalesOrder.getFieldValues('custbody_order_has_issues_reason');

			purchaseOrder.setFieldValue('custbody_order_has_issues','T');
			if(status == cancelled)
			{
				if (isEmpty(hasIssues))
		        {
		         hasIssues = cancelled_reason;
    	        } else
                {				   
		         hasIssues = hasIssues.concat(cancelled_reason);
                }				 

				purchaseOrder.setFieldValues('custbody_order_has_issues_reason',hasIssues);
				purchaseOrder.setFieldValue('custbody_order_issues','Sales Order Cancelled');
			}else// Status == Closed
			{
				if (isEmpty(hasIssues))
		        {
		         hasIssues = closed_reason;
    	        } else
                {				   
		         hasIssues = hasIssues.concat(closed_reason);
                }				 
				purchaseOrder.setFieldValues('custbody_order_has_issues_reason',hasIssues);
				purchaseOrder.setFieldValue ('custbody_order_issues','Sales Order Closed');
			}
		}


		purchaseOrder.setFieldValue('class', salesOrderClass);



		
		var position = 1; //custbody_addl_freight_member
		var vAaccessorialCost = forceParseFloat(thisSalesOrder.getFieldValue('custbodycustbody_addlfreightcostvendor'))
        var mBaccessorialCost = forceParseFloat(thisSalesOrder.getFieldValue('custbody_addl_freight_member')) ;
		var accessorialCost = (forceParseFloat(thisSalesOrder.getFieldValue('custbodycustbody_addlfreightcostvendor')) + forceParseFloat(thisSalesOrder.getFieldValue('custbody_addl_freight_member'))) ;
        var addlFAMember = thisSalesOrder.getFieldValue('custbody_addl_freight_member');
		nlapiLogExecution('debug', 'Accessorial Cost : ', accessorialCost);
		nlapiLogExecution('debug', 'Accessorial Cost Member: ', addlFAMember);

		var itemToInsert = nlapiGetContext().getSetting('SCRIPT', 'custscript_item_parameter');			//REMOVE COMMENT
		purchaseOrder.setLineItemValue('item', 'item', position, itemToInsert);
		purchaseOrder.setLineItemValue('item', 'quantityreceived', position, 1);
        if (thisOrderType != disaster) {
		purchaseOrder.setLineItemValue('item', 'rate', position, estimatedFreightCost);	
        }
        else {
		purchaseOrder.setLineItemValue('item', 'rate', position, 0);	
        }
		purchaseOrder.setLineItemValue('item', 'custbody_product_description', position, "Transportation cost for Sales Order " + salesOrderNumber);
		purchaseOrder.setLineItemValue('item', 'description', position, "Transportation cost for Sales Order : " + salesOrderNumber);
        if (thisOrderType != disaster) {
		purchaseOrder.setLineItemValue('item', 'amount', position, estimatedFreightCost);
        }
        else {
		purchaseOrder.setLineItemValue('item', 'amount', position, 0);
        }
		purchaseOrder.setLineItemValue('item','department',position, program);		
		nlapiLogExecution('debug', estimatedFreightCost);
		position++;
		var actualCost          = thisSalesOrder.getFieldValue('custbody_actual_freight_cost');
		var actualCost_sur      = thisSalesOrder.getFieldValue('custbody_fuel_sur_cost_actual');
		var actualCost_linehaul = thisSalesOrder.getFieldValue('custbody_linehaul_cost_actual');
		var defaultApprovalStatus = nlapiGetContext().getSetting('SCRIPT', 'custscript_default_approval_status');
		//Purchase Order: Apprval Status: "Pending Approval" = 1
		purchaseOrder.setFieldValue('approvalstatus', defaultApprovalStatus);
      
		if(thisOrderType==disaster){
        itemToInsert = nlapiGetContext().getSetting('SCRIPT', 'custscript_disaster_transport_item');
		purchaseOrder.setLineItemValue('item', 'item', position, itemToInsert);
		purchaseOrder.setLineItemValue('item', 'quantityreceived', position, 1);
        if(actualCost){
		purchaseOrder.setLineItemValue('item', 'rate', position, actualCost);	
        }
        else {
		purchaseOrder.setLineItemValue('item', 'rate', position, estimatedFreightCost);
        }
		purchaseOrder.setLineItemValue('item', 'custbody_product_description', position, "Transportation variance " + salesOrderNumber);
		purchaseOrder.setLineItemValue('item', 'description', position, "Transportation variance cost for Sales Order : " + salesOrderNumber);
        if(actualCost){
		purchaseOrder.setLineItemValue('item', 'amount', position, actualCost);
        }
        else {
		purchaseOrder.setLineItemValue('item', 'rate', position, estimatedFreightCost);
        }
		purchaseOrder.setLineItemValue('item','department',position, program);
		position ++;
        }

		if(!isEmpty(actualCost) && (!isEmpty(actualCost_sur) || !isEmpty(actualCost_linehaul))){
			var change  = actualCost - estimatedFreightCost;
			var tolerance = nlapiGetContext().getSetting('SCRIPT', 'custscript_tolerated_variance');
           var toleranceLow = nlapiGetContext().getSetting('SCRIPT',
                                                           'custscript_tol_variance_high');

			if(change != 0  && thisOrderType != grocery && thisOrderType != disaster){
				itemToInsert = nlapiGetContext().getSetting('SCRIPT', 'custscript_transport_produce_variance');
              //Added for ticket #5096 by Thilaga
				//if(thisOrderType==disaster){
                	//itemToInsert = nlapiGetContext().getSetting('SCRIPT', 'custscript_disaster_transport_item');
              	//}
				purchaseOrder.setLineItemValue('item', 'item', position, itemToInsert);
				purchaseOrder.setLineItemValue('item', 'quantityreceived', position, 1);
				purchaseOrder.setLineItemValue('item', 'rate', position, change);	
				purchaseOrder.setLineItemValue('item', 'custbody_product_description', position, "Transportation variance " + salesOrderNumber);
				purchaseOrder.setLineItemValue('item', 'description', position, "Transportation variance cost for Sales Order : " + salesOrderNumber);
				purchaseOrder.setLineItemValue('item', 'amount', position, change);
				purchaseOrder.setLineItemValue('item','department',position, program);
				position ++;
			}
          //changed by Thilaga
			if(change != 0  && thisOrderType == grocery ){
			   nlapiLogExecution('debug', ' add change item ');
				itemToInsert = nlapiGetContext().getSetting('SCRIPT', 'custscript_transport_error_and_omission');
				purchaseOrder.setLineItemValue('item', 'item', position, itemToInsert);
				purchaseOrder.setLineItemValue('item', 'quantityreceived', position, 1);
				purchaseOrder.setLineItemValue('item', 'rate', position, change);	
				purchaseOrder.setLineItemValue('item', 'custbody_product_description', position, "Transportation variance " + salesOrderNumber);
				purchaseOrder.setLineItemValue('item', 'description', position, "Transportation variance cost for Sales Order : " + salesOrderNumber);
				purchaseOrder.setLineItemValue('item', 'amount', position, change);
				purchaseOrder.setLineItemValue('item','department',position, program);
				position ++;
			}
			//
			//var defApproval = nlapiGetContext().getSetting('SCRIPT', 'custscript_default_approval_status');
			var defApproval = nlapiGetContext().getSetting('SCRIPT', 'custscript_variance_approval_status');
			var transportVariance = nlapiGetContext().getSetting('SCRIPT', 'custscript_transportation_variance');	
			nlapiLogExecution('debug', ' change : ' + change);
			nlapiLogExecution('debug', ' tolerance : ' + tolerance);
//commented by Thilaga for ticket #4804
//Added for ticket #6580
			var lowTolerance = parseFloat(0)-parseFloat(toleranceLow);
          nlapiLogExecution('debug', 'low tolerance : ' + lowTolerance);
			if(change <= lowTolerance || change >= tolerance)
            {
              nlapiLogExecution('debug', ' inside tolerance : ' + defApproval);
		//		var hasissues = new Array;
        //      	hasissues     = thisSalesOrder.getFieldValues('custbody_order_has_issues_reason');
                 //commented by Thilaga for ticket #4804
		     /*   if (hasIssues == null)
 	            {
				 purchaseOrder.setFieldValue('custbody_order_has_issues_reason',transpoertationIssues);
				 thisSalesOrder.setFieldValue('custbody_order_has_issues_reason',transpoertationIssues);
    	        } else
                {				   
		            hasIssues = hasIssues.concat(transpoertationIssues);
				    purchaseOrder.setFieldValues('custbody_order_has_issues_reason',hasIssues);
				    thisSalesOrder.setFieldValues('custbody_order_has_issues_reason',hasIssues);
                } 		*/		 
                purchaseOrder.setFieldValue('approvalstatus', defApproval);
              //commented by Thilaga for ticket #4804
		 //       purchaseOrder.setFieldValue('custbody_order_has_issues', 'T');
				//purchaseOrder.setFieldValue('custbody_order_issues', 'Sales Order Has Issues');
				//purchaseOrder.setFieldValue('custbody_order_has_issues_reason',transpoertationIssues);
		//		thisSalesOrder.setFieldValue('custbody_order_has_issues', 'T');
				//thisSalesOrder.setFieldValue('custbody_order_issues', 'Sales Order Has a Transporation Issue');
				//thisSalesOrder.setFieldValue('custbody_order_has_issues_reason',transpoertationIssues);
			}

			//
		}

		if (!isEmpty(mBaccessorialCost) && mBaccessorialCost > 0)
		{
			purchaseOrder.setFieldValue('approvalstatus', defApproval);
			itemToInsert = nlapiGetContext().getSetting('SCRIPT', 'custscript_fees_error_item'); //REMOVE COMMENT
			purchaseOrder.setLineItemValue('item', 'item', position, itemToInsert);
			purchaseOrder.setLineItemValue('item', 'quantityreceived', position, 1);
			purchaseOrder.setLineItemValue('item', 'rate', position, mBaccessorialCost);	
			purchaseOrder.setLineItemValue('item', 'custbody_product_description', position, "Member Accessorial Fees for Sales Order : " + salesOrderNumber);
			purchaseOrder.setLineItemValue('item', 'description', position, "Accessorial Fees for Sales Order : " + salesOrderNumber);
			purchaseOrder.setLineItemValue('item', 'amount', position, mBaccessorialCost);
			purchaseOrder.setLineItemValue('item','department',position, program);
			var description = "Member Accessorial Fees for Sales Order : " + thisSalesOrder.getFieldValue('tranid');
			thisSalesOrder.setFieldValue('custbody_accessorial_comments', description);
			position ++ ;				
		}	

		if (!isEmpty(vAaccessorialCost) && vAaccessorialCost > 0)
		{
			purchaseOrder.setFieldValue('approvalstatus', defApproval);
			itemToInsert = nlapiGetContext().getSetting('SCRIPT', 'custscript_vendor_accessorial'); //REMOVE COMMENT
			purchaseOrder.setLineItemValue('item', 'item', position, itemToInsert);
			purchaseOrder.setLineItemValue('item', 'quantityreceived', position, 1);
			purchaseOrder.setLineItemValue('item', 'rate', position, vAaccessorialCost);	
			purchaseOrder.setLineItemValue('item', 'custbody_product_description', position, "Vendor Accessorial Fees for Sales Order : " + salesOrderNumber);
			purchaseOrder.setLineItemValue('item', 'description', position, "Accessorial Fees for Sales Order : " + salesOrderNumber);
			purchaseOrder.setLineItemValue('item', 'amount', position, vAaccessorialCost);
			purchaseOrder.setLineItemValue('item','department',position, program);
			var description = "Vendor Accessorial Fees for Sales Order : " + thisSalesOrder.getFieldValue('tranid');
			thisSalesOrder.setFieldValue('custbody_accessorial_comments', description);
			position ++ ;				
		}	


        var accessorialFA = forceParseFloat(thisSalesOrder.getFieldValue('custbody_addl_freight_fa'));
		if (!isEmpty(accessorialFA) && accessorialFA > 0)
		{
			nlapiLogExecution('debug', 'Accessorial FA Cost inside if : ' + accessorialFA);
			purchaseOrder.setFieldValue('approvalstatus', defApproval);
			itemToInsert = nlapiGetContext().getSetting('SCRIPT', 'custscript_accessorial_eo'); //REMOVE COMMENT
			purchaseOrder.setLineItemValue('item', 'item', position, itemToInsert);
			purchaseOrder.setLineItemValue('item', 'quantityreceived', position, 1);
			purchaseOrder.setLineItemValue('item', 'rate', position, accessorialFA);	
			purchaseOrder.setLineItemValue('item', 'custbody_product_description', position, "Accessorial E&O for Sales Order : " + salesOrderNumber);
			purchaseOrder.setLineItemValue('item', 'description', position, "Accessorial E&O Fees for Sales Order : " + salesOrderNumber);
			purchaseOrder.setLineItemValue('item', 'amount', position, accessorialFA);
			purchaseOrder.setLineItemValue('item','department',position, program);
			position ++ ;				
		}	

      //Added by Thilaga to fix issue to set status=Pending Approval when accessorial cost actual is present
      var accessorialCostActual = (forceParseFloat(thisSalesOrder.getFieldValue('custbody_accessorial_cost_actual'))) ;
      if(!isEmpty(accessorialCostActual)&&(accessorialCostActual>0)){
         purchaseOrder.setFieldValue('approvalstatus', defApproval);
      }
      
//DEFAULTING EMPTY VALUES

		//var defaultApprovalStatus = nlapiGetContext().getSetting('SCRIPT', 'custscript_default_approval_status');
		//Purchase Order: Apprval Status: "Pending Approval" = 1
		//purchaseOrder.setFieldValue('approvalstatus', defaultApprovalStatus);

		if(isEmpty(purchaseOrder.getFieldValue('class')))
		{
			var defaultRestrictionClass = nlapiGetContext().getSetting('SCRIPT', 'custscript_def_restriction_class');
//				nlapiLogExecution('DEBUG', 'Setting default class');	
			//Purchase Order: Restriction Class "Total Unrestricted" = 1
			purchaseOrder.setFieldValue('class',defaultRestrictionClass);		
		}
		nlapiLogExecution('DEBUG', 'PO Id : ' + purchaseOrder.getId());
		purchaseOrder.setFieldValue('custbody_associated_transaction',thisSalesOrderID);
		var poId = nlapiSubmitRecord(purchaseOrder);
		nlapiLogExecution('DEBUG', 'PO Id : ' + purchaseOrder.getId());
//			thisSalesOrder.setFieldValue('otherrefnum', purchaseOrder.getId());	
		thisSalesOrder.setFieldValue('custbody_associated_transaction', poId);
		thisSalesOrder.setFieldValue('custbody_transporation_po_number', poId);
		thisSalesOrder.setFieldValue('custbody_freight_po_number', poId);
		nlapiSubmitRecord(thisSalesOrder);
	}catch(error){
		nlapiLogExecution('ERROR', 'Error', error);
	}
	nlapiLogExecution('DEBUG', '***END***');
}

function isEmpty(stValue) {   
	if ((stValue == '') || (stValue == null) || (typeof stValue == "undefined"))  
	{        
		return true;   
	}
	return false; 
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