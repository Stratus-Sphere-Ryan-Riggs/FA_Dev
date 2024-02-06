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
	var donationEmail = cusRec.getFieldValue('custentity_fa_donation_email');
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

	else if (ordertype == 'Donation - Yellow' || ordertype == 'Donation - Maroon')
	{
		if((email!="") && (email != null) && (email != undefined)){
			   if(donationEmail!=null){
				   email = donationEmail;
			   }
			   else {
				   email = miscEmail;
			   }

		   }else{
			   if(donationEmail!=null){
				   email = donationEmail;
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
    else {
      if(type == 'create') {
        if(asso_sales_order) {
      		addPromoItems(nlapiLoadRecord('salesorder',asso_sales_order));
        }
      }
  	}
  // set vendor item name
  var count = nlapiGetLineItemCount('item');
   var amount=parseFloat('0');
   //added by Elizabeth for Task 8067
   if(ordertype != 'Donation - Maroon' && ordertype != 'Donation - Yellow'){
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
  }
    //added by Elizabeth for Task 8067
    else {
      for (var i = 1; i <= count; i++) {
              var currentItem = nlapiGetLineItemValue('item', 'item', i);
              if (currentItem == '4038' || currentItem == '4040' || currentItem == '7646') {
                  amount += parseFloat(nlapiGetLineItemValue('item', 'amount', i));
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
          var billHeaderMember = false;
          var members = [];
          for(var i=0;i<=countItems;i++){
            if(invRec.getLineItemText('item','custcol_product_channel',i)=='Donation'){
              if ((invRec.getLineItemValue('item','custcol_bill_to_member',i)=='T')){
              	 members.push(invRec.getLineItemValue('item','custcol_member_bank',i));
                 if (headerMem == invRec.getLineItemValue('item','custcol_member_bank',i)) {
                   billHeaderMember = true;
                 }
              }
            }
          }
          for(var i=1;i<=countItems;i++){
            if(invRec.getLineItemText('item','custcol_product_channel',i)=='Grocery' || invRec.getLineItemText('item','custcol_product_channel',i)=='Produce'){
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
                        //Updated below by Elizabeth for task 8060
                  	var soID = nlapiGetFieldValue('createdfrom');
                    var soRecord = nlapiLoadRecord('salesorder', soID);
                    var itemListLength = soRecord.getLineItemCount('item');
                      for (var i = 1; i <= itemListLength; i++) {
                        if(soRecord.getLineItemValue('item','item',i) == '8283') {
                        var freightSubAmountFromSO = soRecord.getLineItemValue('item','amount',i);
                    nlapiLogExecution('error', 'freightSubAmountFromSO', freightSubAmountFromSO);
                        }
                        if(soRecord.getLineItemValue('item','item',i) == '4038') {
                        var totalFreightAmountFromSO = soRecord.getLineItemValue('item','amount',i);
                    nlapiLogExecution('error', 'totalFreightAmountFromSO', totalFreightAmountFromSO);
                        }
                        if(soRecord.getLineItemValue('item','item',i) == '4148') {
                        var totalVenFreightAmountFromSO = soRecord.getLineItemValue('item','amount',i);
                    nlapiLogExecution('error', 'totalVenFreightAmountFromSO', totalVenFreightAmountFromSO);
                        }
                      }
                  if(soRecord.getFieldValue('custbody_shipping_method_code') == 2) {
                    var proRateFreightSubProportion = ((freightSubAmountFromSO/totalVenFreightAmountFromSO)*-1);
                    produceFrtSub = (parseFloat(produceVenFrtCost))*proRateFreightSubProportion;
                    nlapiLogExecution('error', 'produceFrtSubVen', parseFloat(produceFrtSub));
                  }
                  else{
                    var proRateFreightSubProportion = ((freightSubAmountFromSO/totalFreightAmountFromSO)*-1);
                    produceFrtSub = (parseFloat(transCost) + parseFloat(transFeeCost))*proRateFreightSubProportion;
                    nlapiLogExecution('error', 'produceFrtSubFA', produceFrtSub);
                  }
            }
          }
          nlapiLogExecution('debug', 'headerMemQty=', headerMemQty+' totalQty='+totalQty);
          //Added for ticket #6581 by Thilaga
          if(invRec.getFieldText('custbody_order_type')!='Grocery' && invRec.getFieldText('custbody_order_type')!='Produce'){
            //Updated below per Task 8067 transport is not prorated for donation bill to freight invoices so header member qty and total qty are set to 1
            //headerMemQty = totalQty;
            var memberCount = parseInt(getMemberCount(members));
            nlapiLogExecution('debug', 'memberCount', memberCount + ' ' + billHeaderMember);
            if(memberCount > 0) {
            if (billHeaderMember == true) {
            headerMemQty = parseInt(1);
            }
            else if (billHeaderMember == false) {
            headerMemQty = parseInt(0);
            }
            totalQty = memberCount;
            }
            else {
            headerMemQty = parseInt(1);
            totalQty = parseInt(1);
            }
          }
          var transPercentage = parseFloat(0);
          var proRateTransCost = parseFloat(0);
          var proRateTransFeeCost = parseFloat(0);
          var proRateFreightSub = parseFloat(0);
          var proRateProduceFreight = parseFloat(0);
          var accCost = parseFloat(0);
          nlapiLogExecution('debug', 'totalQty and headerMemQty', totalQty + ' ' + headerMemQty);
          if(totalQty>0){
            if(headerMemQty > 0) {
             transPercentage = parseFloat(headerMemQty/totalQty);
            }
            else {
             transPercentage = parseFloat(0);
            }
        	}
          nlapiLogExecution('debug', 'transPercentage', transPercentage);
          for(var i=1;i<=countItems;i++){
            if(invRec.getLineItemValue('item','item',i)=='4038'){
               proRateTransCost = transPercentage * invRec.getLineItemValue('item','rate',i);
              invRec.setLineItemValue('item','rate',i,nlapiFormatCurrency(proRateTransCost));
              nlapiLogExecution('debug', 'proRateTransCost', proRateTransCost);
            }
            if(invRec.getLineItemValue('item','item',i)=='9151'){
               proRateTransCost = transPercentage * invRec.getLineItemValue('item','rate',i);
              invRec.setLineItemValue('item','rate',i,nlapiFormatCurrency(proRateTransCost));
              nlapiLogExecution('debug', 'proRateTransCostDonation', proRateTransCost);
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
                  if(soRecord.getFieldValue('custbody_shipping_method_code') == 2) {
                    proRateFreightSub = (proRateProduceFreight*proRateFreightSubProportion);
                  }
                  else {
                    proRateFreightSub = ((proRateTransCost + proRateTransFeeCost + accCost)*proRateFreightSubProportion);
                  }
              		    invRec.setLineItemValue('item', 'rate', i, nlapiFormatCurrency(proRateFreightSub)*-1);
                    nlapiLogExecution('error', 'proRateFreightSub', proRateFreightSub);
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
              	'custscript_produce_freight_amt':produceFrtSub,
              	'custscript_member_count':memberCount,
              	'custscript_bill_header_member':billHeaderMember
            }

                    nlapiLogExecution('error', 'produceFrtSub2', produceFrtSub);
            KBS.scriptScheduler.schedule('customscript_sch_create_multipleinvoices', param, true);
            // nlapiScheduleScript('customscript_sch_create_multipleinvoices', 'customdeploy_sch_create_multipleinvoices', param);
        }
      if(type == 'edit' || type == 'create') {
			var invRec = nlapiLoadRecord('invoice',nlapiGetRecordId());
            nlapiLogExecution('debug', 'idInvoice in edit module', idInvoice);
            var invStatus = invRec.getFieldValue('statusRef');
            nlapiLogExecution('debug', 'invStatus', invStatus);
            if(invStatus != 'paidInFull') {
        if(type == 'edit' && context.getExecutionContext() == 'userinterface') {
        	var countItems = invRec.getLineItemCount('item');
        	for(var i=1;i<=countItems;i++){
              if(invRec.getLineItemValue('item','item', i) == '4045'){
                if(invRec.getLineItemValue('item', 'custcol_bill_to_member', i)=='F'){
                  if(invRec.getLineItemValue('item', 'rate', i)==0.00){
                    invRec.setLineItemValue('item', 'rate', i,parseFloat(invRec.getLineItemValue('item','custcol_adjusted_amount',i)));
                     invRec.setLineItemValue('item', 'amount', i,parseFloat(invRec.getLineItemValue('item','custcol_adjusted_amount',i)));
                  }
                }
              }
        	  //var invRecId = nlapiSubmitRecord(invRec);
            }
        }
        //var invRec = nlapiLoadRecord('invoice', nlapiGetRecordId());
        if(invRec.getFieldValue('custbody_order_type') == '1') {
        var totAmount = parseFloat(invRec.getFieldValue('total'));
        var countItems = invRec.getLineItemCount('item');
        var totAdjInvAmt = parseFloat(0);
        for(var i=1;i<=countItems;i++){
            if(invRec.getLineItemText('item','custcol_product_channel',i)=='Grocery'){
              totAdjInvAmt = totAdjInvAmt + parseFloat(invRec.getLineItemValue('item','custcol_adj_invoice_amount',i));
            }
            if(invRec.getLineItemText('item','custcol_product_channel',i) == ''){
              totAdjInvAmt = totAdjInvAmt + parseFloat(invRec.getLineItemValue('item','amount',i));
            }
            if(invRec.getLineItemValue('item','item', i) == '4045'){
              totAdjInvAmt = totAdjInvAmt + parseFloat(invRec.getLineItemValue('item','amount',i));
            }
          }
            nlapiLogExecution('DEBUG','totAmount', totAmount);
            nlapiLogExecution('DEBUG','totAdjInvAmt', totAdjInvAmt);
          if (totAmount !== totAdjInvAmt) {
            var eandoDiff = parseFloat(totAdjInvAmt - totAmount);
            nlapiLogExecution('DEBUG','totAmount', totAmount);
            nlapiLogExecution('DEBUG','totAdjInvAmt', totAdjInvAmt);
            nlapiLogExecution('DEBUG','eandoDiff', eandoDiff);
            if(Math.abs(nlapiFormatCurrency(eandoDiff)) > 0) {
              var findEOlineID = invRec.findLineItemValue('item','item','4149');
              if(findEOlineID != -1){
                var prevEOAmt = invRec.getLineItemValue('item','rate',findEOlineID);
            	nlapiLogExecution('DEBUG','prevEOAmt', prevEOAmt);
            	nlapiLogExecution('DEBUG','eandoDiff + prevEOAmt', (parseFloat(eandoDiff) + parseFloat(prevEOAmt)));
                invRec.selectLineItem('item',findEOlineID);
                invRec.setCurrentLineItemValue('item','rate',nlapiFormatCurrency(parseFloat(eandoDiff) + parseFloat(prevEOAmt)));
                invRec.setCurrentLineItemValue('item','amount',nlapiFormatCurrency(parseFloat(eandoDiff) + parseFloat(prevEOAmt)));
                invRec.commitLineItem('item');
              }
              else{
              invRec.selectNewLineItem('item');
              invRec.setCurrentLineItemValue('item','item','4149');
              invRec.setCurrentLineItemValue('item','quantity','1');
              invRec.setCurrentLineItemValue('item','rate',nlapiFormatCurrency(eandoDiff));
              invRec.commitLineItem('item');
              }
            }
          }
        	var invRecId = nlapiSubmitRecord(invRec);
          	nlapiLogExecution('debug', 'invRecId', invRecId);
        }
       }
      }
    }catch(e)
    {
        nlapiLogExecution('ERROR', 'error', e);
    }

}

function addPromoItems(sales_rec) {
  var promoCount = sales_rec.getLineItemCount('promotions');
    nlapiLogExecution('DEBUG','promoCount',promoCount);
  if(promoCount > 0) {
    var promoIds = [];
    for (var j = 1; j <= promoCount; j++) {
      var promo = sales_rec.getLineItemValue('promotions', 'promocode', j);
      var promoApplied = sales_rec.getLineItemValue('promotions','applicabilitystatus',j);
      var promoRate = sales_rec.getLineItemValue('promotions','discountrate',j);
      var allCustomers = nlapiLookupField('promotioncode', promo, 'ispublic');
  	  nlapiLogExecution('DEBUG', 'promoRate', promoRate + ' ' + allCustomers + ' ' + (promoRate.indexOf('%')));
      //if it is a percentage discount, then add the promo to the array of promos to be added to the secondary invoice. Flat discounts will be divided and added separately via script in the SCH Create Multiple Invoices Script
      if((promoApplied == 'APPLIED') && (promoRate.indexOf('%') >= 0) && (allCustomers == 'T')) {
      	promoIds.push(promo);
      }
    }
    nlapiLogExecution('DEBUG','promoIds',JSON.stringify(promoIds));
    /*try {
    promoIds.forEach(function(rec) {
      nlapiSelectNewLineItem('promotions');
      nlapiSetCurrentLineItemValue('promotions','promocode', parseInt(rec));
      nlapiCommitLineItem('promotions');
      nlapiSetFieldValue('automaticallyapplypromotions', 'T');
    });
    }
    catch(e){
    nlapiLogExecution('DEBUG','error',e);
    }*/
  }
}

function getMemberCount(members) {
  var memberArray = members.sort();
  memberArray = memberArray.filter(Number);
  nlapiLogExecution('DEBUG', 'memberArray', JSON.stringify(memberArray));
  nlapiLogExecution('DEBUG', 'memberArray.length', memberArray.length);
  if (memberArray.length > 0) {
  var memberCount = 1;
  }
  else {
  var memberCount = 0;
  }
  	for (var i = 0; i < memberArray.length; i++)
    {
      if(prevMember) {
        if (prevMember !== memberArray[i])
        {
          memberCount += 1;
        }
      }
      var prevMember = memberArray[i];
    }
  nlapiLogExecution('DEBUG', 'memberCount', memberCount);
  return(memberCount)
}

