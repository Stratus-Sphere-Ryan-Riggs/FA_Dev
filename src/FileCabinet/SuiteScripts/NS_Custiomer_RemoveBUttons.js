nlapiLogExecution("audit","FLOStart",new Date().getTime());
function beforeLoad_HideSaleItems(type, form) {
	
	//var subList = form.getSubList('transactions');
    // if (subList != null) {
	//    subList.removeButton('estimate');
    // }

       nlapiLogExecution('DEBUG','Check For Location','|------------SCRIPT START------------||' + form);
       var button   = form.removeButton('estimate');
       var button   = form.removeButton('invoice');
       var button   = form.removeButton('salesorder');
       nlapiLogExecution('DEBUG','Check For Location','|------------SCRIPT START------------||' + form + ' ' + button);
      // var button   = form.removeButton('New Estimate');
       
	   
}