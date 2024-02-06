/**
 * Copyright (c) 1998-2015 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       13-06-2015     rfulling         
 *
 * Set the transportation Variance E&O Descriptions
 */

var DEBUG = true;

var context = nlapiGetContext();

var stOrderTypeToProcess = context.getSetting('SCRIPT', 'custscript_fa_po_order_type');
var stTransVarianceAmt = context.getSetting('SCRIPT', 'custscript_fa_transportaion_variance');
var stSupplyChainVarianceAmt = context.getSetting('SCRIPT', 'custscript_fa_supply_chain_variance');
var stTransChainVarianceItem = context.getSetting('SCRIPT', 'custscript_fa_transportaion_eo_item');
var stSupplyChainVarianceItem = context.getSetting('SCRIPT', 'custscript_fa_supply_chain_item');
var stAdminChainVarianceItem = context.getSetting('SCRIPT', 'custscript_admin_eo');
var stHasIssueVariance = context.getSetting('SCRIPT', 'custscript_has_issue_variance_threshold');
var stsupplyReasonCode = context.getSetting('SCRIPT', 'custscript_fa_supply_reason_code');
var stTransReasonCode = context.getSetting('SCRIPT', 'custscript_fa_transportation_reason_code');


var ARR_ORDER_TYPES = [];

