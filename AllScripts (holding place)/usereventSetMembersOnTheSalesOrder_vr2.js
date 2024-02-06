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
 * 10/05/2016 - Change the button name
 */

function setMembersInList(type,form)
{
    try
    {
        if(type == "edit" || type == "create" || type == "view")
        {
            var idTransaction = nlapiGetRecordId();

            var buttonScript = "";
            buttonScript += "var suiteletURL = nlapiResolveURL('SUITELET', 'customscript_suit_members_sales_order', 'customdeploy_suit_members_sales_order');";
            buttonScript += "suiteletURL += '&custparam_IdRecord=" + idTransaction + "' ;";
            buttonScript += "nlapiRequestURL(suiteletURL);"
            buttonScript +="window.location.reload();";
            form.addButton('custpage_invoicetomasterbill', 'Invoice Header Member', buttonScript);
            nlapiLogExecution('debug', 'end script');
            
            //form.setScript('customscript_client_members_sales_order');
            //form.addButton('custpage_invoicetomasterbill', 'Invoice to Master Bill', buttonScript);
        }
    }catch(e)
    {
        nlapiLogExecution('ERROR', 'error', e);
    }
}