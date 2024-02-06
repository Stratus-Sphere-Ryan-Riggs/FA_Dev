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
*               4) Round Pallets
* 10/10/2016    Add/set the associated sales order to receipts
* 10/24/2016    changed always re-calc pallets on edit
* 10/24/2016    calculate Pounts
* 01/27/2017    Set Pallets to two decimal places
* 02/01/2017    Set the order line item pallets and gross weight receipted
* 03/10/2017    Set initial value of item fulfillment qty
* 03/12/2017    Clear the  fields
*/
function beforeLoad_Calculate(stType)
{

    var transType = nlapiGetRecordType();
	var scriptcontext = nlapiGetContext().getExecutionContext();
    nlapiLogExecution('DEBUG','beforeload_calculate','|------------SCRIPT STARTED------------||' + stType + ' ' + scriptcontext);	
    if (scriptcontext != 'userinterface'  || stType != 'create')
	{
		return true;
	}
	
	if (transType == 'itemfulfillment')
	{
       for (var i = 1; i <= nlapiGetLineItemCount('item'); i++ ) 
       {
	        nlapiSetLineItemValue('item', 'quantity', i, '');
	        nlapiSetLineItemValue('item', 'custcol_pallets_received', i, '');
	        nlapiSetLineItemValue('item', 'custcol_gross_wt_received', i, '');
	   }   

    }		
    return true;  
}

function beforesubmit_setpounds(stType)
{

    nlapiLogExecution('DEBUG','beforesubmit_setauction_pick','|------------SCRIPT STARTED------------||');
	var receipt_status = nlapiGetContext().getSetting('SCRIPT', 'custscript_receipt_status');
    if(stType!='edit' && stType!='create'  && stType!='dropship')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        return true;
    }
	
   	var orderPounds  = parseFloat('0');
   	var orderPallets = parseFloat('0');
	var transtype = nlapiGetRecordType();
  var soid="";
    var orderType = "";
  
  if(transtype == 'itemfulfillment'){
 	 soid = nlapiGetFieldValue('createdfrom');
  	if(soid!=""){
 		 orderType = nlapiLookupField('salesorder',soid,'custbody_order_type');
 	 }
  }
    for (var i = 1; i <= nlapiGetLineItemCount('item'); i++ ) 
    {

	        var itemQty     = forceParseFloat(nlapiGetLineItemValue('item', 'quantity', i));
      
	        var itemWeight  = forceParseFloat(nlapiGetLineItemValue('item', 'custcol_item_gross_weight', i));
       
      nlapiLogExecution('DEBUG','Order Type','stType= ' + orderType);
      if(orderType=='6'){
        itemWeight = parseFloat('1');
      }
	        var itemPallet  = forceParseFloat(nlapiGetLineItemValue('item', 'custcol_cases_per_pallet', i));
      
			var totalPounds = new Number((parseFloat(itemQty) * parseFloat(itemWeight))).toFixed(2);
      nlapiLogExecution('DEBUG','Total Pounds ','stType= ' + totalPounds);
	      //  totalPounds     = Math.ceil(totalPounds);
			orderPounds     = parseFloat(orderPounds) + parseFloat(totalPounds);
            nlapiSetLineItemValue('item', 'custcol_total_pounds', i, totalPounds );//custcol_total_weight
         //   nlapiSetLineItemValue('item', 'custcol_total_weight', i, totalPounds );//custcol_total_weight
		    var qtyPerPallet = parseFloat(nlapiGetLineItemValue('item', 'custcol_cases_per_pallet', i));
      //Commented for ticket #5151 as rounding is not expected to happen
	        //var totalPallets = Math.round((parseFloat(itemQty) / parseFloat(qtyPerPallet))*100)/100;//custcol_total_weight
      		var totalPallets = ((parseFloat(itemQty) / parseFloat(qtyPerPallet))*100)/100;//custcol_total_weight
	        nlapiLogExecution('DEBUG','Total Pallets ','stType= ' + totalPallets);

	        //totalPallets = Math.ceil(totalPallets);
			
	        orderPallets = parseFloat(orderPallets) + parseFloat(totalPallets);
      
            nlapiSetLineItemValue('item', 'custcol_nbr_pallets', i, totalPallets );
			nlapiSetLineItemValue('item', 'custcol_order_line_nbr', i, nlapiGetLineItemValue('item','orderline',i));

			
	}   

	var transtype = nlapiGetRecordType();
	if (transtype == 'itemfulfillment' || transtype == 'invoice') 
	{
	if(nlapiGetFieldValue('custbody_associated_salesorder')==""|| nlapiGetFieldValue('custbody_associated_salesorder')== null){	
      nlapiSetFieldValue('custbody_associated_salesorder',nlapiGetFieldValue('createdfrom'));
    }
    }		
	
    nlapiSetFieldValue('custbody_total_pounds',orderPounds);
    nlapiSetFieldValue('custbody_total_order_pallets',orderPallets);
	var transtype = nlapiGetRecordType();
	
    return true;
  
	
}

