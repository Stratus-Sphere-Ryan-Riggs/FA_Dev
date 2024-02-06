nlapiLogExecution("audit","FLOStart",new Date().getTime());
/*
* Copyright (c) 1998-2017 NetSuite, Inc.
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
* 1) On Create of a new customer payment - find the apply entries and set the dept, class and Loocations
*/
function beforeLoad_CustomerPayment(stType)
{
   try
   {
       nlapiLogExecution('DEBUG','beforeLoad_CustomoerPayment','|------------SCRIPT STARTED------------||' + stType);


        for (var i = 1; i <= nlapiGetLineItemCount('apply'); i++ ) 
        {
		    var applyLine  =  nlapiGetLineItemValue('apply','internalid',i);
			nlapiLogExecution('DEBUG','beforeLoad_BillPayment',' Assoc Bill internalid ' + i + ' ' + applyLine);
			if (applyLine != '' && applyLine != null)
			{

		        var type_v      =  nlapiLookupField('transaction', applyLine, 'type');
                nlapiLogExecution('DEBUG','beforeLoad_BillPayment',' Assoc Bill b' + type_v);
				
				if (type_v == 'CustInvc')
				{
					var recTrans = nlapiLoadRecord('invoice', applyLine);
					var dept_v   = recTrans.getFieldValue('department');
					var class_v  = recTrans.getFieldValue('class');
					var loc_v    = recTrans.getFieldValue('location');
	                nlapiLogExecution('DEBUG','beforeLoad_BillPayment',' Assoc Bill b' + dept_v + ' ' + class_v + ' ' + loc_v);
					nlapiSetFieldValue('department',dept_v);
					nlapiSetFieldValue('class',class_v);
					nlapiSetFieldValue('location',loc_v);
		            return true;
				}
				
			}	
	    }

	   
   }
   
    catch(error)
   {
       if (error.getDetails != undefined)
       {
           nlapiLogExecution('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
           throw error;
       }
       else
       {
           nlapiLogExecution('ERROR', 'Unexpected Error', error.toString());
           throw nlapiCreateError('99999', error.toString());
       }
   }
 }
 
var Eval = {
		/**
	     * Shorthand version of isEmpty
	     *
	     * @param {String} stValue - string or object to evaluate
	     * @returns {Boolean} - true if empty/null/undefined, false if not
	     * @author bfeliciano
	     */
	    isEmpty : function(stValue)
	    {
	    	return ((stValue === '' || stValue == null || stValue == undefined)
	    			|| (stValue.constructor === Array && stValue.length == 0)
	    			|| (stValue.constructor === Object && (function(v){for(var k in v)return false;return true;})(stValue)));
	    }
};