function afterSubmit_error_ommission(type) {
    // //RF to run on ui Only
    logExecution('DEBUG', 'stLoggerTitle', 'Execution Method ' + context.getExecutionContext());

    if (context.getExecutionContext() != 'userinterface') {
        return;
    }
  

    ARR_ORDER_TYPES = stOrderTypeToProcess.split(',');
    var orderType = nlapiGetFieldValue('custbody_order_type');

    //do not process if not one of the order types
        logExecution('DEBUG', 'stLoggerTitle', 'order type' + orderType);
    if (!Eval.inArray(orderType, ARR_ORDER_TYPES)) {
        return;
    }
  logExecution('DEBUG', 'stLoggerTitle', 'status' + nlapiGetFieldValue('status'));
    if(nlapiGetFieldValue('status')=='Paid In Full'){
    	return;
  	}
    try {

        // Check for type
        logExecution('DEBUG', 'stLoggerTitle', 'Pre Edit');
        if (type != 'create' && type != 'edit') {
            return;
        }
        logExecution('DEBUG', 'stLoggerTitle', 'Past Edit');

        /* This process will only apply to Vendor Bills with an associated Purchase Order.  
        The Vendor Bill will be generated from the Purchase Order using the Bill Purchase Order function.
        The Error & Omission Addition is applied to any Grocery, Produce or Transportation Vendor Bill’s created from a Purchase Order.
        */
        var custId = nlapiGetFieldValue('entity');

        var stLoggerTitle = 'afterSubmit_otherCharges';

        // Check for script param
        if (isEmpty(stOrderTypeToProcess) || isEmpty(stTransVarianceAmt) || isEmpty(stSupplyChainVarianceAmt) || isEmpty(stTransChainVarianceItem) || isEmpty(stSupplyChainVarianceItem)) {
            logExecution('ERROR', stLoggerTitle, 'Please enter all script parameters for Summary computation.');
            //  return;
        }
        logExecution('DEBUG', 'stLoggerTitle', 'Pre po 3');

        logExecution('DEBUG', stLoggerTitle, '>> Start Script Execution <<'
							+ '\n <br /> Order types= ' + stOrderTypeToProcess
							+ '\n <br /> Transportaion amt = ' + stTransVarianceAmt
                            + '\n <br /> Supply chain amt = ' + stSupplyChainVarianceAmt
                            + '\n <br /> Transportaion item = ' + stTransChainVarianceItem
                            + '\n <br /> Supply chain item  = ' + stSupplyChainVarianceItem
							);


        var intLineCount = nlapiGetLineItemCount('item');
        var objData = {};
        objData.tranItem = stTransChainVarianceItem;
        objData.supplyChainItem = stSupplyChainVarianceItem;
        objData.tranVarAmt = stTransVarianceAmt;
        objData.supplyVarAmt = stSupplyChainVarianceAmt;
		objData.adminItem = stAdminChainVarianceItem;
		objData.issueVariance = stHasIssueVariance;


        var recType = nlapiGetRecordType();
        var recId = nlapiGetRecordId();
        var myBill = nlapiLoadRecord(recType, recId);

        //var vBamount = myBill.getFieldValue('usertotal');
        //rf 10-10-2016
        var vBamount = myBill.getFieldValue('custbody_total_bill_amount');
        var masterSO = myBill.getFieldText('custbody_associated_salesorder');
        var itemLnCount = myBill.getLineItemCount('item');
        var expLnCount = myBill.getLineItemCount('expense');
        //open the first purchase order 
        poId = myBill.getLineItemValue('purchaseorders', 'id', 1);
        //if no po Exit
        //if (!poId) {
       //     return false;
       // }

        var poInfo = [];
        //if it finds a po 

        //for now use the first line for class program and custom segment.
        logExecution('DEBUG', 'stLoggerTitle', 'Pre po 2');
        if (itemLnCount) {
            objData.class = myBill.getLineItemValue('item', 'class', 1);
            objData.program = myBill.getLineItemValue('item', 'custcol_cseg_fano_or_mg_cse', 1);
            objData.department = myBill.getLineItemValue('item', 'department', 1);
            objData.location = myBill.getLineItemValue('item', 'location', 1);

        } else if (expLnCount) {
            objData.class = myBill.getLineItemValue('expense', 'class', 1);
            objData.program = myBill.getLineItemValue('expense', 'custcol_cseg_fano_or_mg_cse', 1);
            objData.department = myBill.getLineItemValue('expense', 'department', 1);
            objData.location = myBill.getLineItemValue('expense', 'location', 1);
        }

        logExecution('DEBUG', 'stLoggerTitle', 'Pre po 1');
        if (poId) {
            poInfo = nlapiLookupField('purchaseorder', poId, ['total', 'custbody_order_type']);
             //RF 10-14-2016 We are not comparing the PO total anymore.  Onthe the bill calculated amount to the 
            //bill custom field.  Change poAmt to usertotal 
            var poAmt = myBill.getFieldValue('usertotal'); //Rf as above poInfo.total;
            
            objData.orderType = orderType;
			objData.vendorBillType = nlapiGetFieldValue('custbody_vendor_bill_type');
            //rf change to compare the total only on the bill 
            //var pOvBdiff = (parseFloat(poAmt) - parseFloat(vBamount));
            var pOvBdiff = (parseFloat(vBamount) - parseFloat(poAmt));
        }
		
		if (!poId) {
			objData.orderType = nlapiGetFieldValue('custbody_order_type');
			objData.vendorBillType = nlapiGetFieldValue('custbody_vendor_bill_type');
            var poAmt = myBill.getFieldValue('usertotal'); //Rf as above poInfo.total;
            var vBamount = myBill.getFieldValue('custbody_total_bill_amount'); //Rf as above poInfo.total;
			var pOvBdiff = (parseFloat(vBamount) - parseFloat(poAmt));
		}
			

        //test which type of prbill is being processed.// only need to processif the difference is not zero
        logExecution('DEBUG', 'stLoggerTitle', 'Post po' + pOvBdiff + ' ' +  objData.orderType);
        if (pOvBdiff != 0.00) {
			if (parseInt(objData.vendorBillType) == 1)
			{
              addSummaryLine(myBill, objData, objData.adminItem, pOvBdiff, stTransReasonCode,masterSO); // Process is Admin Fee
            }
            else {			
               switch (parseInt(objData.orderType)) {
                   case 1: addSummaryLine(myBill, objData, objData.supplyChainItem, pOvBdiff, stTransReasonCode,masterSO); break;  //SupplyChain Grocery
                   case 2: addSummaryLine(myBill, objData, objData.supplyChainItem, pOvBdiff, stTransReasonCode,masterSO); break;//Supply chain Product
                   case 7: addSummaryLine(myBill, objData, objData.tranItem, pOvBdiff, stTransReasonCode,masterSO); break; //Trans Portaion 
                   default: return true;
               }
			}
        } else {
            logExecution('DEBUG', 'stLoggerTitle', 'In remove summary line');
            removeSummaryLine(myBill, objData);
        }
    }
    catch (error) {
        if (error.getDetails != undefined) {
            nlapiLogExecution('ERROR', 'Process Error', error.getCode() + ': ' + error.getDetails());
            throw error;
        }
        else {
            nlapiLogExecution('ERROR', 'Unexpected Error', error.toString());
            throw nlapiCreateError('99999', error.toString());
        }
    }

}

