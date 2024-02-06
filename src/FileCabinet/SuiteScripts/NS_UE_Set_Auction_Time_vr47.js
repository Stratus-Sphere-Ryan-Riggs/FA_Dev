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
*  Purpose:  Upon Unsetting the TMS Hold - The first time set the auction time
*  09/29/2016:  1) Only execute for specific order types
*               2) Check the first location - ensure 1 and only 1 is selected
*               3) Calculate the total pounds and the total pallets
*  10/18/2016   Moved the First checck to after the pallet calculation
*  11/01/2016   1) ON create review if admin fee issues should be set
*  11/02/2016   2) Onn edit - If has Issues compare is not being under - review for admin fee
*  11/03/2016   1) lock the vendor field
*  01/20/2017   1) Perform the Admin Fee Checks
*  01/31/2017   1) Recalc Auction time and set requested pickup date
*  01/31/2017   1) For Out BY date - if an out by order type set to 5 business days - else set to release date
*  04/10/2017   Add additional checks for changed email
*  04/21/2017   Update the email change logic
*  06/14/2018   Elizabeth for ticket #6259: added dlvd rate as a modified field. Created conditions for grocery modified emails 
*               and added dlvd rate instead of po rate/rate for these emails.
*/

function userEventBeforeLoad(type, form, request){
                form.getSubList('item').getField('custcol_vendor').setDisplayType('disabled');
				}

