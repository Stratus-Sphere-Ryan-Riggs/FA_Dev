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
 *
 * Version    Date            Author           Remarks
 * 1.00       14 Aug 2016     Sapnesh Premraj
 * 1.10       10 Sep 2018     Mike Jarvis	Moving the deleting of customrecord_month_end_rel_trans records to the scheduled script
 * 						Also, modified the suitelet to respond to request methods GET and POST
 *
 * 1.20       26 July 2019  Thilaga Shanmugam  Added new field for testing purpose
 *
 *
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @return {void} Any output is written via response object
 */

function setFundFormSuitelet(request, response)
{
	var action = request.getParameter('custpage_action');
	var fundId = request.getParameter('custpage_fundid');
	var periodId = request.getParameter('custpage_period');
  	var monthEndRelTest = request.getParameter('custpage_monthendtest');
	var classId = request.getParameter('custpage_restriction_class');
	var SBL_FUND_DETAILS = 'custpage_fund_details';	
	var SCH_SCRIPT_ID = 'customscript_month_end_release';	
	var SCH_SCRIPT_DEPLOYMENT = 'customdeploy_month_end_release';	
	var MONTHEND_CUSTOM_RECORD = 'customrecord_month_end_rel_trans';

	if(request.method === 'GET') {
		var periodId = request.getParameter('custparam_period');
      var mnthEndRelTest = request.getParameter('custparam_monthendtest');
		nlapiLogExecution('DEBUG','setFundFormSuitelet','Starting function, action: '+action+', request.getMethod(): '+request.getMethod()+', periodId: '+periodId+', mnthEndRelTest:'+mnthEndRelTest);
		// Get list of periods
		var periodsSearch = 'customsearch_accounting_period_search';	
      	var search = nlapiSearchRecord(null, periodsSearch, null, null);
      	
		//create the Form where the Sublist will be attached
		var form = nlapiCreateForm('FA Trx - Analysis of Funds, Restriction Class and Period', false);
		var fldMsg = form.addField('custpage_message', 'text', '', 'message').setDisplayType('inline');

     
		fldMsg.setLayoutType('outsideabove','startrow');
		form.setScript('customscript_refresh_fund_suitelet_cs');
      
		if(isEmpty(periodId)){
          form.addFieldGroup("companytestprefs", "Please select the Test mode").setCollapsible(true, false);
          var monthEndTest = form.addField('custpage_monthendtest','checkbox','Month End Test',null,'companytestprefs').setLayoutType('normal','startcol').setDefaultValue('T');
			form.addFieldGroup("companyprefs", "Please select the Period").setCollapsible(true, false);
          	var period = form.addField('custpage_period', 'select', 'Period', null,'companyprefs').setLayoutType('normal','startcol').setMandatory(true);
          period.addSelectOption('','');
          for(var i=0;i<search.length;i++){
                        period.addSelectOption(search[i].getValue('internalid'),search[i].getValue('periodname'));
          }
			period.setDefaultValue(1);
          	
		}
		else {
			
			form.addButton('custpage_startover', 'Start Over', 'startOver();');
			form.addFieldGroup("companyprefs", "Please review funds, then press Submit.").setCollapsible(true, false);
			var period = form.addField('custpage_period', 'select', 'Period', null,'companyprefs').setLayoutType('normal','startcol').setMandatory(true).setDisplayType('readonly');
			//period.setDefaultValue(periodId);
          period.addSelectOption('','');
          for(var i=0;i<search.length;i++){
           if(search[i].getValue('internalid') == periodId){
             period.addSelectOption(search[i].getValue('internalid'),search[i].getValue('periodname'),true);
           }else{
             period.addSelectOption(search[i].getValue('internalid'),search[i].getValue('periodname'));
           }
       	  }
          
          	var monthEndTest = form.addField('custpage_monthendtest','checkbox','Month End Test').setDefaultValue('T');
			var list = form.addSubList(SBL_FUND_DETAILS, 'list', 'Fund Details', 'general');

			list.addField('custpage_mysublistcb','checkbox','checkbox');
			list.addField('location', 'text', 'Fund', 'left');
			list.addField('amount', 'currency', 'Sum Of Debits - Credits', 'right');
			list.addField('internalid', 'text', 'Internal Id', 'right').setDisplayType('hidden');
			list.addMarkAllButtons(); 

			// Use the periodId to filter
			var monthEndRelDatesSvdSrch = 'customsearch_month_end_rel_dates';
			nlapiLogExecution('DEBUG','setFundFormSuitelet GET with periodId','Period selected, period id: ' + periodId);
			nlapiLogExecution('DEBUG','setFundFormSuitelet GET with periodId','mnthEndRelTest: ' + mnthEndRelTest);
          
			var objPeriodEndDate = getPeriodEndDate(monthEndRelDatesSvdSrch,periodId);

			var period = objPeriodEndDate[0].getValue('periodname');
			var startDate = objPeriodEndDate[0].getValue('startdate');
			var endDate = objPeriodEndDate[0].getValue('enddate');

			var monthEndRelFiscalStartSvdSrch = 'customsearch_month_end_rel_dates_2';
			var objFiscalStartDate = getFiscalYear(monthEndRelFiscalStartSvdSrch, endDate);
			var intPeriodLen = objFiscalStartDate.length;

			var fiscalPeriod = objFiscalStartDate[0].getValue('periodname', null, 'group');
			var fiscalStartDate = objFiscalStartDate[0].getValue('startdate', null, 'group');
			var fiscalEndDate = objFiscalStartDate[0].getValue('enddate', null, 'min');

			nlapiLogExecution('DEBUG','setFundFormSuitelet GET with periodId','Start Date: ' + fiscalStartDate);
			nlapiLogExecution('DEBUG','setFundFormSuitelet GET with periodId','End Date: ' + endDate);
          
			
			var filter = new Array();
			 
			if(!isEmpty(periodId)) { filter[filter.length] = new nlobjSearchFilter('trandate',null,'within', fiscalStartDate, endDate); }

			var results = nlapiSearchRecord('transaction', 'customsearch_fa_trx_search_mrfr_rev_e_13', filter,null); 
			for ( var i = 0; results != null && i < results.length; i++) {
				var row = i + 1;
				searchresult = results[i];
				list.setLineItemValue('custpage_mysublistcb', row, 'T' );
				list.setLineItemValue('location', row, searchresult.getValue('locationnohierarchy',null,'group'));
				list.setLineItemValue('amount', row, searchresult.getValue('formulacurrency',null,'sum'));
				list.setLineItemValue('internalid', row, searchresult.getValue('internalid','location','group'));
			}
			var fldAction = form.addField('custpage_action', 'text', '');
			fldAction.setDisplayType('hidden');
		
			form.addSubmitButton('Submit');
		}

		//write the form on the reponse of the Suitelet
		response.writePage( form );

	}
	else if(request.method === 'POST') {
		nlapiLogExecution('DEBUG','setFundFormSuitelet POST','Starting function, action: '+action+', request.getMethod(): '+request.getMethod());

		var fundIdArray = new Array();
		var oldMonthEndTransArray = new Array();
		var params = {};
		var mnthEndRelTest = request.getParameter('custparam_monthendtest');
		// Prepare the array of old month end rel trans to be sent to scheduled script
		nlapiLogExecution('DEBUG', 'setFundFormSuitelet POST', 'Searching for old transactions.');
		/*var arrResults = nlapiSearchRecord(null, 'customsearch_month_end_rel_trans', null, null);
		if (arrResults) {
			nlapiLogExecution('DEBUG', 'setFundFormSuitelet', 'Found '+arrResults.length+' old custom records to send to scheduled script.');
			for (var i = 0; i < arrResults.length; i++) {
				var stUpdateExpId = arrResults[i].getId();
				oldMonthEndTransArray.push(stUpdateExpId);
			}
		}*/

		// Prepare the fund array to be sent to scheduled script
		var intLines = request.getLineItemCount(SBL_FUND_DETAILS);
		nlapiLogExecution('DEBUG','setFundFormSuitelet POST','Number of funds selected for processing: '+intLines);
		for (var line = 1; line <= intLines; line++) {
			var bFundId = request.getLineItemValue(SBL_FUND_DETAILS, 'internalid', line);
			var bFundChecked = request.getLineItemValue(SBL_FUND_DETAILS, 'custpage_mysublistcb', line);

			if (bFundChecked == 'T' && !isEmpty('bFundId')) {
				fundIdArray.push({bfundid:bFundId, periodid:periodId});

			}
	        }
			if(monthEndRelTest==null){
              monthEndRelTest = 'F';
            }
		var email = nlapiGetContext().getEmail();
nlapiLogExecution('DEBUG','email',email);
		params.custscript_kbs_email = email;
		params.custscript_kbs_new_fundidlist = JSON.stringify(fundIdArray); 
		params.custscript_kbs_old_translist = JSON.stringify(oldMonthEndTransArray); 
      	params.custscript_mnth_end_rel_testing_mode = monthEndRelTest;

		nlapiLogExecution('DEBUG','setFundFormSuitelet POST','Sending '+fundIdArray.length+' records to scheduled script, in fundIdArray'+' with MonthEndTestflag:'+monthEndRelTest);
		nlapiLogExecution('DEBUG','setFundFormSuitelet POST','Sending '+oldMonthEndTransArray.length+' old records to scheduled script, in oldMonthEndTransArray');

		nlapiScheduleScript(SCH_SCRIPT_ID, SCH_SCRIPT_DEPLOYMENT, params);


		var form = nlapiCreateForm('FA Trx - Analysis of Funds, Restriction Class and Period', false);
                var notify = form.addField('custpage_status', 'text', '', 'Status').setDisplayType('inline');
									// var fldMsg = form.addField('custpage_message', 'text', '', 'message').setDisplayType('inline');
                notify.setDefaultValue('Your request has been granted and the script is in progress. You will receive an email when it is finished.');
                // notify.setDisplayType('readonly');
                // notify.setDisplaySize(100, 20);
                response.writePage(form);
		nlapiLogExecution('DEBUG','setFundFormSuitelet POST','Finished script.');
	}
}

