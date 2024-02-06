nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Feb 2017     tshanmugam
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
function clientValidateField(type, name){
	
	if(name=='custentity_odyssey_number'){
		var formMemberNumber = nlapiGetFieldValue('custentity_odyssey_number');
      var company = nlapiGetFieldValue('companyname');
      if((formMemberNumber==null) || (formMemberNumber=="")){
        return true;
      }
		  if(formMemberNumber!=null || formMemberNumber!=""){
      //Define search filter expression
		var filters = new Array();
		filters[0] = new nlobjSearchFilter( 'custentity_odyssey_number', null, 'is', formMemberNumber);
	//Define search columns
		var columns = new Array();
		columns[0] = new nlobjSearchColumn('companyname');
     
      //Execute the Customer search, passing search filter expression and columns
		var searchresults = nlapiSearchRecord('customer', null, filters, columns);
      //Loop through the results
		for (var i = 0; searchresults != null && i < searchresults.length; i++)
		{
          var searchresult = searchresults[i];
          var record = searchresult.getId();
          var rectype = searchresult.getRecordType();
          var name = searchresult.getValue('companyname');
			  if(name==company){
                  
              }
            
			else{
				alert("Member number "+formMemberNumber +" exists for another member '"+name+"'. Please change and submit");
				
            }
			
		}
      }
   
		
    }
  return true;
}
