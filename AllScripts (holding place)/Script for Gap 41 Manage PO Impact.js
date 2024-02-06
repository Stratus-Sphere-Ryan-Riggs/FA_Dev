  

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
* @event/Type: User Event Before Submit on Purchase Order
*/
function managePoImpact(type){


	try{
		
		nlapiLogExecution('DEBUG', '***START*** ');
		if(type == 'delete'){
		
			var oldRecord = nlapiGetOldRecord();

			var vbID =  oldRecord.getFieldValue('custbody_associated_transaction');
			
			nlapiLogExecution('DEBUG', ' - 1 - vbID ', vbID);
			if(isEmpty(vbID)){
				nlapiLogExecution('DEBUG', '***END*** ','Not exist vb');
				return;
			}
			var vendorBill = nlapiLoadRecord('vendorbill', vbID);
			vendorBill.setFieldValue('custbody_order_has_issues', 'T');
			nlapiSubmitRecord(vendorBill, true, true);
		}
		if(type == 'create'){
			nlapiLogExecution('DEBUG', '***START create*** ');
			var total_pounds_po = 0;
			var countITems = nlapiGetLineItemCount('item'); 
			nlapiLogExecution('DEBUG', 'countITems ', countITems);
			for(var i = 1; countITems && i <= countITems; i++){
				var total_pounds = nlapiGetLineItemValue('item', 'custcol_total_pounds_2',i);
				nlapiLogExecution('DEBUG', ' - 1 - total_pounds ', total_pounds);
				if(!isEmpty(total_pounds)){
					total_pounds_po +=  parseInt(total_pounds);
				}
			}
			nlapiLogExecution('DEBUG', ' - 2 - total_pounds_po ', total_pounds_po);
			var salesOrderID =  nlapiGetFieldValue('createdfrom');
			nlapiLogExecution('DEBUG', ' - 3 - salesOrderID ', salesOrderID);
			if(isEmpty(salesOrderID)){
				nlapiLogExecution('DEBUG', '***END*** ','Not exist SO');
				return;
			}
			var salesOrder = nlapiLoadRecord('salesorder', salesOrderID);
			var admin_fee_per_pound_rate = salesOrder.getFieldValue('custbody_admin_fee_per_pound_rate');
			var total_amount_so = parseInt(admin_fee_per_pound_rate) * parseInt(total_pounds_po);
			nlapiLogExecution('DEBUG', ' - 4 - total_amount_so ', total_amount_so);
			nlapiLogExecution('DEBUG', ' - 5 - admin_fee_per_pound_rate ', admin_fee_per_pound_rate);
			salesOrder.setFieldValue('custbody_admin_fees', total_amount_so);
			nlapiSubmitRecord(salesOrder, true, true);

		}



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
