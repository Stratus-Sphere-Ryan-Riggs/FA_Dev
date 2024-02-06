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
  		var isLineQtyChanged = context.getSetting('SCRIPT', 'custscript_is_line_qty_changed');
 		var isPickUpLocChanged = context.getSetting('SCRIPT', 'custscript_is_line_pickup_changed');
  		var isDropOffLocChanged = context.getSetting('SCRIPT', 'custscript_is_line_dropoff_changed');
  		var isLineRateChanged = context.getSetting('SCRIPT', 'custscript_is_line_rate_changed');
  		var isLineItemAdded = context.getSetting('SCRIPT', 'custscript_is_line_item_added');
  		var isCancelled= context.getSetting('SCRIPT', 'custscript_is_cancelled');
        nlapiLogExecution('DEBUG', 'idSalesOrder'+'isReleaseDateChanged', idSalesOrder+" "+isReleaseDateChanged+" "+isReqPickUpDateChanged+" "+isPoVenCommentsChanged+" "+isShippingMethodChanged+" "+isMemberPONumChanged+isLineRateChanged);
        var icFilters = new Array();
        var arrRelatedRecords = new Array();
      if(isReleaseDateChanged||isReqPickUpDateChanged||isPoVenCommentsChanged||isShippingMethodChanged||isMemberPONumChanged || isLineQtyChanged ||isPickUpLocChanged|| isDropOffLocChanged||isLineRateChanged){
        icFilters.push(new nlobjSearchFilter('custbody_associated_salesorder', null, 'is', idSalesOrder));
        var icSearchResults = nlapiSearchRecord('transaction', 'customsearch_has_issue_search', icFilters);
        if (icSearchResults != null && icSearchResults.length != 0) {
            for (var i = 0; i < icSearchResults.length; i++) {
                var tranId = icSearchResults[i].getId();
                var tranType = icSearchResults[i].getValue('type');
              	var vendor = icSearchResults[i].getValue('entity');
                nlapiLogExecution('DEBUG', 'Type in find related' + tranType + ' id ' + tranId);
                if ((tranType == 'PurchOrd') || (tranType == 'CustInvc')) {
                    var relatedRecord = {
                        tranid: tranId,
                        type: tranType,
                      	vendor:vendor
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
        var transLineChange = '';
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
        var transLineChanges = [];
        if(isLineQtyChanged){
          var splitString = isLineQtyChanged.split(',');
          var changeList = [];
          nlapiLogExecution('DEBUG','isLineQtyChanged','splitString= ' + splitString+" length="+splitString.length);
          for(var i=0;i<splitString.length-1;i++){
            var splitDetails = splitString[i].split(':');
            nlapiLogExecution('DEBUG','isLineQtyChanged details','splitDetails= ' + splitDetails+" length="+splitDetails.length);
            var changeLineDetails={
              magRef:splitDetails[0],
              oldQty:splitDetails[1],
              newQty:splitDetails[2],
              item:splitDetails[3]
            };
            changeList[i]=changeLineDetails;
          }
            for (var i = 0; i < arrRelatedRecords.length; i++) {
                if (arrRelatedRecords[i].type == 'PurchOrd') {
                  transLineChange = '';
                  nlapiLogExecution('DEBUG','before PO load','before load');
                  var poRec = nlapiLoadRecord('purchaseorder',arrRelatedRecords[i].tranid);
                  nlapiLogExecution('DEBUG','after PO load',poRec);
                  for(var j=0;j<changeList.length;j++){
                    var lineNum= poRec.findLineItemValue('item','custcol_mag_ref_no',changeList[j].magRef);
                   nlapiLogExecution('DEBUG','lineNum=',lineNum);
                  if(lineNum!=-1){
                    transLineChange = transLineChange + "<br>" + 'Quantity of item ' +changeList[j].item +' changed from '+changeList[j].oldQty+' to '+changeList[j].newQty+"</br>";
                  }
                  }
                   // nlapiSubmitField('purchaseorder', arrRelatedRecords[i].tranid, 'custbody_trans_line_changes', transLineChange, false);
                   poRec.setFieldValue('custbody_trans_line_changes',transLineChange);
                   nlapiSubmitRecord(poRec);
               }
              }
         sendPOModEmail = true;
        }
        if(isPickUpLocChanged){
          var splitString = isPickUpLocChanged.split(',');
          var changeList = [];
          nlapiLogExecution('DEBUG','isPickUpLocChanged','splitString= ' + splitString+" length="+splitString.length);
          for(var i=0;i<splitString.length-1;i++){
            var splitDetails = splitString[i].split(':');
            nlapiLogExecution('DEBUG','isPickUpLocChanged details','splitDetails= ' + splitDetails+" length="+splitDetails.length);
            var changeLineDetails={
              magRef:splitDetails[0],
              oldPickUpLoc:splitDetails[1],
              newPickUpLoc:splitDetails[2],
              item:splitDetails[3]
            };
            changeList[i]=changeLineDetails;
          }
            for (var i = 0; i < arrRelatedRecords.length; i++) {
                if (arrRelatedRecords[i].type == 'PurchOrd') {
                  nlapiLogExecution('DEBUG','before PO load','before load');
                  var poRec = nlapiLoadRecord('purchaseorder',arrRelatedRecords[i].tranid);
                  nlapiLogExecution('DEBUG','after PO load',poRec);
                  if(transLineChange!=null && transLineChange!=''){
                    transLineChange = poRec.getFieldValue('custbody_trans_line_changes');
                  }
                  var change = false;
                  for(var j=0;j<changeList.length;j++){
                    var lineNum= poRec.findLineItemValue('item','custcol_mag_ref_no',changeList[j].magRef);
                   nlapiLogExecution('DEBUG','lineNum=',lineNum);
                  if(lineNum!=-1){
                    change = true; poRec.setLineItemValue('item','custcol_pickup_location',lineNum,changeList[j].newPickUpLoc);
                    
                  }
                  }
                   // nlapiSubmitField('purchaseorder', arrRelatedRecords[i].tranid, 'custbody_trans_line_changes', transLineChange, false);
               if(change){
                 transLineChange = transLineChange + "<br>" + 'Pick up Location is changed. Please check PO Pdf for details.'+"</br>";
                  poRec.setFieldValue('custbody_trans_line_changes',transLineChange);
               }
                   nlapiSubmitRecord(poRec);
               }
              }
         sendPOModEmail = true;
        }
        if(isDropOffLocChanged){
          var splitString = isDropOffLocChanged.split(',');
          var changeList = [];
          nlapiLogExecution('DEBUG','isDropOffLocChanged','splitString= ' + splitString+" length="+splitString.length);
          for(var i=0;i<splitString.length-1;i++){
            var splitDetails = splitString[i].split(':');
            nlapiLogExecution('DEBUG','isDropOffLocChanged details','splitDetails= ' + splitDetails+" length="+splitDetails.length);
            var changeLineDetails={
              magRef:splitDetails[0],
              oldDropOffLoc:splitDetails[1],
              newDropOffLoc:splitDetails[2],
              item:splitDetails[3],
              newDropOffMember:splitDetails[4]
            };
            changeList[i]=changeLineDetails;
          }
            for (var i = 0; i < arrRelatedRecords.length; i++) {
                if (arrRelatedRecords[i].type == 'PurchOrd') {
                 // transLineChange = '';
                  nlapiLogExecution('DEBUG','before PO load','before load');
                  var poRec = nlapiLoadRecord('purchaseorder',arrRelatedRecords[i].tranid);
                  nlapiLogExecution('DEBUG','after PO load',poRec);
                  if(transLineChange!=null && transLineChange!=''){
                  	transLineChange = poRec.getFieldValue('custbody_trans_line_changes');
                  }                    
                  var change = false;
                  for(var j=0;j<changeList.length;j++){
                    var lineNum= poRec.findLineItemValue('item','custcol_mag_ref_no',changeList[j].magRef);
                    
                   nlapiLogExecution('DEBUG','lineNum=',lineNum);
                  if(lineNum!=-1){
                 	poRec.setLineItemValue('item','custcol_drop_off_location',lineNum,changeList[j].newDropOffLoc);
                 	poRec.setLineItemValue('item','customer',lineNum,changeList[j].newDropOffMember);
                    change = true;
                  }
                    
                  }
                   // nlapiSubmitField('purchaseorder', arrRelatedRecords[i].tranid, 'custbody_trans_line_changes', transLineChange, false);
                   if(change){
                    transLineChange = transLineChange + "<br>" + 'Drop Off Location is changed. Please check PO Pdf for details'+"</br>";
                    poRec.setFieldValue('custbody_trans_line_changes',transLineChange);
                    }
                  nlapiSubmitRecord(poRec);
               }
              }
         sendPOModEmail = true;
        }
        if(isLineRateChanged){
          var splitString = isLineRateChanged.split(',');
          var changeList = [];
          nlapiLogExecution('DEBUG','isLineRateChanged','splitString= ' + splitString+" length="+splitString.length);
          for(var i=0;i<splitString.length-1;i++){
            var splitDetails = splitString[i].split(':');
            nlapiLogExecution('DEBUG','isDropOffLocChanged details','splitDetails= ' + splitDetails+" length="+splitDetails.length);
            var changeLineDetails={
              magRef:splitDetails[0],
              oldRate:splitDetails[1],
              newRate:splitDetails[2],
              item:splitDetails[3]
            };
            changeList[i]=changeLineDetails;
          }
            for (var i = 0; i < arrRelatedRecords.length; i++) {
                if (arrRelatedRecords[i].type == 'CustInvc') {
                  nlapiLogExecution('DEBUG','before Inv load','before load');
                  var invRec = nlapiLoadRecord('invoice',arrRelatedRecords[i].tranid);
                  nlapiLogExecution('DEBUG','after PO load',invRec.getFieldValue('status'));
                  if(invRec.getFieldValue('status')=='Pending Approval'){
                  	for(var j=0;j<changeList.length;j++){
                    	var lineNum= invRec.findLineItemValue('item','custcol_mag_ref_no',changeList[j].magRef);
                    
                   	nlapiLogExecution('DEBUG','lineNum=',lineNum);
                  	if(lineNum!=-1){
                 				invRec.setLineItemValue('item','rate',lineNum,changeList[j].newRate);
                   }
                    
                  }
                   nlapiSubmitRecord(invRec);
                  }else{
                    nlapiLogExecution('DEBUG','Invoice status not pending approval','create task and email A/R');
                    var today         = new Date();
                     
                    for(var k=0;k<5;k++){
                    today.setDate(today.getDate() + 1);
                	var dayOfWeek   = today.getDay();
                      var validDate = false;
                    while (!validDate)
		     		{
               			if(dayOfWeek == 6){
                 			today.setDate(today.getDate() + 2);
                        }
                       if(dayOfWeek == 0){
                 			today.setDate(today.getDate() + 1);
                       }
                      	var filters = new Array();
              			filters[0] = new nlobjSearchFilter( 'custrecord_holiday_date', null, 'on', nlapiDateToString(today)); // add in item type value
              			filters[1] = new nlobjSearchFilter( 'isinactive', null, 'is', 'F'); 

              			var searchResults = nlapiSearchRecord( 'customrecord_auction_holiday', null, filters);
              			if (searchResults != null)
		      			{
                 		today.setDate(today.getDate() + 1);
                		} else
              			{				
			    		validDate = true;
		 	  			}
                    }
                   }
                    var dueDate = nlapiDateToString(today);
                    nlapiLogExecution('DEBUG','due date',dueDate);
                    var taskRec = nlapiCreateRecord('task');
                    taskRec.setFieldValue('title','Accounts Receivable Analyst:Rate change in sales order after Invoice approval');
                    taskRec.setFieldValue('assigned', 289472);
                    taskRec.setFieldValue('owner',12852);
                    taskRec.setFieldText('priority','High');
                    taskRec.setFieldValue('transaction',arrRelatedRecords[i].tranid);
                    taskRec.setFieldValue('company',invRec.getFieldValue('entity'));
                    taskRec.setFieldValue('sendemail','T');
                    taskRec.setFieldValue('duedate',dueDate);
                    var count = nlapiSubmitRecord(taskRec);
                    nlapiLogExecution('DEBUG','created task',count);
                    nlapiLogExecution('DEBUG','sending email',' to A/R');
                   // nlapiSendEmail(12838, 'tshanmugam@feedingamerica.org', 'Rate changed in sales order after Invoice approval', 'Please check with supply chain on the rate change', null, null, { 'transaction': arrRelatedRecords[i].tranid },  null, true);
                  }
               }
              }
       }
        if(isLineItemAdded){
          nlapiLogExecution('DEBUG','isLineItemAdded','= ' + isLineItemAdded);
          var newLineItemsList = JSON.parse(isLineItemAdded);
          /*for(var i=0;i<newLineItemsList.length;i++){
            nlapiLogExecution('DEBUG','isLineItemAdded:item','= ' + newLineItemsList[i].item);
            nlapiLogExecution('DEBUG','isLineItemAdded:lineNum','= ' + newLineItemsList[i].lineNum);
            nlapiLogExecution('DEBUG','isLineItemAdded:vendor','= ' + newLineItemsList[i].vendor);
          }*/
          for (var j = 0; j < arrRelatedRecords.length; j++) {
                if (arrRelatedRecords[j].type == 'PurchOrd') {
                  var vendor = arrRelatedRecords[j].vendor;
                  nlapiLogExecution('DEBUG','arrRelatedRecords:vendor','= ' + vendor);
                  for(var i=0;i<newLineItemsList.length;i++){
                    var newLineVendor = newLineItemsList[i].vendor;
                    nlapiLogExecution('DEBUG','isLineItemAdded:vendor','= ' + newLineItemsList[i].vendor);
                    if(vendor==newLineVendor){
                      nlapiLogExecution('DEBUG','vendor match','= ' + 'new line to be added to this PO');
                      var poRec = nlapiLoadRecord('purchaseorder',arrRelatedRecords[j].tranid);
                      if(transLineChange!=null && transLineChange!=''){
                      transLineChange = poRec.getFieldValue('custbody_trans_line_changes');
                      }
                      poRec.selectNewLineItem('item');
                      poRec.setCurrentLineItemValue('item','item',newLineItemsList[i].item);                  poRec.setCurrentLineItemValue('item','custcol_member_bank',newLineItemsList[i].customer);        poRec.setCurrentLineItemValue('item','custcol_pickup_location',newLineItemsList[i].pickupLoc);       poRec.setCurrentLineItemValue('item','custcol_drop_off_location',newLineItemsList[i].dropoffLoc);      poRec.setCurrentLineItemValue('item','quantity',newLineItemsList[i].quantity);          poRec.setCurrentLineItemValue('item','units',newLineItemsList[i].units);  poRec.setCurrentLineItemValue('item','rate',newLineItemsList[i].porate);  poRec.setCurrentLineItemValue('item','custcol_nbr_pallets',newLineItemsList[i].noPallets);   
 poRec.setCurrentLineItemValue('item','custcol_cases_per_pallet',newLineItemsList[i].qtyPerPallet);         poRec.setCurrentLineItemValue('item','custcol_admin_fee_vendor',newLineItemsList[i].adminFeeVendor);      poRec.setCurrentLineItemValue('item','custcol_item_gross_weight',newLineItemsList[i].itemGrossWt);     poRec.setCurrentLineItemValue('item','custcol_total_pounds',newLineItemsList[i].totalPounds);       poRec.setCurrentLineItemValue('item','custcol_total_weight',newLineItemsList[i].totalGrossWt);       poRec.setCurrentLineItemValue('item','custcolfa_vendor_item_name',newLineItemsList[i].vendorItemName);   poRec.setCurrentLineItemValue('item','custcol_vendor_item_no',newLineItemsList[i].vendorItemNumber);
                      poRec.commitLineItem('item');
                      transLineChange = transLineChange + "<br>" + 'New item '+newLineItemsList[i].vendorItemName+'-'+newLineItemsList[i].vendorItemNumber+' added to the PO'+"</br>";
                      		       poRec.setFieldValue('custbody_trans_line_changes',transLineChange);
                      var id = nlapiSubmitRecord(poRec, true);
                      sendPOModEmail = true;
                    }
                  }
                }
          }
        }
        if(sendPOModEmail){
          nlapiLogExecution('DEBUG','transaction changes','= ' + tranChanges);
          for (var i = 0; i < arrRelatedRecords.length; i++) {
                if (arrRelatedRecords[i].type == 'PurchOrd') {
                  var orderType = nlapiLookupField('purchaseorder',arrRelatedRecords[i].tranid,'custbody_order_type');
                  var tranLineChange = nlapiLookupField('purchaseorder',arrRelatedRecords[i].tranid,'custbody_trans_line_changes');
                  var blankText = '';
                  nlapiSubmitField('purchaseorder', arrRelatedRecords[i].tranid, 'custbody_transaction_changes', blankText, false);
                  if(tranLineChange!='' && tranLineChange!=null){
                  	tranChanges = tranChanges + tranLineChange;
                  }
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