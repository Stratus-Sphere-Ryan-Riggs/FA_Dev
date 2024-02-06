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
   var created_from = nlapiGetFieldValue('createdfrom');
   if(created_from!=null && created_from!=''){
      sales_rec=nlapiLoadRecord('salesorder',created_from);
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
    if(nlapiGetLineItemText('item','custcol_product_channel',i)=='Grocery'){
      var total_inv_amount = parseFloat(0);
      total_inv_amount = nlapiGetLineItemValue('item','quantity',i)*nlapiGetLineItemValue('item','custcol_adj_invoice_rate',i);
       nlapiSetLineItemValue('item','custcol_adj_invoice_amount',i,total_inv_amount);
       }
    nlapiSetLineItemValue('item','custcol_item_transport_cost',i,parseFloat('0'));
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

function afterSubmitSetTotalTransCost(type) {

   nlapiLogExecution('DEBUG','after submit','inside type= '+type);
  try
    {
         var context = nlapiGetContext();
      nlapiLogExecution('debug', 'Execution context', context.getExecutionContext());
        //if(type == "edit" || type == "create")
        if(type == "create" && nlapiGetFieldValue('createdfrom')!=null && nlapiGetFieldValue('createdfrom')!='')
        {
            var idInvoice = nlapiGetRecordId();
            nlapiLogExecution('debug', 'idInvoice', idInvoice);
			var invRec = nlapiLoadRecord('invoice',idInvoice);
			          
          var transCost = parseFloat(0);
          var transFeeCost = parseFloat(0);
          var produceFrtSub = parseFloat(0);
          var produceVenFrtCost = parseFloat(0);
          var countItems = invRec.getLineItemCount('item');
          var totalQty = parseInt(0);
          var headerMemQty = parseInt(0);
          var adjInvAmount = parseInt(0);
          var totalInvAmount = parseInt(0);
          var headerMem = invRec.getFieldValue('entity');
          for(var i=1;i<=countItems;i++){
            if(invRec.getLineItemText('item','custcol_product_channel',i)=='Grocery' || invRec.getLineItemText('item','custcol_product_channel',i)=='Produce' || invRec.getLineItemText('item','custcol_product_channel',i)=='Donation'){
              totalQty = totalQty + parseInt(invRec.getLineItemValue('item','custcol_original_order_qty',i));
              nlapiLogExecution('debug', 'headerMem=', headerMem+' line member='+invRec.getLineItemValue('item','custcol_member_bank',i));
              if((headerMem == invRec.getLineItemValue('item','custcol_member_bank',i))||(invRec.getLineItemValue('item','custcol_bill_to_member',i)=='F')){
                 headerMemQty = headerMemQty + parseInt(invRec.getLineItemValue('item','custcol_original_order_qty',i));
                 }
            }
            if(invRec.getLineItemValue('item','item',i)=='4038'){
              transCost = invRec.getLineItemValue('item','amount',i);
            }
            if(invRec.getLineItemValue('item','item',i)=='7646'){
              transFeeCost = invRec.getLineItemValue('item','amount',i);
            }
            if(invRec.getLineItemValue('item','item',i)=='4148'){
              produceVenFrtCost = invRec.getLineItemValue('item','amount',i);
            }
            
            //Added for produce freight subsidy ticket #7304
            if(invRec.getLineItemValue('item','item',i)=='8283'){
              produceFrtSub = parseFloat(transCost) + parseFloat(transFeeCost);
            }
          }
          nlapiLogExecution('debug', 'headerMemQty=', headerMemQty+' totalQty='+totalQty);
          //Added for ticket #6581 by Thilaga
          if(invRec.getFieldText('custbody_order_type')!='Grocery' && invRec.getFieldText('custbody_order_type')!='Produce'){
            headerMemQty = totalQty;
          }
          var transPercentage = parseFloat(0);
          var proRateTransCost = parseFloat(0);
          var proRateTransFeeCost = parseFloat(0);
          var proRateFreightSub = parseFloat(0);
          var proRateProduceFreight = parseFloat(0);
          var accCost = parseFloat(0);
          if(totalQty>0){
             transPercentage = parseFloat(headerMemQty/totalQty);
        	}
          nlapiLogExecution('debug', 'transPercentage', transPercentage);
          for(var i=1;i<=countItems;i++){
            if(invRec.getLineItemValue('item','item',i)=='4038'){
               proRateTransCost = transPercentage * invRec.getLineItemValue('item','rate',i);
              invRec.setLineItemValue('item','rate',i,nlapiFormatCurrency(proRateTransCost));
              nlapiLogExecution('debug', 'proRateTransCost', proRateTransCost);
            }
            if(invRec.getLineItemValue('item','item',i)=='7646'){
               proRateTransFeeCost = transPercentage * invRec.getLineItemValue('item','rate',i);
              invRec.setLineItemValue('item','rate',i,nlapiFormatCurrency(proRateTransFeeCost));
              nlapiLogExecution('debug', 'proRateTransFeeCost', proRateTransFeeCost);
            }
            
            //Added for produce freight subsidy ticket #7304
            if(invRec.getLineItemValue('item','item',i)=='4148'){
               proRateProduceFreight = transPercentage * invRec.getLineItemValue('item','rate',i);
              invRec.setLineItemValue('item','rate',i,nlapiFormatCurrency(proRateProduceFreight));
              nlapiLogExecution('debug', 'proRateProduceFreight', proRateProduceFreight);
            }
            
            if(invRec.getLineItemText('item','custcol_product_channel',i)=='Grocery' || invRec.getLineItemText('item','custcol_product_channel',i)=='Produce'){
              if((headerMem != invRec.getLineItemValue('item','custcol_member_bank',i)) && (invRec.getLineItemValue('item', 'custcol_bill_to_member', i)=='T')){
                invRec.setLineItemValue('item','custcol_adjusted_amount',i,invRec.getLineItemValue('item','rate',i));
                invRec.setLineItemValue('item','custcol_item_transport_cost',i,invRec.getLineItemValue('item','custcol_adj_invoice_rate',i));
                if(invRec.getLineItemText('item','custcol_product_channel',i)=='Produce'){
                  invRec.setLineItemValue('item','custcol_item_transport_cost',i,invRec.getLineItemValue('item','rate',i));
                }
                invRec.setLineItemValue('item','rate',i,parseFloat(0));
                			invRec.setLineItemValue('item','custcol_adj_invoice_rate',i,parseFloat(0));
                invRec.setLineItemValue('item','custcol_adj_invoice_amount',i,parseFloat(0));
              }else{
                	var quantity = invRec.getLineItemValue('item', 'quantity', i);
                  	var invRate = invRec.getLineItemValue('item', 'custcol_adj_invoice_rate', i);
            		adjInvAmount = adjInvAmount + parseFloat(quantity)*parseFloat(invRate);
                	totalInvAmount = totalInvAmount + parseFloat(quantity)*parseFloat(invRec.getLineItemValue('item', 'rate', i));
              }
            }
            if(invRec.getLineItemValue('item','item', i) == '4045'){
              if(invRec.getLineItemValue('item','custcol_member_bank',i)!=null && invRec.getLineItemValue('item','custcol_member_bank',i)!='' && headerMem != invRec.getLineItemValue('item','custcol_member_bank',i) && invRec.getLineItemValue('item', 'custcol_bill_to_member', i)=='T'){
                invRec.setLineItemValue('item','custcol_adjusted_amount',i,invRec.getLineItemValue('item','rate',i));
                invRec.setLineItemValue('item','custcol_item_transport_cost',i,invRec.getLineItemValue('item','custcol_adj_invoice_rate',i));
                invRec.setLineItemValue('item','rate',i,parseFloat(0));
                invRec.setLineItemValue('item','custcol_adj_invoice_rate',i,parseFloat(0));
                invRec.setLineItemValue('item','custcol_adj_invoice_amount',i,parseFloat(0));
              
              }else{
                adjInvAmount = adjInvAmount + parseFloat(invRec.getLineItemValue('item','amount', i));
                totalInvAmount = totalInvAmount + parseFloat(invRec.getLineItemValue('item','amount', i));
                accCost = parseFloat(invRec.getLineItemValue('item','amount', i));
            	}
          	}
            nlapiLogExecution('debug', 'accCost', accCost);
            //Added for Produce vendor freight ticket #7304
            if(invRec.getLineItemValue('item','item',i)=='8283'){
               proRateFreightSub = proRateTransCost + proRateTransFeeCost + accCost;
              		    invRec.setLineItemValue('item','rate',i,nlapiFormatCurrency(proRateFreightSub)*-1);
              nlapiLogExecution('debug', 'proRateFreightSub', proRateFreightSub);
            }
          }
          if(invRec.getFieldText('custbody_order_type')=='Grocery'){
          invRec.setFieldValue('custbody_total_adj_inv_amount',adjInvAmount);
        	var totalTransFees = parseFloat(totalInvAmount) + parseFloat(nlapiFormatCurrency(proRateTransCost)) + parseFloat(nlapiFormatCurrency(proRateTransFeeCost)) ;
          nlapiLogExecution('debug', 'adjInvAmount=', adjInvAmount+'   totalTransFees='+totalTransFees);
        	var roundingEOAmt = adjInvAmount-nlapiFormatCurrency(totalTransFees);
          nlapiLogExecution('debug', 'transCost=', transCost+'   transFeeCost='+transFeeCost);
          if((parseFloat(roundingEOAmt))!=0.00){
                  nlapiLogExecution('DEBUG','inside rounding else','add new line item'+roundingEOAmt);
                 	invRec.selectNewLineItem('item');
        			invRec.setCurrentLineItemValue('item','item','4149');
        			invRec.setCurrentLineItemValue('item','quantity','1');
        			invRec.setCurrentLineItemValue('item','rate',nlapiFormatCurrency(roundingEOAmt));
        			invRec.commitLineItem('item');
                 }
          }
          if(invRec.getFieldText('custbody_order_type')=='Produce'){
            var totalTransFees = parseFloat(nlapiFormatCurrency(proRateTransCost)) + parseFloat(nlapiFormatCurrency(proRateTransFeeCost)) ;
            invRec.setFieldValue('custbody_ttl_transporation_fees', totalTransFees);
          }
          var invRecId = nlapiSubmitRecord(invRec);
          nlapiLogExecution('debug', 'invRecId', invRecId);
           var param = 
            {
                'custscript_idinvoice' : idInvoice,
              	'custscript_transport_cost' :transCost,
              	'custscript_trans_fee_cost' :transFeeCost,
              	'custscript_vendor_frt_cost' : produceVenFrtCost,  
              	'custscript_produce_freight_amt':produceFrtSub
            }
            
            nlapiScheduleScript('customscript_sch_create_multipleinvoices', 'customdeploy_sch_create_multipleinvoices', param);
        }
      if(type == 'edit' && context.getExecutionContext() == 'userinterface' ){
        	var idInvoice = nlapiGetRecordId();
            nlapiLogExecution('debug', 'idInvoice in edit module', idInvoice);
			var invRec = nlapiLoadRecord('invoice',idInvoice);
        	var countItems = invRec.getLineItemCount('item');
        	var totDeliveredPrice = parseFloat(0);
        	var totInvPrice = parseFloat(0);
        	var updateFlag = false;
        	for(var i=1;i<=countItems;i++){
              if(invRec.getLineItemText('item','custcol_product_channel',i)=='Grocery'){
                totDeliveredPrice = totDeliveredPrice + parseFloat(invRec.getLineItemValue('item','custcol_adj_invoice_amount',i));
              }
              if(invRec.getLineItemValue('item','item', i) == '4045'){
               // nlapiLogExecution('debug', 'bill to for accessorial', invRec.getLineItemValue('item', 'custcol_bill_to_member', i));
                //nlapiLogExecution('debug', 'accessorial rate', invRec.getLineItemValue('item', 'rate', i)+' Rate to copy='+invRec.getLineItemValue('item','custcol_adjusted_amount',i));
                if(invRec.getLineItemValue('item', 'custcol_bill_to_member', i)=='F'){
                  if(invRec.getLineItemValue('item', 'rate', i)==0.00){
                    invRec.setLineItemValue('item', 'rate', i,parseFloat(invRec.getLineItemValue('item','custcol_adjusted_amount',i)));
                     invRec.setLineItemValue('item', 'amount', i,parseFloat(invRec.getLineItemValue('item','custcol_adjusted_amount',i)));
                    updateFlag = true;
                  }
                }
                //nlapiLogExecution('debug', 'accessorial rate after setting', invRec.getLineItemValue('item', 'rate', i)+' amount='+invRec.getLineItemValue('item','amount',i));
                totDeliveredPrice = totDeliveredPrice + parseFloat(invRec.getLineItemValue('item','amount',i));
              }
              if(invRec.getLineItemValue('item','item', i) != '4149'){
              	totInvPrice = totInvPrice + parseFloat(invRec.getLineItemValue('item','amount',i));
              }
            }
         nlapiLogExecution('debug', 'totDeliveredPrice', totDeliveredPrice);
        nlapiLogExecution('debug', 'totInvPrice', totInvPrice);
        var roundingEOAmt = totDeliveredPrice-totInvPrice;
        nlapiLogExecution('debug', 'roundingEOAmt', roundingEOAmt);
        var roundingEOlineID = invRec.findLineItemValue('item','item','4149');
       // var existingRoundingEO = invRec.getLineItemValue('item','rate',roundingEOlineID);
        
        nlapiLogExecution('debug', 'roundingEOlineID', roundingEOlineID);
        if(roundingEOAmt!=0.00 && invRec.getLineItemText('item','custcol_product_channel',i)=='Grocery'){
        	if(roundingEOlineID!=-1){
          		var existingRoundingEO = invRec.getLineItemValue('item','rate',roundingEOlineID);
          	if(parseFloat(existingRoundingEO)!=nlapiFormatCurrency(roundingEOAmt)){
            	updateFlag = true;
          	}
          
        	}else{
          		updateFlag = true;
        	}
        }
        nlapiLogExecution('debug', 'updateFlag', updateFlag);
        if(updateFlag){
        	if(roundingEOlineID!=-1){
          				 invRec.setLineItemValue('item','rate',roundingEOlineID,nlapiFormatCurrency(roundingEOAmt));
        	}else{
          		nlapiLogExecution('DEBUG','inside rounding else','add new line item'+roundingEOAmt);
                invRec.selectNewLineItem('item');
        		invRec.setCurrentLineItemValue('item','item','4149');
        		invRec.setCurrentLineItemValue('item','quantity','1');
        		invRec.setCurrentLineItemValue('item','rate',nlapiFormatCurrency(roundingEOAmt));
        		invRec.commitLineItem('item');
        	}
        
        	var invRecId = nlapiSubmitRecord(invRec);
          	nlapiLogExecution('debug', 'invRecId', invRecId);
        }
      }
    }catch(e)
    {
        nlapiLogExecution('ERROR', 'error', e);
    }
    
}

