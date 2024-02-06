/**
 * Module Description
 * This script will be used to populate the time sheets
 * with the weighted average of the revenue allocated to the project
 * 
 * Version    Date            Author           Remarks
 * 1.00       8-jun 2016     rfulling
 * 1.1        1- jul 2016    rfulling           Header section shoudl readn lines
 *                                              with no customer bank
 *
 * 12/14/2016 - Added in the set reason multi select
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */

//Globals to be passed as script parameters

var CONTEXT = nlapiGetContext();
var daysVar = CONTEXT.getSetting('SCRIPT', 'custscript_fa_days_var');
var CREDIT_HOLD = CONTEXT.getSetting('SCRIPT', 'custscript_fa_credit_status');
var orderStatus = CONTEXT.getSetting('SCRIPT', 'custscript_fa_order_status');
var orderIssueReason = CONTEXT.getSetting('SCRIPT', 'custscript_fa_hold_reason_code');

function getCustomerBalances(recIds, itemId, poID) {
    var arrFilters = [];
    var arrColumns = [];
    var oneDay = 24 * 60 * 60 * 1000;
    var tdate = new Date();
    var soId = nlapiGetRecordId();
    var customerId = nlapiGetFieldValue('entity');
    var headerAmt = 0;
    var creditHol = "F";
    var headerCL = 0;
    var releaseDate = new Date(nlapiStringToDate(nlapiGetFieldValue('custbody_release_date')));
    var soOutStanding = 0;
    var soLineOutstanding = 0;
    //var daysRelease = (tdate) - nlapiStringToDate(nlapiGetFieldValue('saleseffectivedate'));

	var oldSalesOrder = nlapiGetOldRecord();
	nlapiLogExecution('Debug', 'Old Record  ' + oldSalesOrder);
	// Now check for member or amount changes
	if (!isEmpty(oldSalesOrder))
	{
		if ((customerId                  == oldSalesOrder.getFieldValue('entity')) &&
		    (nlapiGetFieldValue('total') == oldSalesOrder.getFieldValue('total')))
			{	
	         nlapiLogExecution('Debug', 'IN retuern no issue  ');
			 return creditHol;
		    }	 
		
    }		

    //Header Section 
    if (releaseDate) {
        var daysRelease = Math.round(Math.abs((releaseDate.getTime() - tdate.getTime()) / (oneDay)));
        //nlapiLogExecution('Debug', 'Days till Release  ' + daysRelease);
    }

    if (daysRelease < daysVar) {
        //get the value of the sales order for inclusion
        //July 1 this should get the total lines where id is null 
        //var headerAmt = nlapiGetFieldValue('total');
        var headerAmt = getHeaderCustomerAmt();
    }
    //Now get the total amount outstanding for this customer
    custOutStanding = nlapiLookupField('customer', customerId, ['balance', 'creditlimit', 'custentity_fa_credit_status']);// This 
    //Now get any open sales orders from the saved search pending fulfillment
    soOutStanding = getOpenSoBal(customerId, soId);


    nlapiLogExecution('DEBUG', 'Header', 'ThisSo  = ' + headerAmt);
    nlapiLogExecution('DEBUG', 'Search Results ', 'ThisSo  = ' + soOutStanding);
    nlapiLogExecution('DEBUG', 'Invoiced Balance  ', 'ThisSo  = ' + custOutStanding.balance);
    nlapiLogExecution('DEBUG', 'fa status ', 'ThisSo  = ' + custOutStanding.custentity_fa_credit_status + ' credit hold ' + CREDIT_HOLD);

    if (daysRelease < daysVar)
	{	
	  if ((parseFloat(headerAmt) + parseFloat(custOutStanding.balance) + parseFloat(soOutStanding) > parseFloat(custOutStanding.creditlimit)) || (custOutStanding.custentity_fa_credit_status == CREDIT_HOLD) ) { 
          nlapiLogExecution('DEBUG', 'IN CREDIT HOLD', 'IN CREDIT HOLD ' + headerAmt + ' B ' + custOutStanding.balance);
          nlapiLogExecution('DEBUG', 'IN CREDIT HOLD', 'IN CREDIT HOLD ' + soOutStanding + ' OB ' + custOutStanding.creditlimit);
	     //set hold to true;
         //nlapiSubmitField('customer', customerId, ['custentity_fa_credit_status', 'creditholdoverride', 'isinactive'], [CREDIT_HOLD, "ON", "T"]);
         //rf change 9-12-2016
         nlapiSubmitField('customer', customerId, ['custentity_fa_credit_status', 'creditholdoverride', ], [CREDIT_HOLD, "ON"]);
         //  nlapiSetFieldValue('orderstatus', "A");
         nlapiSetFieldValue('custbody_order_status', orderStatus);
         //rf 8-31-2016 add update custombody fields
         nlapiSetFieldValue('custbody_order_has_issues', "T");
		 var hasIssues = new Array;
	     hasIssues     = nlapiGetFieldValues('custbody_order_has_issues_reason');
		 nlapiLogExecution('DEBUG', 'Header', 'Issuereason  = ' + orderIssueReason);
         if (hasIssues == null)
		 {
		   hasIssues = orderIssueReason;
		 nlapiLogExecution('DEBUG', 'Header', 'null Issuereason  = ' + orderIssueReason);
    	 } else
         {				   
		   hasIssues = hasIssues.concat(orderIssueReason);
    	 nlapiLogExecution('DEBUG', 'Header', 'not nullIssuereason  = ' + orderIssueReason);
         }				 
         nlapiSetFieldValues('custbody_order_has_issues_reason', hasIssues);
         updateRelatedDropShipPOs();
        
        // return true;
       }
    } 
    //Now get any open sales orders from the saved search pending fulfillment

    var custOutStanding = [];
    //Nextt loop through the lines of the sales order and get the amounts for each customer on the SO. line
    var usedArray = [];

    var lineCt = nlapiGetLineItemCount('item');
    for (var i = 1; i <= lineCt; i++) {
        //only process customer once 
        if (usedArray.indexOf(nlapiGetLineItemValue('item', 'custcol_member_bank', i)) < 0) {
            var sumOutstanding = 0;
            var lineCustOutstanding = [];
            var compareTotal = 0;
            var custLineId = parseInt(nlapiGetLineItemValue('item', 'custcol_member_bank', i));
            if (!custLineId) {
                continue;
            }
            //get the outstanding Balance for this line customer
            soLineOutstanding = getOpenSoBal(custLineId, soId);
            lineCustOutstanding = nlapiLookupField('customer', custLineId, ['balance', 'creditlimit', 'custentity_fa_credit_status']);
            //if date within range add up the lines of the sales order 
            if (daysRelease < daysVar) {
                var balOutstanding = sumthisSo(parseInt(nlapiGetLineItemValue('item', 'custcol_member_bank', i)));
                compareTotal = parseFloat(balOutstanding);
                //nlapiLogExecution('Debug', 'Line daysRelease < 10 total  ' + compareTotal);

            } else {
                // do not add up the lines just compare the balance to to the total 
                compareTotal = lineCustOutstanding.balance;
                nlapiLogExecution('Debug', 'Line daysRelease > 10 total  ' + compareTotal);
            }
            //nlapiLogExecution('DEBUG', 'Line', 'ThisLineSum  = ' + compareTotal);
            //nlapiLogExecution('DEBUG', 'Line ', 'SearchResults  = ' + soLineOutstanding);
            //nlapiLogExecution('DEBUG', 'Line Balance  ', 'custBalance  = ' + lineCustOutstanding.balance);

            if (daysRelease < daysVar)
           	{	
			  if ((parseFloat(compareTotal) + parseFloat(lineCustOutstanding.balance) > lineCustOutstanding.creditlimit) || (lineCustOutstanding.custentity_fa_credit_status == CREDIT_HOLD)) {
                //nlapiSubmitField('customer', customerId, ['custentity_fa_credit_status', 'creditholdoverride', 'isinactive'], [CREDIT_HOLD, "ON", "T"]);
                //rf change 9-12-2016
                nlapiSubmitField('customer', custLineId, ['custentity_fa_credit_status', 'creditholdoverride', ], [CREDIT_HOLD, "ON"]);
                //nlapiSetFieldValue('orderstatus', "A");
                nlapiSetFieldValue('custbody_order_status', orderStatus);
                //rf 8-31-2016 add update custombody fields
                nlapiSetFieldValue('custbody_order_has_issues',"T");
			    var hasIssues = new Array;
	            hasIssues     = nlapiGetFieldValues('custbody_order_has_issues_reason');
                if (hasIssues == null)
		        {
		          hasIssues = orderIssueReason;
		        } else
                {				   
		           hasIssues = hasIssues.concat(orderIssueReason);
                }				 

                nlapiSetFieldValues('custbody_order_has_issues_reason', hasIssues);
                //RF on 831 to update related PO's
                updateRelatedDropShipPOs();
              }
			}			 
            usedArray.push(nlapiGetLineItemValue('item', 'custcol_member_bank', i))
        }
    }
    return creditHol;
}

