nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
* Company			Feeding America
* Type				NetSuite Client-Side SuiteScript
* Version			1.0.0.0
* Description		This script will clear out fields on a copy
*
* Change History
* 09/08/2016 - Clear out 
* 09/29/2016 - Add a save check to ensure only 1 first pickup location is
* 10/27/2016 - Disable Vendor on UI
* 01/31/2017 - On Save Calculate the Order Release Date
**/

function pageinit(type, name)
{

  //Edited for ticket #6476 by Thilaga
  var orderType = nlapiGetFieldValue('custbody_order_type');
  if(orderType==1 || orderType==2 || orderType==8){
   nlapiDisableLineItemField('item', 'custcol_vendor', true);
  }
  // nlapiDisableLineItemField('item', 'custcol_vendor', true);
   
   if (type == 'copy')
   {
	   nlapiSetFieldValue('custbody_release_date','');
	   nlapiSetFieldValue('custbody_finance_email_sent','');
	   nlapiSetFieldValue('custbody_sc_email_sent','');
	   nlapiSetFieldValue('custbody_produce_passing','');
	   nlapiSetFieldValue('custbody_finance_approved','F');
	   nlapiSetFieldValue('custbody_order_has_issues','F');
	   nlapiSetFieldValue('custbody_associated_transaction','');
	   nlapiSetFieldValue('custbody_order_issues','');
	   nlapiSetFieldValue('custbody_order_has_issues_reason','');
	   nlapiSetFieldValue('custbody_freight_po_number','');
	   nlapiSetFieldValue('custbody_transporation_po_number','');
	   nlapiSetFieldValue('custbody_fa_emails_sent','');
	   nlapiSetFieldValue('custbody_admin_fees', nlapiFormatCurrency('0.00')); 
	   nlapiSetFieldValue('custbody_admin_fee_per_pound_rate', nlapiFormatCurrency('0.00')); 

   }

   return true;
}

function validateLine(type,name){
  
  nlapiLogExecution('DEBUG','type & name', type +' '+name) ;

 var count=nlapiGetLineItemCount('item');
  var lineIndex = nlapiGetCurrentLineItemIndex('item');
     nlapiLogExecution('DEBUG','line count & line index',nlapiGetLineItemCount('item')+' '+ nlapiGetCurrentLineItemIndex('item')) ;
                      
 if(count<lineIndex){
   nlapiSetCurrentLineItemValue('item','custcol_mag_ref_no','');
 }
   return true;
 }

function saveRecord(type, name)
{

      var context = nlapiGetContext();
	  var stOrderTypeToProcess = context.getSetting('SCRIPT', 'custscript_pickup_order_type');
	  var maxWeight            = forceParseFloat(context.getSetting('SCRIPT', 'custscript_max_weight'));
	  var ARR_ORDER_TYPES = [];
	  ARR_ORDER_TYPES = stOrderTypeToProcess.split(',');
      var orderType = nlapiGetFieldValue('custbody_order_type');

      //do not process if not one of the order types
      if (!Eval.inArray(orderType, ARR_ORDER_TYPES)) {
          return true;
      }
	  

       var nbrFirstLocations = 0;
   	   for (var i = 1; i <= nlapiGetLineItemCount('item'); i++ ) 
       {
	        var itemFirst   =  nlapiGetLineItemValue('item', 'custcol_first_pickup', i);
			
			if (itemFirst == 'T')
	        {
				nbrFirstLocations++;
            }				
			nlapiLogExecution('DEBUG','Items', nbrFirstLocations) ;
			if (nbrFirstLocations > 1)
	        {
	              alert ('There can only be one First Location Designation - Please review the order !');
		          return false;
			}
	   }   
	   
 	   if (nbrFirstLocations == 0)
	   {
	              alert ('Please Specify at least one First Pickup Location !');
		          return false;
	   }	 
	   
	   var orderPounds = parseFloat('0');
	   for (var i = 1; i <= nlapiGetLineItemCount('item'); i++ ) 
       {
	        var itemQty    = forceParseFloat(nlapiGetLineItemValue('item', 'quantity', i));
	        var itemWeight = forceParseFloat(nlapiGetLineItemValue('item', 'custcol_item_gross_weight', i));
		    var totalPounds = parseFloat(itemQty) * parseFloat(itemWeight);
		    orderPounds = parseFloat(orderPounds) + parseFloat(totalPounds);
	   }   

       nlapiLogExecution('DEBUG','Total Pounds ', orderPounds) ;
	   if(orderPounds > maxWeight)
	   {
	  	  var result = confirm("The total order weight is "+orderPounds+" which more than the allowed limit "+maxWeight+" Lbs. Do you want to continue?");
		  if(result)
		  {
			return true;
		  }
	 	else{
			return false;
		 }
  	   }

	   
   return true;
}

