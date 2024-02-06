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
	   var transportFeePercent = nlapiGetContext().getSetting('SCRIPT', 'custscript_transport_fee_percentage');
		var incl_freight_subsidy = nlapiGetContext().getSetting('SCRIPT', 'custscript_incl_freight_subsidy');
  		var freight_sub_item = nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_sub_item');
  		var freight_sub_item_text = nlapiLookupField('noninventoryitem', freight_sub_item, 'itemid');
  		var freight_sub_amount = parseFloat('0');
  		var freight_sub_percentage = nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_subsidy_percentage');
  		var percentage_subsidy = nlapiGetContext().getSetting('SCRIPT', 'custscript_percentage_subsidy');
  		var full_amt_subsidy = nlapiGetContext().getSetting('SCRIPT', 'custscript_full_amount_subsidy');
  		var flat_subsidy = nlapiGetContext().getSetting('SCRIPT', 'custscript_flat_subsidy');
		var incl_freight_subsidy_donation = nlapiGetContext().getSetting('SCRIPT', 'custscript_incl_freight_subsidy_donation');
		var freight_sub_item_donation = nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_sub_item_donation');
		var freight_sub_item_donation_text = nlapiLookupField('noninventoryitem', freight_sub_item_donation, 'itemid');
		var freight_sub_percentage_donation = nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_subsidy_percentage_do');
		var percentage_subsidy_donation = nlapiGetContext().getSetting('SCRIPT', 'custscript_percentage_subsidy_donation');
		var full_amt_subsidy_donation = nlapiGetContext().getSetting('SCRIPT', 'custscript_full_amount_subsidy_donation');
		var flat_subsidy_donation = nlapiGetContext().getSetting('SCRIPT', 'custscript_flat_subsidy_donation');
		var subsidy_project_code_donation = nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_sub_project_donation');
		var subsidy_fund_donation = nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_sub_fund_donation');
  		var subsidy_project_code = nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_sub_project');
  		var subsidy_fund = nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_sub_fund');
  		var end_date_donation = nlapiGetContext().getSetting('SCRIPT', 'custscript_end_date_donation');
  		var effective_date_donation = nlapiGetContext().getSetting('SCRIPT', 'custscript_effect_date_donation');
  		var effective_date = nlapiGetContext().getSetting('SCRIPT', 'custscript_effect_date');
  		var end_date = nlapiGetContext().getSetting('SCRIPT', 'custscript_end_date');
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
	  var donationTransProgram = context.getSetting('SCRIPT', 'custscript_donation_trans_program');
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
  //Added for ticket #7140
  	  var foundTransportFeeItem = nlapiFindLineItemValue('item', 'item', '4037');
	  var foundAdmin         = nlapiFindLineItemValue('item', 'item', admin_item);
  	  var foundSubsidy        = nlapiFindLineItemValue('item', 'item', freight_sub_item);
  	  var foundSubsidyDonation        = nlapiFindLineItemValue('item', 'item', freight_sub_item_donation);
  	  var foundProduceVendorFreight = nlapiFindLineItemValue('item', 'item', '4148');
	  var foundAccessorial   = nlapiFindLineItemValue('item', 'item', accessorialFeeItem);
	  var estFreight         = forceParseFloat(recTrans.getFieldValue('custbody_benchmark_line_hall_cost'));
	  var estFreight_sur     = forceParseFloat(recTrans.getFieldValue('custbody_benchmark_fuel_sur'));
	  var actFreight         = forceParseFloat(recTrans.getFieldValue('custbody_linehaul_cost_actual')); //subtotal
	  var actFreight_sur     = forceParseFloat(recTrans.getFieldValue('custbody_fuel_sur_cost_actual')); //subtotal
	  var accessorial_cost   = forceParseFloat(recTrans.getFieldValue('custbody_accessorial_cost_actual')); //subtotal
	  var accessorial_cost_member   = forceParseFloat(recTrans.getFieldValue('custbody_addl_freight_member')); //subtotal
	  var orderTotal         = forceParseFloat(recTrans.getFieldValue('subtotal')); //subtotal
	  var orderType          = recTrans.getFieldValue('custbody_order_type'); //custbody_carrier_code _CARRIER_type
	  var shippingMethod     = recTrans.getFieldValue('custbody_shipping_method_code');
	  var billToFreight      =  recTrans.getFieldValue('custbody_bill_to_freight');
	  var paramBillToFreight = nlapiGetContext().getSetting('SCRIPT', 'custscript_transport_so_bill_to_freight');
	  var totalcost          = parseFloat('0');
	  var totalTransportCost = parseFloat('0');

      nlapiLogExecution('DEBUG','Member Cost ','stType= ' + billToFreight + ' ' + paramBillToFreight + ' ' + ARR_DONATION_ORDER_TYPES);
  		nlapiLogExecution('DEBUG','incl_freight_subsidy ','incl_freight_subsidy= ' + incl_freight_subsidy + ' freight_sub_amount=' + freight_sub_amount + ' freight_sub_item=' + freight_sub_item+' foundSubsidy='+foundSubsidy);
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
			freight_sub_amount = totalcost*-1;
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
  		nlapiLogExecution('DEBUG','incl_freight_subsidy2 ','incl_freight_subsidy= ' + incl_freight_subsidy + ' freight_sub_amount=' + freight_sub_amount + ' freight_sub_item=' + freight_sub_item+' foundSubsidy='+foundSubsidy);

		 }
	//Added for ticket #5096 by Thilaga
	//Added for task 6581 by Thilaga
		if(orderType!=grocery && orderType!=produce && orderType!='9'){
          if(nlapiStringToDate(recTrans.getFieldValue('custbodycustbody_requested_pickup_date')) > (nlapiStringToDate('10/31/2020'))) {
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
           recTrans.setCurrentLineItemValue('item','department',donationTransProgram);
           recTrans.setCurrentLineItemValue('item','custcol_transport_item','T');
           recTrans.commitLineItem('item');
          recTrans.setFieldValue('custbody_total_freight_cost',nlapiFormatCurrency(totalcost));
          }
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
			freight_sub_amount = totalcost*-1;
           recTrans.setLineItemValue('item','rate',foundAdmin,producecost);
		   recTrans.setLineItemValue('item','amount',foundAdmin,nlapiFormatCurrency(producecost));
		   recTrans.setFieldValue('custbody_total_freight_cost',nlapiFormatCurrency(totalcost));
		   recTrans.setFieldValue('custbodycustbody_totalfrt_with_fees',nlapiFormatCurrency(totalcost));
   		   recTrans.setFieldValue('custbodycustbody_fa_freight_amount',nlapiFormatCurrency(producecost));
  		nlapiLogExecution('DEBUG','incl_freight_subsidy3 ','incl_freight_subsidy= ' + incl_freight_subsidy + ' freight_sub_amount=' + freight_sub_amount + ' freight_sub_item=' + freight_sub_item+' foundSubsidy='+foundSubsidy);

		 }
		//Added for task 6581 by Thilaga
        if(orderType!=grocery && orderType!=produce && orderType!='9'){
          if(nlapiStringToDate(recTrans.getFieldValue('custbodycustbody_requested_pickup_date')) > (nlapiStringToDate('10/31/2020'))) {
          var producecost = parseFloat((actFreight + actFreight_sur));
 		   totalTransportCost = producecost;
   		   totalcost   = parseFloat(producecost + accessorial_cost);

           recTrans.setLineItemValue('item','rate',foundAdmin,producecost);
		   recTrans.setLineItemValue('item','amount',foundAdmin,nlapiFormatCurrency(producecost));
		   recTrans.setFieldValue('custbody_total_freight_cost',nlapiFormatCurrency(totalcost));
		   //Added for task 8080 by Elizabeth
            freight_sub_amount = (producecost+accessorial_cost_member)*-1;
          }

        }


	  }

      nlapiLogExecution('DEBUG','Befoore 3% Fee ','stType= ' + paramcarriertype + ' ' + carrierType + ' ' + foundTransport + 'foundTransportFeeItem'+ foundTransportFeeItem+ ' ' + shippingMethod);

	  if (paramcarriertype == carrierType && foundTransport == '-1' && foundTransportFeeItem == '-1' && billToFreight == paramBillToFreight && (Eval.inArray(shippingMethod, ARR_SHIP_TYPES))) //Add the Transport Item
	  {

	     if (orderType == grocery)
	     {
	       var grocerycost = parseFloat((estFreight + estFreight_sur) * transportFeePercent);
		   grocerycost = Math.round(grocerycost * 100)/100;
  		   totalTransportCost = totalTransportCost + grocerycost;
	    //    recTrans.selectNewLineItem('item');
        //    recTrans.setCurrentLineItemValue('item','item',transport_item);
        //    recTrans.setCurrentLineItemValue('item','quantity','1');
        //    recTrans.setCurrentLineItemValue('item','location',  defaultLocation);
        //    recTrans.setCurrentLineItemValue('item','class',     defaultClass);
        //    recTrans.setCurrentLineItemValue('item','rate',grocerycost);
		//    recTrans.setCurrentLineItemValue('item','amount',nlapiFormatCurrency(grocerycost));
        //    recTrans.setCurrentLineItemValue('item','department',defaultDepartment);
        //    recTrans.setCurrentLineItemValue('item','custcol_transport_item','T');
        //    recTrans.commitLineItem('item');
		   recTrans.setFieldValue('custbody_trans_fees',nlapiFormatCurrency(grocerycost));
		   totalcost = parseFloat(totalcost + grocerycost);
		   recTrans.setFieldValue('custbodycustbody_totalfrt_with_fees',nlapiFormatCurrency(totalcost));
		 }

		 if (orderType == produce)
	     {
   	       var producecost = parseFloat((actFreight + actFreight_sur) * transportFeePercent);
  		   totalTransportCost = totalTransportCost + producecost;
		   producecost = Math.round(producecost * 100)/100;
			freight_sub_amount = parseFloat(totalTransportCost)*-1;
		//    recTrans.selectNewLineItem('item');
        //    recTrans.setCurrentLineItemValue('item','item',transport_item);
        //    recTrans.setCurrentLineItemValue('item','quantity','1');
        //    recTrans.setCurrentLineItemValue('item','location',  defaultLocation);
        //    recTrans.setCurrentLineItemValue('item','class',     defaultClass);
        //    recTrans.setCurrentLineItemValue('item','rate',producecost);
		//    recTrans.setCurrentLineItemValue('item','amount',nlapiFormatCurrency(producecost));
        //    recTrans.setCurrentLineItemValue('item','department',produceprogram);
        //    recTrans.setCurrentLineItemValue('item','custcol_transport_item','T');
        //    recTrans.commitLineItem('item');
  		   recTrans.setFieldValue('custbody_trans_fees',nlapiFormatCurrency(producecost));
   		   totalcost = parseFloat(totalcost + producecost);
		   recTrans.setFieldValue('custbodycustbody_totalfrt_with_fees',nlapiFormatCurrency(totalcost));
  		nlapiLogExecution('DEBUG','incl_freight_subsidy4 ','incl_freight_subsidy= ' + incl_freight_subsidy + ' freight_sub_amount=' + freight_sub_amount + ' freight_sub_item=' + freight_sub_item+' foundSubsidy='+foundSubsidy);

		 }

	  }

	  if (paramcarriertype == carrierType && foundTransport != '-1' && billToFreight == paramBillToFreight && (Eval.inArray(shippingMethod, ARR_SHIP_TYPES))) //Add the Transport Item
      {
		 if (orderType == grocery)
	     {
	       var grocerycost = parseFloat((estFreight + estFreight_sur) * transportFeePercent);
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
    	   var producecost = parseFloat((actFreight + actFreight_sur) * transportFeePercent);
		   producecost = Math.round(producecost * 100)/100;
  		   totalTransportCost = totalTransportCost + producecost;
			freight_sub_amount = parseFloat(totalTransportCost)*-1;
           recTrans.setLineItemValue('item','rate',foundTransport,producecost);
		   recTrans.setLineItemValue('item','amount',foundTransport,nlapiFormatCurrency(producecost));
   		   recTrans.setFieldValue('custbody_trans_fees',nlapiFormatCurrency(producecost));
   		   totalcost = parseFloat(totalcost + producecost);
		   recTrans.setFieldValue('custbodycustbody_totalfrt_with_fees',nlapiFormatCurrency(totalcost));
		/*if(foundSubsidy!='-1' && parseFloat(recTrans.getLineItemValue('item','rate',foundSubsidy))!=0){
              recTrans.setLineItemValue('item','rate',foundSubsidy,freight_sub_amount);
              recTrans.setLineItemValue('item','amount',foundSubsidy,nlapiFormatCurrency(freight_sub_amount));
            }*/
  		nlapiLogExecution('DEBUG','incl_freight_subsidy5 ','incl_freight_subsidy= ' + incl_freight_subsidy + ' freight_sub_amount=' + freight_sub_amount + ' freight_sub_item=' + freight_sub_item+' foundSubsidy='+foundSubsidy);
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
		  if(orderType == produce) {
        freight_sub_amount = freight_sub_amount - parseFloat(recTrans.getFieldValue('custbody_addl_freight_member'));
  		nlapiLogExecution('DEBUG','incl_freight_subsidy6 ','incl_freight_subsidy= ' + incl_freight_subsidy + ' freight_sub_amount=' + freight_sub_amount + ' freight_sub_item=' + freight_sub_item+' foundSubsidy='+foundSubsidy);
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

  //Added for ticket #7304
   //nlapiLogExecution('DEBUG','Befoore setting freight subsidy item ','foundSubsidy= ' + foundSubsidy + ' ' +'freight_sub_amount'+ freight_sub_amount);
  if(orderType == produce){
    nlapiLogExecution('DEBUG','Status>> fields ','Status= ' + recTrans.getFieldValue('status') + ' trandate=' + recTrans.getFieldValue('trandate') + ' effective_date=' + effective_date+' end_date='+end_date);
            var no_freight_sub = recTrans.getFieldValue('custbody_no_freight_subsidy_item');
            var apply_orig_freight_sub = recTrans.getFieldValue('custbody_apply_original_subsidy');

    		if(Eval.inArray(shippingMethod, ARR_SHIP_TYPES)){
            if(full_amt_subsidy == 'T') {
                freight_sub_amount = freight_sub_amount;
            }
            else{
                if(percentage_subsidy == 'T'){
                    freight_sub_amount = (freight_sub_amount*(parseFloat(freight_sub_percentage)))
                }
                else{
                    if(flat_subsidy == 'T'){
                      if(freight_sub_amount > nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_sub_amt')){
                        freight_sub_amount = freight_sub_amount;
                      } else {
                        freight_sub_amount = nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_sub_amt');
                      }
                    }
                }
            }
            }
    		if(shippingMethod == 2 && foundProduceVendorFreight!='-1'){
            freight_sub_amount = (recTrans.getLineItemValue('item','rate',foundProduceVendorFreight)*(-1));
                   nlapiLogExecution('DEBUG','Freght Amt1', freight_sub_amount);
            if(full_amt_subsidy == 'T') {
                freight_sub_amount = freight_sub_amount;
            }
            else{
                if(percentage_subsidy == 'T'){
                    freight_sub_amount = (freight_sub_amount*(parseFloat(freight_sub_percentage)))
                }
                else{
                    if(flat_subsidy == 'T'){
                      if(freight_sub_amount > nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_sub_amt')){
                        freight_sub_amount = freight_sub_amount;
                      } else {
                        freight_sub_amount = nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_sub_amt');
                      }
                    }
                }
            }
            }
		  var salesOrdDate = recTrans.getFieldValue('trandate');
          if(foundSubsidy=='-1'){
                   nlapiLogExecution('DEBUG','Freght Amt4', freight_sub_amount + shippingMethod + foundProduceVendorFreight + nlapiStringToDate(salesOrdDate) + incl_freight_subsidy + no_freight_sub + apply_orig_freight_sub + recTrans.getFieldValue('status'));
             if(incl_freight_subsidy == 'T' && freight_sub_amount!=0 && no_freight_sub == 'F' && apply_orig_freight_sub == 'F' && recTrans.getFieldValue('status')!='Billed' && recTrans.getFieldValue('status')!='Closed' && (nlapiStringToDate(salesOrdDate)>=nlapiStringToDate(effective_date) && nlapiStringToDate(salesOrdDate)<=nlapiStringToDate(end_date))){
                   nlapiLogExecution('DEBUG','Freght Amt5', freight_sub_amount + shippingMethod + foundProduceVendorFreight);
               if(Eval.inArray(shippingMethod, ARR_SHIP_TYPES)) {
             	recTrans.selectNewLineItem('item');
           		recTrans.setCurrentLineItemValue('item','item',freight_sub_item);
           		recTrans.setCurrentLineItemValue('item','quantity','1');
           		recTrans.setCurrentLineItemValue('item','location',  subsidy_fund);
           		recTrans.setCurrentLineItemValue('item','class',     defaultClass);
           		recTrans.setCurrentLineItemValue('item','custcol_cseg_projects_cseg',  subsidy_project_code);
           		recTrans.setCurrentLineItemValue('item','rate',freight_sub_amount);
		   		recTrans.setCurrentLineItemValue('item','amount',nlapiFormatCurrency(freight_sub_amount));
           		recTrans.setCurrentLineItemValue('item','department',produceprogram);
                //recTrans.setCurrentLineItemValue('item','custcol_transport_item','T');
           		recTrans.commitLineItem('item');
				   recTrans.setFieldValue('custbody_subsidy_information', freight_sub_item_text + ' ' + freight_sub_amount);
                   nlapiLogExecution('DEBUG','Freght Amt', freight_sub_amount);
               }
               else {
                   nlapiLogExecution('DEBUG','Freght Amt6', freight_sub_amount + shippingMethod + foundProduceVendorFreight);
               if(shippingMethod == 2 && foundProduceVendorFreight!='-1'){
                   nlapiLogExecution('DEBUG','Freght Amt+here', freight_sub_amount);
             	recTrans.selectNewLineItem('item');
           		recTrans.setCurrentLineItemValue('item','item',freight_sub_item);
           		recTrans.setCurrentLineItemValue('item','quantity','1');
           		recTrans.setCurrentLineItemValue('item','location',  subsidy_fund);
           		recTrans.setCurrentLineItemValue('item','class',     defaultClass);
               	recTrans.setCurrentLineItemValue('item','custcol_cseg_projects_cseg',  subsidy_project_code);
           		recTrans.setCurrentLineItemValue('item','rate',freight_sub_amount);
		   		recTrans.setCurrentLineItemValue('item','amount',nlapiFormatCurrency(freight_sub_amount));
           		recTrans.setCurrentLineItemValue('item','department',produceprogram);
                //recTrans.setCurrentLineItemValue('item','custcol_transport_item','T');
           		recTrans.commitLineItem('item');
				   recTrans.setFieldValue('custbody_subsidy_information', freight_sub_item_text + ' ' + freight_sub_amount);
               }
               }
           }
           }
			else{
              if(no_freight_sub == 'F') {
                if(apply_orig_freight_sub == 'F') {
                if(incl_freight_subsidy == 'T' && freight_sub_amount!=0 && recTrans.getFieldValue('status')!='Billed' && recTrans.getFieldValue('status')!='Closed' && (nlapiStringToDate(salesOrdDate)>=nlapiStringToDate(effective_date) && nlapiStringToDate(salesOrdDate)<=nlapiStringToDate(end_date))) {
                if(Eval.inArray(shippingMethod, ARR_SHIP_TYPES) || shippingMethod ==2) {
                if(parseFloat(recTrans.getLineItemValue('item','rate',foundSubsidy))!=0){
                recTrans.setLineItemValue('item','rate',foundSubsidy,freight_sub_amount);
           	    recTrans.setLineItemValue('item','custcol_cseg_projects_cseg',foundSubsidy,subsidy_project_code);
           		recTrans.setLineItemValue('item','location',foundSubsidy,subsidy_fund);
                recTrans.setLineItemValue('item','amount',foundSubsidy,nlapiFormatCurrency(freight_sub_amount));
                recTrans.setFieldValue('custbody_subsidy_information', freight_sub_item_text + ' ' + freight_sub_amount);
                nlapiLogExecution('DEBUG','Freght Amt and project code', freight_sub_amount + subsidy_project_code);
                }
                }
                }
                }
                else {
                  return;
                }
              }
              else {
                if(incl_freight_subsidy == 'T' && freight_sub_amount!=0 && recTrans.getFieldValue('status')!='Billed' && recTrans.getFieldValue('status')!='Closed' && (nlapiStringToDate(salesOrdDate)>=nlapiStringToDate(effective_date) && nlapiStringToDate(salesOrdDate)<=nlapiStringToDate(end_date))) {
                  if(Eval.inArray(shippingMethod, ARR_SHIP_TYPES) || shippingMethod ==2){
                    recTrans.setFieldValue('custbody_subsidy_information', ' ');
                    recTrans.removeLineItem('item',foundSubsidy);
                  }
                  }
                  }
              }
          }
		  //Added for ticket #8080
		   nlapiLogExecution('DEBUG','Order Type', orderType);
		  if(orderType == '3' || orderType == '5' || orderType == '8'){
			nlapiLogExecution('DEBUG','Status>> fields ','Status= ' + recTrans.getFieldValue('status') + ' trandate=' + recTrans.getFieldValue('trandate') + ' effective_date_donation=' + effective_date_donation+' end_date_donation='+end_date_donation + freight_sub_amount);
					var no_freight_sub = recTrans.getFieldValue('custbody_no_freight_subsidy_item');
					var apply_orig_freight_sub = recTrans.getFieldValue('custbody_apply_original_subsidy');

					if(Eval.inArray(shippingMethod, ARR_SHIP_TYPES)){
					if(full_amt_subsidy_donation == 'T') {
						freight_sub_amount = freight_sub_amount;
					}
					else{
						if(percentage_subsidy_donation == 'T'){
							freight_sub_amount = (freight_sub_amount*(parseFloat(freight_sub_percentage_donation)))
						}
						else{
							if(flat_subsidy_donation == 'T'){
						   nlapiLogExecution('DEBUG','Freght Amt0', freight_sub_amount + ' ' + nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_sub_amt_donation'));
							  if(freight_sub_amount > nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_sub_amt_donation')){
								freight_sub_amount = freight_sub_amount;
							  } else {
								freight_sub_amount = nlapiGetContext().getSetting('SCRIPT', 'custscript_freight_sub_amt_donation');
							  }
							}
						}
					}
					}
				  var salesOrdDate = recTrans.getFieldValue('trandate');
				  if(foundSubsidyDonation=='-1'){
						nlapiLogExecution('DEBUG','Freght Amt and project code1', freight_sub_amount + subsidy_project_code_donation);
					 if(incl_freight_subsidy_donation == 'T' && freight_sub_amount!=0 && no_freight_sub == 'F' && apply_orig_freight_sub == 'F' && recTrans.getFieldValue('status')!='Billed' && recTrans.getFieldValue('status')!='Closed' && (nlapiStringToDate(salesOrdDate)>=nlapiStringToDate(effective_date_donation) && nlapiStringToDate(salesOrdDate)<=nlapiStringToDate(end_date_donation))){
					   if(Eval.inArray(shippingMethod, ARR_SHIP_TYPES)) {
						 recTrans.selectNewLineItem('item');
						   recTrans.setCurrentLineItemValue('item','item',freight_sub_item_donation);
						   recTrans.setCurrentLineItemValue('item','quantity','1');
						   recTrans.setCurrentLineItemValue('item','location',  subsidy_fund_donation);
						   recTrans.setCurrentLineItemValue('item','class',     defaultClass);
						   recTrans.setCurrentLineItemValue('item','custcol_cseg_projects_cseg',  subsidy_project_code_donation);
						   recTrans.setCurrentLineItemValue('item','rate',freight_sub_amount);
						   recTrans.setCurrentLineItemValue('item','amount',nlapiFormatCurrency(freight_sub_amount));
						   recTrans.setCurrentLineItemValue('item','department','54');
						//recTrans.setCurrentLineItemValue('item','custcol_transport_item','T');
						   recTrans.commitLineItem('item');
						   recTrans.setFieldValue('custbody_subsidy_information', freight_sub_item_donation_text + ' ' + freight_sub_amount);
						   nlapiLogExecution('DEBUG','Freght Amt1', freight_sub_amount);
					   }
				   }
				   }
					else{
					  if(no_freight_sub == 'F') {
						if(apply_orig_freight_sub == 'F') {
						if(incl_freight_subsidy_donation == 'T' && freight_sub_amount!=0 && recTrans.getFieldValue('status')!='Billed' && recTrans.getFieldValue('status')!='Closed' && (nlapiStringToDate(salesOrdDate)>=nlapiStringToDate(effective_date_donation) && nlapiStringToDate(salesOrdDate)<=nlapiStringToDate(end_date_donation))) {
						if(Eval.inArray(shippingMethod, ARR_SHIP_TYPES)) {
						if(parseFloat(recTrans.getLineItemValue('item','rate',foundSubsidyDonation))!=0){
						recTrans.setLineItemValue('item','rate',foundSubsidyDonation,freight_sub_amount);
						recTrans.setLineItemValue('item','custcol_cseg_projects_cseg',foundSubsidyDonation,subsidy_project_code_donation);
           		        recTrans.setLineItemValue('item','location',foundSubsidyDonation,subsidy_fund_donation);
						recTrans.setLineItemValue('item','amount',foundSubsidyDonation,nlapiFormatCurrency(freight_sub_amount));
						recTrans.setFieldValue('custbody_subsidy_information', freight_sub_item_donation_text + ' ' + freight_sub_amount);
						nlapiLogExecution('DEBUG','Freght Amt and project code', freight_sub_amount + subsidy_project_code_donation);
						}
						}
						}
						}
						else {
						  return;
						}
					  }
					  else {
						if(incl_freight_subsidy_donation == 'T' && freight_sub_amount!=0 && recTrans.getFieldValue('status')!='Billed' && recTrans.getFieldValue('status')!='Closed' && (nlapiStringToDate(salesOrdDate)>=nlapiStringToDate(effective_date_donation) && nlapiStringToDate(salesOrdDate)<=nlapiStringToDate(end_date_donation))) {
						  if(Eval.inArray(shippingMethod, ARR_SHIP_TYPES)){
							recTrans.setFieldValue('custbody_subsidy_information', ' ');
							recTrans.removeLineItem('item',foundSubsidyDonation);
						  }
						  }
						  }
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
