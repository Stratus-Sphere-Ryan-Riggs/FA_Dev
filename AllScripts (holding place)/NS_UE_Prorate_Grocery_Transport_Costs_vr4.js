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
*  Purpose:  Prorate the Grocery Transport Fees across all items based on cases
*/
function aftersubmit_prorate_transport_costs(stType)
{

    if(stType!='edit' && stType!='create')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        return true;
    }
	
	var groceryType = nlapiGetContext().getSetting('SCRIPT', 'custscript_tr_grocery_order_type');
	var groceryChannel = nlapiGetContext().getSetting('SCRIPT', 'custscript_channel_to_sum');
	var transportChannel = nlapiGetContext().getSetting('SCRIPT', 'custscript_transport_channel');
    //added by Thilaga
    var secGroItem = nlapiGetContext().getSetting('SCRIPT', 'custscript_sec_item_grocery');
  	var accessorial = nlapiGetContext().getSetting('SCRIPT', 'custscript_accessorial_item');
  	var accessorialFee = nlapiGetContext().getSetting('SCRIPT', 'custscript_accessorial_fee_item');
  var roundingEO = nlapiGetContext().getSetting('SCRIPT', 'custscript_rounding_eo_item');
	var recTrans    = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId()); 
    var recId       = nlapiGetRecordId();
