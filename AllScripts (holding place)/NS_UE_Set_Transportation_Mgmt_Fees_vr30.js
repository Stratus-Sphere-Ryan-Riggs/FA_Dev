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
*  Purpose:  Add the transporation Fee and 3% management fee to grocery, produce or donation orders where FANO arranged transportation
* 10/06/2016 - Add Pound and freight calculation
* 12/05/2016 - Add in the transporation cost field calculations
* 12/07/2016 - Calculate all the additional transporation fields
* 12/07/2016 - Set Storage requirements and Temp Handling 
* 02/15/2017 - Calculate the item transport cost as (((total transport fees + 3% Fee)/total quantity)*quantity per line) 
* 03/09/2017 - Set the Storage requirements
* 03/10/2017 - If a Yellow or Maroon donation and the bill to is Member - Member Freight Amount to the Actual Freight Amount -
* 03/12/2017 - If the accessorial member fee and bill to member are set - update the sales order with the accessorial cost
* 04/12/2017 - On the grocery/produce po calculate a per item transport rate
*/
function aftersubmit_addfees(stType)
{

	   var transport_item      = nlapiGetContext().getSetting('SCRIPT', 'custscript_so_transport_item');
	   var admin_item          = nlapiGetContext().getSetting('SCRIPT', 'custscript_so_adminfee_item');//custscript_admin_product_channel
	   var adminChannel        = nlapiGetContext().getSetting('SCRIPT', 'custscript_admin_product_channel');
	   var accessorialFeeItem  = nlapiGetContext().getSetting('SCRIPT', 'custscript_member_accessorial_fee');

      if(stType!='edit' && stType!='create')
      {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        return;
      }
	  
      var context = nlapiGetContext();
	  var stOrderTypeToProcess = context.getSetting('SCRIPT', 'custscript_transport_so_order_type');
	  var stDonationOrderType  = context.getSetting('SCRIPT', 'custscript_donation_order_types');
	  var stOrderShipType      = context.getSetting('SCRIPT', 'custscript_transport_so_ship_type');
	  var defaultClass         = context.getSetting('SCRIPT', 'custscript_transport_so_class');
	  var defaultDepartment    = context.getSetting('SCRIPT', 'custscript_transport_so_dept');
	  var defaultLocation      = context.getSetting('SCRIPT', 'custscript_transport_so_location');
	  var paramcarriertype     = context.getSetting('SCRIPT', 'custscript_transport_so_carrier_type');
	  var grocery              = context.getSetting('SCRIPT', 'custscript_transport_so_grocery');
	  var produce              = context.getSetting('SCRIPT', 'custscript_transport_so_produce');
	  var produceprogram       = context.getSetting('SCRIPT', 'custscript_transport_so_produce_program');
	  var ARR_ORDER_TYPES      = [];
	  ARR_ORDER_TYPES          = stOrderTypeToProcess.split(',');
      var orderType            = nlapiGetFieldValue('custbody_order_type'); //custbody_carrier_code _CARRIER_type
      var carrierType          = nlapiGetFieldValue('custbody_carrier_type'); 
	  var ARR_SHIP_TYPES       = [];
	  ARR_SHIP_TYPES           = stOrderShipType.split(',');
	  var ARR_DONATION_ORDER_TYPES = [];
	  ARR_DONATION_ORDER_TYPES = stDonationOrderType.split(',');

      //nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stOrderTypeToProcess + ' ' + defaultClass + ' ' + defaultDepartment );
     // nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + defaultLocation + ' ' + paramcarriertype);
      //do not process if not one of the order types
      if (!Eval.inArray(orderType, ARR_ORDER_TYPES)) {
        return true;
     }


	  //1 check order type, ship method, fa arranged and the estimated and actual order types custbody_order_type custbody_shipping_method_code custbody_bill_to_freight custbody_benchmark_freight_cost custbody_actual_freight_cost
	  //2 if present add transport and misc fee
	  //3 Add in update of the amount and set the dept class, location on first line items
	  //parameters - order types, FANO and ship method
	  
	  var recTrans    = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());

	  var foundTransport     = nlapiFindLineItemValue('item', 'item', transport_item);
	  var foundAdmin         = nlapiFindLineItemValue('item', 'item', admin_item);
	  var foundAccessorial   = nlapiFindLineItemValue('item', 'item', accessorialFeeItem);
	  var estFreight         = forceParseFloat(recTrans.getFieldValue('custbody_benchmark_line_hall_cost'));
	  var estFreight_sur     = forceParseFloat(recTrans.getFieldValue('custbody_benchmark_fuel_sur'));
	  var actFreight         = forceParseFloat(recTrans.getFieldValue('custbody_linehaul_cost_actual')); //subtotal
	  var actFreight_sur     = forceParseFloat(recTrans.getFieldValue('custbody_fuel_sur_cost_actual')); //subtotal
	  var accessorial_cost   = forceParseFloat(recTrans.getFieldValue('custbody_accessorial_cost_actual')); //subtotal
	  var orderTotal         = forceParseFloat(recTrans.getFieldValue('subtotal')); //subtotal
	  var orderType          = recTrans.getFieldValue('custbody_order_type'); //custbody_carrier_code _CARRIER_type
	  var shippingMethod     = recTrans.getFieldValue('custbody_shipping_method_code');
	  var billToFreight      =  recTrans.getFieldValue('custbody_bill_to_freight');	
	  var paramBillToFreight = nlapiGetContext().getSetting('SCRIPT', 'custscript_transport_so_bill_to_freight');
	  var totalcost          = parseFloat('0');
	  var totalTransportCost = parseFloat('0');
	  
      nlapiLogExecution('DEBUG','Member Cost ','stType= ' + billToFreight + ' ' + paramBillToFreight + ' ' + ARR_DONATION_ORDER_TYPES);
      if (billToFreight != paramBillToFreight && Eval.inArray(orderType, ARR_DONATION_ORDER_TYPES)) {
          nlapiLogExecution('DEBUG','IN SET Member Cost ','stType= ' + billToFreight + ' ' + paramBillToFreight + ' ' + ARR_DONATION_ORDER_TYPES);
		  var memberFreight = parseFloat((actFreight + actFreight_sur));
		  recTrans.setFieldValue('custbodycustbody_member_frt_amount',nlapiFormatCurrency(memberFreight));

      }

			
	   if(billToFreight != paramBillToFreight){
	       if (orderType == grocery)
	       {		 
	         var grocerycost = parseFloat((estFreight + estFreight_sur));
			 totalTransportCost = grocerycost; 
   		     totalcost   = parseFloat(grocerycost + accessorial_cost);
		    recTrans.setFieldValue('custbodycustbody_member_frt_amount',nlapiFormatCurrency(totalcost));
		   }
		   
   		   if (orderType == produce)
	       {		 
    	    var producecost = parseFloat((actFreight + actFreight_sur));
			totalTransportCost = producecost; 
   		    totalcost   = parseFloat(producecost + accessorial_cost);
		    recTrans.setFieldValue('custbodycustbody_member_frt_amount',nlapiFormatCurrency(totalcost));
           }
		    recTrans.setFieldValue('custbodycustbody_totalfrt_with_fees',nlapiFormatCurrency('0'));
		    recTrans.setFieldValue('custbodycustbody_fa_freight_amount',nlapiFormatCurrency('0'));
		    recTrans.setFieldValue('custbody_trans_fees',nlapiFormatCurrency('0'));
		    recTrans.setFieldValue('custbody_total_freight_cost',nlapiFormatCurrency('0'));
		}
		
	    //if (!Eval.inArray(shippingMethod, ARR_SHIP_TYPES)) {
        //    return true;
		//}
		
      //recTrans.setFieldValue('custbodycustbody_member_frt_amount',nlapiFormatCurrency('0'));
 	
	  if (foundAdmin == '-1' && billToFreight == paramBillToFreight && Eval.inArray(shippingMethod, ARR_SHIP_TYPES)) //Add the Transport Item
	   {

	     if (orderType == grocery)
	     {		 
	       var grocerycost = parseFloat((estFreight + estFreight_sur));
		   totalTransportCost = grocerycost; 

   		   totalcost   = parseFloat(grocerycost + accessorial_cost);

	       recTrans.selectNewLineItem('item');
           recTrans.setCurrentLineItemValue('item','item',admin_item); 
           recTrans.setCurrentLineItemValue('item','quantity','1'); 
           recTrans.setCurrentLineItemValue('item','location',  defaultLocation); 
           recTrans.setCurrentLineItemValue('item','class',     defaultClass); 
           recTrans.setCurrentLineItemValue('item','rate',grocerycost); 
		   recTrans.setCurrentLineItemValue('item','amount',nlapiFormatCurrency(grocerycost));
           recTrans.setCurrentLineItemValue('item','department',defaultDepartment); 
           recTrans.setCurrentLineItemValue('item','custcol_transport_item','T'); 
           recTrans.commitLineItem('item');
   		   recTrans.setFieldValue('custbody_total_freight_cost',nlapiFormatCurrency(totalcost));
   		   recTrans.setFieldValue('custbodycustbody_totalfrt_with_fees',nlapiFormatCurrency(totalcost));
 		   recTrans.setFieldValue('custbodycustbody_fa_freight_amount',nlapiFormatCurrency(grocerycost));

		 }

		 if (orderType == produce)
	     {		 
    	    var producecost = parseFloat((actFreight + actFreight_sur));
 		    totalTransportCost = producecost; 
  		    totalcost   = parseFloat(producecost + accessorial_cost);

		   recTrans.selectNewLineItem('item');
           recTrans.setCurrentLineItemValue('item','item',admin_item); 
           recTrans.setCurrentLineItemValue('item','quantity','1'); 
           recTrans.setCurrentLineItemValue('item','location',  defaultLocation); 
           recTrans.setCurrentLineItemValue('item','class',     defaultClass); 
           recTrans.setCurrentLineItemValue('item','rate',producecost); 
		   recTrans.setCurrentLineItemValue('item','amount',nlapiFormatCurrency(producecost));
           recTrans.setCurrentLineItemValue('item','department',produceprogram); 
           recTrans.setCurrentLineItemValue('item','custcol_transport_item','T'); 
           recTrans.commitLineItem('item');
   		   recTrans.setFieldValue('custbody_total_freight_cost',nlapiFormatCurrency(totalcost));
   		   recTrans.setFieldValue('custbodycustbody_totalfrt_with_fees',nlapiFormatCurrency(totalcost));
   		   recTrans.setFieldValue('custbodycustbody_fa_freight_amount',nlapiFormatCurrency(producecost));

		 }
	

	
	  } 

	  
	  if (foundAdmin != '-1' && billToFreight == paramBillToFreight && Eval.inArray(shippingMethod, ARR_SHIP_TYPES)) //Add the Transport Item
      {
		 if (orderType == grocery)
	     {		 
		   var grocerycost = parseFloat((estFreight + estFreight_sur));
 		   totalTransportCost = grocerycost; 
		   totalcost   = parseFloat(grocerycost + accessorial_cost);
  
	       recTrans.setLineItemValue('item','rate',foundAdmin,grocerycost); 
		   recTrans.setLineItemValue('item','amount',foundAdmin,nlapiFormatCurrency(grocerycost));
		   recTrans.setFieldValue('custbody_total_freight_cost',nlapiFormatCurrency(totalcost));
   		   recTrans.setFieldValue('custbodycustbody_totalfrt_with_fees',nlapiFormatCurrency(totalcost));
   		   recTrans.setFieldValue('custbodycustbody_fa_freight_amount',nlapiFormatCurrency(grocerycost));


		 }

		 if (orderType == produce)
	     {		 
     	   var producecost = parseFloat((actFreight + actFreight_sur));
 		   totalTransportCost = producecost; 
   		   totalcost   = parseFloat(producecost + accessorial_cost);

           recTrans.setLineItemValue('item','rate',foundAdmin,producecost); 
		   recTrans.setLineItemValue('item','amount',foundAdmin,nlapiFormatCurrency(producecost));
		   recTrans.setFieldValue('custbody_total_freight_cost',nlapiFormatCurrency(totalcost));
		   recTrans.setFieldValue('custbodycustbody_totalfrt_with_fees',nlapiFormatCurrency(totalcost));
   		   recTrans.setFieldValue('custbodycustbody_fa_freight_amount',nlapiFormatCurrency(producecost));

		 }

	  } 	   

      nlapiLogExecution('DEBUG','Befoore 3% Fee ','stType= ' + paramcarriertype + ' ' + carrierType + ' ' + foundTransport + ' ' + shippingMethod);

	  if (paramcarriertype == carrierType && foundTransport == '-1' && billToFreight == paramBillToFreight && (Eval.inArray(shippingMethod, ARR_SHIP_TYPES))) //Add the Transport Item
	  {

	     if (orderType == grocery)
	     {		 
	       var grocerycost = parseFloat((estFreight + estFreight_sur) * .03);
		   grocerycost = Math.round(grocerycost * 100)/100;
  		   totalTransportCost = totalTransportCost + grocerycost;
	       recTrans.selectNewLineItem('item');
           recTrans.setCurrentLineItemValue('item','item',transport_item); 
           recTrans.setCurrentLineItemValue('item','quantity','1'); 
           recTrans.setCurrentLineItemValue('item','location',  defaultLocation); 
           recTrans.setCurrentLineItemValue('item','class',     defaultClass); 
           recTrans.setCurrentLineItemValue('item','rate',grocerycost); 
		   recTrans.setCurrentLineItemValue('item','amount',nlapiFormatCurrency(grocerycost));
           recTrans.setCurrentLineItemValue('item','department',defaultDepartment); 
           recTrans.setCurrentLineItemValue('item','custcol_transport_item','T'); 
           recTrans.commitLineItem('item');
		   recTrans.setFieldValue('custbody_trans_fees',nlapiFormatCurrency(grocerycost));
		   totalcost = parseFloat(totalcost + grocerycost); 
		   recTrans.setFieldValue('custbodycustbody_totalfrt_with_fees',nlapiFormatCurrency(totalcost));
		 }

		 if (orderType == produce)
	     {		 
   	       var producecost = parseFloat((actFreight + actFreight_sur) * .03);
  		   totalTransportCost = totalTransportCost + producecost;
		   producecost = Math.round(producecost * 100)/100;  

		   recTrans.selectNewLineItem('item');
           recTrans.setCurrentLineItemValue('item','item',transport_item); 
           recTrans.setCurrentLineItemValue('item','quantity','1'); 
           recTrans.setCurrentLineItemValue('item','location',  defaultLocation); 
           recTrans.setCurrentLineItemValue('item','class',     defaultClass); 
           recTrans.setCurrentLineItemValue('item','rate',producecost); 
		   recTrans.setCurrentLineItemValue('item','amount',nlapiFormatCurrency(producecost));
           recTrans.setCurrentLineItemValue('item','department',produceprogram); 
           recTrans.setCurrentLineItemValue('item','custcol_transport_item','T'); 
           recTrans.commitLineItem('item');
  		   recTrans.setFieldValue('custbody_trans_fees',nlapiFormatCurrency(producecost));
   		   totalcost = parseFloat(totalcost + producecost); 
		   recTrans.setFieldValue('custbodycustbody_totalfrt_with_fees',nlapiFormatCurrency(totalcost));

		 }
		 
	  } 
	  
	  if (paramcarriertype == carrierType && foundTransport != '-1' && billToFreight == paramBillToFreight && (Eval.inArray(shippingMethod, ARR_SHIP_TYPES))) //Add the Transport Item
      {
		 if (orderType == grocery)
	     {		 
	       var grocerycost = parseFloat((estFreight + estFreight_sur) * .03);
		   grocerycost = Math.round(grocerycost * 100)/100;  
  		   totalTransportCost = totalTransportCost + grocerycost;

	       recTrans.setLineItemValue('item','rate',foundTransport,grocerycost); 
		   recTrans.setLineItemValue('item','amount',foundTransport,nlapiFormatCurrency(grocerycost));
   		   recTrans.setFieldValue('custbody_trans_fees',nlapiFormatCurrency(grocerycost));
   		   totalcost = parseFloat(totalcost + grocerycost); 
		   recTrans.setFieldValue('custbodycustbody_totalfrt_with_fees',nlapiFormatCurrency(totalcost));


		 }

		 if (orderType == produce)
	     {		 
    	   var producecost = parseFloat((actFreight + actFreight_sur) * .03);
		   producecost = Math.round(producecost * 100)/100;  
  		   totalTransportCost = totalTransportCost + producecost;

           recTrans.setLineItemValue('item','rate',foundTransport,producecost); 
		   recTrans.setLineItemValue('item','amount',foundTransport,nlapiFormatCurrency(producecost));
   		   recTrans.setFieldValue('custbody_trans_fees',nlapiFormatCurrency(producecost));
   		   totalcost = parseFloat(totalcost + producecost); 
		   recTrans.setFieldValue('custbodycustbody_totalfrt_with_fees',nlapiFormatCurrency(totalcost));

		 }

	  } 	  
      // For member accessorial fees - add to the order is bill to member and member designated and FA arranged
      if (!Eval.isEmpty(recTrans.getFieldValue('custbody_addl_freight_member')))
	  {
          var foundAccesorial  = nlapiFindLineItemValue('item', 'item', accessorialFeeItem);
	 	  if (foundAccesorial == '-1' && billToFreight == paramBillToFreight && Eval.inArray(shippingMethod, ARR_SHIP_TYPES))
	      {
  	         recTrans.selectNewLineItem('item');
             recTrans.setCurrentLineItemValue('item','item',accessorialFeeItem); 
             recTrans.setCurrentLineItemValue('item','quantity','1'); 
             recTrans.setCurrentLineItemValue('item','location',  defaultLocation); 
             recTrans.setCurrentLineItemValue('item','class',     defaultClass); 
             recTrans.setCurrentLineItemValue('item','rate',forceParseFloat(recTrans.getFieldValue('custbody_addl_freight_member'))); 
		     recTrans.setCurrentLineItemValue('item','amount',nlapiFormatCurrency(forceParseFloat(recTrans.getFieldValue('custbody_addl_freight_member'))));
             recTrans.setCurrentLineItemValue('item','department',defaultDepartment); 
             recTrans.setCurrentLineItemValue('item','custcol_transport_item','T'); 
             recTrans.setCurrentLineItemValue('item','custcol_member_bank',recTrans.getFieldValue('custbody_member_accessorial_bill_to')); 
		     recTrans.commitLineItem('item');
          }			  
 
          if (foundAccesorial != '-1' && billToFreight == paramBillToFreight && Eval.inArray(shippingMethod, ARR_SHIP_TYPES))
	      {
	       recTrans.setLineItemValue('item','rate',foundAccesorial,forceParseFloat(recTrans.getFieldValue('custbody_addl_freight_member'))); 
		   recTrans.setLineItemValue('item','amount',foundAccesorial,nlapiFormatCurrency(forceParseFloat(recTrans.getFieldValue('custbody_addl_freight_member'))));
           recTrans.setLineItemValue('item','custcol_member_bank',foundAccesorial,recTrans.getFieldValue('custbody_member_accessorial_bill_to')); 
          }			  
 
      }
	  
      if (Eval.isEmpty(recTrans.getFieldValue('custbody_addl_freight_member')))
	  {
           var foundAccesorial  = nlapiFindLineItemValue('item', 'item', accessorialFeeItem);
           if (foundAccesorial != '-1' && billToFreight == paramBillToFreight && Eval.inArray(shippingMethod, ARR_SHIP_TYPES))
	       {
	   	       recTrans.setLineItemValue('item','rate',foundAccesorial,forceParseFloat('0')); 
	   		   recTrans.setLineItemValue('item','amount',foundAccesorial,nlapiFormatCurrency(forceParseFloat('0')));

           }
      }	  
      // Now Loop through and determine the storage requirements and temp range

	  recTrans.setFieldText('custbody_transportation_type','DRY');
	  var storageReq = 1;
	  var tempA = 0;
	  var tempB = 0;
	  var tempC = 0;
	  
	  var ttlQuantity = parseFloat('0')
	  for (var i = 1; i <= recTrans.getLineItemCount('item'); i++ ) 
      {
		  var itemStorage  =  recTrans.getLineItemText ('item', 'custcol_storage_requirements', i);
		  var itemTemp     =  recTrans.getLineItemValue('item', 'custcol_temp_group', i);
		  var itemChannel  =  recTrans.getLineItemValue('item', 'custcol_product_channel', i);
		  if (itemChannel != adminChannel)
		  {
		   ttlQuantity      =  parseFloat(ttlQuantity) + parseFloat(recTrans.getLineItemValue('item', 'quantity', i));
		  }
		  
          if (storageReq <= 1 && itemStorage == 'REFRIG') {
              			storageReq = 2 ;  
          } 						 

          if (storageReq <= 2 && itemStorage == 'FROZEN') {
              			storageReq = 3 ;  
          } 						 

		nlapiLogExecution('DEBUG','Temp','stType= ' + itemTemp);
		switch(itemTemp){
		case 'A':	tempA = 1;
								break;
		case 'B':	tempB = 1;
								break;
		case 'C':	tempC = 1;
								break;
		default: break;

	    }	  

	  }
		
         nlapiLogExecution('DEBUG','Storage Req ','stType= ' + storageReq + ' a ' + tempA + ' b ' + tempB + ' c ' + tempC);
 
		switch(storageReq){
		case 1:	recTrans.setFieldText('custbody_transportation_type','DRY');
								break;
		case 2:	recTrans.setFieldText('custbody_transportation_type','REFRIG');
								break;
		case 3:	recTrans.setFieldText('custbody_transportation_type','FROZEN');
								break;
		default: break;

	    }	  
		
		if (tempA == 1 && tempB == 0 && tempC == 0)
		{
          recTrans.setFieldValue('custbody_temperature_control','34');
		}  
		if (tempA == 0 && tempB == 1 && tempC == 0)
		{
          recTrans.setFieldValue('custbody_temperature_control','47');
		}  
		if (tempA == 0 && tempB == 0 && tempC == 1)
		{
          recTrans.setFieldValue('custbody_temperature_control','58');
		}  
		if (tempA == 1 && tempB == 1 && tempC == 1)
		{
          recTrans.setFieldValue('custbody_temperature_control','38');
		}  
		if ((tempA == 1 || tempB == 1) && tempC == 1)
		{
          recTrans.setFieldValue('custbody_temperature_control','45');
		}  

         nlapiLogExecution('DEBUG','Prorate Transport ','stCost= ' + totalTransportCost + ' TtlQuantity ' + ttlQuantity);
		 if (ttlQuantity > 0 && totalTransportCost > 0)
		 {
			 var tsCostPerItem = parseFloat(totalTransportCost/ttlQuantity);
             nlapiLogExecution('DEBUG','Prorate Transport ','ts cost per= ' + tsCostPerItem);
           var total_adj_inv_amount = parseFloat('0');
	 	     for (var i = 1; i <= recTrans.getLineItemCount('item'); i++ ) 
             {
		           var itemChannel  =  recTrans.getLineItemValue('item', 'custcol_product_channel', i);
		           if (itemChannel != adminChannel)
		           {
		             var itemQty    =  recTrans.getLineItemValue('item', 'quantity', i);
					 var tsCost     =  parseFloat(tsCostPerItem * itemQty);
		             var itemAmount =  parseFloat(recTrans.getLineItemValue('item', 'amount', i));
					 var tsAdj      = parseFloat(tsCost) + parseFloat(itemAmount);
                     nlapiLogExecution('DEBUG','Prorate Transport ','ts cost and amount= ' + tsCost + ' ' + itemAmount);
		             recTrans.setLineItemValue('item', 'custcol_item_transport_cost', i,nlapiFormatCurrency(tsCost)); //custcol_adj_invoice_rate
		             recTrans.setLineItemValue('item', 'custcol_adjusted_amount', i,nlapiFormatCurrency(tsAdj));
                     if(recTrans.getLineItemText('item','custcol_product_channel',i)=='Grocery'){
                     var adj_inv_rate = recTrans.getLineItemValue('item', 'custcol_adj_invoice_rate', i);
                     
                     if(adj_inv_rate!=null && adj_inv_rate!=''){
                       recTrans.setLineItemValue('item', 'custcol_adj_invoice_amount', i,parseFloat(adj_inv_rate * itemQty));
                       total_adj_inv_amount=total_adj_inv_amount+parseFloat(adj_inv_rate * itemQty);
                       
                     }else{
		       //      var rate = parseFloat(tsCostPerItem) + parseFloat(recTrans.getLineItemValue('item', 'rate', i));
                //       recTrans.setLineItemValue('item', 'custcol_adj_invoice_rate', i,rate);
                 //      recTrans.setLineItemValue('item', 'custcol_adj_invoice_amount', i,parseFloat(rate * itemQty));
                  //     total_adj_inv_amount=total_adj_inv_amount+parseFloat(rate * itemQty);
                     }
                     }
                     
		           }
			 }		   

	     }else{
           nlapiLogExecution('DEBUG','Inside else ','stCost= ' + totalTransportCost + ' TtlQuantity ' + ttlQuantity);
            var total_adj_inv_amount = parseFloat('0');
	 	     for (var i = 1; i <= recTrans.getLineItemCount('item'); i++ ) 
             {
           		if(recTrans.getLineItemText('item','custcol_product_channel',i)=='Grocery')	{
                     var adj_inv_rate = recTrans.getLineItemValue('item', 'custcol_adj_invoice_rate', i);
                     var itemQty    =  recTrans.getLineItemValue('item', 'quantity', i);
                     if(adj_inv_rate!=null && adj_inv_rate!=''){
                       recTrans.setLineItemValue('item', 'custcol_adj_invoice_amount', i,parseFloat(adj_inv_rate * itemQty));
                       total_adj_inv_amount=total_adj_inv_amount+parseFloat(adj_inv_rate * itemQty);
                       
                     }else{
		             var rate = parseFloat(tsCostPerItem) + parseFloat(recTrans.getLineItemValue('item', 'rate', i));
                    
                       recTrans.setLineItemValue('item', 'custcol_adj_invoice_rate', i,rate);
                       recTrans.setLineItemValue('item', 'custcol_adj_invoice_amount', i,parseFloat(rate * itemQty));
                       total_adj_inv_amount=total_adj_inv_amount+parseFloat(rate * itemQty);
                     }
           }
             }
         }
		recTrans.setFieldValue('custbody_total_adj_inv_amount',parseFloat(total_adj_inv_amount).toFixed(2));

	var id = nlapiSubmitRecord(recTrans, true);
    return true;
  
	
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