function beforesubmit_ordervalues(stType)
{

    nlapiLogExecution('DEBUG','Script Enter: Operation Type','stType= ' + stType);
    if(stType!='edit' && stType!='create')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        return true;
    }
  
   var context = nlapiGetContext();
	var stOrderTypeToProcess = context.getSetting('SCRIPT', 'custscript_so_order_type');
	var stMultiAdmin         = context.getSetting('SCRIPT', 'custscript_multi_admin_fee_reason');
	var stNoAdmin            = context.getSetting('SCRIPT', 'custscript_no_admin_fee_designation');
	var stOrderModified      = context.getSetting('SCRIPT', 'custscript_order_modified');//custscript_out_by_order_types
	var stOutByOrderTypes    = context.getSetting('SCRIPT', 'custscript_out_by_order_types');
	var stReceiptOrderTypes  = context.getSetting('SCRIPT', 'custscript_receipt_due_order_type');
	var stFAArranged         = context.getSetting('SCRIPT', 'custscript_fa_arranged_transport');
	var stOutByOrderDays     = forceParseFloat(context.getSetting('SCRIPT', 'custscript_out_by_days')); 
	var stFADays             = forceParseFloat(context.getSetting('SCRIPT', 'custscript_fa_receipt_due_date_days')); 
	var stNonFADays          = forceParseFloat(context.getSetting('SCRIPT', 'custscript_member_receipt_due_date_days'));
	var SCOrderTypeToProcess = context.getSetting('SCRIPT', 'custscript_do_order_types');
	var SCProductChannels    = context.getSetting('SCRIPT', 'custscript_supply_chain_product_channel');
	var ARR_ORDER_TYPES = [];
	ARR_ORDER_TYPES = stOrderTypeToProcess.split(',');
	var ARR_OUTBYORDER_TYPES = [];
	ARR_OUTBYORDER_TYPES = stOutByOrderTypes.split(',');
	var ARR_RECEIPTBYORDER_TYPES = [];
	ARR_RECEIPTBYORDER_TYPES = stReceiptOrderTypes.split(',');
	var ARR_FASHIPR_TYPES = [];
	ARR_FASHIPR_TYPES = stFAArranged.split(',');
	var ARR_DONATION_TYPES = [];
	ARR_DONATION_TYPES = SCOrderTypeToProcess.split(',');
	var ARR_PRODUCTCHANNEL_TYPES = [];
	ARR_PRODUCTCHANNEL_TYPES = SCProductChannels.split(',');

    var orderType = nlapiGetFieldValue('custbody_order_type');

    var shipmentMethod = nlapiGetFieldValue('custbody_shipping_method_code');

    //nlapiLogExecution('DEBUG',' past first check','stType= ' + stType);
    var nbrFirstLocations = 0;
    var estFreight     = forceParseFloat(nlapiGetFieldValue('custbody_benchmark_line_hall_cost'));
	var estFreight_sur = forceParseFloat(nlapiGetFieldValue('custbody_benchmark_fuel_sur'));
	var actFreight     = forceParseFloat(nlapiGetFieldValue('custbody_linehaul_cost_actual')); //subtotal
	var actFreight_sur = forceParseFloat(nlapiGetFieldValue('custbody_fuel_sur_cost_actual')); //subtotal

	nlapiSetFieldValue('custbody_benchmark_freight_cost',parseFloat(estFreight + estFreight_sur));
	nlapiSetFieldValue('custbody_actual_freight_cost',parseFloat(actFreight + actFreight_sur));
	
   	var orderPounds  = parseFloat('0');
   	var orderPallets = parseFloat('0');
   	var newQty     = parseFloat('0');
  	var totalOrderQty = parseInt('0');
    //added by Thilaga
    var maxLeadDays = parseFloat('0');
  
  //if order type=blue calculate total order pounds for web service and manual by Thilaga Shanmugam
   	if(orderType==6){
   	 	
   	 	if (stType=='create' || stType =='edit' ) {		
	  		      for (var i = 1; i <= nlapiGetLineItemCount('item'); i++ ) {
	  		      	var total_gross_weight = parseFloat(nlapiGetLineItemValue('item', 'custcol_total_weight', i));
				nlapiSetLineItemValue('item', 'custcol_gross_wt_received', i, total_gross_weight );
		        		orderPounds     = parseFloat(orderPounds) + total_gross_weight;
                    	totalOrderQty 	= parseInt(totalOrderQty) + parseInt(nlapiGetLineItemValue('item', 'quantity', i));
				}
					            		
		nlapiLogExecution('DEBUG',' in nblue donation','TtlPounds ' + orderPounds);
		nlapiSetFieldValue('custbody_total_gross_weight_fulfilled',orderPounds);
   		nlapiSetFieldValue('custbody_total_pounds',orderPounds);
          nlapiSetFieldValue('custbody_total_order_qty',totalOrderQty);
    		}
    		orderPounds  = parseFloat('0');
      		totalOrderQty = parseInt('0');
    	}
   	
	if (!Eval.inArray(orderType, ARR_ORDER_TYPES)) {
        return true;
    }

	/*if (isEmpty(nlapiGetFieldValue('custbodycustbody_requested_pickup_date')))
	{
		nlapiSetFieldValue('custbodycustbody_requested_pickup_date',nlapiGetFieldValue('custbody_release_date'));
    }		*/
  if(stType=='edit')
	{
		var recOldOrder = nlapiGetOldRecord();
    }	
	//if order type='Produce' and Shipping Method ='Vendor Arranged' then add Vendor Freight Item and cost details by Thilaga Shanmugam
	var shippingMethod = nlapiGetFieldValue('custbody_shipping_method_code');
	if(orderType==2 && shippingMethod==2){
		nlapiLogExecution('DEBUG','Inside if loop','set new line item');
		var itemVendorFreight = context.getSetting('SCRIPT', 'custscript_item_vendor_freight_produce');
		if(stType=='create'){
		var vendorFreightVdr = nlapiGetLineItemValue('item', 'povendor', 1);

		var rate= parseFloat(nlapiGetFieldValue('custbody_actual_freight_cost'));
		nlapiLogExecution('DEBUG','PO vendor of first line',vendorFreightVdr);
          if(rate>0.00){
			nlapiSelectNewLineItem('item');
		// set the item and location values on the currently selected line
			nlapiSetCurrentLineItemValue('item', 'item', itemVendorFreight);
			nlapiSetCurrentLineItemValue('item', 'custcolfa_vendor_item_name', 'Freight');
			nlapiSetCurrentLineItemValue('item', 'rate', rate);
			nlapiSetCurrentLineItemValue('item', 'porate', rate);
			nlapiSetCurrentLineItemValue('item', 'quantity', '1');
			nlapiSetCurrentLineItemValue('item', 'povendor', vendorFreightVdr);
		// commit the line to the database
            nlapiCommitLineItem('item');
          }
		var filters = new Array();
		filters[0] = new nlobjSearchFilter( 'custrecord_trans_po_vendor', null, 'anyOf', vendorFreightVdr );
		var columns = new Array();
		columns[0] = new nlobjSearchColumn( 'internalid' );
		var searchResults= nlapiSearchRecord('customrecord_carrier',null,filters,columns);

		for ( var i = 0; searchResults != null && i < searchResults.length; i++ )
		{
		var searchresult = searchResults[ i ];
		var carrier = searchresult.getId( );
		nlapiSetFieldValue('custbody_carrier_code',carrier);
		}
	}
	if(stType=='edit'){
		var rate= nlapiGetFieldValue('custbody_actual_freight_cost');
      var linenumber=nlapiFindLineItemValue('item', 'item', itemVendorFreight);
      nlapiLogExecution('DEBUG','Line number',linenumber);
      if(linenumber!=-1 && (parseFloat(recOldOrder.getFieldValue('custbody_actual_freight_cost'))!=parseFloat(rate))){
        nlapiSelectLineItem('item',linenumber);
      	nlapiSetCurrentLineItemValue('item','quantity',new Number(0));
      	nlapiCommitLineItem('item');
        if(parseFloat(rate)>0.00){
        var vendorFreightVdr = nlapiGetLineItemValue('item', 'povendor', 1);

		nlapiLogExecution('DEBUG','PO vendor of first line',vendorFreightVdr);
		nlapiSelectNewLineItem('item');
		// set the item and location values on the currently selected line
		nlapiSetCurrentLineItemValue('item', 'item', itemVendorFreight);
		nlapiSetCurrentLineItemValue('item', 'custcolfa_vendor_item_name', 'Modified Freight');
		nlapiSetCurrentLineItemValue('item', 'rate', rate);
		nlapiSetCurrentLineItemValue('item', 'porate', rate);
		nlapiSetCurrentLineItemValue('item', 'quantity', '1');
		nlapiSetCurrentLineItemValue('item', 'povendor', vendorFreightVdr);
		// commit the line to the database
		nlapiCommitLineItem('item');
        }
      }else{
        if((parseFloat(recOldOrder.getFieldValue('custbody_actual_freight_cost'))!=parseFloat(rate))&& parseFloat(rate)>0.00){
        var vendorFreightVdr = nlapiGetLineItemValue('item', 'povendor', 1);
				nlapiLogExecution('DEBUG','PO vendor of first line',vendorFreightVdr);
		nlapiSelectNewLineItem('item');
		// set the item and location values on the currently selected line
		nlapiSetCurrentLineItemValue('item', 'item', itemVendorFreight);
		nlapiSetCurrentLineItemValue('item', 'custcolfa_vendor_item_name', 'Freight');
		nlapiSetCurrentLineItemValue('item', 'rate', rate);
		nlapiSetCurrentLineItemValue('item', 'porate', rate);
		nlapiSetCurrentLineItemValue('item', 'quantity', '1');
		nlapiSetCurrentLineItemValue('item', 'povendor', vendorFreightVdr);
		// commit the line to the database
		nlapiCommitLineItem('item');
        }
      }
	}
	}
	//Added by Thilaga for ticket #5129
   if (stType=='create' || stType =='edit' )
		    {
              if(nlapiGetFieldValue('custbody_opportunity_donor')=='' || nlapiGetFieldValue('custbody_opportunity_donor')== null){
                nlapiLogExecution('DEBUG','Opportunity donor',nlapiGetFieldValue('custbody_donor_1'));
                nlapiSetFieldValue('custbody_opportunity_donor',nlapiGetFieldValue('custbody_donor_1'));
              }
            }

   	for (var i = 1; i <= nlapiGetLineItemCount('item'); i++ ) 
    {
	        var itemFirst   =  nlapiGetLineItemValue('item', 'custcol_first_pickup', i);
			if (itemFirst == 'T')
	        {
				nbrFirstLocations++;
            }				

	        var itemQty    = forceParseFloat(nlapiGetLineItemValue('item', 'quantity', i));
			newQty = parseFloat(newQty) + parseFloat(itemQty);
	        var itemWeight = forceParseFloat(nlapiGetLineItemValue('item', 'custcol_item_gross_weight', i));
	        var itemPallet = forceParseFloat(nlapiGetLineItemValue('item', 'custcol_nbr_pallets', i));
            //added by Thilaga
     
            var leadDays = parseFloat(new Number(nlapiGetLineItemValue('item', 'custcol_warehouse_lead_days',i)));
      
            if(leadDays>maxLeadDays){
                    maxLeadDays = leadDays;
            }

            var linechanged = false;

			
			if (stType=='edit')
			{
			   	var currentline = nlapiGetLineItemValue('item', 'line', i);
				var oldline = recOldOrder.getLineItemValue('item', 'line', i);
                //nlapiLogExecution('DEBUG','Lines',' lines ' +  currentline + ' Old line ' + oldline);
				var foundIndex = recOldOrder.findLineItemValue('item', 'line', currentline);
				if (foundIndex == -1)
				{ 	
                    //nlapiLogExecution('DEBUG','Lines',' in line change 1'); //costly to log in a loop - causes script execution usage limit exceeded errors
					linechanged = true;
				}
				if (foundIndex != -1)
				{ 	
			        if ( (nlapiGetLineItemValue('item', 'item', i)     != recOldOrder.getLineItemValue('item', 'item', foundIndex))     ||
			             (nlapiGetLineItemValue('item', 'quantity', i) != recOldOrder.getLineItemValue('item', 'quantity', foundIndex)) ||
			             (nlapiGetLineItemValue('item', 'custcol_item_gross_weight', i) != recOldOrder.getLineItemValue('item', 'custcol_item_gross_weight', foundIndex)) ||
			             (nlapiGetLineItemValue('item', 'custcol_cases_per_pallet', i)  != recOldOrder.getLineItemValue('item', 'custcol_cases_per_pallet', foundIndex)) 
				       )
					   {   
                         //nlapiLogExecution('DEBUG','Lines',' in line change 2 index' + foundIndex);
					     linechanged = true;
					   }	 
				}

            }				

            if (stType=='create' || stType =='edit' )
		    {		
  		      var totalPounds = new Number((parseFloat(itemQty) * parseFloat(itemWeight))).toFixed(2);
	        //  totalPounds     = Math.ceil(totalPounds);
              nlapiSetLineItemValue('item', 'custcol_total_pounds', i, totalPounds );//custcol_total_weight
              nlapiSetLineItemValue('item', 'custcol_total_weight', i, totalPounds );//custcol_total_weight
            
            }
			
	        orderPounds     = parseFloat(orderPounds) + parseFloat(nlapiGetLineItemValue('item', 'custcol_total_weight', i));
if(nlapiGetLineItemText('item', 'custcol_product_channel', i)!="Admin Fees") {     
			totalOrderQty = parseInt(totalOrderQty) + parseInt(itemQty);
	}
			
			if ((stType =='edit' && itemPallet == 0) || (stType=='create' && itemPallet == 0))
            {
				var qtyPerPallet = forceParseFloat(nlapiGetLineItemValue('item', 'custcol_cases_per_pallet', i));
                //nlapiLogExecution('DEBUG',' in no pickup','cases pallets ' +  qtyPerPallet);
                if ((parseFloat(itemQty) > 0) && (parseFloat(qtyPerPallet) > 0))
                { 
	       		    var qtyPerPallet = parseFloat(nlapiGetLineItemValue('item', 'custcol_cases_per_pallet', i));
                  //Commented for ticket #5151
	               // var totalPallets = Math.round((parseFloat(itemQty) / parseFloat(qtyPerPallet))*100)/100;
                  var totalPallets = ((parseFloat(itemQty) / parseFloat(qtyPerPallet))*100)/100;
	                totalPallets = Math.ceil(totalPallets);
	                //nlapiLogExecution('DEBUG',' in no pickup','TtlPallets ' + totalPallets);
	                nlapiSetLineItemValue('item', 'custcol_nbr_pallets', i, totalPallets );
               }	

           }				
            orderPallets = parseFloat(orderPallets) + forceParseFloat(nlapiGetLineItemValue('item', 'custcol_nbr_pallets', i));
			
	}   
	
	nlapiLogExecution('DEBUG',' in no pickup','TtlPallets ' + orderPallets);
	nlapiLogExecution('DEBUG',' in no pickup','TtlPallets ' + orderPounds);
    nlapiSetFieldValue('custbody_total_order_pallets',orderPallets);
    nlapiSetFieldValue('custbody_total_pounds',orderPounds);
	nlapiSetFieldValue('custbody_total_order_qty',totalOrderQty);
  
	if (!Eval.inArray(orderType, ARR_ORDER_TYPES)) {
        return true;
    }

 	if (nbrFirstLocations > 1)
	{
				  //throw ('Please Specify at least one First Pickup Location !');
      			  throw ('There can only be one First Location Designation - Please review the order ! ' + nbrFirstLocations +'-' + nlapiGetLineItemCount('item') );
		          return false;
	}	 

 	if (nbrFirstLocations == 0)
	{
				  throw ('Please Specify at least one First Pickup Location !');
		          return false;
	}	 

	// First check on Create If No Admin or Multi Admin
	var hasIssues = new Array;
	hasIssues     = nlapiGetFieldValues('custbody_order_has_issues_reason');
	var Admin1    = nlapiGetFieldValue('custbodycustbody_admin_fee_recipient');
	var Admin2    = nlapiGetFieldValue('custbody_admin_fee_recp_2');
    var	Admin3    = nlapiGetFieldValue('custbody_admin_fee_recp_3');
	
	
	
	if ((stType=='create' || stType=='edit') && (!isEmpty(Admin1) || !isEmpty(Admin2) || !isEmpty(Admin3)) )
    {

           var foundIndex = nlapiFindLineItemValue('item', 'custcol_admin_fee_vendor', '1');
 	       nlapiLogExecution('DEBUG',' admin fee check ',' found index 1' + foundIndex);
		   var setAdminHasIssues = false;
           if (foundIndex == -1 && !isEmpty(Admin1) && !setAdminHasIssues)
           {
			  
               if (isEmpty(hasIssues))
			   {
			   	   hasIssues = stNoAdmin;
			   } else
               {				   
			     hasIssues = hasIssues.concat(stNoAdmin);
               }	
              setAdminHasIssues = true;			   
			  nlapiSetFieldValue ('custbody_order_has_issues_reason', hasIssues);//custbody_order_has_issues  
              nlapiSetFieldValue ('custbody_order_has_issues','T');  
           }			   

           var foundIndex = nlapiFindLineItemValue('item', 'custcol_admin_fee_vendor', '3');
 	       nlapiLogExecution('DEBUG',' admin fee check ',' found index 3' + foundIndex);
           if (foundIndex == -1 && !isEmpty(Admin3) && !setAdminHasIssues)
           {
			  
               if (isEmpty(hasIssues))
			   {
				   hasIssues = stNoAdmin;
			   } else
               {				   
			     hasIssues = hasIssues.concat(stNoAdmin);
               }	
              setAdminHasIssues = true;			   
			  nlapiSetFieldValue ('custbody_order_has_issues_reason', hasIssues);//custbody_order_has_issues  
              nlapiSetFieldValue ('custbody_order_has_issues','T');  
           }		

           var foundIndex = nlapiFindLineItemValue('item', 'custcol_admin_fee_vendor', '2');
 	       //nlapiLogExecution('DEBUG',' admin fee check ',' found index 2' + foundIndex);
           if (foundIndex == -1 && !isEmpty(Admin2) && !setAdminHasIssues)
           {
			  
 	           nlapiLogExecution('DEBUG',' has issue ',' hs issues ' + hasIssues);
               if (isEmpty(hasIssues))
			   {
				   hasIssues = stNoAdmin;
			   } else
               {				   
			     hasIssues = hasIssues.concat(stNoAdmin);
               }				 
              setAdminHasIssues = true;			   
			  nlapiSetFieldValue ('custbody_order_has_issues_reason', hasIssues);//custbody_order_has_issues  
              nlapiSetFieldValue ('custbody_order_has_issues','T');  
           }			   
		   

		   var poVendor = '';
		   var pocount_1 = 0;
		   var pocount_2 = 0;
		   var pocount_3 = 0;
           for (var i = 1; i <= nlapiGetLineItemCount('item'); i++ ) 
           {
			  var adminline   =  nlapiGetLineItemValue('item','custcol_admin_fee_vendor', i);
			  var adminvendor =  nlapiGetLineItemValue('item','custcol_admin_fee_vendor', i);
              if (adminline == '1' && poVendor != adminvendor)
              {
				   pocount_1++;
              }
			  
              if (adminline == '2' && poVendor != adminvendor)
              {
				   pocount_2++;
              }

              if (adminline == '3' && poVendor != adminvendor)
              {
				   pocount_3++;
              }

 		    }		   

  
		   
	}   
	

    //added by Thilaga for release date
    if (Eval.inArray(orderType, ARR_RECEIPTBYORDER_TYPES)){
        if (isEmpty(nlapiGetFieldValue('custbody_release_date')))
		  {	 
            if(maxLeadDays>0){
		     var today = new Date();
	         today = nlapiDateToString(today);
		     var newdate    = nlapiDateToString(nlapiAddDays(nlapiStringToDate(today), maxLeadDays));
  	         var newdateC    = nlapiStringToDate(newdate);
		    // var dayOfWeek   = newdateC.getDay();
		     var validDate = false;
		    
             //Added by Thilaga
             nlapiLogExecution('DEBUG','iteration + day', maxLeadDays+" : "+maxLeadDays);
              
                 newdateC.setDate(newdateC.getDate() + 1);
                    while(!validDate){
                        if(!validateDate(newdateC)){
                         	newdateC.setDate(newdateC.getDate() + 1);  
                        }else{
                            validDate = true;
                        }
                        nlapiLogExecution('DEBUG','inside while today', i+":"+today);
                    }
                    
                   
             newdateC = nlapiDateToString(newdateC);
		    nlapiSetFieldValue('custbody_release_date',newdateC);
            
		  }
          }
    }

  // Added by Thilaga for bug #5362
  
  var oldOutDate = recOldOrder ? recOldOrder.getFieldValue('custbody_outbydate') : null;
  var newOutDate = nlapiGetFieldValue('custbody_outbydate');
  var oldReleaseDate = recOldOrder ? recOldOrder.getFieldValue('custbody_release_date') : null;
  var newReleaseDate = nlapiGetFieldValue('custbody_release_date');
  var oldActualDeliveryDate = recOldOrder ? recOldOrder.getFieldValue('custbody_actual_carrier_delivery_date') : null;
  var newActualDeliveryDate = nlapiGetFieldValue('custbody_actual_carrier_delivery_date');
  nlapiLogExecution('DEBUG','for bug 5362 + oldOutDate', oldOutDate+" : newOutDate "+newOutDate);
  if(Eval.inArray(orderType, ARR_OUTBYORDER_TYPES) && (oldOutDate!=newOutDate)){
    nlapiSetFieldValue('custbody_receipt_due_date','');
  }
   
  if(Eval.inArray(orderType, ARR_RECEIPTBYORDER_TYPES)){
    
    if(Eval.inArray(shipmentMethod,ARR_FASHIPR_TYPES)){
     	 if(oldActualDeliveryDate!=newActualDeliveryDate){
    		nlapiSetFieldValue('custbody_receipt_due_date','');
    	}
    } else{
      	if(oldReleaseDate!=newReleaseDate){
    		nlapiSetFieldValue('custbody_receipt_due_date','');
   		 }
    }
  }
 
    
    // Calculate out by date * receipt due date- if a donation item type calc as 5 days form today - otherwise set to release date
	if (Eval.inArray(orderType, ARR_OUTBYORDER_TYPES) && (isEmpty(nlapiGetFieldValue('custbody_outbydate')) || isEmpty(nlapiGetFieldValue('custbody_receipt_due_date')) || isEmpty(nlapiGetFieldValue('custbodycustbody_requested_pickup_date')))) {
        
		  if (isEmpty(nlapiGetFieldValue('custbody_outbydate')))
		  {	   
		     var today = new Date();
             if((nlapiGetFieldValue('custbody_release_date').valueOf())<(nlapiGetFieldValue('trandate').valueOf())){
	            today = nlapiGetFieldValue('trandate');
             }else{
                today = nlapiGetFieldValue('custbody_release_date');
             }
		     //var newdate    = nlapiDateToString(nlapiAddDays(nlapiStringToDate(today), stOutByOrderDays));
  	         var newdateC    = nlapiStringToDate(today);
		    // var dayOfWeek   = newdateC.getDay();
		     var validDate = false;
		    
             //Added by Thilaga
             nlapiLogExecution('DEBUG','iteration + day', stOutByOrderDays+" : "+stOutByOrderDays);
               for(var i=0;i<stOutByOrderDays;i++){
                 //newdateC    = nlapiStringToDate(today);
                 newdateC.setDate(newdateC.getDate() + 1);
                    while(!validDate){
                        if(!validateDate(newdateC)){
                         	newdateC.setDate(newdateC.getDate() + 1);  
                        }else{
                            validDate = true;
                        }
                        nlapiLogExecution('DEBUG','inside while today', i+":"+today);
                    }
                    
                    validDate = false;
               }
             newdateC = nlapiDateToString(newdateC);
		    nlapiSetFieldValue('custbody_outbydate',newdateC);
            
		  }
	if(isEmpty(nlapiGetFieldValue('custbodycustbody_requested_pickup_date'))&& isEmpty(nlapiGetFieldValue('custbody_odyssey_offer_date'))){
                nlapiSetFieldValue('custbodycustbody_requested_pickup_date',nlapiGetFieldValue('custbody_outbydate'));
            }
		  if (isEmpty(nlapiGetFieldValue('custbody_receipt_due_date')))
		  {	  
		       var today = new Date(nlapiGetFieldValue('custbody_outbydate'));
	           today = nlapiDateToString(today);
		      // var newdate    = nlapiDateToString(nlapiAddDays(nlapiStringToDate(today), (stOutByOrderDays * 2)));
  	           var newdateC    = nlapiStringToDate(today);
		    //   var dayOfWeek   = newdateC.getDay();
		       var validDate = false;
		      
               nlapiLogExecution('DEBUG','iteration + day', stOutByOrderDays+" : "+stOutByOrderDays);
               for(var i=0;i<stOutByOrderDays;i++){
                 //newdateC    = nlapiStringToDate(today);
                 newdateC.setDate(newdateC.getDate() + 1);
                    while(!validDate){
                        if(!validateDate(newdateC)){
                         	newdateC.setDate(newdateC.getDate() + 1);  
                        }else{
                            validDate = true;
                        }
                        nlapiLogExecution('DEBUG','inside while today', i+":"+today);
                    }
                    
                    validDate = false;
               }
               newdateC = nlapiDateToString(newdateC);
		       nlapiSetFieldValue('custbody_receipt_due_date',newdateC);
		  } 
    } else
	{
      if (Eval.inArray(orderType, ARR_RECEIPTBYORDER_TYPES)){

		if (isEmpty(nlapiGetFieldValue('custbody_outbydate')))
	    {
			nlapiSetFieldValue('custbody_outbydate',nlapiGetFieldValue('custbody_release_date'));
        }	
        if (isEmpty(nlapiGetFieldValue('custbodycustbody_requested_pickup_date')))
	    {
			nlapiSetFieldValue('custbodycustbody_requested_pickup_date',nlapiGetFieldValue('custbody_release_date'));
        }	

        if(Eval.inArray(shipmentMethod,ARR_FASHIPR_TYPES)){
            if(isEmpty(nlapiGetFieldValue('custbody_receipt_due_date')) && !isEmpty(nlapiGetFieldValue('custbody_actual_carrier_delivery_date')))
            {
			   var leadDays = stFADays;
			   
		       var today = new Date();
	           today =  nlapiGetFieldValue('custbody_actual_carrier_delivery_date');
			  // var newdate    = nlapiDateToString(nlapiAddDays(nlapiStringToDate(today), leadDays));
  	           var newdateC    = nlapiStringToDate(today);
		       var dayOfWeek   = newdateC.getDay();
		       var validDate = false;
		      
               nlapiLogExecution('DEBUG','iteration + day', leadDays+":"+today);
               for(var i=0;i<leadDays;i++){
                 //newdateC    = nlapiStringToDate(today);
                 newdateC.setDate(newdateC.getDate() + 1);
                    while(!validDate){
                        if(!validateDate(newdateC)){
                         	newdateC.setDate(newdateC.getDate() + 1);  
                        }else{
                            validDate = true;
                        }
                        nlapiLogExecution('DEBUG','inside while today', i+":"+today);
                    }
                    
                    validDate = false;
               }
               var newdate = nlapiDateToString(newdateC);
		       nlapiSetFieldValue('custbody_receipt_due_date',newdate);
             }
			}
            else{
            if(isEmpty(nlapiGetFieldValue('custbody_receipt_due_date')))
            {
			  
				var leadDays = stNonFADays;
               			   

		       var today = new Date();
	           today =  nlapiGetFieldValue('custbody_release_date');
			  // var newdate    = nlapiDateToString(nlapiAddDays(nlapiStringToDate(today), leadDays));
  	           var newdateC    = nlapiStringToDate(today);
		       var dayOfWeek   = newdateC.getDay();
		       var validDate = false;
		      
               nlapiLogExecution('DEBUG','iteration + day', leadDays+":"+today);
               for(var i=0;i<leadDays;i++){
                 //newdateC    = nlapiStringToDate(today);
                 newdateC.setDate(newdateC.getDate() + 1);
                    while(!validDate){
                        if(!validateDate(newdateC)){
                         	newdateC.setDate(newdateC.getDate() + 1);  
                        }else{
                            validDate = true;
                        }
                        nlapiLogExecution('DEBUG','inside while today', i+":"+today);
                    }
                    
                    validDate = false;
               }
               var newdate = nlapiDateToString(newdateC);
		       nlapiSetFieldValue('custbody_receipt_due_date',newdate);
             }

            }
		}			
		
	}
	
  // Check if releaseDate, out by date, release number or the line item pickup location or status changes - set to modified
	if(stType=='edit')
	{
	   var oldRecord      = nlapiGetOldRecord();
	   var recModified    = false;
       var changeText     = '';
	   
	   nlapiSetFieldValue('custbody_transaction_changes','');
	   
	   if ( nlapiGetFieldValue('custbody_release_date') !=  oldRecord.getFieldValue('custbody_release_date') )
	   {
		   //nlapiSetFieldValue('custbdy_order_status',stOrderModified)
		   changeText = changeText + '<br>' + 'The Release Date has changed from: ' + oldRecord.getFieldValue('custbody_release_date') + ' to: ' + nlapiGetFieldValue('custbody_release_date') + "</br>";
		   recModified = true;
        }		   
      
	   if ( nlapiGetFieldValue('custbody_outbydate') !=  oldRecord.getFieldValue('custbody_outbydate') )
	   {
		   changeText = changeText + "<br>" + 'The Out By Date has changed from: ' + oldRecord.getFieldValue('custbody_outbydate') + ' to: ' + nlapiGetFieldValue('custbody_outbydate') + "</br>";
		   //nlapiSetFieldValue('custbody_order_status',stOrderModified)
 		   recModified = true;
       }		   

       if ( (!isEmpty(nlapiGetFieldValue('custbody_release_number'))) && (nlapiGetFieldValue('custbody_release_number') !=  oldRecord.getFieldValue('custbody_release_number')))
	   {

          changeText = changeText + "<br>" + 'The Release Number for Pick-Up location #1 has changed from: ' + oldRecord.getFieldValue('custbody_release_number') + ' to: ' + nlapiGetFieldValue('custbody_release_number') + "</br>";
		   //nlapiSetFieldValue('custbody_order_status',stOrderModified)
 		   recModified = true;
       }

   	   if ( (nlapiGetFieldValue('custbody_release_number') !=  oldRecord.getFieldValue('custbody_release_number')) &&
	     ( !isEmpty(nlapiGetFieldValue('custbody_release_number')) || !isEmpty(oldRecord.getFieldValue('custbody_release_number')) ) )
	   {
		   var oldValue = oldRecord.getFieldValue('custbody_release_number');
		   if  (isEmpty(nlapiGetFieldValue('custbody_release_number')))
		   {
                var oldValue = 'No Value';
           }				
 		   
		   changeText = changeText + "<br>" + 'The Release Number for Pick-Up location #1 has changed from: ' + oldValue + ' to: ' + nlapiGetFieldValue('custbody_release_number') + "</br>";
 		   recModified = true;
       }

	   
	   if ( (nlapiGetFieldValue('custbody_release_no_donor1') !=  oldRecord.getFieldValue('custbody_release_no_donor1')) && 
	     ( !isEmpty(nlapiGetFieldValue('custbody_release_no_donor1')) || !isEmpty(oldRecord.getFieldValue('custbody_release_no_donor1')) ) )
	   {
		   var oldValue = oldRecord.getFieldValue('custbody_release_no_donor1');
		   if  (isEmpty(nlapiGetFieldValue('custbody_release_no_donor1')))
		   {
                var oldValue = 'No Value';
           }				
 		   
		   changeText = changeText + "<br>" + 'The Release Number for Pick-Up location #1 has changed from: ' + oldValue + ' to: ' + nlapiGetFieldValue('custbody_release_no_donor1') + "</br>";
 		   recModified = true;
       }

	   if ( (nlapiGetFieldValue('custbody_release_no_donor2') !=  oldRecord.getFieldValue('custbody_release_no_donor2')) &&
	     ( !isEmpty(nlapiGetFieldValue('custbody_release_no_donor2')) || !isEmpty(oldRecord.getFieldValue('custbody_release_no_donor2')) ) )
	   {
		   var oldValue =  oldRecord.getFieldValue('custbody_release_no_donor2');
		   if  (isEmpty(nlapiGetFieldValue('custbody_release_no_donor2')))
		   {
                var oldValue = 'No Value';
           }
		   changeText = changeText + "<br>" + 'The Release Number for Pick-Up location #2 has changed from: ' + oldValue + ' to: ' + nlapiGetFieldValue('custbody_release_no_donor2') + "</br>";
 		   recModified = true;
       }

	   if ( (nlapiGetFieldValue('custbody_release_no_donor3') !=  oldRecord.getFieldValue('custbody_release_no_donor3')) &&
	     ( !isEmpty(nlapiGetFieldValue('custbody_release_no_donor3')) || !isEmpty(oldRecord.getFieldValue('custbody_release_no_donor3')) ) )
	   {
		   var oldValue =  oldRecord.getFieldValue('custbody_release_no_donor3');
		   if  (isEmpty(nlapiGetFieldValue('custbody_release_no_donor3')))
		   {
                var oldValue = 'No Value';
           }				
 		   
		   changeText = changeText + "<br>" + 'The Release Number for Pick-Up location #3 has changed from: ' + oldValue + ' to: ' + nlapiGetFieldValue('custbody_release_no_donor3') + "</br>";
 		   recModified = true;
       }

	   if ( (nlapiGetFieldValue('custbody_delivery_instructions') !=  oldRecord.getFieldValue('custbody_delivery_instructions')) && 
	     ( !isEmpty(nlapiGetFieldValue('custbody_delivery_instructions')) || !isEmpty(oldRecord.getFieldValue('custbody_delivery_instructions')) ) )
	   {
		   var oldValue = oldRecord.getFieldValue('custbody_delivery_instructions');
		   if  (isEmpty(nlapiGetFieldValue('custbody_delivery_instructions')))
		   {
                var oldValue = 'No Value';
           }				
 		   
		   changeText = changeText + "<br>" + 'The Delivery Instructions have changed from: ' + oldValue + ' to: ' + nlapiGetFieldValue('custbody_delivery_instructions') + "</br>";
 		   recModified = true;
       }

  	   
       if ( (nlapiGetFieldValue('custbody_warehouse_1') !=  oldRecord.getFieldValue('custbody_warehouse_1')) && 
	       ( !isEmpty(nlapiGetFieldValue('custbody_warehouse_1')) || !isEmpty(oldRecord.getFieldValue('custbody_warehouse_1')) ) )
	   {

		   var oldValue = oldRecord.getFieldText('custbody_warehouse_1');
	       if  (isEmpty(oldValue))
		   {
               oldValue = 'No Value';
           }				
           var oldWarehouse = [];
	       oldWarehouse = oldValue.split('-WN');		  
 		   
		   var newValue = nlapiGetFieldText('custbody_warehouse_1');
	       if  (isEmpty(nlapiGetFieldValue('custbody_warehouse_1')))
		   {
               newValue = 'No Value';
           }				
           var newWarehouse = [];
	       newWarehouse = newValue.split('-WN');		  
		   
		   changeText = changeText + "<br>" + 'Warehouse#1 has changed from: ' + oldWarehouse[0]  + ' to: ' + newWarehouse[0] + "</br>";
 		   recModified = true;
       }

       if ( (nlapiGetFieldValue('custbody_warehouse_2') !=  oldRecord.getFieldValue('custbody_warehouse_2')) && 
	       ( !isEmpty(nlapiGetFieldValue('custbody_warehouse_2')) || !isEmpty(oldRecord.getFieldValue('custbody_warehouse_2')) ) )
	   {
		   var oldValue = oldRecord.getFieldText('custbody_warehouse_2');
	       if  (isEmpty(oldValue))
		   {
               oldValue = 'No Value';
           }				
           var oldWarehouse = [];
	       oldWarehouse = oldValue.split('-WN');		  
 		   
		   var newValue = nlapiGetFieldText('custbody_warehouse_2');
	       if  (isEmpty(nlapiGetFieldValue('custbody_warehouse_2')))
		   {
               newValue = 'No Value';
           }				
           var newWarehouse = [];
	       newWarehouse = newValue.split('-WN');		  
		   
		   changeText = changeText + "<br>" + 'Warehouse#2 has changed from: ' + oldWarehouse[0]  + ' to: ' + newWarehouse[0] + "</br>";
 		   recModified = true;
       }

       if ( (nlapiGetFieldValue('custbody_warehouse_3') !=  oldRecord.getFieldValue('custbody_warehouse_3')) && 
	       ( !isEmpty(nlapiGetFieldValue('custbody_warehouse_3')) || !isEmpty(oldRecord.getFieldValue('custbody_warehouse_3')) ) )
	   {

		   var oldValue = oldRecord.getFieldText('custbody_warehouse_3');
	       if  (isEmpty(oldValue))
		   {
               oldValue = 'No Value';
           }				
           var oldWarehouse = [];
	       oldWarehouse = oldValue.split('-WN');		  
 		   
		   var newValue = nlapiGetFieldText('custbody_warehouse_3');
	       if  (isEmpty(nlapiGetFieldValue('custbody_warehouse_3')))
		   {
               newValue = 'No Value';
           }				
           var newWarehouse = [];
	       newWarehouse = newValue.split('-WN');		  
		   
		   changeText = changeText + "<br>" + 'Warehouse#3 has changed from: ' + oldWarehouse[0]  + ' to: ' + newWarehouse[0] + "</br>";
 		   recModified = true;
       }
	   
       if ( (nlapiGetFieldValue('custbody_warehouse_contact1') !=  oldRecord.getFieldValue('custbody_warehouse_contact1')) && 
	       ( !isEmpty(nlapiGetFieldValue('custbody_warehouse_contact1')) || !isEmpty(oldRecord.getFieldValue('custbody_warehouse_contact1')) ) )
	   {
		   var oldValue =  oldRecord.getFieldText('custbody_warehouse_contact1');
		   if  (isEmpty(nlapiGetFieldValue('custbody_warehouse_contact1')))
		   {
                var oldValue = 'No Value';
           }				
 		   
		   changeText = changeText + "<br>" + 'Warehouse Contact#1 has changed from: ' + oldValue + ' to: ' + nlapiGetFieldText('custbody_warehouse_contact1') + "</br>";
 		   recModified = true;
       }

       if ( (nlapiGetFieldValue('custbody_warehouse_contact2') !=  oldRecord.getFieldValue('custbody_warehouse_contact2')) && 
	       ( !isEmpty(nlapiGetFieldValue('custbody_warehouse_contact2')) || !isEmpty(oldRecord.getFieldValue('custbody_warehouse_contact2')) ) )
	   {
		   var oldValue =  oldRecord.getFieldText('custbody_warehouse_contact2');
		   if  (isEmpty(nlapiGetFieldValue('custbody_warehouse_contact2')))
		   {
                var oldValue = 'No Value';
           }				
 		   
		   changeText = changeText + "<br>" + 'Warehouse Contact#2 has changed from: ' + oldValue + ' to: ' + nlapiGetFieldText('custbody_warehouse_contact2') + "</br>";
 		   recModified = true;
       }

       if ( (nlapiGetFieldValue('custbody_warehouse_contact3') !=  oldRecord.getFieldValue('custbody_warehouse_contact3')) && 
	       ( !isEmpty(nlapiGetFieldValue('custbody_warehouse_contact3')) || !isEmpty(oldRecord.getFieldValue('custbody_warehouse_contact3')) ) )
	   {
		   var oldValue =  oldRecord.getFieldText('custbody_warehouse_contact3');
		   if  (isEmpty(nlapiGetFieldValue('custbody_warehouse_contact3')))
		   {
                var oldValue = 'No Value';
           }				
 		   
		   changeText = changeText + "<br>" + 'Warehouse Contact#3 has changed from: ' + oldValue + ' to: ' + nlapiGetFieldText('custbody_warehouse_contact3') + "</br>";
 		   recModified = true;
       }
      if ( (nlapiGetFieldValue('custbody_drop_off_location1') !=  oldRecord.getFieldValue('custbody_drop_off_location1')) && 
	       ( !isEmpty(nlapiGetFieldValue('custbody_drop_off_location1')) || !isEmpty(oldRecord.getFieldValue('custbody_drop_off_location1')) ) )
	   {

		   var oldValue = oldRecord.getFieldText('custbody_drop_off_location1');
	       if  (isEmpty(oldValue))
		   {
               oldValue = 'No Value';
           }				
           var oldWarehouse = [];
	       oldWarehouse = oldValue.split('-WN');		  
 		   
		   var newValue = nlapiGetFieldText('custbody_drop_off_location1');
	       if  (isEmpty(nlapiGetFieldValue('custbody_drop_off_location1')))
		   {
               newValue = 'No Value';
           }				
           var newWarehouse = [];
	       newWarehouse = newValue.split('-WN');		  
		   
		   changeText = changeText + "<br>" + 'Dropoff#1 has changed from: ' + oldWarehouse[0]  + ' to: ' + newWarehouse[0] + "</br>";
 		   recModified = true;
       }

       if ( (nlapiGetFieldValue('custbody_drop_off_location_2') !=  oldRecord.getFieldValue('custbody_drop_off_location_2')) && 
	       ( !isEmpty(nlapiGetFieldValue('custbody_drop_off_location_2')) || !isEmpty(oldRecord.getFieldValue('custbody_drop_off_location_2')) ) )
	   {
		   var oldValue = oldRecord.getFieldText('custbody_drop_off_location_2');
	       if  (isEmpty(oldValue))
		   {
               oldValue = 'No Value';
           }				
           var oldWarehouse = [];
	       oldWarehouse = oldValue.split('-WN');		  
 		   
		   var newValue = nlapiGetFieldText('custbody_drop_off_location_2');
	       if  (isEmpty(nlapiGetFieldValue('custbody_drop_off_location_2')))
		   {
               newValue = 'No Value';
           }				
           var newWarehouse = [];
	       newWarehouse = newValue.split('-WN');		  
		   
		   changeText = changeText + "<br>" + 'Dropoff#2 has changed from: ' + oldWarehouse[0]  + ' to: ' + newWarehouse[0] + "</br>";
 		   recModified = true;
       }

       if ( (nlapiGetFieldValue('custbody_drop_off_location_3') !=  oldRecord.getFieldValue('custbody_drop_off_location_3')) && 
	       ( !isEmpty(nlapiGetFieldValue('custbody_drop_off_location_3')) || !isEmpty(oldRecord.getFieldValue('custbody_drop_off_location_3')) ) )
	   {

		   var oldValue = oldRecord.getFieldText('custbody_drop_off_location_3');
	       if  (isEmpty(oldValue))
		   {
               oldValue = 'No Value';
           }				
           var oldWarehouse = [];
	       oldWarehouse = oldValue.split('-WN');		  
 		   
		   var newValue = nlapiGetFieldText('custbody_drop_off_location_3');
	       if  (isEmpty(nlapiGetFieldValue('custbody_drop_off_location_3')))
		   {
               newValue = 'No Value';
           }				
           var newWarehouse = [];
	       newWarehouse = newValue.split('-WN');		  
		   
		   changeText = changeText + "<br>" + 'Dropoff#3 has changed from: ' + oldWarehouse[0]  + ' to: ' + newWarehouse[0] + "</br>";
 		   recModified = true;
       }
      if ( (nlapiGetFieldValue('custbody_drop_off_location_4') !=  oldRecord.getFieldValue('custbody_drop_off_location_4')) && 
	       ( !isEmpty(nlapiGetFieldValue('custbody_drop_off_location_4')) || !isEmpty(oldRecord.getFieldValue('custbody_drop_off_location_4')) ) )
	   {

		   var oldValue = oldRecord.getFieldText('custbody_drop_off_location_4');
	       if  (isEmpty(oldValue))
		   {
               oldValue = 'No Value';
           }				
           var oldWarehouse = [];
	       oldWarehouse = oldValue.split('-WN');		  
 		   
		   var newValue = nlapiGetFieldText('custbody_drop_off_location_4');
	       if  (isEmpty(nlapiGetFieldValue('custbody_drop_off_location_4')))
		   {
               newValue = 'No Value';
           }				
           var newWarehouse = [];
	       newWarehouse = newValue.split('-WN');		  
		   
		   changeText = changeText + "<br>" + 'Dropoff#4 has changed from: ' + oldWarehouse[0]  + ' to: ' + newWarehouse[0] + "</br>";
 		   recModified = true;
       }
      //Added by Thilaga
      
      
      
       if ( nlapiGetFieldValue('custbody_total_pounds') != oldRecord.getFieldValue('custbody_total_pounds')) 
	   {

           if (forceParseFloat(nlapiGetFieldValue('custbody_total_pounds')) > 0 &&  forceParseFloat(oldRecord.getFieldValue('custbody_total_pounds')) )
		   {	   
		     //var poundChange = (forceParseFloat(oldRecord.getFieldValue('custbody_total_pounds')) - forceParseFloat(nlapiGetFieldValue('custbody_total_pounds'))) /  forceParseFloat(nlapiGetFieldValue('custbody_total_pounds'));
		     var poundChange = (forceParseFloat(oldRecord.getFieldValue('custbody_total_pounds')).toFixed(2) - forceParseFloat(nlapiGetFieldValue('custbody_total_pounds')).toFixed(2)); 
			 nlapiLogExecution('DEBUG',' pound change ',' found index ' + poundChange);
             poundChange = Math.abs(poundChange);
			 nlapiLogExecution('DEBUG',' pound change ',' found index ' + oldRecord.getFieldValue('custbody_total_pounds'));
			 nlapiLogExecution('DEBUG',' pound change ',' found index ' + nlapiGetFieldValue('custbody_total_pounds'));
			 nlapiLogExecution('DEBUG',' pound change ',' found index ' + poundChange);
			 var oldPounds = forceParseFloat(oldRecord.getFieldValue('custbody_total_pounds')).toFixed(2);
			 var newPounds = forceParseFloat(nlapiGetFieldValue('custbody_total_pounds')).toFixed(2);
		     var poundChangePct = (Math.abs(oldPounds - newPounds) /  newPounds);
			 nlapiLogExecution('DEBUG',' pound pct change ',' found index ' + poundChangePct);

			 if (poundChangePct >= .10 && (Eval.inArray(orderType, ARR_DONATION_TYPES)))
		     {
			  //var oldPoundT = String.format("%,d", oldPounds)
			  changeText = changeText + "<br>" + 'The total pounds has changed from: ' + oldPounds + ' to: ' + newPounds + "</br>";
		      //nlapiSetFieldValue('custbody_order_status',stOrderModified)
 		      recModified = true;
			 } 
			 if (poundChange > 0 && (!Eval.inArray(orderType, ARR_DONATION_TYPES)))
		     {
				 nlapiLogExecution('DEBUG',' IN GROCERY CHANGEe ',' found index ' + poundChangePct);
			  changeText = changeText + "<br>" + 'The total pounds has changed from: ' + oldPounds + ' to: ' + newPounds + "</br>";
		      //nlapiSetFieldValue('custbody_order_status',stOrderModified)
 		      recModified = true;
			 } 
		   } 
       }

       //we are getting script execution usage exceeded errors on large Sales Orders - need to make this code more efficient.
       //meanwhile we'need to get the record to save so skipping item changes for orders with more than 100 items 
      if(oldRecord.getLineItemCount('item') > 100){
			//changeText = changeText + "<br>" + 'Temporarily not checking for line changes on orders with more thana 100 items until we can make the code be more efficient and not timeout.'
      }
      else{
      
        var oldQty = parseFloat('0');
        var newQty = parseFloat('0');

       var arrOldRecord=[];
        var arrNewRecord=[];
        var iter=new Number(0);

        for (var i = 1; i <= oldRecord.getLineItemCount('item'); i++ ) 
        {
          //Elizabeth: below starts edits for ticket #6259 - adding dlvd rate as a modified field for grocery modified emails
              var itemQty       =  forceParseFloat(oldRecord.getLineItemValue('item', 'quantity', i));
          var poPrice = forceParseFloat(oldRecord.getLineItemValue('item', 'porate', i));
          var dlvdrate = forceParseFloat(oldRecord.getLineItemValue('item', 'custcol_adj_invoice_rate', i));
          var rate = forceParseFloat(oldRecord.getLineItemValue('item', 'rate', i));
              var itemChannel   =  oldRecord.getLineItemValue('item', 'custcol_product_channel', i);

              if (Eval.inArray(itemChannel, ARR_PRODUCTCHANNEL_TYPES))
              {	
               oldQty = parseFloat(oldQty) + parseFloat(itemQty);
                if(!Eval.inArray(orderType, ARR_DONATION_TYPES)){
                  var oldItemValue={
                    linenumber:oldRecord.getLineItemValue('item', 'line', i),
                    itemid:oldRecord.getLineItemValue('item', 'item', i),
                    itemname:oldRecord.getLineItemValue('item', 'description', i),
                    quantity:itemQty,
                    porate:poPrice,
                    dlvdrate:dlvdrate,
                    rate:rate
                  }
                  arrOldRecord[iter]=oldItemValue;
                  iter++;
              }else{
                var oldItemValue={
                    linenumber:oldRecord.getLineItemValue('item', 'line', i),
                    itemid:oldRecord.getLineItemValue('item', 'item', i),
                    itemname:oldRecord.getLineItemValue('item', 'description', i),
                    quantity:itemQty,
                    porate:poPrice,
                    dlvdrate:dlvdrate,
                    rate:rate,
                  usebydate:oldRecord.getLineItemValue('item', 'custcolcustcol_usebydate', i)
                  }
                  arrOldRecord[iter]=oldItemValue;
                  iter++;
              }
          } 

        }
        iter=0;
        for (var i = 1; i <= nlapiGetLineItemCount('item'); i++ ) 
        {

              var itemQty      =  forceParseFloat(nlapiGetLineItemValue('item', 'quantity', i));
          var poPrice = forceParseFloat(nlapiGetLineItemValue('item', 'porate', i));
          var dlvdrate = forceParseFloat(nlapiGetLineItemValue('item', 'custcol_adj_invoice_rate', i));
          var rate = forceParseFloat(nlapiGetLineItemValue('item', 'rate', i));
                      var itemChannel  =  nlapiGetLineItemValue('item', 'custcol_product_channel', i);

              if (Eval.inArray(itemChannel, ARR_PRODUCTCHANNEL_TYPES))
              {	
                newQty = parseFloat(newQty) + parseFloat(itemQty);
                if(!Eval.inArray(orderType, ARR_DONATION_TYPES)){
                      var newItemValue={
                       linenumber:nlapiGetLineItemValue('item', 'line', i),
                      itemid:nlapiGetLineItemValue('item', 'item', i),
                      itemname:nlapiGetLineItemValue('item', 'description', i),
                      quantity:itemQty,
                      porate:poPrice,
                      dlvdrate:dlvdrate,
                      rate:rate
                  }
                  arrNewRecord[iter]=newItemValue;
                  iter++;
                  }else{
                    var newItemValue={
                       linenumber:nlapiGetLineItemValue('item', 'line', i),
                      itemid:nlapiGetLineItemValue('item', 'item', i),
                      itemname:nlapiGetLineItemValue('item', 'description', i),
                      quantity:itemQty,
                      porate:poPrice,
                      dlvdrate:dlvdrate,
                      rate:rate,
                     usebydate:nlapiGetLineItemValue('item', 'custcolcustcol_usebydate', i)
                  }
                  arrNewRecord[iter]=newItemValue;
                  iter++;
                  }
              }  
        }


        if ( oldQty != newQty) 
         {

             if (newQty > 0 &&  oldQty > 0)
             {	   
               var qtyChange = (Math.abs(oldQty - newQty) /  newQty);
               nlapiLogExecution('DEBUG',' qty change ',' found index 2' + qtyChange);

               if (qtyChange >= .10 && (Eval.inArray(orderType, ARR_DONATION_TYPES)))
               {
                changeText = changeText + "<br>" + 'The total quantity has changed from: ' + oldQty + ' to: ' + newQty + "</br>";
                //nlapiSetFieldValue('custbody_order_status',stOrderModified)
                recModified = true;
               } 
               if (qtyChange > 0 && (!Eval.inArray(orderType, ARR_DONATION_TYPES)))  //if a non donation then tag as a qty change 
               {
                changeText = changeText + "<br>" + 'The total quantity has changed from: ' + oldQty + ' to: ' + newQty + "</br>";
                //nlapiSetFieldValue('custbody_order_status',stOrderModified)
                recModified = true;
               }				 
             } 
         }

         if(nlapiGetFieldText('custbody_order_status')=='Accepted'){
        //Added by Thilaga
        var iterator = new Number(0);

        iterator=arrOldRecord.length;

        var oldRecIter = new Number(0);
        var newRecIter = new Number(0);
            nlapiLogExecution('DEBUG',' iterator + oldrecord +newRecord ',iterator+" "+arrOldRecord+" "+arrNewRecord);

      for(var i=0;i<=iterator;i++){
   //  nlapiLogExecution('DEBUG',' line number old new ',arrOldRecord[oldRecIter].linenumber+" "+arrNewRecord[newRecIter].linenumber);
        //Elizabeth: below specifies conditions for non-grocery modified emails
if (orderType != '1') {
        if(arrOldRecord[oldRecIter]==null && arrNewRecord[newRecIter]==null){
          continue;
        }	
        else if(arrOldRecord[oldRecIter]!=null && arrOldRecord[oldRecIter].linenumber!=null && arrNewRecord[newRecIter]==null){
          changeText = changeText + "<br>" +"Item deleted - "+arrOldRecord[oldRecIter].itemname+" Quantity - "+arrOldRecord[oldRecIter].quantity+" PO Rate - "+arrOldRecord[oldRecIter].porate+" Rate - "+arrOldRecord[oldRecIter].rate;
            oldRecIter++;
        }
        else if(arrNewRecord[newRecIter]!=null && (arrNewRecord[newRecIter].linenumber==null || arrNewRecord[newRecIter].linenumber=="")){
          changeText = changeText + "<br>" +"Item added - "+arrNewRecord[newRecIter].itemname+" Quantity - "+arrNewRecord[newRecIter].quantity+" PO Rate - "+arrNewRecord[newRecIter].porate+" Rate - "+arrNewRecord[newRecIter].rate;
          newRecIter++;
          iterator++;

          }
          else if(arrNewRecord[newRecIter].linenumber==arrOldRecord[oldRecIter].linenumber){
            if(arrNewRecord[newRecIter].itemid!=arrOldRecord[oldRecIter].itemid){
              changeText = changeText + "<br>" +"Item changed from old value: "+arrOldRecord[oldRecIter].itemname+" to new value: "+arrNewRecord[newRecIter].itemname;
            }
            if(arrNewRecord[newRecIter].porate!=arrOldRecord[oldRecIter].porate){
              changeText = changeText + "<br>" +"PO Rate changed from old value: "+arrOldRecord[oldRecIter].porate+" to new value: "+arrNewRecord[newRecIter].porate+" for item "+arrNewRecord[newRecIter].itemname;
            }
            if(arrNewRecord[newRecIter].quantity!=arrOldRecord[oldRecIter].quantity){
              changeText = changeText + "<br>" +"Quantity changed from old value: "+arrOldRecord[oldRecIter].quantity+" to new value: "+arrNewRecord[newRecIter].quantity+" for item "+arrNewRecord[newRecIter].itemname;
            }
            if(arrNewRecord[newRecIter].rate!=arrOldRecord[oldRecIter].rate){
              changeText = changeText + "<br>" +"Rate changed from old value: "+arrOldRecord[oldRecIter].rate+" to new value: "+arrNewRecord[newRecIter].rate+" for item "+arrNewRecord[newRecIter].itemname;
            }
            if(arrNewRecord[newRecIter].usebydate!=arrOldRecord[oldRecIter].usebydate){
              changeText = changeText + "<br>" +"Use By Date changed from old value: "+arrOldRecord[oldRecIter].usebydate+" to new value: "+arrNewRecord[newRecIter].usebydate+" for item "+arrNewRecord[newRecIter].itemname;
            }
            oldRecIter++;
            newRecIter++;

          }else {
        changeText = changeText + "<br>" +"Item deleted - "+arrOldRecord[oldRecIter].itemname+" Quantity - "+arrOldRecord[oldRecIter].quantity+" PO Rate - "+arrOldRecord[oldRecIter].porate+" Rate - "+arrOldRecord[oldRecIter].rate;
          oldRecIter++;
          }
      }
        //Elizabeth: below specifies conditions for grocery modified emails
        else if (orderType == '1') {
          
                  if(arrOldRecord[oldRecIter]==null && arrNewRecord[newRecIter]==null){
          continue;
        }	
        else if(arrOldRecord[oldRecIter]!=null && arrOldRecord[oldRecIter].linenumber!=null && arrNewRecord[newRecIter]==null){
          changeText = changeText + "<br>" +"Item deleted - "+arrOldRecord[oldRecIter].itemname+" Quantity - "+arrOldRecord[oldRecIter].quantity+" Dlvd Rate - "+arrOldRecord[oldRecIter].dlvdrate;
            oldRecIter++;
        }
        else if(arrNewRecord[newRecIter]!=null && (arrNewRecord[newRecIter].linenumber==null || arrNewRecord[newRecIter].linenumber=="")){
          changeText = changeText + "<br>" +"Item added - "+arrNewRecord[newRecIter].itemname+" Quantity - "+arrNewRecord[newRecIter].quantity+" Dlvd Rate - "+arrNewRecord[newRecIter].dlvdrate;
          newRecIter++;
          iterator++;

          }
          else if(arrNewRecord[newRecIter].linenumber==arrOldRecord[oldRecIter].linenumber){
            if(arrNewRecord[newRecIter].itemid!=arrOldRecord[oldRecIter].itemid){
              changeText = changeText + "<br>" +"Item changed from old value: "+arrOldRecord[oldRecIter].itemname+" to new value: "+arrNewRecord[newRecIter].itemname;
            }
            if(arrNewRecord[newRecIter].dlvdrate!=arrOldRecord[oldRecIter].dlvdrate){
              changeText = changeText + "<br>" +"Dlvd Rate changed from old value: "+arrOldRecord[oldRecIter].dlvdrate+" to new value: "+arrNewRecord[newRecIter].dlvdrate+" for item "+arrNewRecord[newRecIter].itemname;
            }
            if(arrNewRecord[newRecIter].quantity!=arrOldRecord[oldRecIter].quantity){
              changeText = changeText + "<br>" +"Quantity changed from old value: "+arrOldRecord[oldRecIter].quantity+" to new value: "+arrNewRecord[newRecIter].quantity+" for item "+arrNewRecord[newRecIter].itemname;
            }
            if(arrNewRecord[newRecIter].usebydate!=arrOldRecord[oldRecIter].usebydate){
              changeText = changeText + "<br>" +"Use By Date changed from old value: "+arrOldRecord[oldRecIter].usebydate+" to new value: "+arrNewRecord[newRecIter].usebydate+" for item "+arrNewRecord[newRecIter].itemname;
            }
            oldRecIter++;
            newRecIter++;

          }else {
        changeText = changeText + "<br>" +"Item deleted - "+arrOldRecord[oldRecIter].itemname+" Quantity - "+arrOldRecord[oldRecIter].quantity+" Dlvd Rate - "+arrOldRecord[oldRecIter].dlvdrate;
          oldRecIter++;
          }
          
        }
      }
      }
      }
	   nlapiSetFieldValue('custbody_transaction_changes',changeText);


	   
   }




  
	// Now calculate the auction time (Need to add in a friday check and and holiday check 
	//var auctiontime    = 2; 
	if(stType=='edit')
    {		
	   var auctiontime    = 2; 
	   var oldRecord      = nlapiGetOldRecord();
	   var current_no_tms = nlapiGetFieldValue('custbody_please_wait_no_tms');
	   var old_no_tms     = oldRecord.getFieldValue('custbody_please_wait_no_tms');
	   nlapiLogExecution('DEBUG','Time ','no tms ' + current_no_tms);
	   if (current_no_tms != 'T' && old_no_tms == 'T')
	   { 	
          var todayts       = new Date();
          var today         = new Date();
          nlapiLogExecution('DEBUG','Today ','Today' + todayts);
	      var fullDate    = nlapiDateToString(today);
	      var intHours    = todayts.getHours();
		  var initialDayOfWeek   = today.getDay();
		  intHours        = parseFloat(intHours + 2);
          nlapiLogExecution('DEBUG','Time ','Time' + intHours);
		  
		  var validDate = false;
   	      if (intHours >= 0 && intHours < 9)
		  {
             auctiontime    = forceParseFloat(10 - intHours); 
          } 
		  
	      nlapiLogExecution('DEBUG','Time ','NOT IN 16 hours ' + intHours);
   	      if (parseFloat(intHours) >= 16 || initialDayOfWeek == 6 || initialDayOfWeek == 0)
		  {
	         nlapiLogExecution('DEBUG','Time ','in more than 16 hours ');
		     var validDate = false;
             auctiontime    = forceParseFloat(10 + (23 - intHours)); 
             today.setDate(today.getDate() + 1);
		     var dayOfWeek   = today.getDay();
	         nlapiLogExecution('DEBUG','Time ','in more than 16 hours ' + dayOfWeek + ' auction time ' + auctiontime);
	  
		     while (!validDate)
		     {
               if(dayOfWeek == 6){
                 today.setDate(today.getDate() + 2);
				 auctiontime    = parseFloat(auctiontime + 48);
	             nlapiLogExecution('DEBUG','Time sat','in more than 16 hours ' + dayOfWeek + ' auction time ' + auctiontime);
               }
               if(dayOfWeek == 0){
                 today.setDate(today.getDate() + 1);
				 auctiontime    = parseFloat(auctiontime + 24);
	             nlapiLogExecution('DEBUG','Time sun','in more than 16 hours ' + dayOfWeek + ' auction time ' + auctiontime);
              }
		      var filters = new Array();
              filters[0] = new nlobjSearchFilter( 'custrecord_holiday_date', null, 'on', nlapiDateToString(today)); // add in item type value
              filters[1] = new nlobjSearchFilter( 'isinactive', null, 'is', 'F'); 

              var searchResults = nlapiSearchRecord( 'customrecord_auction_holiday', null, filters);
              if (searchResults != null)
		      {
                 today.setDate(today.getDate() + 1);
				 auctiontime    = parseFloat(auctiontime + 24);
		      } else
              {				
			    validDate = true;
		 	  }
		    }
		  }	

	   }
    var approvalstatus2 = nlapiSetFieldValue('custbody_auction_time_hours',auctiontime); 
   }	   
    return true;
  
}
//added by Thilaga for ticket#5038
function aftersubmit_ordervalues(stType)
{
  if(stType=='edit')
	{
	   var oldRecord      = nlapiGetOldRecord();
      var newRecord = nlapiGetNewRecord();
	  var recModForSync = false;
       var fieldsModified = {
         	isReleaseDateMod: false,
         	isRequestedPickDateMod: false,
         	isPoVenCommentsMod: false,
         	isShippingMethodMod: false,
         	isPOMemberNumMod: false
         	};
       
      if ( (newRecord.getFieldValue('custbody_release_date')!=null)&&( newRecord.getFieldValue('custbody_release_date') !=  oldRecord.getFieldValue('custbody_release_date') ))
	   {
		  recModForSync = true;
         fieldsModified.isReleaseDateMod=true;
       }		   
//Added by thilaga for ticket #5038 starts
      if (  (newRecord.getFieldValue('custbodycustbody_requested_pickup_date')!=null)&&(newRecord.getFieldValue('custbodycustbody_requested_pickup_date') !=  oldRecord.getFieldValue('custbodycustbody_requested_pickup_date') ))
	   {
		  recModForSync = true;
         fieldsModified.isRequestedPickDateMod=true;
       }
      if ((newRecord.getFieldValue('custbodycustbody_po_vendor_comments')!=null)&& (newRecord.getFieldValue('custbodycustbody_po_vendor_comments') !=  oldRecord.getFieldValue('custbodycustbody_po_vendor_comments') ))
	   {
		  recModForSync = true;
         fieldsModified.isPoVenCommentsMod=true;
       }
       if ( (newRecord.getFieldValue('custbody_shipping_method_code')!=null)&& (newRecord.getFieldValue('custbody_shipping_method_code') !=  oldRecord.getFieldValue('custbody_shipping_method_code') ))
	   {
		  recModForSync = true;
         fieldsModified.isShippingMethodMod=true;
       }
      if ((newRecord.getFieldValue('otherrefnum')!=null)&& (newRecord.getFieldValue('otherrefnum') !=  oldRecord.getFieldValue('otherrefnum') ))
	   {
		  recModForSync = true;
         fieldsModified.isPOMemberNumMod=true;
       }
//Added by thilaga for ticket #5038 ends
      if(recModForSync){
  	  var param = 
            {
              'custscript_idsalesorder' : nlapiGetRecordId(),
              'custscript_isreleasedatechanged' : fieldsModified.isReleaseDateMod,
              'custscript_isreqpickupdatechanged':fieldsModified.isRequestedPickDateMod,
              'custscript_ispovencommentschanged':fieldsModified.isPoVenCommentsMod,
              'custscript_isshipmethodchanged':fieldsModified.isShippingMethodMod,
              'custscript_ismemberponumchanged':fieldsModified.isPOMemberNumMod,
              'custscript_is_cancelled':false
            }
            
            nlapiScheduleScript('customscript_fa_ss_update_so_related_rec', 'customdeploy_sch_update_relatedrecords', param);
    }
      
    }
}

function validateDate(stDate){
  var newDate = new Date(stDate);
 var dayOfWeek   = newDate.getDay();
              if(dayOfWeek == 6){
                 return false;
               }
               if(dayOfWeek == 0){
                 return false;
              }
		      var filters = new Array();
              filters[0] = new nlobjSearchFilter( 'custrecord_holiday_date', null, 'on', nlapiDateToString(newDate)); // add in item type value
              filters[1] = new nlobjSearchFilter( 'isinactive', null, 'is', 'F'); 

              var searchResults = nlapiSearchRecord( 'customrecord_auction_holiday', null, filters);
              if (searchResults != null)
		      {
                 return false;
		      } else
              {				
			    return true;
		 	  }

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

