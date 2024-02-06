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

function multipeInvoices(type,form)
{
    try
    {
        //if(type == "edit" || type == "create")
        if(type == "create")
        {
            var idInvoice = nlapiGetRecordId();
            nlapiLogExecution('debug', 'idInvoice', idInvoice);

           var param = 
            {
                'custscript_idinvoice' : idInvoice
            }
            
            nlapiScheduleScript('customscript_sch_create_multipleinvoices', 'customdeploy_sch_create_multipleinvoices', param);
        }
    }catch(e)
    {
        nlapiLogExecution('ERROR', 'error', e);
    }
}