function addSummaryLine(proBill, objData, lineItem, amtDiff, Rcode, masterSO) {

    logExecution('DEBUG', 'stLoggerTitle', 'IN Add Summary' + amtDiff + ' ' + objData.tranVarAmt + objData.supplyVarAmt );
    if (Math.abs(amtDiff) <= objData.tranVarAmt || Math.abs(amtDiff) <= objData.supplyVarAmt) {
        //add the line item 
       logExecution('DEBUG', 'stLoggerTitle', 'IN Add Summary line');
        proBill.setFieldValue('custbody_order_has_issues', 'F');
        proBill.setFieldValues('custbody_order_has_issues_reason', null);
      proBill.setFieldValue('approvalstatus',2);
        proBill.selectNewLineItem('item');
        proBill.setCurrentLineItemValue('item', 'item', lineItem);
        proBill.setCurrentLineItemValue('item', 'qty', 1);
        proBill.setCurrentLineItemValue('item', 'rate', parseFloat(amtDiff));
        proBill.setCurrentLineItemValue('item', 'custcol_cseg_fano_or_mg_cse', objData.program);
        proBill.setCurrentLineItemValue('item', 'department', objData.department);
        proBill.setCurrentLineItemValue('item', 'class', objData.class);
        proBill.setCurrentLineItemValue('item', 'location', objData.location);
        proBill.setCurrentLineItemValue('item', 'description', "Error & Ommission Variance for " + masterSO);
        proBill.setCurrentLineItemValue('item', 'custbody_product_description', "Error & Ommission Variance for " + masterSO);

        proBill.commitLineItem('item');

    } else {
        //mark bill has issues set to not approved.
        proBill.setFieldValue('custbody_order_has_issues', 'T');
      //Added by Thilaga
       nlapiLogExecution('DEBUG', "Approval status", proBill.getFieldValue('approvalstatus'));
      proBill.setFieldValue('approvalstatus',1);
        //  proBill.setFieldValue('custbody_order_issues', " tbd order has issues");
        proBill.setFieldValues('custbody_order_has_issues_reason', [].concat(Rcode));
		
		var masterSO = proBill.getFieldValue('custbody_associated_salesorder');
		if (!isEmpty(masterSO))
		{		
			  nlapiSubmitField('salesorder',masterSO,'custbody_order_has_issues', 'T');
			  nlapiSubmitField('salesorder',masterSO,'custbody_order_has_issues_reason', Rcode);
		}  

		
        //send email to the the creator

    }
  nlapiLogExecution('DEBUG', "values", proBill.getFieldValue('custbody_order_has_issues')+" "+proBill.getFieldValue('custbody_has_issues_comments')+" "+proBill.getFieldValues('custbody_order_has_issues_reason'));
	/*if((proBill.getFieldValue('custbody_order_has_issues')=="F"||proBill.getFieldValue('custbody_order_has_issues')==null) && (proBill.getFieldValue('custbody_has_issues_comments')==""||proBill.getFieldValue('custbody_has_issues_comments')==null)&&proBill.getFieldValues('custbody_order_has_issues_reason'==null)){*/
    if (Math.abs(amtDiff) > objData.issueVariance) {
    //    proBill.setFieldValue('custbody_order_has_issues', 'T');
		//Added by Thilaga (commented Has issues for ticket #5114)
       nlapiLogExecution('DEBUG', "Approval status", proBill.getFieldValue('approvalstatus'));
      proBill.setFieldValue('approvalstatus',1);
	    var hasIssues = new Array;
	    hasIssues     = proBill.getFieldValues('custbody_order_has_issues_reason');
        if (hasIssues == null)
 	    {
		   hasIssues = Rcode;
		//   proBill.setFieldValue('custbody_order_has_issues_reason', hasIssues);
    	} else
        {				   
		   hasIssues = hasIssues.concat(Rcode);
      //     proBill.setFieldValues('custbody_order_has_issues_reason', hasIssues);
        }				 
		
		var masterSO = proBill.getFieldValue('custbody_associated_salesorder');
		// pull and set the multi select
		if (!isEmpty(masterSO))
		{		
			//  nlapiSubmitField('salesorder',masterSO,'custbody_order_has_issues', 'T');
			//  nlapiSubmitField('salesorder',masterSO,'custbody_order_has_issues_reason', hasIssues);
		}  

	}	
//}
	
    nlapiSubmitRecord(proBill);

}