function checkUsage(name) {
	var context = nlapiGetContext();
	var remUsage = context.getRemainingUsage();
	nlapiLogExecution('DEBUG', 'checkUsage', ', name: '+name + ', remUsage: ', remUsage);
}
function isEmpty(stValue)
{
	if ((stValue == '') || (stValue == null) || (stValue == undefined))
	{
		return true;
	}
	return false;
}

function getPeriodEndDate(monthEndRelTransSvdSrch, period)
{
	filters = [], columns = [];

	filters.push((new nlobjSearchFilter('internalid', null, 'is', period)));

	var search = nlapiSearchRecord(null, monthEndRelTransSvdSrch, filters, null);

	return search;
}

function getFiscalYear(monthEndRelTransSvdSrch, endDate)
{
	var stMethod = 'getFiscalYear';
//	nlapiLogExecution('DEBUG', stMethod, 'Started Function: ' + stMethod);

	filters = [], columns = [];

	filters.push((new nlobjSearchFilter('enddate', null, 'onorafter', endDate)));
	filters.push((new nlobjSearchFilter('isyear', null, 'is', 'T')));

	var search = nlapiSearchRecord(null, monthEndRelTransSvdSrch, filters, null);

	return search;
}


function searchMonthEndTrans(monthEndRelTransSvdSrch, monthEndTestMode)
{
	var stMethod = 'searchMonthEndTrans';
//	nlapiLogExecution('DEBUG', stMethod, 'Started Function: ' + stMethod);

	filters = [], columns = [];

	if(monthEndTestMode == 'T')
	{
		filters.push((new nlobjSearchFilter('custrecord_fund_processed', null, 'is', 'T')));
		var search = nlapiSearchRecord(null, monthEndRelTransSvdSrch, filters, null);
	}
	else
	{
		var search = nlapiSearchRecord(null, monthEndRelTransSvdSrch, null, null);
	}

	return search;
}
