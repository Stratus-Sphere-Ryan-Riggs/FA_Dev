nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
* Company			Feeding America
* Type				NetSuite Client-Side SuiteScript
* Version			1.0.0.0
* Description		This script will clear out fields on a copy
*
* Change History
* 10/20/2016 - Add in check for warehouse pricingClear
**/

function clientValidateLine(type) {
                                                       
    var povendor = nlapiGetCurrentLineItemValue('item', 'povendor');

 
    if (povendor != null && povendor != '') {
         nlapiSetCurrentLineItemValue('item','custcol_vendor',povendor);
     }
    return true;
}

function clientFieldChanged(type, name) {
	
	if (type != 'item')
	{
       return true;
    }	
	
  	if (type == 'item' && (name == 'povendor' || name == 'porate'))
	{
                                                       
       var povendor = nlapiGetCurrentLineItemValue('item', 'povendor');

       if (povendor != null && povendor != '') {
         nlapiSetCurrentLineItemValue('item','custcol_vendor',povendor);
       }
    }
	//custcolmation
 	if (type == 'item' && (name == 'povendor' || name == 'custcol_pickup_location'))
	{
                                                       
      var povendor = nlapiGetCurrentLineItemValue('item', 'povendor');
      if(povendor==null || povendor==''){
        povendor         = nlapiGetCurrentLineItemValue('item', 'custcol_vendor');
      }
       var pickuplocation_t = nlapiGetCurrentLineItemText ('item', 'custcol_pickup_location');
       var pickuplocation   = nlapiGetCurrentLineItemValue('item', 'custcol_pickup_location');
       nlapiLogExecution('Debug', 'IN Warehouse Lookup 1' + pickuplocation_t + ' po ' + povendor);
	   
	   if (isEmpty(pickuplocation_t))
	   {
           return true;
       }		   
	   
	   if (!isEmpty(pickuplocation_t))
	   {	   
	     if (!isEmpty(povendor)); 
	     {
		   
            nlapiLogExecution('Debug', 'IN Warehouse Lookup 2' + pickuplocation_t + ' po ' + povendor);
		   	var filters = new Array();
            filters[0] = new nlobjSearchFilter( 'custrecord_master_item', null, 'is', nlapiGetCurrentLineItemValue('item', 'item')); 
            filters[1] = new nlobjSearchFilter( 'custrecord_item_wareouse_vendor', null, 'is', povendor); 
            filters[2] = new nlobjSearchFilter( 'custrecord_vendor_warehouse', null, 'is', pickuplocation); 
            filters[3] = new nlobjSearchFilter( 'isinactive', null, 'is', 'F'); 
	        var arrColumns = new Array();
            arrColumns.push(new nlobjSearchColumn('custrecord_vendor_warehouse_price'));
            var searchResults = nlapiSearchRecord('customrecord_vendor_warehouse_price', 'customsearch_vendor_warehouse_price', filters, arrColumns );
            nlapiLogExecution('Debug', 'IN Warehouse Lookup 3 Search Results'  + searchResults);
		    if (searchResults != null)
		     {
                  var newrate    = searchResults[0].getValue('custrecord_vendor_warehouse_price');  // Add an Inactive Check
				  nlapiSetCurrentLineItemValue('item','porate',nlapiFormatCurrency(newrate),false);
				  nlapiSetCurrentLineItemValue('item','rate',nlapiFormatCurrency(newrate),false);
                  nlapiLogExecution('Debug', 'New Rate 3' + newrate);
             }
         }
	   }	 
    }
  //Added by Thilaga for Bug 5194 && 5486
	if (type == 'item' && (name == 'quantity' || name == 'custcol_cases_per_pallet')){
      nlapiLogExecution('Debug', 'field changed:type    ' + type + ' name ' + name);
      var nbr_pallets = new Number('0');
      var case_per_pallet = nlapiGetCurrentLineItemValue('item','custcol_cases_per_pallet');
      if(case_per_pallet!=null &&  case_per_pallet!='' && case_per_pallet!='0'){
        nbr_pallets = new Number(nlapiGetCurrentLineItemValue('item','quantity'))/new Number(case_per_pallet);
      			  nlapiSetCurrentLineItemValue('item','custcol_nbr_pallets',nlapiFormatCurrency(nbr_pallets),false);
    }
  }
  if (type == 'item' && (name == 'quantity' || name == 'custcol_item_gross_weight')){
      nlapiLogExecution('Debug', 'field changed:type    ' + type + ' name ' + name);
      var total_weight = new Number(nlapiGetCurrentLineItemValue('item','quantity'))*new Number(nlapiGetCurrentLineItemValue('item','custcol_item_gross_weight'));
      nlapiSetCurrentLineItemValue('item','custcol_total_weight',nlapiFormatCurrency(total_weight),false);
    nlapiSetCurrentLineItemValue('item','custcol_total_pounds',nlapiFormatCurrency(total_weight),false);
    }
	
    return true;
}

function lineInit(type, name) {
	
	nlapiLogExecution('Debug', 'lineinit-postsource    ' + type + ' name ' + name);
}

function isEmpty (stValue) {
     if ((stValue == '') || (stValue == null) || (stValue == undefined)) {
          return true;
     }

     return false;
}