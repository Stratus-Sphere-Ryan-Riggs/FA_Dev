nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
 * Module Description
 * This script will be used to populate the time sheets
 * with the weighted average of the revenue allocated to the project
 * 
 * Version    Date            Author           Remarks
 * 1.00       8-jun 2016     rfulling
 * 1.1        1- jul 2016    rfulling           Header section shoudl readn lines
 *                                              with no customer bank
 * 1.2        19-Jul-2016    Peter August       Altered on Save to ensure a value on contract or contract URL is present
 *
 *
 *
* @param {String} type Sublist internal id
* @returns {Boolean} True to save line item, false to abort save
*/

function clientValidateLine(type) {
                                                       
    var legalContract = nlapiGetCurrentLineItemValue('item', 'custcol_fa_legal_approval_item');
    var legalContractExp = nlapiGetCurrentLineItemValue('expense', 'custcol_fa_legal_required_exp');

    //use the body field  custbody_legal_contract

    nlapiLogExecution('Debug', 'ValidateLine    ' + legalContract);
  
    if (legalContract == "T" && isEmpty(nlapiGetFieldValue('custbody_legal_contract')) && isEmpty(nlapiGetFieldValue('custbody_electronic_contract_url'))) {
         alert('PO Does not have Contract');
         return false;
     }
    if (legalContractExp == "T" && isEmpty(nlapiGetFieldValue('custbody_legal_contract')) && isEmpty(nlapiGetFieldValue('custbody_electronic_contract_url'))) {
         alert('PO Does not have Contract');
         return false;
     }
    return true;
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

function savePO(type) {
          
   	for (var i = 1; i <= nlapiGetLineItemCount('expense'); i++ ) 
    {
	    var legalContractExp = nlapiGetLineItemValue('expense', 'custcol_fa_legal_required_exp',i);
        if (legalContractExp == "T" && isEmpty(nlapiGetFieldValue('custbody_legal_contract')) && isEmpty(nlapiGetFieldValue('custbody_electronic_contract_url'))) {
            alert('PO Does not have Contract');
            return false;
        }
     }			   

   	for (var i = 1; i <= nlapiGetLineItemCount('item'); i++ ) 
    {
         var legalContract = nlapiGetLineItemValue('item', 'custcol_fa_legal_approval_item',i);
	     if (legalContract == "T" && isEmpty(nlapiGetFieldValue('custbody_legal_contract')) && isEmpty(nlapiGetFieldValue('custbody_electronic_contract_url'))) {
         alert('PO Does not have Contract');
         return false;
        }
 
    }			   

    return true;
}