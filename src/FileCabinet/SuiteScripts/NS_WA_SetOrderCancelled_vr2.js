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


function setCancelStatus() {

var CONTEXT          = nlapiGetContext();
var cancelStatus     = CONTEXT.getSetting('SCRIPT', 'custscript_cancel_status');//custscript_cancel_status_order
var cancelLineStatus = CONTEXT.getSetting('SCRIPT', 'custscript_cancel_line_status');
var cancelStatusOrder = CONTEXT.getSetting('SCRIPT', 'custscript_cancel_status_order');//custscript_cancel_status_order custscript_cancel_opp_status
var cancelOppStatus   = CONTEXT.getSetting('SCRIPT', 'custscript_cancel_opp_status');//custscript_cancel_status_order custscript_cancel_opp_status
 
		nlapiLogExecution('DEBUG', 'Cancel Status: ' + cancelStatus + ' 2 ' + cancelStatusOrder );	
if(cancelStatus=='3'){
        nlapiSetFieldValue('custbody_order_status', cancelStatusOrder);
        nlapiSetFieldValue('custbody_opportunity_status', cancelOppStatus);
		nlapiLogExecution('DEBUG', 'Document ID=' + nlapiGetFieldValue('tranid')+'Cancel Status: ' + cancelStatus + ' 2 ' + cancelStatusOrder );	
        var lineCt = nlapiGetLineItemCount('item');
        for (var i = 1; i <= lineCt; i++) {
			
			nlapiSetLineItemValue('item', 'custcol_item_status_field', i, cancelLineStatus); //custcol_opportunity_line_status
			//nlapiSetLineItemValue('item', 'custcol_opportunity_line_status', i, cancelOppStatus); //custcol_opportunity_line_status
			//nlapiSetLineItemValue('item', 'isclosed', i, 'T');
	    }
  if(nlapiGetFieldValue('status')=='Pending Fulfillment'){
    nlapiLogExecution('DEBUG', 'Order Status: ' + nlapiGetFieldValue('status') );
    var numLines = nlapiGetLineItemCount('item');
    for (var i=1;i<=numLines;i++){
      nlapiSetLineItemValue('item','isclosed',i,'T');
    }
  }
  var param = 
            {
              'custscript_idsalesorder' : nlapiGetRecordId(),
              'custscript_is_cancelled' : true,
             }
                nlapiLogExecution('DEBUG', 'Email param: ' + param );

            //Updated below for tfs ticket #8091
            KBS.scriptScheduler.schedule('customscript_ss_related_rec', param, true);
            //nlapiScheduleScript('customscript_fa_ss_update_so_related_rec', 'customdeploy_sch_update_relatedrecords', param);
}
  if(cancelStatus=='8'){
    nlapiLogExecution('DEBUG', 'Cancel status' + cancelStatus);
  }

		return true;
}
