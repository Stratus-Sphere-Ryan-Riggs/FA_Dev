nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
* Company			Feeding America
* Type				NetSuite Client-Side SuiteScript
* Version			1.0.0.0
* Description		This script will set various FA Donation Fields
*
* Change History
* 11/03/2016 - Set Various fields
**/

function clientFieldChanged(type, name) {
	
    // Set the Item Number or Handling Code
	
 	if (name == 'custrecord_ns_item_1' && (!isEmpty(nlapiGetFieldText('custrecord_ns_item_1'))))
	{
		var itemName = nlapiLookupField('item', nlapiGetFieldValue('custrecord_ns_item_1'), 'itemid');
		nlapiSetFieldValue('custrecord_donation_item_1', itemName, false);
	}

 	if (name == 'custrecord_ns_item_2' && (!isEmpty(nlapiGetFieldText('custrecord_ns_item_2'))))
	{
		var itemName = nlapiLookupField('item', nlapiGetFieldValue('custrecord_ns_item_2'), 'itemid');
		nlapiSetFieldValue('custrecord_donation_item_2', itemName, false);
	}

 	if (name == 'custrecord_ns_item_3' && (!isEmpty(nlapiGetFieldText('custrecord_ns_item_3'))))
	{
		var itemName = nlapiLookupField('item', nlapiGetFieldValue('custrecord_ns_item_3'), 'itemid');
		nlapiSetFieldValue('custrecord_donation_item_3', itemName, false);
	}

 	if (name == 'custrecord_ns_item_4' && (!isEmpty(nlapiGetFieldText('custrecord_ns_item_4'))))
	{
		var itemName = nlapiLookupField('item', nlapiGetFieldValue('custrecord_ns_item_4'), 'itemid');
		nlapiSetFieldValue('custrecord_donation_item_4', itemName, false);
	}
	
 	if (name == 'custrecord_ns_item_5' && (!isEmpty(nlapiGetFieldText('custrecord_ns_item_5'))))
	{
		var itemName = nlapiLookupField('item', nlapiGetFieldValue('custrecord_ns_item_5'), 'itemid');
		nlapiSetFieldValue('custrecord_donation_item_5', itemName, false);
	}

 	if (name == 'custrecord_ns_item_6' && (!isEmpty(nlapiGetFieldText('custrecord_ns_item_6'))))
	{
		var itemName = nlapiLookupField('item', nlapiGetFieldValue('custrecord_ns_item_2'), 'itemid');
		nlapiSetFieldValue('custrecord_donation_item_2', itemName, false);
	}

 	if (name == 'custrecord_ns_item_7' && (!isEmpty(nlapiGetFieldText('custrecord_ns_item_7'))))
	{
		var itemName = nlapiLookupField('item', nlapiGetFieldValue('custrecord_ns_item_7'), 'itemid');
		nlapiSetFieldValue('custrecord_donation_item_7', itemName, false);
	}

 	if (name == 'custrecord_ns_item_8' && (!isEmpty(nlapiGetFieldText('custrecord_ns_item_8'))))
	{
		var itemName = nlapiLookupField('item', nlapiGetFieldValue('custrecord_ns_item_8'), 'itemid');
		nlapiSetFieldValue('custrecord_donation_item_8', itemName, false);
	}
	
 	if (name == 'custrecord_ns_member' && (!isEmpty(nlapiGetFieldText('custrecord_ns_member'))))
	{
		var entityName = nlapiLookupField('entity', nlapiGetFieldValue('custrecord_ns_member'), 'entityid');
		nlapiSetFieldValue('custrecord_donation_a2haffiliateid', entityName, false);
	}
	
 	if (name == 'custrecord_ns_donor' && (!isEmpty(nlapiGetFieldText('custrecord_ns_donor'))))
	{
		var entityName = nlapiLookupField('entity', nlapiGetFieldValue('custrecord_ns_donor'), 'entityid');
		nlapiSetFieldValue('custrecord_donation_donor_no', entityName, false);
	}
	
	
    return true;
}

function isEmpty (stValue) {
     if ((stValue == '') || (stValue == null) || (stValue == undefined)) {
          return true;
     }

     return false;
}