nlapiLogExecution("audit","FLOStart",new Date().getTime());
/* This after submit script sets the external id of the item on create.
* 
* @version 1.0 
*  Purpose:  Set the G##### / PR##### item #s for new items to be concatenated with the internal ID of the item. This ticket will also add the vendor UPC to the mainline field 'Vendor Item Code' if the item is a grocery item.
*  Ticket #:  5430 & 5360
*/
function aftersubmit_setItemNumber(stType)
{
    var recordType = nlapiGetRecordType();
    nlapiLogExecution('DEBUG','aftersubmit_setItemNumber','|------------SCRIPT STARTED------------||');
    if(stType!='create' && recordType!='noninventoryitem')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType + ' ' + recordType);
        return;
    }
	var itemInternalID = nlapiGetRecordId();
    var itemRecord = nlapiLoadRecord('noninventoryitem',itemInternalID);
	var itemType = itemRecord.getFieldValue('custitem_product_channel');
	
    if(itemType != '1' && itemType != '2')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','itemType= ' + itemType);
        return;
    }
	var itemID = itemRecord.getFieldValue('itemid');

    if(itemType != '2')
    {
      if (itemInternalID.length == 4)
        {
        var groceryItemID = 'G' + '0' + itemInternalID;
        itemRecord.setFieldValue('itemid',groceryItemID);
        //add UPC code
        var vendorCode = itemRecord.getLineItemValue('itemvendor','vendorcode',1);
      	var setCode = itemRecord.setFieldValue('custitem_vendor_item_code',vendorCode);
        }
      if (itemInternalID.length >= 5)
        {
        var groceryItemID = 'G' + itemInternalID;
        itemRecord.setFieldValue('itemid',groceryItemID);
        //add UPC code
        var vendorCode = itemRecord.getLineItemValue('itemvendor','vendorcode',1);
      	var setCode = itemRecord.setFieldValue('custitem_vendor_item_code',vendorCode);
         }
         }
    if(itemType == '2')
    {
      if (itemInternalID.length == 4)
        {
        var produceItemID = 'PR' + '0' + itemInternalID;
        itemRecord.setFieldValue('itemid',produceItemID);
			//add list of Fresh Produce Donors
            var filter = new Array();
            filter[0] = new nlobjSearchFilter('custentity_freshproducedonor','null','is','T');
      		filter[1] = new nlobjSearchFilter('isinactive','null','is','F');
      		var column = new Array();
            column[0]= new nlobjSearchColumn('entityid');
      		var results = nlapiSearchRecord('vendor',null,filter,column);
     		if(results!=null){
      	    for (var i = 0; i < results.length; i++ )
               {

            var vendorid = results[i].getId();
                
              if (vendorid) {
                var isPresent = itemRecord.findLineItemValue('itemvendor','vendor',vendorid);
              }
                if (isPresent == -1) {
                itemRecord.selectNewLineItem('itemvendor');
				itemRecord.setCurrentLineItemValue('itemvendor', 'vendor', vendorid);
				itemRecord.setCurrentLineItemValue('itemvendor', 'purchaseprice', 0.00);
				itemRecord.commitLineItem('itemvendor');
              }
           }
        }
     }
      if (itemInternalID.length >= 5)
        {
        var produceItemID = 'PR' + itemInternalID;
        itemRecord.setFieldValue('itemid',produceItemID);
			//add list of Fresh Produce Donors
            var filter = new Array();
            filter[0] = new nlobjSearchFilter('custentity_freshproducedonor','null','is','T');
      		filter[1] = new nlobjSearchFilter('isinactive','null','is','F');
      		var column = new Array();
            column[0]= new nlobjSearchColumn('entityid');
      		var results = nlapiSearchRecord('vendor',null,filter,column);
     		if(results!=null){
      	    for (var i = 0; i < results.length; i++ )
               {

            var vendorid = results[i].getId();
                
              if (vendorid) {
                var isPresent = itemRecord.findLineItemValue('itemvendor','vendor',vendorid);
              }
                if (isPresent == -1) {
                itemRecord.selectNewLineItem('itemvendor');
				itemRecord.setCurrentLineItemValue('itemvendor', 'vendor', vendorid);
				itemRecord.setCurrentLineItemValue('itemvendor', 'purchaseprice', 0.00);
				itemRecord.commitLineItem('itemvendor');
              }
           }
        }
     }
   }
	nlapiSubmitRecord(itemRecord);
    return true;
  
	
}