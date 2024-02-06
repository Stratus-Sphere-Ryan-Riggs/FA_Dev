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
* 2.00       01-11-2017      Peter August     Resolved issue with doubling transport feeds
*/

function createInvoices() {
    var adjustedAmt;
    try {
        var totalQuantity = parseInt(0);
        var totalMemberHeaderQuantity = parseInt(0);
        var memberQuantity = parseInt(0);
        var deleteLines = [];
        var groceryOrProduce = false;

        var context = nlapiGetContext();
        //Product Channels references
        var grocery = context.getSetting('SCRIPT', 'custscript_grocery_productchannel');
        var produce = context.getSetting('SCRIPT', 'custscript_produce_productchannel');
        var donation = context.getSetting('SCRIPT', 'custscript_donation_productchannel');
      	var other = context.getSetting('SCRIPT','custscript_prod_channel_other');
        var transportation = context.getSetting('SCRIPT', 'custscript_transportation_productchannel');
        var admin = context.getSetting('SCRIPT', 'custscript_admin_productchannel');
        var accItem = context.getSetting('SCRIPT', 'custscript_acc_item');
        var memberCount = context.getSetting('SCRIPT', 'custscript_member_count');
        var billHeaderMember = context.getSetting('SCRIPT', 'custscript_bill_header_member');
        var accMember = '' ;
        var accRec = {
        customer:'0',
        accAmt:0.00
      }

        var secondaryInvoiceItem = context.getSetting('SCRIPT', 'custscript_seconday_invoice_item');
        nlapiLogExecution('DEBUG', 'idInvoice', secondaryInvoiceItem);
        var secondaryInvoiceItem_prod = context.getSetting('SCRIPT', 'custscriptcustscript_seconday_inv_produc');
        nlapiLogExecution('DEBUG', 'idInvoice', secondaryInvoiceItem_prod);
        var secondaryInvoiceItem_don = context.getSetting('SCRIPT', 'custscript_seconday_inv_donation');

        var idInvoice = context.getSetting('SCRIPT', 'custscript_idinvoice');
      var transCost = context.getSetting('SCRIPT', 'custscript_transport_cost');
      var transFeeCost = context.getSetting('SCRIPT', 'custscript_trans_fee_cost');
      var produceFrtSub = context.getSetting('SCRIPT', 'custscript_produce_freight_amt');
        var produceVenFrtCost = context.getSetting('SCRIPT', 'custscript_vendor_frt_cost');
        var groceryDiscountItem = context.getSetting('SCRIPT', 'custscript_grocerydiscitem');
        nlapiLogExecution('DEBUG', 'idInvoice=', idInvoice+' transCost='+transCost+' transFeeCost='+transFeeCost+' produceFrtSub='+produceFrtSub);
        var invoice = nlapiLoadRecord('invoice', idInvoice);
        var customer = invoice.getFieldValue('entity');
        nlapiLogExecution('DEBUG', 'customer', customer);
        var salesorderMaster = invoice.getFieldValue('createdfrom');
        var soMaster = nlapiLoadRecord('salesorder', salesorderMaster);
        nlapiLogExecution('DEBUG', 'salesorder', salesorderMaster);
        //Added by Thilaga
        var orderType = invoice.getFieldValue('custbody_order_type');

        invoice.setFieldValue('custbody_associated_salesorder', salesorderMaster);
        invoice.setFieldValue('memo', 'Master Invoice');

        var countItems = invoice.getLineItemCount('item');
        nlapiLogExecution('DEBUG', 'countItems', countItems);

        for (var i = 1; i <= countItems; i++) {
            var productChannel = invoice.getLineItemValue('item', 'custcol_product_channel', i);

            /*if ((productChannel == grocery) || (productChannel == produce)) {
                groceryOrProduce = true;
            }*/
          if(invoice.getLineItemValue('item', 'item', i)==accItem){
              accMember = invoice.getLineItemValue('item', 'custcol_member_bank', i);
          }
        }
	nlapiLogExecution('DEBUG', 'Accessorial member=' ,accMember);
        /*if (!groceryOrProduce) {
            return;
        }*/

        //if(transpOrAdmin){
        for (var i = 1; i <= countItems; i++) {
            var billToMember = invoice.getLineItemValue('item', 'custcol_bill_to_member', i);
            var productChannel = invoice.getLineItemValue('item', 'custcol_product_channel', i);
          var item = invoice.getLineItemValue('item', 'item', i);
            nlapiLogExecution('DEBUG', 'productChannel: ' + i, productChannel);
            if ((productChannel == grocery) || (productChannel == produce) || (productChannel == donation)) //Grocery(id=1)/Produce(id=2)
            {
                var itemCustomer = invoice.getLineItemValue('item', 'custcol_member_bank', i);
                nlapiLogExecution('DEBUG', 'itemCustomer: ' + i, itemCustomer);

                //Update totalQuantity
                var lineQuantity = invoice.getLineItemValue('item', 'quantity', i);
              var lineOrgQuantity = invoice.getLineItemValue('item','custcol_original_order_qty',i);
                nlapiLogExecution('DEBUG', 'lineQuantity(customer) ', lineQuantity+' lineOrgQuantity:'+lineOrgQuantity);
                totalQuantity = totalQuantity + parseInt(lineOrgQuantity);
                nlapiLogExecution('DEBUG', 'totalQuantity(customer) ', totalQuantity);

                if (customer == itemCustomer) {
                    //Update totalMemberHeaderQuantity
                    totalMemberHeaderQuantity = totalMemberHeaderQuantity + parseInt(lineOrgQuantity);
                }

                if (isEmpty(itemCustomer)) {
                    //Update totalMemberHeaderQuantity
                    totalMemberHeaderQuantity = totalMemberHeaderQuantity + parseInt(lineOrgQuantity);
                }
                // 20170111
                if (!isEmpty(itemCustomer) && (billToMember == 'F') && customer != itemCustomer) {
                    //Update totalMemberHeaderQuantity
                    totalMemberHeaderQuantity = totalMemberHeaderQuantity + parseInt(lineOrgQuantity);
                }

                if ((customer != itemCustomer) && (!isEmpty(itemCustomer)) && (billToMember == 'T')) {
                    //Determinate if there is already a secondary member invoice for itemCustomer
                    var filters = [];
                    filters.push(new nlobjSearchFilter('internalid', 'customer', 'is', itemCustomer));
                    filters.push(new nlobjSearchFilter('custbody_primary_invoice', null, 'is', idInvoice));

                    var secondaryMemberInvoice = nlapiSearchRecord('invoice', 'customsearch_testinvoice', filters);
                    nlapiLogExecution('DEBUG', 'Secondary member invoice', secondaryMemberInvoice);

                    if (secondaryMemberInvoice != null) //if a secondary member invoice is found
                    {
                        nlapiLogExecution('DEBUG', 'A secondary member invoice is found', secondaryMemberInvoice[0].getValue('internalid'));
                        var memberInvoice = nlapiLoadRecord('invoice', secondaryMemberInvoice[0].getValue('internalid'));
                        var lineItem = invoice.getLineItemValue('item', 'item', i);
                        nlapiLogExecution('DEBUG', 'lineItem ' + i, lineItem);
                        var lineRate = invoice.getLineItemValue('item', 'custcol_adjusted_amount', i);
                        nlapiLogExecution('DEBUG', 'lineRate ' + i, lineRate);
                        var lineAmount = invoice.getLineItemValue('item', 'amount', i);
                        var lineDescription = invoice.getLineItemValue('item', 'description', i);
                      var dropoffaddress = invoice.getLineItemValue('item', 'custcol_dropoff_address_1', i);
                      var dropoffcity = invoice.getLineItemValue('item', 'custcol_dropoff_city', i);
                      var dropoffstate=invoice.getLineItemValue('item', 'custcol_dropoff_state', i);
                      var dropoffzip = invoice.getLineItemValue('item', 'custcol_dropoff_zip_code', i);
                      var magRef = invoice.getLineItemValue('item', 'custcol_mag_ref_no', i);
                      var adjInvRate = parseFloat(invoice.getLineItemValue('item', 'custcol_item_transport_cost', i));
                      var adjInvAmount = adjInvRate * parseFloat(lineQuantity);
                        //added by Thilaga
                        memberInvoice.setFieldValue('custbody_order_type', orderType);
                        memberInvoice.selectNewLineItem('item');
                        if (productChannel == grocery) {
                            memberInvoice.setCurrentLineItemValue('item', 'item', secondaryInvoiceItem);
                          memberInvoice.setCurrentLineItemValue('item', 'custcol_adj_invoice_rate', adjInvRate);
                        }
                        else if (productChannel == produce) {
                            memberInvoice.setCurrentLineItemValue('item', 'item', secondaryInvoiceItem_prod);
                        }
                        else if (productChannel == donation) {
                            memberInvoice.setCurrentLineItemValue('item', 'item', secondaryInvoiceItem_don);
                        }
                        if(productChannel != donation){
                      	memberInvoice.setCurrentLineItemValue('item', 'rate', lineRate);
                        }
                        else if (productChannel == donation) {
                      	memberInvoice.setCurrentLineItemValue('item', 'rate', '0');
                        }
                        if(lineItem==accItem && itemCustomer!=accMember){
                          continue;
                          nlapiLogExecution('DEBUG', 'Line item + Line member=' ,lineItem+" "+itemCustomer);
                          memberInvoice.setCurrentLineItemValue('item', 'rate', '0.00');
                        }

                        memberInvoice.setCurrentLineItemValue('item', 'quantity', lineQuantity);
                     //   memberInvoice.setCurrentLineItemValue('item', 'amount', parseFloat(lineQuantity*lineRate));
                        memberInvoice.setCurrentLineItemValue('item', 'description', lineDescription);
                        memberInvoice.setCurrentLineItemValue('item', 'mandatorytaxcode', 'T');
                        memberInvoice.setCurrentLineItemValue('item', 'custcol_product_channel', productChannel);
                        memberInvoice.setCurrentLineItemValue('item', 'custcol_member_bank', itemCustomer);
                        memberInvoice.setCurrentLineItemValue('item', 'custcol_secondary_invoice_item', lineItem);
                       memberInvoice.setCurrentLineItemValue('item', 'custcol_dropoff_address_1', dropoffaddress);
                         memberInvoice.setCurrentLineItemValue('item', 'custcol_dropoff_city', dropoffcity);
                         memberInvoice.setCurrentLineItemValue('item', 'custcol_dropoff_state', dropoffstate);
                         memberInvoice.setCurrentLineItemValue('item', 'custcol_dropoff_zip_code', dropoffzip);
                      memberInvoice.setCurrentLineItemValue('item', 'custcol_mag_ref_no', magRef);
                      memberInvoice.setCurrentLineItemValue('item', 'custcol_adj_invoice_amount', adjInvAmount);
                        memberInvoice.commitLineItem('item');
                        try {
                            var memberInvoiceID = nlapiSubmitRecord(memberInvoice, true, true);
                        }
                        catch (e) {
                            nlapiLogExecution('DEBUG', 'Member Invoice', 'Could not be created ' + e);
                        }

                        //Remove the line from the current invoice
                        //deleteLines.push(i);
                        invoice.setLineItemValue('item', 'rate', i, 0);
                        invoice.setLineItemValue('item', 'amount', i, 0);
                    }
                    else if (secondaryMemberInvoice == null) //if no secondary member invoice is found
                    {
                        nlapiLogExecution('DEBUG', 'No secondary member invoice is found');
                        var secondaryInvoice = nlapiCreateRecord('invoice');
                        nlapiLogExecution('DEBUG', 'secondaryInvoice ' + i, secondaryInvoice);
                        //Get field values
                        var date = invoice.getFieldValue('trandate');
                        nlapiLogExecution('DEBUG', 'date ' + i, date);
                        var enddate = invoice.getFieldValue('duedate');
                        nlapiLogExecution('DEBUG', 'duedate ' + i, enddate);
                        var location = invoice.getFieldValue('location');
                        nlapiLogExecution('DEBUG', 'location ' + i, location);
                        var program = invoice.getFieldValue('department');
                        nlapiLogExecution('DEBUG', 'department ' + i, program);
                      //Added for ticket #6285 by Thilaga
                      	var project = invoice.getFieldValue('custbody_cseg_projects_cseg');
                      nlapiLogExecution('DEBUG', 'department ' + i, project);
                        var originalClass = invoice.getFieldValue('class');
                        nlapiLogExecution('DEBUG', 'class ' + i, originalClass);
                        var lineItem = invoice.getLineItemValue('item', 'item', i);
                        nlapiLogExecution('DEBUG', 'lineItem ' + i, lineItem);
                      if(productChannel != donation) {
                        var lineRate = invoice.getLineItemValue('item', 'custcol_adjusted_amount', i);
                      }
                      else if(productChannel == donation) {
                        var lineRate = '0';
                      }
                        nlapiLogExecution('DEBUG', 'lineRate ' + i, lineRate);
                        var lineAmount = invoice.getLineItemValue('item', 'amount', i);
                        var lineDescription = invoice.getLineItemValue('item', 'description', i);
                      var dropoffaddress = invoice.getLineItemValue('item', 'custcol_dropoff_address_1', i);
                      var dropoffcity = invoice.getLineItemValue('item', 'custcol_dropoff_city', i);
                      var dropoffstate=invoice.getLineItemValue('item', 'custcol_dropoff_state', i);
                      var dropoffzip = invoice.getLineItemValue('item', 'custcol_dropoff_zip_code', i);
                      var magRef = invoice.getLineItemValue('item', 'custcol_mag_ref_no', i);
					var adjInvRate = parseFloat(invoice.getLineItemValue('item', 'custcol_item_transport_cost', i));
                      var adjInvAmount = adjInvRate * parseFloat(lineQuantity);
                        //Set SecondaryInvoice values
                        secondaryInvoice.setFieldValue('entity', itemCustomer);
                        secondaryInvoice.setFieldValue('trandate', date);
                        secondaryInvoice.setFieldValue('duedate', enddate);
                        secondaryInvoice.setFieldValue('department', program);
                      //Added for ticket #6382
                      secondaryInvoice.setFieldValue('otherrefnum',	invoice.getFieldValue('otherrefnum'));
                      //Added for ticket #6513
                      secondaryInvoice.setFieldValue('otherrefnum',	invoice.getFieldValue('otherrefnum'));
                      secondaryInvoice.setFieldValue('custbody_cseg_projects_cseg', project);
                        secondaryInvoice.setFieldValue('location', location);
                        secondaryInvoice.setFieldValue('class', originalClass);
                        secondaryInvoice.setFieldValue('custbody_associated_salesorder', salesorderMaster);
                        secondaryInvoice.setFieldValue('custbody_primary_invoice', idInvoice);
                        //added by Thilaga
                        secondaryInvoice.setFieldValue('custbody_order_type', orderType);
                      if(productChannel != other){
                          secondaryInvoice.selectNewLineItem('item');

                        if (productChannel == grocery) {
                            secondaryInvoice.setCurrentLineItemValue('item', 'item', secondaryInvoiceItem);
                          secondaryInvoice.setCurrentLineItemValue('item', 'custcol_adj_invoice_rate', adjInvRate);
                        }
                        else if (productChannel == produce) {
                            secondaryInvoice.setCurrentLineItemValue('item', 'item', secondaryInvoiceItem_prod);
                        }
                        else if (productChannel == donation) {
                            secondaryInvoice.setCurrentLineItemValue('item', 'item', secondaryInvoiceItem_don);
                          }

                        secondaryInvoice.setCurrentLineItemValue('item', 'rate', lineRate);
                        if(lineItem==accItem && itemCustomer!=accMember){
                          continue;
                          secondaryInvoice.setCurrentLineItemValue('item', 'rate', '0.00');
                          }
                        secondaryInvoice.setCurrentLineItemValue('item', 'quantity', lineQuantity);
                       // secondaryInvoice.setCurrentLineItemValue('item', 'amount', lineAmount);
                        secondaryInvoice.setCurrentLineItemValue('item', 'mandatorytaxcode', 'T');
                        secondaryInvoice.setCurrentLineItemValue('item', 'custcol_product_channel', productChannel);
                        secondaryInvoice.setCurrentLineItemValue('item', 'custcol_member_bank', itemCustomer);
                        secondaryInvoice.setCurrentLineItemValue('item', 'description', lineDescription);
                        secondaryInvoice.setCurrentLineItemValue('item', 'custcol_secondary_invoice_item', lineItem);
                         secondaryInvoice.setCurrentLineItemValue('item', 'custcol_dropoff_address_1', dropoffaddress);
                         secondaryInvoice.setCurrentLineItemValue('item', 'custcol_dropoff_city', dropoffcity);
                         secondaryInvoice.setCurrentLineItemValue('item', 'custcol_dropoff_state', dropoffstate);
                         secondaryInvoice.setCurrentLineItemValue('item', 'custcol_dropoff_zip_code', dropoffzip);
                         secondaryInvoice.setCurrentLineItemValue('item', 'custcol_mag_ref_no', magRef);
                        secondaryInvoice.setCurrentLineItemValue('item', 'custcol_adj_invoice_amount', adjInvAmount);
                         secondaryInvoice.commitLineItem('item');
                      }
                        try {
                            var secondaryInvoiceID = nlapiSubmitRecord(secondaryInvoice, true, true);
                        }
                        catch (e) {
                            nlapiLogExecution('ERROR', 'Secondary Invoice', 'Could not be created ' + e);
                        }
                        //Remove the line from the current invoice
                        //deleteLines.push(i);
                        invoice.setLineItemValue('item', 'rate', i, 0);
                        invoice.setLineItemValue('item', 'amount', i, 0);
                    }
                }
            }
        }

        for (var i = 1; i <= countItems; i++) {
            	var productChannel = invoice.getLineItemValue('item', 'custcol_product_channel', i);
            var lineItem = invoice.getLineItemValue('item', 'item', i);
                var lineItemType = invoice.getLineItemValue('item', 'itemtype', i);
                //var isFlatOrCustSubsidy = getSubsidyType(soMaster, lineItem);

            if ((productChannel == transportation) || (productChannel == admin) || (lineItemType == 'Discount')) {
                var itemCustomer = invoice.getLineItemValue('item', 'custcol_member_bank', i);
                nlapiLogExecution('DEBUG', 'itemCustomer: ' + i, itemCustomer);

                //var lineItem = invoice.getLineItemValue('item', 'item', i);
                //nlapiLogExecution('DEBUG', 'lineItem ' + i, lineItem);
              if((lineItem ==  accItem) && (itemCustomer==customer)){
                nlapiLogExecution('DEBUG', 'lineItem is accItem and header/line customer is same' + i, lineItem);
                continue;
                }
                if (lineItem === '10629' && itemCustomer === customer) {
                    continue;
                }
                var lineAmount = invoice.getLineItemValue('item', 'amount', i);
                nlapiLogExecution('DEBUG', 'amount ' + i, lineAmount);
                var lineRate = invoice.getLineItemValue('item', 'rate', i);
                nlapiLogExecution('DEBUG', 'lineRate ' + i, lineRate);
                var lineQuantity = invoice.getLineItemValue('item', 'quantity', i);
                nlapiLogExecution('DEBUG', 'quantity ' + i, lineQuantity);
                var lineDescription = invoice.getLineItemValue('item', 'description', i);
                var lineFund = invoice.getLineItemValue('item', 'location', i);
                var lineProjectCode = invoice.getLineItemValue('item', 'custcol_cseg_projects_cseg', i);

                var filters = [];
                filters.push(new nlobjSearchFilter('custbody_primary_invoice', null, 'is', idInvoice));
                var secondaryMemberInvoices = nlapiSearchRecord('invoice', 'customsearch_testinvoice', filters);

                for (var j = 0; secondaryMemberInvoices != null && j < secondaryMemberInvoices.length; j++) {
                    var totalMemberQuantity = 0;
                    var membersContribution = 0;

                    nlapiLogExecution('DEBUG', 'SecondaryInvoiceID', secondaryMemberInvoices[j].getId());
                    var secondaryInvoice = nlapiLoadRecord('invoice', secondaryMemberInvoices[j].getId());

                    var count = secondaryInvoice.getLineItemCount('item');

                    for (var k = 1; k <= count; k++) {
                        var itemProductChannel = secondaryInvoice.getLineItemValue('item', 'custcol_product_channel', k);
                        nlapiLogExecution('DEBUG', 'itemProductChannel', itemProductChannel);

                        if (itemProductChannel == grocery || itemProductChannel == produce) {
                            var itemQuantity = secondaryInvoice.getLineItemValue('item', 'custcol_original_order_qty', k);
                            nlapiLogExecution('DEBUG', 'itemQuantity' + k, itemQuantity);
                            totalMemberQuantity = totalMemberQuantity + parseInt(itemQuantity);
                        }
                    }
                    nlapiLogExecution('DEBUG', 'totalMemberQuantity', totalMemberQuantity);
                    nlapiLogExecution('DEBUG', 'totalQuantity', totalQuantity);
                    membersContribution = totalMemberQuantity / totalQuantity;
                    nlapiLogExecution('DEBUG', 'membersContribution', membersContribution);
					if(lineItem=='4038'){
                    lineAmount = transCost;
                      nlapiLogExecution('DEBUG','lineAmount',lineAmount);
                  }
                  if(lineItem=='7646'){
                    lineAmount = transFeeCost;
                  }
                  if(lineItem=='4148'){
                    lineAmount = produceVenFrtCost;
                  }
                  if(lineItem=='8283'){
                    lineAmount = produceFrtSub*-1;
                    nlapiLogExecution('DEBUG','itemCustomer>>accRec.customer',itemCustomer+'>>'+accRec.customer);
                  }
                  //Added for Produce Freight Subsidy ticket #7304
                    nlapiLogExecution('DEBUG', 'orderType' , orderType);
                  if(orderType == '1' || orderType == '2') {
                    if(lineItemType != 'Discount') {
                        var proratedAmount = lineAmount * membersContribution;
                        nlapiLogExecution('DEBUG', 'proratedAmount | lineAmount | membersContribution', proratedAmount + ' | ' + lineAmount + ' | ' + membersContribution);
                    }
                    else {
                        if (lineItem === '10629') {
                            var proratedAmount = parseFloat(lineAmount);
                        } else if(transCost != 0) {
                            var proratedAmount = parseFloat((transCost * membersContribution) * (parseFloat(lineRate) / 100));
                      }
                      else if(produceVenFrtCost != 0) {
                            var proratedAmount = parseFloat((produceVenFrtCost * membersContribution) * (parseFloat(lineRate) / 100));
                      }
                      else {
                            var proratedAmount = parseFloat(0);
                      }
                    }
                  }
                  else if (orderType == '3' || orderType == '5' || orderType == '8') {
                    if(lineItem=='9151' || lineItemType=='Discount') {
                      if (billHeaderMember == 'T') {
                      var proratedAmount = parseFloat(lineAmount);
                      }
                      else {
                        var subsidyRate = getSubsidyType(soMaster, lineItem);
                        nlapiLogExecution('DEBUG', 'subsidyRate', subsidyRate);
                        if(subsidyRate.indexOf('%') > 0) {
                      	var proratedAmount = parseFloat((transCost/memberCount) * (parseFloat(subsidyRate)/100));
                        }
                        else {
                        var proratedAmount = parseFloat(parseFloat(subsidyRate)/memberCount);
                        }
                      nlapiLogExecution('DEBUG', 'proratedAmountep1', proratedAmount);
                      }
                    }
                    else{
                    nlapiLogExecution('DEBUG','memberCount',memberCount);
                    var proratedAmount = (lineAmount/memberCount);
                    }
                  }

                  if(lineItem=='8283' && secondaryInvoice.getFieldValue('entity')==accRec.customer){
                    proratedAmount = proratedAmount - parseFloat(accRec.accAmt);
                  }

                   nlapiLogExecution('DEBUG', 'produceFrtSub>>lineItem', produceFrtSub+'>>'+lineItem);
                  //added by Thilaga for ticket #5146
                  if(lineItem ==  accItem){
                    if(itemCustomer==secondaryInvoice.getFieldValue('entity')){
                	nlapiLogExecution('DEBUG', 'lineItem is accItem and header/line customer is same' + i, lineItem);
                	proratedAmount = new Number(invoice.getLineItemValue('item', 'custcol_adjusted_amount', i));
                    accRec.customer =   itemCustomer;
                    accRec.accAmt = proratedAmount;

              	  }else {
                    continue;
                    proratedAmount = lineAmount * new Number('0');
                  }
                    nlapiLogExecution('DEBUG', 'accRec' , JSON.stringify(accRec));
                 }


                  nlapiLogExecution('DEBUG', 'proratedAmount>>produceFrtSub', proratedAmount+'>>'+produceFrtSub);
                    secondaryInvoice.selectNewLineItem('item');
                    secondaryInvoice.setCurrentLineItemValue('item', 'item', lineItem);
                    secondaryInvoice.setCurrentLineItemValue('item', 'quantity', 1);
                    nlapiLogExecution('DEBUG', 'TEST LINE ITEM VALUE ' + i, lineItem);
                    nlapiLogExecution('DEBUG', 'Item Customer | Customer ' + i, itemCustomer + ' | ' + customer);
                        if (lineItem === '10629' && (itemCustomer === secondaryInvoice.getFieldValue('entity'))) {
                        nlapiLogExecution('DEBUG', 'lineRate', lineRate);
                            adjustedAmt = new Number(invoice.getLineItemValue('item', 'custcol_adjusted_amount', i));
                        secondaryInvoice.setCurrentLineItemValue('item', 'rate', adjustedAmt);
                        secondaryInvoice.setCurrentLineItemValue('item', 'amount', adjustedAmt);
                        } else {
                            secondaryInvoice.setCurrentLineItemValue('item', 'rate', proratedAmount.toFixed(2));
                            secondaryInvoice.setCurrentLineItemValue('item', 'amount', proratedAmount.toFixed(2));
                        }
                    secondaryInvoice.setCurrentLineItemValue('item', 'mandatorytaxcode', 'T');
                    secondaryInvoice.setCurrentLineItemValue('item', 'custcol_member_bank', itemCustomer);
                    secondaryInvoice.setCurrentLineItemValue('item', 'custcol_product_channel', productChannel);
                    //added by Elizabeth for devops task 11199
                    secondaryInvoice.setCurrentLineItemValue('item', 'department', program);
                    secondaryInvoice.setCurrentLineItemValue('item', 'description', lineDescription);
                    secondaryInvoice.setCurrentLineItemValue('item', 'custcol_secondary_invoice_item', lineItem);
                    //if(lineItemType == 'Discount') {
                      secondaryInvoice.setCurrentLineItemValue('item', 'location', lineFund);
                      secondaryInvoice.setCurrentLineItemValue('item', 'custcol_cseg_projects_cseg', lineProjectCode);
                    //}
                    if ((lineItem !== '10629' || (lineItem === '10629' && (itemCustomer === secondaryInvoice.getFieldValue('entity'))))) {
                        secondaryInvoice.commitLineItem('item');
                    }
                    try {
                        var secondaryInvoiceID = nlapiSubmitRecord(secondaryInvoice, true, true);
                    }
                    catch (e) {
                        nlapiLogExecution('ERROR', 'Secondary Invoice', 'Could not be created ' + e);
                    }
                }
            }
        }

      	 nlapiLogExecution('DEBUG', 'get into: ' , 'second loop to set prorated transport cost');
      /*  for (var i = 1; i <= countItems; i++) {
            var productChannel = invoice.getLineItemValue('item', 'custcol_product_channel', i);
            nlapiLogExecution('DEBUG', 'productChannel: ' + i, productChannel);
            if ((productChannel == transportation) || (productChannel == admin) ) //Transportation(id=8)/Admin Fee(id=6)
            {

                var lineItem = invoice.getLineItemValue('item', 'item', i);
                nlapiLogExecution('DEBUG', 'lineItem ' + i, lineItem);
               var itemCustomer = invoice.getLineItemValue('item', 'custcol_member_bank', i);
                var lineAmount = invoice.getLineItemValue('item', 'amount', i);
                nlapiLogExecution('DEBUG', 'amount ' + i, lineAmount);
                var lineQuantity = invoice.getLineItemValue('item', 'quantity', i);
                nlapiLogExecution('DEBUG', 'lineQuantity ' + i, lineQuantity);

                memberHeaderContribution = totalMemberHeaderQuantity / totalQuantity;
              if(lineItem == accItem){
                if(itemCustomer==customer){
                  memberHeaderContribution = new Number('1');
                }else{
                  memberHeaderContribution = new Number('0');
                }
              }
                nlapiLogExecution('DEBUG', 'membersContribution', memberHeaderContribution);

                var proratedAmount = lineAmount * memberHeaderContribution;
                nlapiLogExecution('DEBUG', 'proratedAmount', proratedAmount);

                invoice.setLineItemValue('item', 'amount', i, proratedAmount.toFixed(2));
                invoice.setLineItemValue('item', 'rate', i, proratedAmount.toFixed(2));
                invoice.setLineItemValue('item', 'quantity', i, lineQuantity);
            }
        }*/
        try {
          //	 var invID = nlapiSubmitRecord(invoice);
        }
        catch (e) {
            nlapiLogExecution('ERROR', 'e', e);

        }
       // Create rounding E&O for main and secondary invoice for grocery order type
       if(orderType==1){

         		var filters = [];
                filters.push(new nlobjSearchFilter('custbody_primary_invoice', null, 'is', idInvoice));

                var secondaryMemberInvoice = nlapiSearchRecord('invoice', 'customsearch_testinvoice', filters);
                nlapiLogExecution('DEBUG', 'Secondary member invoice', secondaryMemberInvoice);

                if (secondaryMemberInvoice != null) //if a secondary member invoice is found
                {
                    for (var j = 0; secondaryMemberInvoices != null && j < secondaryMemberInvoices.length; j++) {
                      var secInv = nlapiLoadRecord('invoice',secondaryMemberInvoices[j].getId());
                      setRoundEOLineItem(secInv);
                     }
                }
        // setRoundEOLineItem(invoice);
         }
    }
    catch (e) {
        nlapiLogExecution('ERROR', 'e', e);
    }
}