function updateRelatedDropShipPOs() {
    var poIds = [];
    var poLnCount = nlapiGetLineItemCount('links');
    var typ = '';
    var poid = ''
    for (var intLineCtr = 1; intLineCtr <= poLnCount; intLineCtr++) {
        typ = nlapiGetLineItemValue('links', 'type', intLineCtr);
        lnktyp = nlapiGetLineItemValue('links', 'linktype', intLineCtr);
        if (typ == 'Purchase Order' && lnktyp == 'Drop Shipment') {
            poid = nlapiGetLineItemValue('links', 'id', intLineCtr);
            nlapiSubmitField('purchaseorder', poid, ['custbody_order_has_issues', 'custbody_order_has_issues_reason'], ["T", orderIssueReason]);
        }
    }
    return;
}

function sumthisSo(memberBankId) {
    var custLineTot = 0;
    var lineCt = nlapiGetLineItemCount('item');
    for (var i = 1; i <= lineCt; i++) {
        if (nlapiGetLineItemValue('item', 'custcol_member_bank', i) == memberBankId) {
            custLineTot = parseInt(custLineTot) + parseInt(nlapiGetLineItemValue('item', 'amount', i));
        }
    }
    return custLineTot;
}

function getOpenSoBal(customerId, soId) {
    var arrFilters = new Array();
    var arrColumns = new Array();
    var sOValue = 0;
    arrFilters.push(new nlobjSearchFilter('internalid', null, 'noneof', soId));
    arrFilters.push(new nlobjSearchFilter('entity', null, 'is', customerId));

    arrColumns.push(new nlobjSearchColumn('amount', null, 'sum'));
    arrColumns.push(new nlobjSearchColumn('entity', null, 'group'));

    var openSo = nlapiSearchRecord('transaction', 'customsearch_order_credit_limit_total', arrFilters, arrColumns);

    //if you find a value return it 
    if (openSo) {
        sOValue = openSo[0].getValue('amount', null, 'sum');
    }
    return sOValue;
}

function getHeaderCustomerAmt() {
    var lineCt = nlapiGetLineItemCount('item');
    var custHeadTot = 0;
    for (var i = 1; i <= lineCt; i++) {
        if (!nlapiGetLineItemValue('item', 'custcol_member_bank', i)) {
            custHeadTot = parseInt(custHeadTot) + parseInt(nlapiGetLineItemValue('item', 'amount', i));
        }
    }
    return custHeadTot;
}

function isEmpty(stValue) {   
	if ((stValue == '') || (stValue == null) || (typeof stValue == "undefined"))  
	{        
		return true;   
	}
	return false; 
}