nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
* Copyright (c) 1998-2016 NetSuite, Inc.
* 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
* All Rights Reserved.
*
* This software is the confidential and proprietary information of
* NetSuite, Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with NetSuite.
* Module Description
*
* Version    Date            Author           Remarks
* 1.00       11-13-2017     thilaga     
* 
*/

function updateRelatedRecords() {
 //   try {

        var context = nlapiGetContext();
        var idSalesOrder = context.getSetting('SCRIPT', 'custscript_idsalesorder');
        var isReleaseDateChanged = context.getSetting('SCRIPT', 'custscript_isreleasedatechanged');
      	var isReqPickUpDateChanged = context.getSetting('SCRIPT', 'custscript_isreqpickupdatechanged');
      	var isPoVenCommentsChanged = context.getSetting('SCRIPT', 'custscript_ispovencommentschanged');
      	var isShippingMethodChanged = context.getSetting('SCRIPT', 'custscript_isshipmethodchanged');
      	var isMemberPONumChanged = context.getSetting('SCRIPT', 'custscript_ismemberponumchanged');
  		var isCancelled= context.getSetting('SCRIPT', 'custscript_is_cancelled');
        nlapiLogExecution('DEBUG', 'idSalesOrder'+'isReleaseDateChanged', idSalesOrder+" "+isReleaseDateChanged+" "+isReqPickUpDateChanged+" "+isPoVenCommentsChanged+" "+isShippingMethodChanged+" "+isMemberPONumChanged);
        var icFilters = new Array();
        var arrRelatedRecords = new Array();
      if(isReleaseDateChanged||isReqPickUpDateChanged||isPoVenCommentsChanged||isShippingMethodChanged||isMemberPONumChanged){
        icFilters.push(new nlobjSearchFilter('custbody_associated_salesorder', null, 'is', idSalesOrder));
        var icSearchResults = nlapiSearchRecord('transaction', 'customsearch_has_issue_search', icFilters);
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
      nlapiLogExecution('DEBUG', 'arrRelatedRecords=' + arrRelatedRecords );
        
        var fields = ['custbody_order_type','custbody_release_date','custbodycustbody_requested_pickup_date','custbodycustbody_po_vendor_comments','custbody_shipping_method_code','otherrefnum'];
        var columns = nlapiLookupField('salesorder', idSalesOrder, fields);
        nlapiLogExecution('DEBUG', 'columns=' + columns );
        var orderType = columns.custbody_order_type;
        var releaseDate = columns.custbody_release_date;
        var reqPickupDate = columns.custbodycustbody_requested_pickup_date;
        var poComments = columns.custbodycustbody_po_vendor_comments;
      	var shippingMethod = columns.custbody_shipping_method_code;
      	var memberPONum = columns.otherrefnum;
        var sendPOModEmail = false;
        var tranChanges = '';
        nlapiLogExecution('DEBUG', 'Release Date' + releaseDate + ' isReleaseDateChanged ' + isReleaseDateChanged+ 'Req pick up date' + reqPickupDate+ 'isReqPickUpDateChanged'+isReqPickUpDateChanged+' poComments '+poComments+ 'isMemberPONumChanged '+isMemberPONumChanged);
        if (isReleaseDateChanged) {
          var oldReleaseDate;
            for (var i = 0; i < arrRelatedRecords.length; i++) {
                if (arrRelatedRecords[i].type == 'PurchOrd') {
                  if(i==0){
                  	oldReleaseDate = nlapiLookupField('purchaseorder', arrRelatedRecords[i].tranid, 'custbody_release_date');
                  }
                    nlapiSubmitField('purchaseorder', arrRelatedRecords[i].tranid, 'custbody_release_date', releaseDate, false);
                } /*else {
                    nlapiSubmitField('invoice', arrRelatedRecords[i].tranid, 'custbody_release_date', releaseDate, false);
                }*/
            }
          if(oldReleaseDate!=releaseDate){
          sendPOModEmail = true;
          tranChanges = tranChanges +"<br>"+ 'The Release Date changed from:' +oldReleaseDate+' to:'+releaseDate;
        }
        }
        if(isReqPickUpDateChanged){
          var oldReqPickUpDate;
          for (var i = 0; i < arrRelatedRecords.length; i++) {
                if (arrRelatedRecords[i].type == 'PurchOrd') {
                  if(i==0){
                    oldReqPickUpDate=nlapiLookupField('purchaseorder', arrRelatedRecords[i].tranid, 'custbodycustbody_requested_pickup_date');
                  }
                    nlapiSubmitField('purchaseorder', arrRelatedRecords[i].tranid, 'custbodycustbody_requested_pickup_date', reqPickupDate, false);
                } /*else {
                    nlapiSubmitField('invoice', arrRelatedRecords[i].tranid, 'custbodycustbody_requested_pickup_date', reqPickupDate, false);
                }*/
            }
          if(oldReqPickUpDate!=reqPickupDate){
          sendPOModEmail = true;
          tranChanges = tranChanges +"<br>"+ 'The Requested Pick Up Date changed from:' +oldReqPickUpDate+' to:'+reqPickupDate;
          }
        }
        if(isPoVenCommentsChanged){
          var oldPOVenComments;
          for (var i = 0; i < arrRelatedRecords.length; i++) {
                if (arrRelatedRecords[i].type == 'PurchOrd') {
                  if(i==0){
                    oldPOVenComments = nlapiLookupField('purchaseorder', arrRelatedRecords[i].tranid, 'custbodycustbody_po_vendor_comments');
                  }
                    nlapiSubmitField('purchaseorder', arrRelatedRecords[i].tranid, 'custbodycustbody_po_vendor_comments', poComments, false);
                }/* else {
                    nlapiSubmitField('invoice', arrRelatedRecords[i].tranid, 'custbodycustbody_po_vendor_comments', poComments, false);
                }*/
            }
          if(oldPOVenComments!=poComments && poComments!=''){
          sendPOModEmail = true;
          tranChanges = tranChanges +"<br>"+ 'The PO Vendor Comments changed from:' +oldPOVenComments+' to:'+poComments;
          }
        }
        if(isShippingMethodChanged){
          for (var i = 0; i < arrRelatedRecords.length; i++) {
                if (arrRelatedRecords[i].type == 'PurchOrd') {
                    nlapiSubmitField('purchaseorder', arrRelatedRecords[i].tranid, 'custbody_shipping_method_code', shippingMethod, false);
                }/* else {
                    nlapiSubmitField('invoice', arrRelatedRecords[i].tranid, 'custbody_shipping_method_code', shippingMethod, false);
                }*/
            }
        }
        if(isMemberPONumChanged){
          for (var i = 0; i < arrRelatedRecords.length; i++) {
                if (arrRelatedRecords[i].type == 'CustInvc') {
                    nlapiSubmitField('invoice', arrRelatedRecords[i].tranid, 'otherrefnum', memberPONum, false);
                }/* else {
                    nlapiSubmitField('invoice', arrRelatedRecords[i].tranid, 'otherrefnum', memberPONum, false);
                }*/
            }
        }
        if(sendPOModEmail){
          nlapiLogExecution('DEBUG','transaction changes','= ' + tranChanges);
          for (var i = 0; i < arrRelatedRecords.length; i++) {
                if (arrRelatedRecords[i].type == 'PurchOrd') {
                  var orderType = nlapiLookupField('purchaseorder',arrRelatedRecords[i].tranid,'custbody_order_type');
                  if(orderType==1||orderType==2){
                    nlapiSubmitField('purchaseorder', arrRelatedRecords[i].tranid, 'custbody_po_status', '3', false);
                    nlapiSubmitField('purchaseorder', arrRelatedRecords[i].tranid, 'custbody_transaction_changes', tranChanges, false);
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
        }
        
      }
if(isCancelled!=null && isCancelled!='' && isCancelled=='true'){
  var icFilters = new Array();
        var arrRelatedRecords = new Array();
        icFilters.push(new nlobjSearchFilter('custbody_associated_salesorder', null, 'is', idSalesOrder));
        var icSearchResults = nlapiSearchRecord('transaction', 'customsearch_has_issue_search', icFilters);
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
    				for (var j=1;j<=numLines;j++){
      					poRec.setLineItemValue('item','isclosed',j,'T');
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
    /*}
    catch (e) {
        nlapiLogExecution('ERROR', 'e', e);
    }*/
}