function isEmpty(value) {
    if (value == null)
        return true;
    if (value == undefined)
        return true;
    if (value == 'undefined')
        return true;
    if (value == '')
        return true;
    if (value == 'NaN')
        return true;
    if (value == NaN)
        return true;
    if (value == '')
        return true;
    if (isNaN(value))
        return true;
    return false;
}

function setRoundEOLineItem(invoice){
  try{
    	var roundingEO = nlapiGetContext().getSetting('SCRIPT', 'custscript_rounding_eando_item');
    	var grocery = nlapiGetContext().getSetting('SCRIPT', 'custscript_grocery_productchannel');
    	//var invoice = nlapiLoadRecord('invoice', invoiceID);
        var countItems = invoice.getLineItemCount('item');
        var adjInvAmount = parseFloat(0);
		for (var i = 1; i <= countItems; i++) {
        	 var productChannel = invoice.getLineItemValue('item', 		'custcol_product_channel', i);
        	 if (productChannel == grocery && (parseFloat(invoice.getLineItemValue('item', 'rate', i))>0)) {
                  var quantity = invoice.getLineItemValue('item', 'quantity', i);
                  var invRate = invoice.getLineItemValue('item', 'custcol_adj_invoice_rate', i);
            		adjInvAmount = adjInvAmount + parseFloat(quantity)*parseFloat(invRate);
          	 }
          	if(invoice.getLineItemValue('item','item', i) == '4045'){
              adjInvAmount = adjInvAmount + parseFloat(invoice.getLineItemValue('item','amount', i));
            }
		}
        invoice.setFieldValue('custbody_total_adj_inv_amount',adjInvAmount);
        var totalTransFees = parseFloat(invoice.getFieldValue('total'));
        var roundingEOAmt = adjInvAmount-totalTransFees;
    nlapiLogExecution('DEBUG','rounding E&O amount',roundingEOAmt+' totalTransFees='+totalTransFees+' adjInvAmount='+adjInvAmount);
        if(totalTransFees>0 && roundingEO!=0){
            var lineNum = invoice.findLineItemValue('item','item',roundingEO);
            nlapiLogExecution('DEBUG','rounding item line num',lineNum);
        	if(lineNum!='-1'){
         		var amt= new Number(invoice.getLineItemValue('item','rate',lineNum));
           		nlapiLogExecution('DEBUG','rounding item line current value and diff',amt+' '+roundingEOAmt);
          		if((parseFloat(roundingEOAmt))!=0.00){
            		nlapiLogExecution('DEBUG','inside rounding if',nlapiFormatCurrency(roundingEOAmt));
                   	invoice.setLineItemValue('item','rate',lineNum,nlapiFormatCurrency(roundingEOAmt));
            		invoice.commitLineItem('item');
          		}
            }else{
              nlapiLogExecution('DEBUG','inside rounding else',nlapiFormatCurrency(roundingEOAmt));
        		if((parseFloat(roundingEOAmt))!=0.00){
                  nlapiLogExecution('DEBUG','inside rounding else','add new line item'+roundingEO);
                 	invoice.selectNewLineItem('item');
        			invoice.setCurrentLineItemValue('item','item',roundingEO);
        			invoice.setCurrentLineItemValue('item','quantity','1');
        			invoice.setCurrentLineItemValue('item','rate',nlapiFormatCurrency(roundingEOAmt));
        			invoice.commitLineItem('item');
                 }
        	}
          var id = nlapiSubmitRecord(invoice, true);
          nlapiLogExecution('DEBUG','after record submit',id);
          }

        }
        catch(e){
        	nlapiLogExecution('ERROR', 'e', e);
        }
}

