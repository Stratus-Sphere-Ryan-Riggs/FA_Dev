nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Oct 2016     tshanmugam
 * 2.00       09 Nov 2016     Peter August     Adjusted to warehouse code is W<Internal ID>
 *                                             Adjusted the name to be Warehouse Code + Name + City + State + Zip
 * 1.00       27 Jun 2018     eperkins         Changes to warehouse name or address will update on associated records - ticket #5510
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
function updateWCodeandName(stType){
  
	
	//Update warehouse code and name
	
	//search max of warehouse code
	
	//add 1 to the resulting code
	//set WHcode=above
	//set Name = Wcode + name
    if(stType!='edit' && stType!='create')
    {
        //do nothing
        nlapiLogExecution('DEBUG','Script Exit: Invalid Operation Type','stType= ' + stType);
        return true;
    }

	var record = nlapiLoadRecord('customrecord_warehouse_address',nlapiGetRecordId());
    var WCode = record.getFieldValue('custrecord_mstr_warehouse_code');
	
	if (stType=='create')
	{
	   WCode = 'WN' + nlapiGetRecordId();
	   record.setFieldValue('custrecord_mstr_warehouse_code',WCode);
	}   
  if(stType=='create' || stType=='edit')
    {
	  var newName = "";
	  if (!isEmpty(record.getFieldValue('custrecord_warehousename')));
	  {
		  newName = newName + record.getFieldValue('custrecord_warehousename');
	  } 	  
      if (!isEmpty(record.getFieldValue('custrecord_mstr_address_line_1')));
	  {
		  newName = newName + '-' + record.getFieldValue('custrecord_mstr_address_line_1');
	  }   
	  if (!isEmpty(record.getFieldValue('custrecord_mstr_city')));
	  {
		  newName = newName + '-' + record.getFieldValue('custrecord_mstr_city');
	  } 	  

	  /*if (!isEmpty(record.getFieldText('custrecord_mstr_state')));
	  {
		  newName = newName + '-' + record.getFieldText('custrecord_mstr_state');
	  } 	  */
	  if (!isEmpty(record.getFieldValue('custrecord_mstr_zip_code')));
	  {
		var zip =   record.getFieldValue('custrecord_mstr_zip_code');
        var zipCode = [];
        zipCode=zip.split("-");
     nlapiLogExecution('DEBUG','zip split',zipCode[0]);   
        newName = newName + '-' + zipCode[0];
	  } 	  
		newName = newName + '-' + WCode;
      record.setFieldValue('name',newName);	
	}
	if (stType=='edit')
  	{
  		var id=nlapiGetRecordId();
      nlapiLogExecution('DEBUG','record ID ' + id);
      		var filter = new Array();
      	    filter[0] = new nlobjSearchFilter('internalid','custrecord_assoc_master_warehouse','anyof',id);
      		var column = new Array();
            column[0]= new nlobjSearchColumn('internalid');
      		var results = nlapiSearchRecord('customrecord_address_contact_association',null,filter,column);
     		if(results!=null){
      	for (var i = 0; i < results.length; i++ )
               {
                var eWRecord = nlapiLoadRecord('customrecord_address_contact_association',results[i].getValue('internalid'));
                 eWRecord.setFieldValue('custrecord_entity_warehouse_name',record.getFieldValue('custrecord_warehousename'));
                 eWRecord.setFieldValue('custrecord_entity_warehouse_code',WCode);
                 eWRecord.setFieldValue('custrecord_addr_line_1',record.getFieldValue('custrecord_mstr_address_line_1'));
                 eWRecord.setFieldValue('custrecord_address_line_2',record.getFieldValue('custrecord_mstr_address_line_2'));
                 eWRecord.setFieldValue('custrecord_address_city',record.getFieldValue('custrecord_mstr_city'));
                 eWRecord.setFieldValue('custrecord_address_state',record.getFieldValue('custrecord_mstr_state'));
                 eWRecord.setFieldValue('custrecord_zip_code',record.getFieldValue('custrecord_mstr_zip_code'));
                 eWRecord.setFieldValue('name',record.getFieldValue('name'));
                 nlapiSubmitRecord(eWRecord);
               }
            }
      //Added by Elizabeth - ticket #5510 - update edits to warehouse name or address on other records
            var filter2 = new Array();
      	    filter2[0] = new nlobjSearchFilter('internalid','custrecord_warehouse_association','anyof',id);
      		var column2 = new Array();
            column2[0]= new nlobjSearchColumn('internalid');
      		var results2 = nlapiSearchRecord('customrecord_warehouse_contacts',null,filter2,column2);
      nlapiLogExecution('DEBUG','warehouse contacts ' + results2);
     		if(results2!=null){
      	for (var j = 0; j < results2.length; j++ )
               {
                 var eW2Record = nlapiLoadRecord('customrecord_warehouse_contacts',results2[j].getValue('internalid'));
                 var newcontactname = (record.getFieldValue('custrecord_warehousename') + '-' + eW2Record.getFieldValue('custrecord_warehouse_contact_name'));
                 eW2Record.setFieldValue('custrecord_wc_warehouse_name',record.getFieldValue('custrecord_warehousename'));
                 eW2Record.setFieldValue('name',newcontactname);
                 nlapiLogExecution('DEBUG','warehouse contacts newcontactname' + newcontactname);
                /* var contact = eW2Record.getFieldValue('custrecord_mstr_contacts');
               	 var eW3Record = nlapiLoadRecord('contact',contact);

    			 var address1 = eW3Record.getLineItemValue('addressbook', 'addr1', 1);
                 var address2 = eW3Record.getLineItemValue('addressbook', 'addr2', 1);
                 var city1 = eW3Record.getLineItemValue('addressbook', 'city', 1);
                 var state1 = eW3Record.getLineItemValue('addressbook', 'dropdownstate', 1);
                 var zip1 = eW3Record.getLineItemValue('addressbook', 'zip', 1);
                 var label = eW3Record.getLineItemValue('addressbook', 'label', 1);
                 
                                  eW3Record.setLineItemValue('addressbook', 'addr1', 1, record.getFieldValue('custrecord_mstr_address_line_1'));
                                  eW3Record.setLineItemValue('addressbook', 'addr2', 1, record.getFieldValue('custrecord_mstr_address_line_2'));
                                  eW3Record.setLineItemValue('addressbook', 'city', 1, record.getFieldValue('custrecord_mstr_city'));
                                  eW3Record.setLineItemValue('addressbook', 'dropdownstate', 1, record.getFieldValue('custrecord_mstr_state'));
                                  eW3Record.setLineItemValue('addressbook', 'zip', 1, record.getFieldValue('custrecord_mstr_zip_code'));
                                  eW3Record.setLineItemValue('addressbook', 'label', 1, record.getFieldValue('custrecord_mstr_address_line_1'));
                 
                                                       eW3Record.commitLineItem('addressbook');
                 

                 nlapiSubmitRecord(eW3Record);*/
                 nlapiSubmitRecord(eW2Record);
               }
            }
    	}

    

	
	nlapiSubmitRecord(record);
	return true;
 	
}

function isEmpty(stValue) {   
	if ((stValue == '') || (stValue == null) || (typeof stValue == "undefined"))  
	{        
		return true;   
	}
	return false; 
}