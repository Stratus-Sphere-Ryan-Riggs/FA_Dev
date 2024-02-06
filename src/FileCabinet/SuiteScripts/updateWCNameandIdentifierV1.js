nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Dec 2016     tshanmugam
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function updateWCNameandIdentifier(stType){
	
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

	var record = nlapiLoadRecord('customrecord_warehouse_contacts',nlapiGetRecordId());
    var WCIdentifier = record.getFieldValue('custrecord_wh_contact_identifier');
	
	if (stType=='create' || stType=='edit')
	{
      if(isEmpty(WCIdentifier)){
		WCIdentifier = 'WC-' + nlapiGetRecordId();
      }
	  record.setFieldValue('custrecord_wh_contact_identifier',WCIdentifier);
	}   
	
    if(stType=='edit' || stType=='create')
    {
	  var newName = "";
	  
	  if (!isEmpty(record.getFieldValue('custrecord_wc_warehouse_name')));
	  {
		  newName = newName + record.getFieldValue('custrecord_wc_warehouse_name');
	  } 	  
        
	  if (!isEmpty(record.getFieldValue('custrecord_warehouse_contact_name')));
	  {
		  newName = newName + '-' + record.getFieldValue('custrecord_warehouse_contact_name');
	  } 	  

	  record.setFieldValue('name',newName);
	
     //Added for ticket #7337
      
        var warehouseRoles= [];
        warehouseRoles = record.getFieldTexts('custrecord_warehouse_role');
        nlapiLogExecution('DEBUG','warehouseRoles= ' + JSON.stringify(warehouseRoles));
        var whRoleText = '';
        for(var i=0;i<warehouseRoles.length;i++){
            if(i==warehouseRoles.length-1){
              whRoleText = whRoleText + warehouseRoles[i];
            }
              else{
 					whRoleText = whRoleText + warehouseRoles[i] + ', ';
              }
        }
        nlapiLogExecution('DEBUG','whRoleText= ' + whRoleText);
        record.setFieldValue('custrecord_wh_role_text',whRoleText);
        
        newName = newName + '-' + whRoleText;
        record.setFieldValue('name',newName);
      
      
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