// ------------------------------------------------- UTILITY FUNCTIONS -------------------------------------------------
var Eval =
{
    /**
	 * Evaluate if the given string is empty string, null or undefined.
	 * 
	 * @param {String}
	 *            stValue - Any string value
	 * @returns {Boolean}
	 * @memberOf Eval
	 * @author memeremilla
	 */
    isEmpty: function (stValue) {
        if ((stValue == '') || (stValue == null) || (stValue == undefined)) {
            return true;
        }

        return false;
    },
    /**
	* Evaluate if the given string is an element of the array
	* 
	* @param {String}
	*            stValue - String to find in the array.
	* @param {Array}
	*            arr - Array to be check for components.
	* @returns {Boolean}
	* @memberOf Eval
	* @author memeremilla
	*/
    inArray: function (stValue, arr) {
        if (this.isEmpty(arr)) {
            return false;
        }

        var bIsValueFound = false;

        for (var i = 0; i < arr.length; i++) {
            if (stValue == arr[i]) {
                bIsValueFound = true;
                break;
            }
        }

        return bIsValueFound;
    },
};

var Parse =
{
    /**
	 * Converts String to Float
	 * 
	 * @author asinsin
	 */
    forceFloat: function (stValue) {
        var flValue = parseFloat(stValue);

        if (isNaN(flValue)) {
            return 0.00;
        }

        return flValue;
    },

    forceNegative: function (stVal) {
        return this.forceFloat(stVal) * (-1);
    }
};
