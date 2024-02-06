nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
 * Copyright (c) 1998-2016 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 * 
 * This software is the confidential and proprietary information of NetSuite, Inc. ("Confidential Information").
 * You shall not disclose such Confidential Information and shall use it only in accordance with the terms of the license agreement
 * you entered into with NetSuite.
 */

/**
 * Module Description:
 * 
 * 
 * Version    Date				Author				Remarks
 * 1.00       14 Aug 2016     Sapnesh Premraj			Demo version

 * There are 3 files involved in this process, documented as follows:
 * Old name - > New name: 
 * setFundSuitelet.js -> KBS_setFunds_SL.js
 * FA_SS_Process_MonthEndRelease.js -> KBS_setFunds_SS.js
 * setFundSearch_CS.js -> KBS_setFunds_CS.js
 *
 */

function startOver()
{

	nlapiLogExecution('DEBUG','startOver','Starting over');
	console.log('DEBUG , startOver , Starting over');
	
	var url = nlapiResolveURL('SUITELET', 'customscript_fill_fund_details', 'customdeploy_fill_fund_details', null);
	window.onbeforeunload = null;
	window.location = url;
}
function refreshFundDetails(type, name)
{
	console.log('DEBUG , refreshFundDetails , I am triggered.  : '+type+', name: '+name);
      if(name == 'custpage_period') {
	nlapiLogExecution('DEBUG','refreshFundDetails','Starting function, type: '+type+', name: '+name);
	console.log('DEBUG , refreshFundDetails , Starting function, type: '+type+', name: '+name);
	var period = nlapiGetFieldValue('custpage_period');
	var url = nlapiResolveURL('SUITELET', 'customscript_fill_fund_details', 'customdeploy_fill_fund_details', null);
	var deployLink = url + '&custparam_period=' + period;
	window.onbeforeunload = null;
	window.location = deployLink;
        }
}
/***
function refreshFundDetails(type, name)
{
      if(type != 'custpage_fund_details') {
	nlapiLogExecution('DEBUG','refreshFundDetails','Starting function, doing nothing, type: '+type+', name: '+name);
	console.log('DEBUG , refreshFundDetails , Starting function, doing nothing, type: '+type+', name: '+name);
	nlapiSetFieldValue('custpage_action','Refresh'); 
        document.getElementById('submitter').value = 'Refresh';
        document.getElementById('secondarysubmitter').value = 'Refresh';
        }
}
***/

function submitFundDetails()
{
	var action = nlapiGetFieldValue('custpage_action');
	nlapiLogExecution('DEBUG','submitFundDetails','Starting function, custpage_action: '+action);
	console.log('DEBUG , submitFundDetails , Starting function, custpage_action: '+action);
	if(nlapiGetFieldValue('custpage_action')!='Refresh') { return confirm('You are submitting the Form'); };
        return true;
}