function getSubsidyType(soMaster, lineItem) {
  var promoCount = soMaster.getLineItemCount('promotions');
  nlapiLogExecution('DEBUG','promoCount',promoCount);
  var isFlatOrCustSubsidy = false;
  if(promoCount > 0) {
    var promoIds = [];
    for (var j = 1; j <= promoCount; j++) {
      var promo = soMaster.getLineItemValue('promotions', 'promocode', j);
      var promoApplied = soMaster.getLineItemValue('promotions','applicabilitystatus',j);
      var promoRate = soMaster.getLineItemValue('promotions','discountrate',j);
      var allCustomers = nlapiLookupField('promotioncode', promo, 'ispublic');
  	  nlapiLogExecution('DEBUG', 'promoRate', promoRate + ' ' + (promoRate.indexOf('%')));
      if(((promoApplied == 'APPLIED') && (promoRate.indexOf('%') < 0)) || ((promoApplied == 'APPLIED') && (allCustomers == 'F'))) {
      	promoIds.push(promo);
      }
    }
    nlapiLogExecution('DEBUG','promoIds',JSON.stringify(promoIds));
    promoIds.forEach(function(rec) {
      var promoItem = nlapiLookupField('promotioncode',rec,'discount');
    nlapiLogExecution('DEBUG','promoItem',promoItem + ' ' + lineItem);
      if(promoItem == lineItem) {
        isFlatOrCustSubsidy = true;
      }
      else {
        isFlatOrCustSubsidy = false;
      }
    });
  }
  return promoRate;
}
