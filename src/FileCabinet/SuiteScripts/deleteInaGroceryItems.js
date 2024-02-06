nlapiLogExecution("audit","FLOStart",new Date().getTime());
function scheduled_delete_fa_grocery_item_records(type)
{
	var context = nlapiGetContext();
	var deleteFAVendorWarehouse = context.getSetting('SCRIPT', 'custscript_del_fa_vendor_warehouse');
	var deleteFAInactItem = context.getSetting('SCRIPT', 'custscript_del_fa_inactive_item');
  var deleteFAInactEW = context.getSetting('SCRIPT', 'custscript_del_fa_inactive_EW');

	var arrColumns = [new nlobjSearchColumn('internalid')];

	if(deleteFAVendorWarehouse == 'T')
	{
		var arrFAVendorWarehouseResults = nlapiSearchRecord('customrecord_vendor_warehouse_price', null, null, arrColumns);

		if (arrFAVendorWarehouseResults)
		{
			for (var i = 0; i < arrFAVendorWarehouseResults.length; i++)
			{
				var stUpdateExpId = arrFAVendorWarehouseResults[i].getValue('internalid');
				nlapiLogExecution('DEBUG','Vendor warehouse ID','='+stUpdateExpId);

				nlapiDeleteRecord('customrecord_vendor_warehouse_price',stUpdateExpId);
			}
		}
	}

	if(deleteFAInactItem == 'T')
	{
		var arrFAInactItemResults = nlapiSearchRecord('item', 'customsearch_inactive_item_for_delete', null,  arrColumns);

		if (arrFAInactItemResults)
		{
			for (var i = 0; i < arrFAInactItemResults.length; i++)
			{
				var stUpdateExpId = arrFAInactItemResults[i].getValue('internalid');
				nlapiLogExecution('DEBUG','Item ID','='+stUpdateExpId);
				nlapiDeleteRecord(arrFAInactItemResults[i].getRecordType(),stUpdateExpId);
			}
		}
	}
  if(deleteFAInactEW == 'T')
	{
		var arrFAInactEWResults = nlapiSearchRecord('customrecord_address_contact_association', 'customsearch_inactive_ew_for_delete', null,  arrColumns);

		if (arrFAInactEWResults)
		{
			for (var i = 0; i < arrFAInactEWResults.length; i++)
			{
				var stUpdateExpId = arrFAInactEWResults[i].getValue('internalid');
				nlapiLogExecution('DEBUG','EW ID','='+stUpdateExpId);
				nlapiDeleteRecord('customrecord_address_contact_association',stUpdateExpId);
			}
		}
	}
}