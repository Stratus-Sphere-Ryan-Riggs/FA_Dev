nlapiLogExecution("audit","FLOStart",new Date().getTime());
// JScript source code
function createFulfillment(donationID, donorID, memberID, items, addressRecReturned) {
    try {

        var recordType = 'transaction';
        var context = nlapiGetContext();
        var donationsSavedSearch = context.getSetting('SCRIPT', 'custscript_blueorders_saved_search');
        var resultsSavedSearch = nlapiSearchRecord(recordType, donationsSavedSearch, null, null);


        if (resultsSavedSearch && resultsSavedSearch.length > 0) {
            for (var i = 0; i < resultsSavedSearch.length; i++) {
                try {
                    // Now transform the sales order into a fulfillment	
                    var soID = resultsSavedSearch[i].getValue('internalid');
                    nlapiLogExecution('debug', 'sales order ID Before Total Fullfillment Lines ' + soID);

                    var newFulfillment = nlapiTransformRecord('salesorder', soID, 'itemfulfillment');
                    var ifID = nlapiSubmitRecord(newFulfillment, true, true);
                    nlapiLogExecution('debug', 'Item fulfillment ID Post Fulfillment ' + ifID);


                    //var ifID = nlapiSubmitRecord(newFulfillment, true, true);
                    var newSalesOrder2 = nlapiLoadRecord('salesorder', soID);
                    nlapiLogExecution('debug', 'Pre CLOSER ' + newSalesOrder2.getFieldValue('status'));
                    for (var l = 1; l <= newSalesOrder2.getLineItemCount('item'); l++) {
                        //added by Thilaga
                        newSalesOrder2.setLineItemValue('item', 'isclosed', l, 'T');
                    }
                    nlapiLogExecution('debug', 'CLOSE SALEES ORDER ' + newSalesOrder2.getFieldValue('status'));
                    //added for bug #5384 by Thilaga
                    newSalesOrder2.setFieldText('custbody_order_status', 'Receipted');
                    var soID2 = nlapiSubmitRecord(newSalesOrder2);
                    //added for test
                    currentDate = new Date(); // returns the date
                    nlapiLogExecution('EMERGENCY', 'After SO and ITEM fulfill create Date/Time', nlapiDateToString(currentDate, 'datetimetz'));
				yieldScript(resultsSavedSearch);
                }
                catch (errSO) {
                    var stErrDetails = 'Error in creating item fulfillment: ' + errSO.toString();
                    nlapiLogExecution('EMERGENCY', 'Error in Item fulfillment', stErrDetails);
                }
            }
        }

        
    }
    catch (errSO) {
        var stErrDetails = 'Error while retrieving SO: ' + errSO.toString();
        nlapiLogExecution('EMERGENCY', 'Error in Item fulfillment', stErrDetails);
    }
}

function yieldScript(results) {
    var context = nlapiGetContext();
    var intRemainingUsage = context.getRemainingUsage();
    if (intRemainingUsage < 500) {
      results = null;
        nlapiYieldScript();
    }
}