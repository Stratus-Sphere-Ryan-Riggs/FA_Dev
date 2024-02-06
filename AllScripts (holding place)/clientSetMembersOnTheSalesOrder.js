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

function setMembersInList(idTransaction)
{
    try{
        nlapiLogExecution('DEBUG', 'Client paso');
        var context = nlapiGetContext();
        var environment = context.getEnvironment();
        var url = '';
        if(environment == 'SANDBOX'){
            url = 'https://system.sandbox.netsuite.com';
        }
        else if(environment == 'PRODUCTION'){
            url = 'https://system.netsuite.com';
        }                                             
        var urlResolve = nlapiResolveURL('SUITELET', 'customscript_suit_members_sales_order', 'customdeploy_suit_members_sales_order');
        url = url +""+ urlResolve;
        url += "&custparam_IdRecord=" + idTransaction;
        nlapiRequestURL(url);
        return true;                       
    }
    catch(e){
        nlapiLogExecution('ERROR', 'error', e);
    }
}