nlapiLogExecution('DEBUG','Accessorial Fee',accessorialFee);
	// For Non Grocery Order 
	var transportTotal = parseFloat('0');
	var invTotal = parseFloat('0');
	if (groceryType == recTrans.getFieldValue('custbody_order_type'))
	{
 
        var ttlQuantity        =  parseFloat('0')
        var totalTransportCost =  parseFloat('0')
		for (var j = 1; j <= recTrans.getLineItemCount('item'); j++ ) 
        {
            //added by Thilaga
            if(recTrans.getLineItemValue('item','rate',j)=='0.00'){
                continue;
            }
   			var itemChannel =  recTrans.getLineItemValue('item','custcol_product_channel',j);
            //modified by Thilaga
			if (itemChannel == groceryChannel || (recTrans.getLineItemValue('item','item',j)==secGroItem))
			{
              nlapiLogExecution('DEBUG','Inside secondary grocery item','Qty');
				ttlQuantity = ttlQuantity + parseFloat(recTrans.getLineItemValue('item','quantity',j));
			}	
			
			if (itemChannel == transportChannel && (recTrans.getLineItemValue('item','item',j)!=accessorialFee && recTrans.getLineItemValue('item','item',j)!=accessorial))
			{
				totalTransportCost = totalTransportCost + parseFloat(recTrans.getLineItemValue('item','amount',j));
			}	
          if((recTrans.getLineItemValue('item','item',j))!=roundingEO){
            invTotal = invTotal+parseFloat(recTrans.getLineItemValue('item','amount',j));
		}
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','qty= ' + ttlQuantity);
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','cost= invTotal= ' + totalTransportCost+' '+invTotal);
        }
	    if (ttlQuantity > 0 && totalTransportCost > 0)
		{
			 var tsCostPerItem = parseFloat(totalTransportCost/ttlQuantity);
	 	     for (var i = 1; i <= recTrans.getLineItemCount('item'); i++ ) 
             {
                 //added by Thilaga
                 if(recTrans.getLineItemValue('item','rate',i)=='0.00'){
                     continue;
                  }
		           var itemChannel  =  recTrans.getLineItemValue('item', 'custcol_product_channel', i);
		           //modified by Thilaga
			        if (itemChannel == groceryChannel || (recTrans.getLineItemValue('item','item',i)==secGroItem) || (recTrans.getLineItemValue('item','item',i)==accessorial)|| (recTrans.getLineItemValue('item','item',i)==accessorialFee))
		           {
                     nlapiLogExecution('DEBUG','Inside secondary grocery item','set prorated value '+recTrans.getLineItemValue('item','item',i));
		             var itemQty    =  recTrans.getLineItemValue('item', 'quantity', i);
                     //added by Thilaga
                     var rate = recTrans.getLineItemValue('item', 'rate', i);
					 var tsCost     =  parseFloat(tsCostPerItem * itemQty);
		             var itemAmount =  parseFloat(recTrans.getLineItemValue('item', 'amount', i));
                     var tsTotalRate = new Number((parseFloat(tsCostPerItem)+parseFloat(rate)).toFixed(2));
					 var tsAdj      =  parseFloat(tsTotalRate * itemQty);;
                     nlapiLogExecution('DEBUG','Prorate Transport ','ts cost, Adj rate and amount= ' + tsCost + ' '+tsTotalRate+ ' ' + tsAdj);
                     nlapiLogExecution('DEBUG','bill to member value',recTrans.getLineItemValue('item','custcol_bill_to_member',i));
		             recTrans.setLineItemValue('item', 'custcol_item_transport_cost', i,nlapiFormatCurrency(tsCost)); //custcol_adj_invoice_rate
		             recTrans.setLineItemValue('item', 'custcol_adjusted_amount', i,nlapiFormatCurrency(tsAdj));
                     //modified by Thilaga
                     
		             recTrans.setLineItemValue('item', 'custcol_adj_invoice_rate', i,tsTotalRate.toFixed(2));
                         if(recTrans.getFieldValue('entity')==recTrans.getLineItemValue('item','custcol_member_bank',i)){
                           if(itemChannel == groceryChannel || (recTrans.getLineItemValue('item','item',i)==secGroItem)){
                           transportTotal=parseFloat(transportTotal)+parseFloat(tsAdj);
                           }else if (recTrans.getLineItemValue('item','item',i)==accessorialFee){
                             
                             transportTotal=parseFloat(transportTotal)+parseFloat(itemAmount);
                                               nlapiLogExecution('DEBUG','Inside accessorial',transportTotal);
                           }
                           else if (recTrans.getLineItemValue('item','item',i)==accessorial){
                             
                             transportTotal=parseFloat(transportTotal)+parseFloat(itemAmount);
                                               nlapiLogExecution('DEBUG','Inside accessorial',transportTotal);
                           }
                         }else if (recTrans.getLineItemValue('item','custcol_bill_to_member',i)=='F'){
                                    transportTotal=parseFloat(transportTotal)+parseFloat(tsAdj);
                                               nlapiLogExecution('DEBUG','Inside Bill to N',transportTotal);
                           }
		           }
   		           if (itemChannel != groceryChannel)
		           {
	                  recTrans.setLineItemValue('item', 'custcol_adjusted_amount', i,nlapiFormatCurrency(recTrans.getLineItemValue('item', 'amount',i)));
				   }	   

			 }		
          nlapiLogExecution('DEBUG','total transport cost is',nlapiFormatCurrency(transportTotal));
recTrans.setFieldValue('custbody_ttl_transporation_fees',nlapiFormatCurrency(transportTotal));
	     }

		 if (ttlQuantity > 0 && totalTransportCost <=0)
		 {
	 	     for (var i = 1; i <= recTrans.getLineItemCount('item'); i++ ) 
             {
               //added by Thilaga
	           recTrans.setLineItemValue('item','custcol_adj_invoice_rate',i,nlapiFormatCurrency(recTrans.getLineItemValue('item', 'rate', i)));
               recTrans.setLineItemValue('item', 'custcol_adjusted_amount', i,nlapiFormatCurrency(recTrans.getLineItemValue('item', 'amount',i)));
			 }
           recTrans.setFieldValue('custbody_ttl_transporation_fees',recTrans.getFieldValue('total'));

	     }
      
      if(parseFloat(nlapiGetFieldValue('amount'))!=recTrans.getFieldValue('custbody_ttl_transporation_fees')){
        
        var amount = new Number(invTotal);
        var TtlTransFees = recTrans.getFieldValue('custbody_ttl_transporation_fees');
        nlapiLogExecution('DEBUG','inside E&O insert amount totalfees diff',amount+' '+TtlTransFees+' '+parseFloat(parseFloat(amount)-parseFloat(TtlTransFees)));
        var diff = new Number(parseFloat(TtlTransFees)-parseFloat(amount));
        var lineNum = recTrans.findLineItemValue('item','item',roundingEO);
        nlapiLogExecution('DEBUG','rounding item line num',lineNum);
        if(lineNum!='-1'){
          var amt= new Number(recTrans.getLineItemValue('item','rate',lineNum));
           nlapiLogExecution('DEBUG','rounding item line current value and diff',amt+' '+diff);
          if((parseFloat(diff))!=0.00){
            nlapiLogExecution('DEBUG','inside rounding if',nlapiFormatCurrency(diff));
            recTrans.setLineItemValue('item','rate',lineNum,nlapiFormatCurrency(diff));
            recTrans.commitLineItem('item');
          }
          
        }else{
        if((parseFloat(diff))!=0.00){
        	recTrans.selectNewLineItem('item');
        	recTrans.setCurrentLineItemValue('item','item',roundingEO);
        	recTrans.setCurrentLineItemValue('item','quantity','1');
        	recTrans.setCurrentLineItemValue('item','rate',nlapiFormatCurrency(diff));
        	recTrans.commitLineItem('item');
            }
        }
      }

    }

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