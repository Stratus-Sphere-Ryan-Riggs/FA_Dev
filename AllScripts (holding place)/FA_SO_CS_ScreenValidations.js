nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Oct 2016     US37907
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord(){

	var lineCount = nlapiGetLineItemCount('item');
	var total_order_wt = 0;
	
	for ( var int = 1; int <= lineCount; int++) {
		var line_qty = nlapiGetLineItemValue('item', 'quantity', int);
		var item_gross_wt = nlapiGetLineItemValue('item', 'custcol_item_gross_weight', int);
		var total_gross_wt = nlapiGetLineItemValue('item', 'custcol_total_weight', int);
		
		if(total_gross_wt == null || total_gross_wt == '' || total_gross_wt == 0){
			var line_total_gross_wt = line_qty * item_gross_wt;
			total_order_wt = line_total_gross_wt + total_order_wt;
		}else{
			total_order_wt = total_order_wt + total_gross_wt;
		}
		nlapiLogExecution('DEBUG', 'Sales Order: Total Weight', 'Total Line Weight = '+nlapiGetLineItemText('item', 'custcol_total_weight', int));
	}
	
	nlapiLogExecution('DEBUG', 'Sales Order: Total Weight', 'Total Weight = '+total_order_wt);

	if(total_order_wt > 43500){
		var result = confirm("The total order weight is "+total_order_wt+" which more than the allowed limit 43500 Lbs. Do you want to continue?");
		if(result){
			return true;
		}else{
			return false;
		}
		
	}
	
	return true;
}
