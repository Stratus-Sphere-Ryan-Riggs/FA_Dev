nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       17 Apr 2017     tshanmugam
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function clientAlertUser(type, name){

if(type=='create') { 
	var asso_sales_order = nlapiGetFieldValue('custbody_associated_salesorder');
	if(asso_sales_order!=null && asso_sales_order!=""){
      //Define search filter expression
		var filters = new Array();
		filters[0] = new nlobjSearchFilter( 'custbody_associated_salesorder', null, 'is', asso_sales_order);
	//Define search columns
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('transactionnumber');

      //Execute the Customer search, passing search filter expression and columns
		var searchresults = nlapiSearchRecord('vendorcredit', null, filters, columns);
      //Loop through the results
     // alert(searchresults);
		if(searchresults != null && searchresults!='')
		{

				alert("Vendor Credit already exists for this sales order. Please review before creating this new Vendor credit");


		}

	}
}

  return true;
}
