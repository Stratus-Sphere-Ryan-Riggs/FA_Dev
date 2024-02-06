nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
 * Module Description
 * This script will be used to populate the time sheets
 * with the weighted average of the revenue allocated to the project
 * 
 * Version    Date            Author           Remarks
 * 1.00       12/22/2016      Paugust          Create 
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

var CONTEXT          = nlapiGetContext();
var declineStatus     = CONTEXT.getSetting('SCRIPT', 'custscript_decline_status');//custscript_cancel_status_order
var declineLineStatus = CONTEXT.getSetting('SCRIPT', 'custscript_decline_line_status');
var declineStatusOrder = CONTEXT.getSetting('SCRIPT', 'custscript_decline_status_order');//custscript_opp_decline_status
var declineOppStatus = CONTEXT.getSetting('SCRIPT', 'custscript_opp_decline_status');//custscript_opp_decline_status

function setDeclineStatus(recIds, itemId, poID) {
 
        nlapiSetFieldValue('custbody_order_status', declineStatusOrder);
        nlapiSetFieldValue('custbody_opportunity_status', declineOppStatus);

		nlapiLogExecution('DEBUG', 'Cancel Status: ' + declineStatus + ' 2 ' + declineStatusOrder );	
        var lineCt = nlapiGetLineItemCount('item');
        for (var i = 1; i <= lineCt; i++) {
			
			nlapiSetLineItemValue('item', 'custcol_item_status_field', i, declineLineStatus);
			//nlapiSetLineItemValue('item', 'custcol_opportunity_line_status', i, declineOppStatus); //custcol_opportunity_line_status

			//nlapiSetLineItemValue('item', 'isclosed', i, 'T');
	    }

		return true;
}