function fieldChanged(type, name)
{
	  
	  
	  if (type != 'item' && name != 'custcol_warehouse_lead_days')
	  {
        return true;
      }

	  var context = nlapiGetContext();
	  var stOrderTypeToProcess = context.getSetting('SCRIPT', 'custscript_pickup_order_type');
	  var ARR_ORDER_TYPES = [];
	  ARR_ORDER_TYPES = stOrderTypeToProcess.split(',');
      var orderType = nlapiGetFieldValue('custbody_order_type');

      //do not process if not one of the order types
      if (!Eval.inArray(orderType, ARR_ORDER_TYPES)) {
          return true;
      }
	  
	  if (!isEmpty(nlapiGetFieldValue('custbody_release_date')))
	  {
        return true;
      }		

	  var leadDays = forceParseFloat(nlapiGetCurrentLineItemValue('item', 'custcol_warehouse_lead_days'));
	  if (leadDays > 0)
	  {
		  var today = new Date();
	      today = nlapiDateToString(today);
		  var newdate    = nlapiDateToString(nlapiAddDays(nlapiStringToDate(today), leadDays));
  	      var newdateC    = nlapiStringToDate(newdate);
		  var dayOfWeek   = newdateC.getDay();
	      nlapiLogExecution('DEBUG','newdate c pre', newdateC) ;
		  var validDate = false;
		  while (!validDate)
		  {
            if(dayOfWeek == 6){
              newdateC.setDate(newdateC.getDate() + 1);
            }
            if(dayOfWeek == 0){
              newdateC.setDate(newdateC.getDate() + 2);
            }
			/// Search the holiday table
			nlapiLogExecution('DEBUG','prefind ', nlapiDateToString(newdateC)) ;
		    var filters = new Array();
            filters[0] = new nlobjSearchFilter( 'custrecord_holiday_date', null, 'on', nlapiDateToString(newdateC)); // add in item type value
            filters[1] = new nlobjSearchFilter( 'isinactive', null, 'is', 'F'); 

            var searchResults = nlapiSearchRecord( 'customrecord_auction_holiday', null, filters);
            if (searchResults != null)
		    {
				nlapiLogExecution('DEBUG','in found ', newdateC) ;
				newdateC.setDate(newdateC.getDate() + 1);
			} else
            {				
				nlapiLogExecution('DEBUG','in not found ', newdateC) ;
			  validDate = true;
			}
		  }
	      nlapiLogExecution('DEBUG','newdate c post', newdateC) ;
          newdateC = nlapiDateToString(newdateC);
		  nlapiSetFieldValue('custbody_release_date',newdateC);
		  nlapiSetFieldValue('custbodycustbody_requested_pickup_date',newdateC);
	  }	  
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


function isEmpty(stValue) {   
 if ((stValue == '') || (stValue == null) || (typeof stValue == "undefined"))  
   {        return true;   
   }    
   return false; 
}

// ------------------------------------------------- UTILITY FUNCTIONS -------------------------------------------------
var Eval =
{
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
        if (isEmpty(arr)) {
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