function aftersubmit_setpounds(stType)
{

    nlapiLogExecution('DEBUG','beforesubmit_setauction_pick','|------------SCRIPT STARTED------------||');
	var receipt_status = nlapiGetContext().getSetting('SCRIPT', 'custscript_receipt_status');
	var po_receipt_status = nlapiGetContext().getSetting('SCRIPT', 'custscript_po_receipt_status');
	var receipt_modified_status = nlapiGetContext().getSetting('SCRIPT', 'custscript_receipt_status_mod');
	var po_receipt_modified_status = nlapiGetContext().getSetting('SCRIPT', 'custscript_po_receipt_status_m');
	var line_status    = nlapiGetContext().getSetting('SCRIPT', 'custscript_line_item_status');

    if(stType!='dropship' && stType!='edit' && stType!='create')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        return true;
    }
	
	var recTrans   = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId()); 
    var recId      = nlapiGetRecordId();

	
	var transtype = nlapiGetRecordType();
	if (transtype != 'itemfulfillment')
	{
		return true;
	}
    nlapiLogExecution('DEBUG',' in no pickup',' transtype ' +  transtype);
  //Adjusted by Thilaga for ticket #Bug 5018
	/*if (transtype == 'itemfulfillment' && (!Eval.isEmpty(recTrans.getFieldValue('createdfrom'))) )
	{
     
      nlapiLogExecution('Debug', 'total pounds ');
	  var soId = recTrans.getFieldValue('createdfrom');
	  //nlapiSubmitField('salesorder', soId, 'custbody_order_status', receipt_status, false);
	  //
	  //var arrParam = [];
	  //     arrParam['custscript_opp_trans_type']           = 'SalesOrd';
      //     arrParam['custscript_opp_trans_internal_id']    = soId;
    
	  //var status = nlapiScheduleScript('customscript_ns_ss_opportunity_email','customdeploy_opportunity_email',arrParam);
	  
   	  var filters = new Array();
      filters[0] = new nlobjSearchFilter( 'createdfrom', null, 'is', soId); 
      var searchResults = nlapiSearchRecord('transaction', 'customsearch_total_receipted_pounds', filters);
	  if (searchResults != null)
	  {
                  var ttlPounds   = forceParseFloat(searchResults[0].getValue('custbody_total_pounds', null, 'sum')); 
                  nlapiLogExecution('Debug', 'total pounds ' + ttlPounds);
			  	  nlapiSubmitField('salesorder', soId, 'custbody_total_gross_weight_fulfilled', ttlPounds, false);
        
      }

	}	*/

	if (transtype == 'itemfulfillment' && (!Eval.isEmpty(recTrans.getFieldValue('createdfrom'))) )
	{
	  var icFilters_2 = new Array();
	  var soId = recTrans.getFieldValue('createdfrom');
      icFilters_2.push(new nlobjSearchFilter('createdfrom', null, 'is' , soId));
      var icSearchResults_2 = nlapiSearchRecord('transaction', 'customsearch_total_receipted_pounds_2', icFilters_2);
       //Adjusted by Thilaga for ticket #Bug 5018
      var ttlReceivedPounds = forceParseFloat(0);
      var ttlReceivedQty = parseInt(0);
      var arrGrossWeightReceived = new Array();
      if (icSearchResults_2 != null && icSearchResults_2.length != 0) 
      {
        	soTrans = nlapiLoadRecord('salesorder',soId); 
			for (var i = 0; i < icSearchResults_2.length; i++)
        	{
			//Edited for ticket #5448
              nlapiLogExecution('DEBUG','Transaction type','|------------SCRIPT STARTED------------||'+icSearchResults_2[i].getValue('type', null, 'group'));
              if(icSearchResults_2[i].getValue('type', null, 'group') == 'ItemShip'){
           		var lineNum    = icSearchResults_2[i].getValue('custcol_order_line_nbr', null, 'group'); 
              var item    = icSearchResults_2[i].getValue('item', null, 'group'); 
              nlapiLogExecution('DEBUG','item','|------------SCRIPT STARTED------------||'+item);
                var magRef =  icSearchResults_2[i].getValue('custcol_mag_ref_no', null, 'group'); 
           		var ttlPounds  = forceParseFloat(icSearchResults_2[i].getValue('custcol_gross_wt_received', null, 'sum')); 
           		var ttlPallets = forceParseFloat(icSearchResults_2[i].getValue('custcol_pallets_received', null, 'sum')); 
              var ttlQty = 
                  parseInt(icSearchResults_2[i].getValue('quantity', null, 'sum')); 
              ttlReceivedPounds=ttlReceivedPounds+ ttlPounds;
              if(item!='4148'){
              	ttlReceivedQty = ttlReceivedQty + ttlQty;
              }
		   	    var lineid     = soTrans.findLineItemValue('item','custcol_mag_ref_no', magRef);
			    if (lineid != '-1')
			    {
					soTrans.setLineItemValue('item','custcol_pallets_received',lineid,ttlPallets);
					soTrans.setLineItemValue('item','custcol_gross_wt_received',lineid,ttlPounds);
					//soTrans.setLineItemValue('item','custcol_item_status_field',lineid,line_status);
                  var weightRcvd= {
                    magRef:magRef,
                    wtRcvd:ttlPounds
                  }
                  arrGrossWeightReceived.push(weightRcvd);
				}	

                nlapiLogExecution('Debug', 'line ' + lineNum + ' Pounds ' + ttlPounds + ' Pallet ' + ttlPallets);
                nlapiLogExecution('Debug', 'line found ' + lineid);
              }
              if( icSearchResults_2[i].getValue('type', null, 'group') == 'PurchOrd'){
                var magRef =  icSearchResults_2[i].getValue('custcol_mag_ref_no', null, 'group'); 
                if(magRef!=null && magRef!='' && arrGrossWeightReceived.length!=0){
                  var poRec = nlapiLoadRecord('purchaseorder',icSearchResults_2[i].getValue('internalid',null,'group'));
                  var lineNum = poRec.findLineItemValue('item','custcol_mag_ref_no',magRef);
                  var GrossWt = '';
                  nlapiLogExecution('Debug', 'line found ' + lineNum);
                  for(var k=0;k<arrGrossWeightReceived.length;k++){
                    if(arrGrossWeightReceived[k].magRef== magRef){
                      poRec.setLineItemValue('item','custcol_gross_wt_received',lineNum,arrGrossWeightReceived[k].wtRcvd);
                      break;
                    }
                  }
                  nlapiSubmitRecord(poRec);
                }
                
                
              }
            }
        nlapiLogExecution('Debug', 'total gross weight received' + ttlReceivedPounds);
        soTrans.setFieldValue('custbody_total_gross_weight_fulfilled',ttlReceivedPounds);
        soTrans.setFieldValue('custbody_total_receipted_qty',ttlReceivedQty);
			var nbrReceiptedLines = 0;
			var nbrOrderLines     = 0; //custcol_storage_requirements  quantityfulfilled
            var totalReceipted    = false;			
		    for (var j = 1; j <= soTrans.getLineItemCount('item'); j++ ) 
            {
				var productType    = soTrans.getLineItemValue('item','custcol_product_type',j);
				var qtyFulfill = soTrans.getLineItemValue('item','quantityfulfilled',j);
              //Added by Thilaga for ticket #Task 4979:
              var qtyPerPallet = soTrans.getLineItemValue('item','custcol_cases_per_pallet',j);
              var itemGrossWeight = soTrans.getLineItemValue('item','custcol_item_gross_weight',j);
				nlapiLogExecution('Debug', 'Receipte ' + qtyFulfill);
              
				if (qtyFulfill > 0||(soTrans.getLineItemValue('item','custcol_item_status_field',j)==line_status))
				{
             		nbrReceiptedLines++
                    if(qtyFulfill > 0){
					soTrans.setLineItemValue('item','custcol_item_status_field',j,line_status);
                  var nbrPallet = new Number(Math.round((parseFloat(qtyFulfill) / parseFloat(qtyPerPallet))*100/100));
                    }
                  
                }					
				
				if (!Eval.isEmpty(productType))
				{
					nbrOrderLines++
				}
            } 
			
            nlapiLogExecution('Debug', 'Receiptd ' + nbrReceiptedLines + ' lines ' + nbrOrderLines);
			var receiptModified = false;
        var orderType = "";
        if(soId!=""){
 		 orderType = nlapiLookupField('salesorder',soId,'custbody_order_type');
 	 	}
			if ((nbrReceiptedLines >= nbrOrderLines) && (orderType!='6'))
			{
				soTrans.setFieldValue('custbody_order_status', receipt_status);
				totalReceipted = true;
              //Added by Thilaga for ticket #3918
              soTrans.setFieldValue('custbody_receipt_received_date',new Date());
				if (stType =='edit')
				{
				  soTrans.setFieldValue('custbody_order_status', receipt_modified_status);
                  //Added by Thilaga for ticket #3918
              soTrans.setFieldValue('custbody_receipt_received_date',new Date());
			      receiptModified = true;
                }					
			}
			
			var arrParam = [];
	        arrParam['custscript_transtype']           = 'salesorder';
            arrParam['custscript_transintid']    = soId;
        	arrParam['custscript_transid'] = soTrans.getFieldValue('tranid');
    		
        //rearranged for email script
       		 var id = nlapiSubmitRecord(soTrans, true);
         
	   if(orderType!='6'){
        var status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger',arrParam);
           if (status == 'INPROGRESS')
	{
		status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger_3',arrParam);
        nlapiLogExecution('DEBUG','Scheduled Script Called 2','Scheduled Script Queue Status= ' + status);
    }	
                    if (status == 'INPROGRESS')
	{
		status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger_4',arrParam);
        nlapiLogExecution('DEBUG','Scheduled Script Called 2','Scheduled Script Queue Status= ' + status);
    }		
    if (status == 'INPROGRESS')
	{
		status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger_5',arrParam);
        nlapiLogExecution('DEBUG','Scheduled Script Called 2','Scheduled Script Queue Status= ' + status);
    }
       }
			
  	   } 
		
    }
	
	
	if (transtype == 'itemfulfillment' && (!Eval.isEmpty(recTrans.getFieldValue('createdfrom'))) )
	{
	  var icFilters = new Array();
	  var soId = recTrans.getFieldValue('custbody_associated_salesorder');
      icFilters.push(new nlobjSearchFilter('custbody_associated_salesorder', null, 'is' , soId));
      var icSearchResults = nlapiSearchRecord('transaction', 'customsearch_has_issue_search', icFilters);
      if (icSearchResults != null && icSearchResults.length != 0) 
      {
        	for (var i = 0; i < icSearchResults.length; i++)
        	{
			   var tranId   = icSearchResults[i].getId();
			   var tranType = icSearchResults[i].getValue('type');
               nlapiLogExecution('DEBUG','Type in find related' + tranType + ' id ' + tranId);
			   
			   if (tranId != nlapiGetRecordId())
			   {	   
			      if (tranType == 'PurchOrd')
			      {
	               nlapiSubmitField('purchaseorder', tranId, 'custbody_order_status', receipt_status, false);
	               nlapiSubmitField('purchaseorder', tranId, 'custbody_po_status', po_receipt_status, false);
				   if (receiptModified)
				   {
	                 nlapiSubmitField('purchaseorder', tranId, 'custbody_order_status',  receipt_modified_status, false);
	                 nlapiSubmitField('purchaseorder', tranId, 'custbody_po_status', po_receipt_modified_status, false);
                   }
                   
				   if (totalReceipted)
				   {
	                   var arrParam = [];
	                   arrParam['custscript_opp_trans_type']           = 'PurchOrd';
                       arrParam['custscript_opp_trans_internal_id']    = tranId;
 	                   var status = nlapiScheduleScript('customscript_ns_ss_opportunity_email','customdeploy_opportunity_email',arrParam);
				       nlapiLogExecution('DEBUG','Scheduled Script Called','Scheduled Script Queue Status= ' + status);
				   }   
			      }

			      if (tranType == 'VendBill') // CustInvc
			      {
	               nlapiSubmitField('vendorbill', tranId, 'custbody_order_status', receipt_status, false);	   
			      }

			      if (tranType == 'CustInvc')
			      {
	               nlapiSubmitField('invoice', tranId, 'custbody_order_status', receipt_status, false);	   
			      }
			   }	  
           		
            }
  	   } 
		
    }
	

	// Set all orders / transactions to receipted
	// 
	
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