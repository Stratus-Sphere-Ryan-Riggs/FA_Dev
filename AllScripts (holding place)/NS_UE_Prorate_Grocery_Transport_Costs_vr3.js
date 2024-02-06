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
	var recTrans    = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId()); 
    var recId       = nlapiGetRecordId();

	// For Non Grocery Order 
	var transportTotal = parseFloat('0');
	
	if (groceryType == recTrans.getFieldValue('custbody_order_type'))
	{

        var ttlQuantity        =  parseFloat('0')
        var totalTransportCost =  parseFloat('0')
		for (var j = 1; j <= recTrans.getLineItemCount('item'); j++ ) 
        {
   			var itemChannel =  recTrans.getLineItemValue('item','custcol_product_channel',j);
			if (itemChannel == groceryChannel)
			{
				ttlQuantity = ttlQuantity + parseFloat(recTrans.getLineItemValue('item','quantity',j));
			}	
			
			if (itemChannel == transportChannel)
			{
				totalTransportCost = totalTransportCost + parseFloat(recTrans.getLineItemValue('item','amount',j));
			}	

		}
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','qty= ' + ttlQuantity);
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','cost= ' + totalTransportCost);
	    if (ttlQuantity > 0 && totalTransportCost > 0)
		{
			 var tsCostPerItem = parseFloat(totalTransportCost/ttlQuantity);
	 	     for (var i = 1; i <= recTrans.getLineItemCount('item'); i++ ) 
             {
		           var itemChannel  =  recTrans.getLineItemValue('item', 'custcol_product_channel', i);
		           if (itemChannel == groceryChannel)
		           {
		             var itemQty    =  recTrans.getLineItemValue('item', 'quantity', i);
					 var tsCost     =  parseFloat(tsCostPerItem * itemQty);
		             var itemAmount =  parseFloat(recTrans.getLineItemValue('item', 'amount', i));
					 var tsAdj      = parseFloat(tsCost) + parseFloat(itemAmount);
                     nlapiLogExecution('DEBUG','Prorate Transport ','ts cost and amount= ' + tsCost + ' ' + itemAmount);
		             recTrans.setLineItemValue('item', 'custcol_item_transport_cost', i,nlapiFormatCurrency(tsCost)); //custcol_adj_invoice_rate
		             recTrans.setLineItemValue('item', 'custcol_adjusted_amount', i,nlapiFormatCurrency(tsAdj));
		             recTrans.setLineItemValue('item', 'custcol_adj_invoice_rate', i,tsCostPerItem);
		           }
   		           if (itemChannel != groceryChannel)
		           {
	                  recTrans.setLineItemValue('item', 'custcol_adjusted_amount', i,nlapiFormatCurrency(recTrans.getLineItemValue('item', 'amount',i)));
				   }	   

			 }		   

	     }

		 if (ttlQuantity > 0 && totalTransportCost <=0)
		 {
	 	     for (var i = 1; i <= recTrans.getLineItemCount('item'); i++ ) 
             {
	           recTrans.setLineItemValue('item', 'custcol_adjusted_amount', i,nlapiFormatCurrency(recTrans.getLineItemValue('item', 'amount',i)));
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