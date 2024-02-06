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
    for (var i = 1; i <= nlapiGetLineItemCount('item'); i++ ) 
    {

	        var itemQty     = forceParseFloat(nlapiGetLineItemValue('item', 'quantity', i));
	        var itemWeight  = forceParseFloat(nlapiGetLineItemValue('item', 'custcol_item_gross_weight', i));
	        var itemPallet  = forceParseFloat(nlapiGetLineItemValue('item', 'custcol_cases_per_pallet', i));
			var totalPounds = Math.round((parseFloat(itemQty) * parseFloat(itemWeight))*100)/100;
	        totalPounds     = Math.ceil(totalPounds);
			orderPounds     = parseFloat(orderPounds) + parseFloat(totalPounds);
            nlapiSetLineItemValue('item', 'custcol_total_pounds', i, totalPounds );//custcol_total_weight
            nlapiSetLineItemValue('item', 'custcol_total_weight', i, totalPounds );//custcol_total_weight
		    var qtyPerPallet = parseFloat(nlapiGetLineItemValue('item', 'custcol_cases_per_pallet', i));
	        var totalPallets = Math.round((parseFloat(itemQty) / parseFloat(qtyPerPallet))*100)/100;//custcol_total_weight
	        nlapiLogExecution('DEBUG','Total Pallets ','stType= ' + totalPallets);

	        //totalPallets = Math.ceil(totalPallets);
			
	        orderPallets = parseFloat(orderPallets) + parseFloat(totalPallets);
            nlapiSetLineItemValue('item', 'custcol_nbr_pallets', i, totalPallets );
			nlapiSetLineItemValue('item', 'custcol_order_line_nbr', i, nlapiGetLineItemValue('item','orderline',i));

			
	}   

	var transtype = nlapiGetRecordType();
	if (transtype == 'itemfulfillment') 
	{
		nlapiSetFieldValue('custbody_associated_salesorder',nlapiGetFieldValue('createdfrom'));
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
	if (transtype == 'itemfulfillment' && (!Eval.isEmpty(recTrans.getFieldValue('createdfrom'))) )
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

	}	

	if (transtype == 'itemfulfillment' && (!Eval.isEmpty(recTrans.getFieldValue('createdfrom'))) )
	{
	  var icFilters_2 = new Array();
	  var soId = recTrans.getFieldValue('createdfrom');
      icFilters_2.push(new nlobjSearchFilter('createdfrom', null, 'is' , soId));
      var icSearchResults_2 = nlapiSearchRecord('transaction', 'customsearch_total_receipted_pounds_2', icFilters_2);
      if (icSearchResults_2 != null && icSearchResults_2.length != 0) 
      {
        	soTrans = nlapiLoadRecord('salesorder',soId); 
			for (var i = 0; i < icSearchResults_2.length; i++)
        	{
           		var lineNum    = icSearchResults_2[i].getValue('custcol_order_line_nbr', null, 'group'); 
           		var ttlPounds  = forceParseFloat(icSearchResults_2[i].getValue('custcol_total_weight', null, 'sum')); 
           		var ttlPallets = forceParseFloat(icSearchResults_2[i].getValue('custcol_nbr_pallets', null, 'sum')); 
		   	    var lineid     = soTrans.findLineItemValue('item','custcol_order_line_nbr', lineNum);
			    if (lineid != '-1')
			    {
					soTrans.setLineItemValue('item','custcol_pallets_received',lineid,ttlPallets);
					soTrans.setLineItemValue('item','custcol_gross_wt_received',lineid,ttlPounds);
					//soTrans.setLineItemValue('item','custcol_item_status_field',lineid,line_status);
				}	

                nlapiLogExecution('Debug', 'line ' + lineNum + ' Pounds ' + ttlPounds + ' Pallet ' + ttlPallets);
                nlapiLogExecution('Debug', 'line found ' + lineid);

            }
			var nbrReceiptedLines = 0;
			var nbrOrderLines     = 0; //custcol_storage_requirements  quantityfulfilled
            var totalReceipted    = false;			
		    for (var j = 1; j <= soTrans.getLineItemCount('item'); j++ ) 
            {
				var storage    = soTrans.getLineItemValue('item','custcol_storage_requirements',j);
				var qtyFulfill = soTrans.getLineItemValue('item','quantityfulfilled',j);
				nlapiLogExecution('Debug', 'Receipte ' + qtyFulfill);
				if (qtyFulfill > 0)
				{
             		nbrReceiptedLines++
					soTrans.setLineItemValue('item','custcol_item_status_field',j,line_status);

                }					
				
				if (!Eval.isEmpty(storage))
				{
					nbrOrderLines++
				}
            } 
			
            nlapiLogExecution('Debug', 'Receiptd ' + nbrReceiptedLines + ' lines ' + nbrOrderLines);
			var receiptModified = false;
			if (nbrReceiptedLines >= nbrOrderLines)
			{
				soTrans.setFieldValue('custbody_order_status', receipt_status);
				totalReceipted = true;
				if (stType =='edit')
				{
				  soTrans.setFieldValue('custbody_order_status', receipt_modified_status);
			      receiptModified = true;
                }					
			}
			
			var arrParam = [];
	        arrParam['custscript_opp_trans_type']           = 'SalesOrd';
            arrParam['custscript_opp_trans_internal_id']    = soId;
    
	        var status = nlapiScheduleScript('customscript_ns_ss_opportunity_email','customdeploy_opportunity_email',arrParam);

			var id = nlapiSubmitRecord(soTrans, true);
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