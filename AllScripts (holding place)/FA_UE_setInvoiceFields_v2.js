nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Oct 2016     tshanmugam
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){
 
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function beforeSubmitSetTransactionEmail(type){
	
	nlapiLogExecution('DEBUG','beforeSubmitSetTransactionEmail','|------------SCRIPT STARTED------------||');
    if(type!='create' && type!='edit' )
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','type= ' + type);
        return;
    }
	
   var context = nlapiGetContext();
  var mem_passthru_item = context.getSetting('SCRIPT','custscript_member_passthru_item');
  var mem_passthru_account = context.getSetting('SCRIPT','custscript_member_passthru_acct');
	var email = nlapiGetFieldValue('email');
	var ordertype   = nlapiGetFieldText('custbody_order_type');
	var customer = nlapiGetFieldValue('entity');
	nlapiLogExecution('DEBUG','Existing value in email field',email);
	nlapiLogExecution('DEBUG','Order Type',ordertype);
	
	var cusRec = nlapiLoadRecord('customer',customer);
	var groceryEmail = cusRec.getFieldValue('custentity_fa_grocery_contact');
	var produceEmail = cusRec.getFieldValue('custentity_fa_produce_email');
	var miscEmail = cusRec.getFieldValue('custentity_fa_miscellaneous_contact_emai');
	if (ordertype == 'Produce')
	{ 	
			   if((email!="") && (email != null) && (email != undefined)){
				   if(produceEmail!=null){
					   email = produceEmail;
				   }
				   else {
					   email = miscEmail;
				   }
				   
			   }else{
				   if(produceEmail!=null){
					   email = produceEmail;
				   }
				   else {
					   email = miscEmail;
				   }
			   }
	}		

	else if (ordertype == 'Grocery') 
	{ 	
		if((email!="") && (email != null) && (email != undefined)){
			   if(groceryEmail!=null){
				   email = groceryEmail;
			   }
			   else {
				   email = miscEmail;
			   }
			   
		   }else{
			   if(groceryEmail!=null){
				   email = groceryEmail;
			   }
			   else {
				   email = miscEmail;
			   }
		   }
	}		

	else 
	{ 	
		if((email!="") && (email != null) && (email != undefined)){
			  
				   email = miscEmail;
			   }
			   
		   else{
			   
				   email = miscEmail;
			   }
	}
			

	

	var id = nlapiSetFieldValue('email',email);
    nlapiLogExecution('DEBUG','Email ' + email);
	//set bill to and ship to address
  var address = cusRec.getFieldValue('defaultaddress');
  nlapiLogExecution('DEBUG','Ship To address ' + address);
  nlapiSetFieldValue('billaddress',address);
  nlapiSetFieldValue('shipaddress',address);
  
  var asso_sales_order = nlapiGetFieldValue('custbody_associated_salesorder');
  var sales_rec;
  if(asso_sales_order!=null && asso_sales_order!=''){
      sales_rec=nlapiLoadRecord('salesorder',asso_sales_order);
    }
  // set vendor item name
  var count = nlapiGetLineItemCount('item');
   var amount=parseFloat('0');
  for(var i=1;i<=count;i++){
   
    var disItem = nlapiGetLineItemValue('item','item',i);
    var secDisItem = nlapiGetLineItemValue('item','custcol_secondary_invoice_item',i);
    var disItemName = "";
    if(secDisItem!=null && secDisItem!=""){
      disItemName = nlapiLookupField('item',secDisItem,'displayname');
    }else{
   		 disItemName = nlapiLookupField('item',disItem,'displayname');
    }
    var itemName = nlapiLookupField('item',disItem,'itemid');
   
    nlapiLogExecution('DEBUG','Item display name: Item name:' + disItemName+":"+itemName," item:"+nlapiGetLineItemValue('item','item',i));
    if(disItemName!=null && disItemName!=""){
      nlapiSetLineItemValue('item','custcol_mem_item_name',i,disItemName);
    }else{
      nlapiSetLineItemValue('item','custcol_mem_item_name',i,itemName);
      if(itemName=="Transportation Item" || itemName=="Transport Fee Item" || itemName=="Transport Fees Item"){
        amount=amount+parseFloat(nlapiGetLineItemValue('item','amount',i));
     }
    }
    var magRef = nlapiGetLineItemValue('item','custcol_mag_ref_no',i);
    if(sales_rec!=null && sales_rec!='' && magRef!=null && magRef!=''){
      var lineNum = sales_rec.findLineItemValue('item','custcol_mag_ref_no',magRef);
      var orderQty = sales_rec.getLineItemValue('item','quantity',lineNum);
      if(nlapiGetLineItemValue('item','custcol_original_order_qty',i)==null || nlapiGetLineItemValue('item','custcol_original_order_qty',i)==''){
      nlapiSetLineItemValue('item','custcol_original_order_qty',i,orderQty);
      }
    }
    
   }
	//set transport cost total
  nlapiLogExecution('DEBUG','Amount',amount);
 nlapiSetFieldValue('custbody_ttl_transporation_fees', amount);
  
  // to set invoice account for member pass-thru item
  var memPassItem = nlapiFindLineItemValue('item','item',mem_passthru_item);
  nlapiLogExecution('DEBUG','memPassItem',memPassItem);
  if(memPassItem!=-1){
    nlapiSetFieldValue('account',mem_passthru_account);
  }
  
    return true;
	
    
}

function afterSubmitSetTotalTransCost() {

   nlapiLogExecution('DEBUG','after submit','inside');
    
}