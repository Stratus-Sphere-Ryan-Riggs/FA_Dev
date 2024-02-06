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
* @author Verónica Seoane & Pedro Barrios
* @version 1.0
* @event/Type: User Event After Submit on VB
*
* 09/28/2016 - Removed hard coded values for dept, class and location
* 09/28/2016 - Setting the Program based on the order type
* 12/29/2016 - Setup the Admin Fee Variance Fields
* 01/24/2017 - Build out the 3 Admin Fee Bills
* 02/16/2017 - For the Admin Fee Don't calculate the E&O
*/
function createOrUpdateVB(){


	try{
		nlapiLogExecution('DEBUG', '***START*** ');

	    ///////////////////
	    //  Get Values   //
	    //////////////////
	    var context = nlapiGetContext();
		
		var admin_fee          = context.getSetting('SCRIPT', 'custscript_admin_fee');	
		var item_by_parameter  = context.getSetting('SCRIPT', 'custscript_item_to_add_vb');
		var variance_threshold = context.getSetting('SCRIPT', 'custscript_variance_threshold');
		var adminFeeVar        = context.getSetting('SCRIPT', 'custscript_admin_fee_var');
		var err_omission       = context.getSetting('SCRIPT', 'custscript_error_omission_item');
		var produce_dept       = context.getSetting('SCRIPT', 'custscript_default_department');
		var default_dept       = context.getSetting('SCRIPT', 'custscript_default_department');
		var grocery_dept       = context.getSetting('SCRIPT', 'custscript_grocery_program_id');
		var default_class      = context.getSetting('SCRIPT', 'custscript_default_class');
		var default_location   = context.getSetting('SCRIPT', 'custscript_default_location');
		var grocery_order_type = context.getSetting('SCRIPT', 'custscript_grocery_order_type_id');


		var associated_transaction = nlapiGetFieldValue('custbody_associated_transaction');
		nlapiLogExecution('DEBUG', ' - 1 - associated_transaction ', associated_transaction);

		if(isEmpty(nlapiGetFieldValue('custbodycustbody_admin_fee_recipient')) &&
           isEmpty(nlapiGetFieldValue('custbody_admin_fee_recp_2')) &&
           isEmpty(nlapiGetFieldValue('custbody_admin_fee_recp_3')) 
		  )
		{
			var masterVB = nlapiLoadRecord('vendorbill', nlapiGetRecordId());
			if (isEmpty(masterVB.getFieldValue('custbody_finance_vendor')))//custbody_finance_vendor
			{
			  masterVB.setFieldValue('custbody_finance_vendor',masterVB.getFieldValue('entity'));
			}  
			if (isEmpty(masterVB.getFieldValue('tranid')))//custbody_finance_vendor
			{
			  masterVB.setFieldValue('tranid',masterVB.getFieldValue('transactionnumber'));
			}  
		    nlapiSubmitRecord(masterVB);
			return;
		} 
		var admin_fee_per_pound_rate = nlapiGetFieldValue('custbody_admin_fee_per_pound_rate');
		var EstimatedAdminFees       = nlapiGetFieldValue('custbody_admin_fee_for_rec1');
		var masterSalesOrder         = nlapiGetFieldValue('custbody_associated_salesorder');
		var masterSalesOrder_t       = nlapiGetFieldText('custbody_associated_salesorder');

		var admin_fee_per_pound_rate_2 = nlapiGetFieldValue('custbody_admin_fee_per_lb_rate_2');
		var EstimatedAdminFees_2       = nlapiGetFieldValue('custbody_admin_fee_for_rec2');

		var admin_fee_per_pound_rate_3 = nlapiGetFieldValue('custbody_admin_fee_per_lb_rate_3');
		var EstimatedAdminFees_3       = nlapiGetFieldValue('custbody_admin_fee_for_rec3');
		
		nlapiLogExecution('DEBUG', ' - 2 - admin_fee_per_pound_rate ', admin_fee_per_pound_rate);
		nlapiLogExecution('DEBUG', ' - 2 - admin_fee_per_pound_rate 2', admin_fee_per_pound_rate_2);
		nlapiLogExecution('DEBUG', ' - 2 - admin_fee_per_pound_rate 3', admin_fee_per_pound_rate_3);


		///////////////////////////////
	    //  Calculate the variance   // 
	    //////////////////////////////

		var pounds_of_IR   = 0;
		var pounds_of_IR_1 = 0;
		var pounds_of_IR_2 = 0;
		var pounds_of_IR_3 = 0;
		var countItems = nlapiGetLineItemCount('item'); 
		nlapiLogExecution('DEBUG', 'countItems', countItems);

		for(var i = 1; i <= countItems; i++)
		{
			var column_pounds = nlapiGetLineItemValue('item', 'custcol_total_pounds', i);
			var column_admin  = nlapiGetLineItemValue('item', 'custcol_admin_fee_vendor', i);
            if (isEmpty(column_pounds))
        	{
              column_pounds = 0;
            }
			nlapiLogExecution('DEBUG', ' - 5 - column_pounds ', column_pounds);
			nlapiLogExecution('DEBUG', ' - 5 - column_admin ', column_admin);
			if (column_admin == 'T')
		    {		
			  pounds_of_IR += parseFloat(column_pounds);
			}  
			if (column_admin == '1')
		    {		
			  pounds_of_IR_1 += parseFloat(column_pounds);
			}  
			if (column_admin == '2')
		    {		
			  pounds_of_IR_2 += parseFloat(column_pounds);
			}  
			if (column_admin == '3')
		    {		
			  pounds_of_IR_3 += parseFloat(column_pounds);
			}  
		}
	


		//////////////////////////////////////////
	    //  Calculate the Receipt Amount Fee    // 
	    /////////////////////////////////////////
	    var masterVB = nlapiLoadRecord('vendorbill', nlapiGetRecordId());
		var masterVBId = nlapiGetRecordId();
		if (isEmpty(masterVB.getFieldValue('tranid')))
		{
			  masterVB.setFieldValue('tranid',masterVB.getFieldValue('transactionnumber'));
			  nlapiSubmitRecord(masterVB);
		}  

        if (!isEmpty(nlapiGetFieldValue('custbodycustbody_admin_fee_recipient')))
	    {		
		   var receipt_amount_fee = parseFloat(pounds_of_IR_1)*parseFloat(admin_fee_per_pound_rate);
		   var variance = parseFloat(EstimatedAdminFees) - parseFloat(receipt_amount_fee);
		   var recipient = nlapiGetFieldValue('custbodycustbody_admin_fee_recipient');
		
		   if (nlapiGetFieldValue('custbody_order_type') == grocery_order_type)
		   {
			default_dept = grocery_dept;
           }			
		
		   if (isEmpty(nlapiGetFieldValue('custbody_admin_fee_bill_1')))
		   {	   
 			 nlapiLogExecution('DEBUG', ' In New');
		     var vendorBill = nlapiCreateRecord('vendorbill');
		   }	 
		   if (!isEmpty(nlapiGetFieldValue('custbody_admin_fee_bill_1')))
		   {	   
 			 nlapiLogExecution('DEBUG', ' In existing');
 		     var vendorBill = nlapiLoadRecord('vendorbill', nlapiGetFieldValue('custbody_admin_fee_bill_1'));
		   }
          //Added by Thilaga for Issue 6531
          if(vendorBill.getFieldValue('status')!='Paid In Full'){
		   vendorBill.setFieldValue('entity',recipient);
		   vendorBill.setFieldValue('custbody_finance_vendor',recipient);
		   vendorBill.setFieldValue('custbody_vendor_bill_type',admin_fee);
		   vendorBill.setFieldValue('custbody_order_type',nlapiGetFieldValue('custbody_order_type'));
		   vendorBill.setFieldValue('status', 'Pending Approval');
          vendorBill.setFieldValue('department', default_dept);
          vendorBill.setFieldValue('class', default_class);
          vendorBill.setFieldValue('location', default_location);
		   var accepted = context.getSetting('SCRIPT', 'custscript_accepted');	
		   vendorBill.setFieldValue('custbody_order_status', accepted);

		   //add Reciepted Fees Line
		   vendorBill.setLineItemValue('item', 'item', 1, item_by_parameter);
		   vendorBill.setLineItemValue('item', 'quantity', 1, pounds_of_IR_1);
		   vendorBill.setLineItemValue('item', 'rate', 1, admin_fee_per_pound_rate);
		   vendorBill.setLineItemValue('item', 'amount', 1, receipt_amount_fee);
//commented for ticket 5509
    	   //vendorBill.setFieldValue('custbody_total_bill_amount', nlapiFormatCurrency(receipt_amount_fee));

		   vendorBill.setLineItemValue('item', 'department',1, default_dept);
		   vendorBill.setLineItemValue('item', 'class',1, default_class);
		   vendorBill.setLineItemValue('item', 'location', 1, default_location);
          
		   //if(variance != 0){
		   // vendorBill.setLineItemValue('item', 'item', 2, err_omission);
		   //vendorBill.setLineItemValue('item', 'quantity', 2, 1);
		   //vendorBill.setLineItemValue('item', 'rate', 2, variance);
		   //vendorBill.setLineItemValue('item', 'amount', 2, variance);
		   //vendorBill.setLineItemValue('item', 'department',2, default_dept);
		   //vendorBill.setLineItemValue('item', 'class',2, default_class);
		   //vendorBill.setLineItemValue('item', 'location', 2, default_location);
		   //   }
   		   if((Math.abs(parseFloat(variance)) <= Math.abs(parseFloat(variance_threshold) ))|| (parseFloat(variance) == 0 )){
	  		  vendorBill.setFieldValue('custbody_order_has_issues', 'F');
			  vendorBill.setFieldValue('custbody_order_has_issues_reason', "");
		   }
		   
   		  if((Math.abs(parseFloat(variance)) > 0) && (Math.abs(parseFloat(variance)) > Math.abs(parseFloat(variance_threshold)))) {
		      var hasIssues = new Array;
	          hasIssues     = masterVB.getFieldValues('custbody_order_has_issues_reason');
			  nlapiLogExecution('DEBUG', ' Master SO + has Issues ', hasIssues);
              if (hasIssues == null)
		      {
		       hasIssues = adminFeeVar;
    	      } else
              {				   
		       hasIssues = hasIssues.concat(adminFeeVar);
              }				 

			  vendorBill.setFieldValue   ('custbody_order_has_issues', 'T');
			  vendorBill.setFieldValues ('custbody_order_has_issues_reason', [hasIssues]);
			  masterVB.setFieldValue    ('custbody_order_has_issues', 'T');
			  masterVB.setFieldValues   ('custbody_order_has_issues_reason', [hasIssues]);
			  var masterSO = masterVB.getFieldValue('custbody_associated_salesorder');
			  nlapiLogExecution('DEBUG', ' Master SO ', masterSO);
			  if (!isEmpty(masterSO))
			  {		
			    nlapiSubmitField('salesorder',masterSO,'custbody_order_has_issues', 'T');
			    nlapiSubmitField('salesorder',masterSO,'custbody_order_has_issues_reason', adminFeeVar);
			  }  
		    }

       	  vendorBill.setFieldValue('custbody_associated_salesorder',masterSalesOrder);
           nlapiLogExecution('DEBUG', ' masterVBId'+masterVBId);
          vendorBill.setFieldValue('custbody_associated_transaction',masterVBId);
		  var tranid = 'Admin Fee Bill 1 for ' + masterSalesOrder_t;
		  nlapiLogExecution('DEBUG', ' tranid ' + tranid);	
       	  vendorBill.setFieldValue('tranid',tranid);
		  try {
    	  var id_vb = nlapiSubmitRecord(vendorBill);
    	     //masterVB.setFieldValue('custbody_associated_transaction',id_vb);
            nlapiLogExecution('DEBUG', ' id_vb ' + id_vb);
    	     masterVB.setFieldValue('custbody_admin_fee_bill_1',id_vb);
             nlapiSubmitField('vendorbill', masterVBId, 'custbody_admin_fee_bill_1', id_vb);
          }
           catch(e)
          {
			 var stErrDetails = 'Error in creating allocation journal entry. Details: ' + e.toString();
		     nlapiLogExecution('DEBUG', ' - 99 - vendor bill creation' + stErrDetails);	
             //nlapiSubmitField('vendorcredit',stVBid,'custbody_svb_exceptions',stErrDetails);
           }
        }
		}  

       if (!isEmpty(nlapiGetFieldValue('custbody_admin_fee_recp_2')))
	    {		
		   var receipt_amount_fee = parseFloat(pounds_of_IR_2)*parseFloat(admin_fee_per_pound_rate_2);
		   var variance = parseFloat(EstimatedAdminFees_2) - parseFloat(receipt_amount_fee);
		   var recipient = nlapiGetFieldValue('custbody_admin_fee_recp_2');
		
		   if (nlapiGetFieldValue('custbody_order_type') == grocery_order_type)
		   {
			default_dept = grocery_dept;
           }			
		
		   if (isEmpty(nlapiGetFieldValue('custbody_admin_fee_bill_2')))
		   {	   
 			 nlapiLogExecution('DEBUG', ' In New');
		     var vendorBill = nlapiCreateRecord('vendorbill');
		   }	 
		   if (!isEmpty(nlapiGetFieldValue('custbody_admin_fee_bill_2')))
		   {	   
 			 nlapiLogExecution('DEBUG', ' In existing');
 		     var vendorBill = nlapiLoadRecord('vendorbill', nlapiGetFieldValue('custbody_admin_fee_bill_2'));
		   }
          if(vendorBill.getFieldValue('status')!='Paid In Full'){
		   vendorBill.setFieldValue('entity',recipient);
		   vendorBill.setFieldValue('custbody_finance_vendor',recipient);
		   vendorBill.setFieldValue('custbody_vendor_bill_type',admin_fee);
		   vendorBill.setFieldValue('status', 'Pending Approval');
          vendorBill.setFieldValue('department', default_dept);
          vendorBill.setFieldValue('class', default_class);
          vendorBill.setFieldValue('location', default_location);
		   var accepted = context.getSetting('SCRIPT', 'custscript_accepted');
		   vendorBill.setFieldValue('custbody_order_type',nlapiGetFieldValue('custbody_order_type'));
		   vendorBill.setFieldValue('custbody_order_status', accepted);

		   //add Reciepted Fees Line
		   vendorBill.setLineItemValue('item', 'item', 1, item_by_parameter);
		   vendorBill.setLineItemValue('item', 'quantity', 1, pounds_of_IR_2);
		   vendorBill.setLineItemValue('item', 'rate', 1, admin_fee_per_pound_rate);
		   vendorBill.setLineItemValue('item', 'amount', 1, receipt_amount_fee);
//commented for ticket 5509
    	 //  vendorBill.setFieldValue('custbody_total_bill_amount', nlapiFormatCurrency(receipt_amount_fee));

		   vendorBill.setLineItemValue('item', 'department',1, default_dept);
		   vendorBill.setLineItemValue('item', 'class',1, default_class);
		   vendorBill.setLineItemValue('item', 'location', 1, default_location);
		   //if(variance != 0){
			// vendorBill.setLineItemValue('item', 'item', 2, err_omission);
			// vendorBill.setLineItemValue('item', 'quantity', 2, 1);
			// vendorBill.setLineItemValue('item', 'rate', 2, variance);
			// vendorBill.setLineItemValue('item', 'amount', 2, variance);
			// vendorBill.setLineItemValue('item', 'department',2, default_dept);
			// vendorBill.setLineItemValue('item', 'class',2, default_class);
			// vendorBill.setLineItemValue('item', 'location', 2, default_location);
		   //}
   		   if((Math.abs(parseFloat(variance)) <= Math.abs(parseFloat(variance_threshold) ))|| (parseFloat(variance) == 0 )){
	  		  vendorBill.setFieldValue('custbody_order_has_issues', 'F');
			  vendorBill.setFieldValue('custbody_order_has_issues_reason', "");
		   }
		   
   		  if((Math.abs(parseFloat(variance)) > 0) && (Math.abs(parseFloat(variance)) > Math.abs(parseFloat(variance_threshold)))) {
		      var hasIssues = new Array;
	          hasIssues     = masterVB.getFieldValues('custbody_order_has_issues_reason');
			  nlapiLogExecution('DEBUG', ' Master SO + has Issues ', hasIssues);
              if (hasIssues == null)
		      {
		       hasIssues = adminFeeVar;
    	      } else
              {				   
		       hasIssues = hasIssues.concat(adminFeeVar);
              }				 

			  vendorBill.setFieldValue   ('custbody_order_has_issues', 'T');
			  vendorBill.setFieldValues ('custbody_order_has_issues_reason', [hasIssues]);
			  masterVB.setFieldValue    ('custbody_order_has_issues', 'T');
			  masterVB.setFieldValues   ('custbody_order_has_issues_reason', [hasIssues]);
			  var masterSO = masterVB.getFieldValue('custbody_associated_salesorder');
			  nlapiLogExecution('DEBUG', ' Master SO ', masterSO);
			  if (!isEmpty(masterSO))
			  {		
			    nlapiSubmitField('salesorder',masterSO,'custbody_order_has_issues', 'T');
			    nlapiSubmitField('salesorder',masterSO,'custbody_order_has_issues_reason', adminFeeVar);
			  }  
		    }

       	  vendorBill.setFieldValue('custbody_associated_salesorder',masterSalesOrder);
       	  vendorBill.setFieldValue('custbody_associated_transaction',masterVBId);
		  var tranid = 'Admin Fee Bill 2 for ' + masterSalesOrder_t;
       	  vendorBill.setFieldValue('tranid',tranid);

		  try {
    	  var id_vb = nlapiSubmitRecord(vendorBill);
    	     //masterVB.setFieldValue('custbody_associated_transaction',id_vb);
            nlapiSubmitField('vendorbill', masterVBId, 'custbody_admin_fee_bill_2', id_vb);
    	     masterVB.setFieldValue('custbody_admin_fee_bill_2',id_vb);
          }
           catch(e)
          {
			 var stErrDetails = 'Error in creating allocation journal entry. Details: ' + e.toString();
		     nlapiLogExecution('DEBUG', ' - 99 - vendor bill creation' + stErrDetails);	
             //nlapiSubmitField('vendorcredit',stVBid,'custbody_svb_exceptions',stErrDetails);
           }
        }
		}  
		
		
       if (!isEmpty(nlapiGetFieldValue('custbody_admin_fee_recp_3')))
	    {		
		   var receipt_amount_fee = parseFloat(pounds_of_IR_3)*parseFloat(admin_fee_per_pound_rate_3);
		   var variance = parseFloat(EstimatedAdminFees_3) - parseFloat(receipt_amount_fee);
		   var recipient = nlapiGetFieldValue('custbody_admin_fee_recp_3');
		
		   if (nlapiGetFieldValue('custbody_order_type') == grocery_order_type)
		   {
			default_dept = grocery_dept;
           }			
		
		   if (isEmpty(nlapiGetFieldValue('custbody_admin_fee_bill_3')))
		   {	   
 			 nlapiLogExecution('DEBUG', ' In New');
		     var vendorBill = nlapiCreateRecord('vendorbill');
		   }	 
		   if (!isEmpty(nlapiGetFieldValue('custbody_admin_fee_bill_3')))
		   {	   
 			 nlapiLogExecution('DEBUG', ' In existing');
 		     var vendorBill = nlapiLoadRecord('vendorbill', nlapiGetFieldValue('custbody_admin_fee_bill_3'));
		   }
          if(vendorBill.getFieldValue('status')!='Paid In Full'){
		   vendorBill.setFieldValue('entity',recipient);
		   vendorBill.setFieldValue('custbody_finance_vendor',recipient);
		   vendorBill.setFieldValue('custbody_vendor_bill_type',admin_fee);
		   vendorBill.setFieldValue('status', 'Pending Approval');
          vendorBill.setFieldValue('department', default_dept);
          vendorBill.setFieldValue('class', default_class);
          vendorBill.setFieldValue('location', default_location);
   		   vendorBill.setFieldValue('custbody_order_type',nlapiGetFieldValue('custbody_order_type'));
		   var accepted = context.getSetting('SCRIPT', 'custscript_accepted');	
		   vendorBill.setFieldValue('custbody_order_status', accepted);

		   //add Reciepted Fees Line
		   vendorBill.setLineItemValue('item', 'item', 1, item_by_parameter);
		   vendorBill.setLineItemValue('item', 'quantity', 1, pounds_of_IR_3);
		   vendorBill.setLineItemValue('item', 'rate', 1, admin_fee_per_pound_rate);
		   vendorBill.setLineItemValue('item', 'amount', 1, receipt_amount_fee);
//commented for ticket 5509
    	//   vendorBill.setFieldValue('custbody_total_bill_amount', nlapiFormatCurrency(receipt_amount_fee));

		   vendorBill.setLineItemValue('item', 'department',1, default_dept);
		   vendorBill.setLineItemValue('item', 'class',1, default_class);
		   vendorBill.setLineItemValue('item', 'location', 1, default_location);
		   //if(variance != 0){
			// vendorBill.setLineItemValue('item', 'item', 2, err_omission);
			 //vendorBill.setLineItemValue('item', 'quantity', 2, 1);
			 //vendorBill.setLineItemValue('item', 'rate', 2, variance);
			 //vendorBill.setLineItemValue('item', 'amount', 2, variance);
			 //vendorBill.setLineItemValue('item', 'department',2, default_dept);
			 //vendorBill.setLineItemValue('item', 'class',2, default_class);
			 //vendorBill.setLineItemValue('item', 'location', 2, default_location);
		   //}
   		   if((Math.abs(parseFloat(variance)) <= Math.abs(parseFloat(variance_threshold) ))|| (parseFloat(variance) == 0 )){
	  		  vendorBill.setFieldValue('custbody_order_has_issues', 'F');
			  vendorBill.setFieldValue('custbody_order_has_issues_reason', "");
		   }
		   
   		  if((Math.abs(parseFloat(variance)) > 0) && (Math.abs(parseFloat(variance)) > Math.abs(parseFloat(variance_threshold)))) {
		      var hasIssues = new Array;
	          hasIssues     = masterVB.getFieldValues('custbody_order_has_issues_reason');
			  nlapiLogExecution('DEBUG', ' Master SO + has Issues ', hasIssues);
              if (hasIssues == null)
		      {
		       hasIssues = adminFeeVar;
    	      } else
              {				   
		       hasIssues = hasIssues.concat(adminFeeVar);
              }				 

			  vendorBill.setFieldValue   ('custbody_order_has_issues', 'T');
			  vendorBill.setFieldValues ('custbody_order_has_issues_reason', [hasIssues]);
			  masterVB.setFieldValue    ('custbody_order_has_issues', 'T');
			  masterVB.setFieldValues   ('custbody_order_has_issues_reason', [hasIssues]);
			  var masterSO = masterVB.getFieldValue('custbody_associated_salesorder');
			  nlapiLogExecution('DEBUG', ' Master SO ', masterSO);
			  if (!isEmpty(masterSO))
			  {		
			    nlapiSubmitField('salesorder',masterSO,'custbody_order_has_issues', 'T');
			    nlapiSubmitField('salesorder',masterSO,'custbody_order_has_issues_reason', adminFeeVar);
			  }  
		    }

       	  vendorBill.setFieldValue('custbody_associated_salesorder',masterSalesOrder);
       	  vendorBill.setFieldValue('custbody_associated_transaction',masterVBId);
  		  var tranid = 'Admin Fee Bill 3 for ' + masterSalesOrder_t;
       	  vendorBill.setFieldValue('tranid',tranid);

		  try {
    	  var id_vb = nlapiSubmitRecord(vendorBill);
    	     //masterVB.setFieldValue('custbody_associated_transaction',id_vb);
            nlapiSubmitField('vendorbill', masterVBId, 'custbody_admin_fee_bill_3', id_vb);
    	     masterVB.setFieldValue('custbody_admin_fee_bill_3',id_vb);
          }
           catch(e)
          {
			 var stErrDetails = 'Error in creating allocation journal entry. Details: ' + e.toString();
		     nlapiLogExecution('DEBUG', ' - 99 - vendor bill creation' + stErrDetails);	
             //nlapiSubmitField('vendorcredit',stVBid,'custbody_svb_exceptions',stErrDetails);
           }
        }
		}  
		
		
    	masterVB.setFieldValue('custbody_associated_transaction',id_vb);
    	nlapiSubmitRecord(masterVB);
    	
    	nlapiLogExecution('DEBUG', ' - 10 - id_vb ', id_vb);

	    

	}catch(error){
		nlapiLogExecution('ERROR', 'Error', error);
	}

	nlapiLogExecution('DEBUG', '***END***');
} 



function isEmpty(stValue) {   
 if ((stValue == '') || (stValue == null) || (typeof stValue == "undefined"))  
   {        return true;   
   }    
   return false; 
}

