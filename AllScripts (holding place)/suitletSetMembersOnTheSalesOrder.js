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
 * 1.00       22-07-2016     dcarrion         
 *
 */

function setMembersInList(request, response)
{ 
	nlapiLogExecution('DEBUG', 'Suitlet paso');
	var recordId = request.getParameter('custparam_IdRecord');
	var salesOrder = nlapiLoadRecord('salesorder', recordId);
	nlapiLogExecution('DEBUG', 'Sales ID', recordId);
	var headerCustomer = salesOrder.getFieldValue('entity');
	nlapiLogExecution('DEBUG', 'customer', headerCustomer);
	var countItems = salesOrder.getLineItemCount('item');
	nlapiLogExecution('DEBUG', 'countItems', countItems);

	for(var i=1; i <= countItems; i++)
	{
		salesOrder.setLineItemValue('item', 'custcol_bill_to_member',i, 'F');
		var memberBank = salesOrder.getLineItemValue('item', 'custcol_member_bank', i);
		nlapiLogExecution('DEBUG', 'Member bank', memberBank);
		salesOrder.setLineItemValue('item', 'custcol_member_bank', i, headerCustomer);
	}
	var salesOrderId = nlapiSubmitRecord(salesOrder, true, true);
}