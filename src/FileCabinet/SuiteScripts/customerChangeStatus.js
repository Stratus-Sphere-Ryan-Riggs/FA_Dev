nlapiLogExecution("audit","FLOStart",new Date().getTime());
/* Author - Thilaga
 * This is to set eligible customers to 'Auto' credit status
 * Runs daily at 1 am
 * Uses 2 saved search customsearch_cus_change_status and customsearch_order_credit_limit_total
 */

function changeCusOnHoldStatus(){
	try{
        var context = nlapiGetContext();
		var recordType = 'customer';
		var customerSavedSearch = context.getSetting('SCRIPT', 'custscript_customer_saved_search');
      nlapiLogExecution('debug', 'customerSavedSearch ' + customerSavedSearch);
		var resultsSavedSearch = nlapiSearchRecord(recordType, customerSavedSearch, null, null);
		if (resultsSavedSearch && resultsSavedSearch.length > 0) {
            for (var i = 0; i < resultsSavedSearch.length; i++) {
                try {
                    // Now transform the sales order into a fulfillment	
                    var cusID = resultsSavedSearch[i].getValue('internalid');
                    var balance = parseFloat(resultsSavedSearch[i].getValue('balance'));
                    var creditLimit = parseFloat(resultsSavedSearch[i].getValue('creditlimit'));
                   nlapiLogExecution('debug', 'cusID + balance + creditLimit ' + cusID+' '+balance+' '+creditLimit);
                    var openSoBal = parseFloat(getOpenSoBal(cusID));
                    if(creditLimit>(balance+openSoBal)){
                    	//nlapiSubmitField('customer',cusID,['custentity_fa_credit_status'],[0]);
                    	var cus = nlapiLoadRecord('customer',cusID);
                      cus.setFieldText('custentity_fa_credit_status','No Issue');
                      cus.setFieldText('creditholdoverride','Auto');
                      nlapiSubmitRecord(cus);
                      
                    }
                    
                }catch (err) {
                    var stErrDetails = 'Error: ' + err.toString();
                    nlapiLogExecution('ERROR', 'Error', stErrDetails);
                }
            }
            yieldScript();
		}
		
	}catch (err) {
        var stErrDetails = 'Error:' + err.toString();
        nlapiLogExecution('ERROR', 'Error ', stErrDetails);
    }
}

function getOpenSoBal(customerId) {
    var arrFilters = new Array();
    var arrColumns = new Array();
    var sOValue = 0;
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

function yieldScript() {
    var context = nlapiGetContext();
    var intRemainingUsage = context.getRemainingUsage();
    if (intRemainingUsage < 500) {
           nlapiYieldScript();
    }
}