nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
*
*
* This script is deployed as a scheduled script
* This script is used to auto close yellow donation orders with receipt received date greater than or equal to 90 days
*
* @author Thilaga Shanmugam
* @version 1.0
*
*
*/


var context = nlapiGetContext();
var intUsageLimit = 400;

function auto_close_transactions()
{

    var searchName        = nlapiGetContext().getSetting('SCRIPT','custscript_auto_close_search');
    var trans_type    =  'SalesOrd';

    var results = fetchtransactions(searchName);
    if(results != null)
    {
            for(var i = 0; i < results.length; i++)
            {
				
			   close_salesorder(results[i].getId(),trans_type);
               //approve_purchaseorders per DevOps Task 8054
               setTimeout(function(){ approve_purchaseorders(results[i].getId()); }, 10000)

  			   	if (context.getRemainingUsage() <= intUsageLimit)
				{

		           nlapiLogExecution('ERROR','Monitor usage', 'Remaining usage='+context.getRemainingUsage());
				   monitorUsageLimit();

                }

            }
    }


    return true;


}

//-------------------------Local Functions----------------------
function fetchtransactions(searchName)
{
    try
    {
        // Look for Sales orders not committed
        nlapiLogExecution("DEBUG", "Sales Orders", "Fetching orders "+searchName);
        var results = nlapiSearchRecord('salesorder', searchName);
        if(results == null)
        {
            nlapiLogExecution("DEBUG", "Sales Orders", "Nothing to Fetch.");
        }
        else
        {
            nlapiLogExecution("DEBUG", "Sales Orders", results.length + " Order entries.");

        }
        return results;
    }
    catch(e)
    {
      nlapiLogExecution("ERROR", "Failed in Fetch Info ", e);
       //customererror(e, 'Sales Orders', 'Failed in Fetch Info');
    }
}



function close_salesorder (stOppId, trans_type)
{

				var recTran       = nlapiLoadRecord('salesorder',stOppId);


		       for (var i = 1; i <= recTran.getLineItemCount('item'); i++ )
               {
				   var lineStatus = recTran.getLineItemValue('item','isclosed',i);
				  nlapiLogExecution("DEBUG", "Line Item status", lineStatus+" "+stOppId);
				  recTran.setLineItemValue('item','isclosed',i,'T');
			}

var id = nlapiSubmitRecord(recTran);
 nlapiLogExecution("DEBUG", "Order status", nlapiLoadRecord('salesorder',id).getFieldValue('status'));

}



function approve_purchaseorders(soID) {

    var filters = new Array();
    filters[0] = new nlobjSearchFilter( 'type', null, 'anyof', 'PurchOrd' );
    filters[1] = new nlobjSearchFilter( 'mainline', null, 'is', 'T' );
    filters[2] = new nlobjSearchFilter( 'custbody_associated_salesorder', null, 'anyof', soID );
    filters[3] = new nlobjSearchFilter( 'custbody_po_status', null, 'anyof', ['2','5','6']);
    var poList = nlapiCreateSearch('transaction', filters);
    var poListResults = poList.runSearch();
    var poListResultsData = poListResults.getResults(0,1000);
 				nlapiLogExecution("DEBUG", "poList Results", JSON.stringify(poListResultsData));

    if(poListResultsData != null)
    {
            for(var i = 0; i < poListResultsData.length; i++)
            {
				nlapiSubmitField('purchaseorder', poListResultsData[i].getId(), 'approvalstatus', 2);
 				nlapiLogExecution("DEBUG", "poID", poListResultsData[i].getId());
            }
    }
}

function setTimeout(aFunction, milliseconds){
	var date = new Date();
	date.setMilliseconds(date.getMilliseconds() + milliseconds);
	while(new Date() < date){
	}

	return aFunction();
}


function monitorUsageLimit() {

	nlapiLogExecution('ERROR','Monitor usage', 'Remaining usage='+context.getRemainingUsage());

	// Monitor usage limit
	//if (context.getRemainingUsage() <= intUsageLimit) {
     //   var stateMain = nlapiYieldScript();

       // if (stateMain.status == 'FAILURE') {
       // 	nlapiLogExecution('ERROR', 'Failed to yield script, exiting', 'Reason='+stateMain.reason+', Size='+stateMain.size);
       //     throw "Failed to yield script";

      //  } else if (stateMain.status == 'RESUME') {
      //  	nlapiLogExecution('ERROR', 'Resuming script', 'Reason='+stateMain.reason+ ', Size='+stateMain.size);
     //   }

	//}

}



function isEmpty(stValue) {
	if ((stValue == '') || (stValue == null) || (typeof stValue == "undefined"))
	{
		return true;
	}
	return false;
}