function removeSummaryLine(proBill, objData) {
    //loop through the lines and remove if the item is one of the script parameters.
    var intLineCount = proBill.getLineItemCount('item');
   

    for (var intLineCtr = 1; intLineCtr <= intLineCount; intLineCtr++) {
        var stItem = proBill.getLineItemValue('item', 'item', intLineCtr);
        if (stItem == objData.supplyChainItem || stItem == objData.tranItem || stItem == objData.adminItem) {
            proBill.removeLineItem('item', intLineCtr);
           proBill.setFieldValue('custbody_order_has_issues', 'F');
    proBill.setFieldValues('custbody_order_has_issues_reason', null);
        }
    }
    nlapiSubmitRecord(proBill);
}

function deleteScriptedLines(recTrans, objData) {
    var stLogTitle = 'afterSubmit_.deleteScriptedLines';
    //Initialize
logExecution('DEBUG', 'stLoggerTitle', 'Execution Method ' + context.getExecutionContext());

    if (context.getExecutionContext() != 'userinterface') {
        return;
    }

    nlapiLogExecution('DEBUG', stLogTitle, 'arrEQAcct = ' + 'Removing Lines');

    //Loop Expense line
    var intExpCount = nlapiGetLineItemCount('item');

    for (var intCtr = intExpCount; intCtr > 0; intCtr--) {
        var stItem = nlapiGetLineItemValue('item', 'item', intCtr);
        if (stItem == stTransChainVarianceItem || stItem == stSupplyChainVarianceItem  || stItem == stAdminChainVarianceItem) { 
            nlapiRemoveLineItem('item', intCtr);
            nlapiLogExecution('DEBUG', stLogTitle, 'Deleting scripted line = ' + intCtr);
        }
    }

}

function logExecution(stLog, stLoggerTitle, stMessage) {

    if (DEBUG) {
        nlapiLogExecution(stLog, stLoggerTitle, stMessage);
    }
}

/**
 * Return true if value is null, empty string, or undefined
 * @param stValue
 * @returns {Boolean}
 */
function isEmpty(stValue) {
    if ((stValue == '') || (stValue == null) || (stValue == undefined)) {
        return true;
    }
    return false;
}


/**
 * Converts a string to float
 * @param stValue
 * @returns
 */
function forceParseFloat(stValue) {
    var flValue = parseFloat(stValue);

    if (isNaN(flValue)) {
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