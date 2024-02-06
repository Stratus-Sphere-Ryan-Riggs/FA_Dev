/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Oct 2016     tshanmugam
 * 2.00       09 Nov 2016     Peter August     Adjusted to warehouse code is W<Internal ID>
 *                                             Adjusted the name to be Warehouse Code + Name + City + State + Zip
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