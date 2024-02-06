nlapiLogExecution("audit","FLOStart",new Date().getTime());
function cancelPOs(){
   
        var arrRelatedRecords = new Array();
        var icSearchResults = nlapiSearchRecord('transaction', 'customsearch_cancel_associated_pos');
  if (icSearchResults != null && icSearchResults.length != 0) {
            for (var i = 0; i < icSearchResults.length; i++) {
                var tranId = icSearchResults[i].getId();
                var tranType = icSearchResults[i].getValue('type');
                nlapiLogExecution('DEBUG', 'Type in find related' + tranType + ' id ' + tranId);
                if ((tranType == 'PurchOrd') || (tranType == 'CustInvc')) {
                    var relatedRecord = {
                        tranid: tranId,
                        type: tranType
                    }
                    arrRelatedRecords.push(relatedRecord);
                }
            }
        }
  for (var i = 0; i < arrRelatedRecords.length; i++) {
                if (arrRelatedRecords[i].type == 'PurchOrd') {
                  var poRec = nlapiLoadRecord('purchaseorder',arrRelatedRecords[i].tranid);
                   //Order type = transportation, do not cancel
                   if(poRec.getFieldValue('custbody_order_type')=='7'){
                     
                   }else{
                     var numLines = poRec.getLineItemCount('item');
                     nlapiLogExecution('DEBUG', 'Order type' + poRec + " "+ numLines);
                     poRec.setFieldText('custbody_po_status','PO Cancelled');
                     if(poRec.getFieldValue('status')!='Closed'){
    				for (var j=1;j<=numLines;j++){
      					poRec.setLineItemValue('item','isclosed',j,'T');
    				}
                    }
                   }
                  if(poRec.getFieldValue('custbody_project_cseg')==null || poRec.getFieldValue('custbody_project_cseg')==''){
                  	poRec.setFieldText('custbody_project_cseg','00000 No Project');
                  }
                  nlapiSubmitRecord(poRec);
                  var arrParam = [];
	        arrParam['custscript_transtype']           = 'purchaseorder';
            arrParam['custscript_transintid']    = arrRelatedRecords[i].tranid;
        	arrParam['custscript_transid'] = nlapiLookupField('purchaseorder',arrRelatedRecords[i].tranid,'tranid');
    		
            var status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger',arrParam);
				       nlapiLogExecution('DEBUG','Scheduled Script Called','Scheduled Script Queue Status= ' + status);
                   if (status == 'INPROGRESS')
	{
		status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger_2',arrParam);
        nlapiLogExecution('DEBUG','Scheduled Script Called 2','Scheduled Script Queue Status= ' + status);
    }	
                   if (status == 'INPROGRESS')
	{
		status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger_3',arrParam);
        nlapiLogExecution('DEBUG','Scheduled Script Called 2','Scheduled Script Queue Status= ' + status);
    }	
                    if (status == 'INPROGRESS')
	{
		status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger_4',arrParam);
        nlapiLogExecution('DEBUG','Scheduled Script Called 2','Scheduled Script Queue Status= ' + status);
    }		
    if (status == 'INPROGRESS')
	{
		status = nlapiScheduleScript('customscript_scheduled_order_email_trigg','customdeploy_scheduled_trigger_5',arrParam);
        nlapiLogExecution('DEBUG','Scheduled Script Called 2','Scheduled Script Queue Status= ' + status);
    }
                } 
            }
        
}