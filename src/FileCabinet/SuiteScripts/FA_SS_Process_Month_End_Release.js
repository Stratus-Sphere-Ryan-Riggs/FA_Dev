nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
* Copyright (c) 1998-2015 NetSuite, Inc.
* 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
* All Rights Reserved.
*
* This software is the confidential and proprietary information of
* NetSuite, Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with NetSuite.
*
*
* Version Type    Date            	Author
* 1.00    Create  08 Aug 2016		Shafiq Hossain
* 1.10    Create  11 Sep 2018		Mike Jarvis  	Moved almost all processing from suitelet to scheduled script; added yield script statements
* 1.10    Create  14 May 2019      Thilaga Shanmugam Revamped the process
*
 * Thilaga 20190516
 * There are 3 files involved in this process, documented as follows:
 * Old name - > New name:
 * setFundSuitelet.js -> KBS_setFunds_SL.js
 * FA_SS_Process_MonthEndRelease.js -> KBS_setFunds_SS.js
 * setFundSearch_CS.js -> KBS_setFunds_CS.js
*/

var totalAvailExp = 0;
var monthEndTestMode = nlapiGetContext().getSetting('SCRIPT', 'custscript_mnth_end_rel_testing_mode');
var finalErrorMsg = '';
var SCRIPT_ID = 911; // deployment id for this script
// var SCRIPT_DEP_ID = 911;  // deployment id for this script

// eslint-disable-next-line no-unused-vars
function scheduled_process_MonthEndRelease() {
    var stMethod = 'scheduled_process_MonthEndRelease';
    var objContext = nlapiGetContext();
    var values;
    var monthEndRelDtlExpSvdSrch = objContext.getSetting('SCRIPT', 'custscript_month_end_rel_dtl_exp');
    var monthEndRelJESvdSrch = objContext.getSetting('SCRIPT', 'custscript_mnth_end_rel_je_svd_srch');
    var monthEndRelDatesSvdSrch = objContext.getSetting('SCRIPT', 'custscript_month_end_rel_dates');
    var monthEndRelFiscalStartSvdSrch = objContext.getSetting('SCRIPT', 'custscript_mnth_end_rel_fiscal_start');
    var monthEndRelTransSvdSrch = objContext.getSetting('SCRIPT', 'custscript_month_end_rel_trans');
    var monthEndCYBalPYAcctSvdSrch = objContext.getSetting('SCRIPT', 'custscript_cy_balance_py_acct');
    var netAssetCYUsedBalSvdSrch = objContext.getSetting('SCRIPT', 'custscript_cy_used_balance');
    var netAssetPYBalSvdSrch = objContext.getSetting('SCRIPT', 'custscript_mnth_end_rel_py_balance');
    var netExpReqReleaseSvdSrch = objContext.getSetting('SCRIPT', 'custscript_net_exp_req_rel_svd_srch');
    var monthEndReleaseTransSearch = objContext.getSetting('SCRIPT', 'custscript_month_end_rel_trans_rec_svd_s');
    var monthEndRelTransToDel = objContext.getSetting('SCRIPT', 'custscript_me_rel_trans_to_del');

    var filterFundTransSvdSrch = objContext.getSetting('SCRIPT', 'custscript_filter_fund_trans');
    var fundsGroupByFundSvdSrch = objContext.getSetting('SCRIPT', 'custscript_grp_by_fund');
    var unrestrictedClass = objContext.getSetting('SCRIPT', 'custscript_unrestricted_class');
    var restrictedClass = objContext.getSetting('SCRIPT', 'custscript_restricted_class');

    var monthEndPYCYAcctMapSvdSrch = objContext.getSetting('SCRIPT', 'custscript_mnth_end_rel_py_cy_acct_map');
    var monthEndCYAcctMapSvdSrch = objContext.getSetting('SCRIPT', 'custscript_mnth_end_rel_cy_acct_map');
    var monthEndRelCreateApprovedJE = objContext.getSetting('SCRIPT', 'custscript_create_approved_je');

    var sumUnrestrictedRestrictedFunds = objContext.getSetting('SCRIPT', 'custscript_restric_unrestric_fund_amt');

    var monthEndJEType = objContext.getSetting('SCRIPT', 'custscript_mnth_end_rel_auto_restriction');
 	var monthEndOldRelTransToDel = objContext.getSetting('SCRIPT', 'custscript_del_old_me_rel_trans');


    var expenseAccountType = 'Expense';
    var revenueAccountType = 'Revenue';
    var netAssetAccountType = 'Net Asset';


    var jeNumber = '';
    var jeCreated = 'F';
    var jeHtml = '<html>The script has completed.  ';

    var fundIdArray = JSON.parse(objContext.getSetting('SCRIPT', 'custscript_kbs_new_fundidlist'));
    var oldMonthEndTransArray = [] ;
  //  = JSON.parse(objContext.getSetting('SCRIPT', 'custscript_kbs_old_translist'));
    var i, x, a, u, b, v, n;
    var stUpdateExpId;
    var recMonthEnd;
    var recMonthEndId;
    var stUpdateExpId;
    var arrResults;
    var searchResult;
    var intCtr;
    var intResultLen;
    var fund;
    var fundText;
    var period;
    var periodText;
    var monthEndRelTransRcdId;
    var objPeriodEndDate;
    var period;
    var startDate;
    var endDate;
    var objFiscalStartDate;
    var intPeriodLen;
    var fiscalPeriod;
    var fiscalStartDate;
    var fiscalEndDate;
    var objPYCYBalTrans;
    var intUpdatePYCYBalances;
    var idPYCYBalTrans;
    var objUpdatePYCYBal;
    var intUpdatePYCYBal;
    var fundPYCYBal;
    var fundPYCYBalText;
    var amtPYCYBal;
    var idPYCYBalTrans;
    var fundPYCYBalTrans;
    var programPYCYBalTrans;
    var revStreamPYCYBalTrans;
    var accountPYCYBalTrans;
    var fanoMGPYCYBal;
  	var acctPYCYBal;
  	var acctPYCYBalTxt;
    var fanoMGPYCYBalTrans;
    var projectPYCYBalTrans;
    var objUpdateCYUsedBal;
    var intUpdateCYUsedBal;
    var fundCYUsedBal;
    var amtCYUsedBal;
    var idPYCYBalTrans;
    var fundPYCYBalTrans;
    var programPYCYBalTrans;
    var revStreamPYCYBalTrans;
    var projectPYCYBalTrans;
    var savedSearchList = [];
    var objGetFundTrans;
    var intFundTransactions;
    var objGetExpenseDetail;
    var intFundExpenseDetail;

    values = {
        monthEndRelDtlExpSvdSrch: monthEndRelDtlExpSvdSrch,
        monthEndRelJESvdSrch: monthEndRelJESvdSrch,
        monthEndRelDatesSvdSrch: monthEndRelDatesSvdSrch,
        monthEndRelFiscalStartSvdSrch: monthEndRelFiscalStartSvdSrch,
        monthEndRelTransSvdSrch: monthEndRelTransSvdSrch,
        monthEndReleaseTransSearch:monthEndReleaseTransSearch,
        monthEndRelTransToDel:monthEndRelTransToDel,
        monthEndCYBalPYAcctSvdSrch: monthEndCYBalPYAcctSvdSrch,
        netAssetCYUsedBalSvdSrch: netAssetCYUsedBalSvdSrch,
        netAssetPYBalSvdSrch: netAssetPYBalSvdSrch,
        netExpReqReleaseSvdSrch: netExpReqReleaseSvdSrch,
        filterFundTransSvdSrch: filterFundTransSvdSrch,
        fundsGroupByFundSvdSrch: fundsGroupByFundSvdSrch,
        unrestrictedClass: unrestrictedClass,
        restrictedClass: restrictedClass,
        monthEndPYCYAcctMapSvdSrch: monthEndPYCYAcctMapSvdSrch,
        monthEndCYAcctMapSvdSrch: monthEndCYAcctMapSvdSrch,
        monthEndRelCreateApprovedJE: monthEndRelCreateApprovedJE,
        sumUnrestrictedRestrictedFunds: sumUnrestrictedRestrictedFunds,
      	monthEndRelTransToDel:monthEndRelTransToDel,
        monthEndJEType: monthEndJEType
    };

    nlapiLogExecution('DEBUG', stMethod, '>> Start Script Execution <<');
    nlapiLogExecution('DEBUG', stMethod, 'values: ' + JSON.stringify(values));

    try {

        nlapiLogExecution('DEBUG', 'scheduled_process_MonthEndRelease', 'Received ' + fundIdArray.length + ' records selected, fundIdArray');
       

      //  nlapiLogExecution('DEBUG', 'scheduled_process_MonthEndRelease', 'Preparing to delete oldMonthEndTransArray.');
        // This loop is deleting all old entries from Month End Release Transaction custom record
        oldMonthEndTransArray = nlapiSearchRecord(null, monthEndOldRelTransToDel, null, null);
             
      if (oldMonthEndTransArray) {
        nlapiLogExecution('DEBUG', 'scheduled_process_MonthEndRelease', 'Received ' + oldMonthEndTransArray.length + ' old records found, oldMonthEndTransArray');
        for (i = 0; i < oldMonthEndTransArray.length; i += 1) {
            stUpdateExpId = oldMonthEndTransArray[i].getId();
            nlapiDeleteRecord('customrecord_month_end_rel_trans', stUpdateExpId);
          	checkToYield('oldMonthEndTransArray');
        }
      }
        checkToYield('oldMonthEndTransArray');
        oldMonthEndTransArray = nlapiSearchRecord(null, monthEndOldRelTransToDel, null, null);
             
      if (oldMonthEndTransArray) {
        nlapiLogExecution('DEBUG', 'scheduled_process_MonthEndRelease', 'Received ' + oldMonthEndTransArray.length + ' old records found, oldMonthEndTransArray');
        for (i = 0; i < oldMonthEndTransArray.length; i += 1) {
            stUpdateExpId = oldMonthEndTransArray[i].getId();
            nlapiDeleteRecord('customrecord_month_end_rel_trans', stUpdateExpId);
          checkToYield('oldMonthEndTransArray');
        }
      }
      checkToYield('oldMonthEndTransArray');
        nlapiLogExecution('DEBUG', 'scheduled_process_MonthEndRelease', 'Preparing to create new custom records customrecord_month_end_rel_trans.');
        // This loop is creating new entries into Month End Release Transaction custom record based on the funds selected in the Suitelet page
        for (i = 0; i < fundIdArray.length; i += 1) {
            recMonthEnd = nlapiCreateRecord('customrecord_month_end_rel_trans');
            recMonthEnd.setFieldValue('custrecord_month_end_rel_fund', fundIdArray[i].bfundid);
            recMonthEnd.setFieldValue('custrecord_month_end_rel_period', fundIdArray[i].periodid);
            recMonthEnd.setFieldValue('custrecord_fund_processed', 'F');
            recMonthEndId = nlapiSubmitRecord(recMonthEnd);
        }
        checkToYield('fundIdArray');

        // CLEAR MONTH END RELEASE DETAIL EXPENSES RECORD
        arrResults = nlapiSearchRecord(null, monthEndRelDtlExpSvdSrch, null, null);
        if (arrResults) {
            for (i = 0; i < arrResults.length; i += 1) {
                stUpdateExpId = arrResults[i].getId();
                nlapiDeleteRecord('customrecord_month_end_release_dtl', stUpdateExpId);
            }
        }
        checkToYield('after clearing monthEndRelDtlExpSvdSrch');

        // CLEAR MONTH END RELEASE JOURNAL ENTRY STAGING RECORD
        arrResults = nlapiSearchRecord(null, monthEndRelJESvdSrch, null, null);
        if (arrResults) {
            for (i = 0; i < arrResults.length; i += 1) {
                stUpdateExpId = arrResults[i].getId();
                nlapiDeleteRecord('customrecord_month_end_release_je', stUpdateExpId);
            }
        }
        checkToYield('after clearing monthEndRelJESvdSrch');

      // This loop is deleting all old entries from 'FA PY and NAR Fund Balances w Seg List' custom record
        arrResults = nlapiSearchRecord(null, monthEndCYBalPYAcctSvdSrch, null, null);
        if (arrResults) {
            for (i = 0; i < arrResults.length; i += 1) {
                stUpdateExpId = arrResults[i].getId();
                nlapiDeleteRecord('customrecord_fa_py_fund_bal_w_seg', stUpdateExpId);
              checkToYield('oldMonthEndTransArray');
            }
        }
        checkToYield('after clearing monthEndRelJESvdSrch');
        // Loop through all selected funds and create individual month end release journal entry lines
        searchResult = searchMonthEndTrans(monthEndRelTransSvdSrch, monthEndTestMode,0,0);

        if (searchResult) {
            intResultLen = searchResult.length;
            for (intCtr = 0; intCtr < intResultLen; intCtr += 1) {
                fund = searchResult[intCtr].getValue('custrecord_month_end_rel_fund');
                fundText = searchResult[intCtr].getText('custrecord_month_end_rel_fund');
                meRelperiod = searchResult[intCtr].getValue('custrecord_month_end_rel_period');
                period = meRelperiod;
                periodText = searchResult[intCtr].getText('custrecord_month_end_rel_period');
                monthEndRelTransRcdId = searchResult[intCtr].getId();

                nlapiLogExecution('DEBUG', stMethod, 'Processing Fund ' + fundText + ' for Period ' + periodText + ', number : ' + intCtr + ' of ' + intResultLen);

                // CALCULATE FISCAL START AND PERIOD END DATES WHEN PROCESSING FIRST SELECTED FUND
                if (intCtr === 0) {
                    objPeriodEndDate = getPeriodEndDate(monthEndRelDatesSvdSrch, period);
                    period = objPeriodEndDate[0].getValue('periodname');
                    startDate = objPeriodEndDate[0].getValue('startdate');
                    endDate = objPeriodEndDate[0].getValue('enddate');
                    objFiscalStartDate = getFiscalYear(monthEndRelFiscalStartSvdSrch, endDate);
                    intPeriodLen = objFiscalStartDate.length;
                    fiscalPeriod = objFiscalStartDate[0].getValue('periodname', null, 'group');
                    fiscalStartDate = objFiscalStartDate[0].getValue('startdate', null, 'group');
                    fiscalEndDate = objFiscalStartDate[0].getValue('enddate', null, 'min');

                    nlapiLogExecution('DEBUG', stMethod, 'Fiscal Start Based on Selected Period: ' + fiscalStartDate + 
                    'Fiscal End Based on Selected Period: '+fiscalEndDate+' Fiscal Period: '+fiscalPeriod);
                }

                // This loop creates new entries into Fund CY PY Balance custom record and sets net asset balance for FANO and MG
                objUpdatePYCYBal = updatePYCYBal(netAssetPYBalSvdSrch, fund, fiscalStartDate, endDate);
                if (objUpdatePYCYBal) {
                    intUpdatePYCYBal = objUpdatePYCYBal.length;
                    nlapiLogExecution('DEBUG', stMethod, 'Number of PY CY Balance Lines: ' + intUpdatePYCYBal);

                    for (a = 0; a < intUpdatePYCYBal; a += 1) {
                            fundPYCYBal = objUpdatePYCYBal[a].getValue('location', null, 'group');
                            fundPYCYBalText = objUpdatePYCYBal[a].getText('location', null, 'group');
                            amtPYCYBal = parseFloat(objUpdatePYCYBal[a].getValue('formulacurrency', null, 'sum'));
                            fanoMGPYCYBal = objUpdatePYCYBal[a].getValue('custrecord_fano_or_mg','account','group');
                            acctPYCYBal = objUpdatePYCYBal[a].getText('account',null, 'group');
                            programPYCYBal = objUpdatePYCYBal[a].getValue('department',null,'group');
                            projectPYCYBal = objUpdatePYCYBal[a].getValue('custcol_cseg_projects_cseg',null,'group');
                            acctStreamPYCYBal = objUpdatePYCYBal[a].getValue('custrecord_fundraising_stream','location','group');
                            nlapiLogExecution('DEBUG', stMethod, 'Account PY CY Balance Lines: ' + acctPYCYBal);
                          if(acctPYCYBal=="3350 Net Assets : Net Assets - TR FANO"){
                            acctPYCYBalTxt = "Net Assets - TR FANO";
                          }else{
                            acctPYCYBalTxt = "Net Assets - TR Grants";
                          }
                          var objGetPYRec = getCurrYrBalPYAcct(monthEndCYBalPYAcctSvdSrch,fundPYCYBal,fanoMGPYCYBal,programPYCYBal,projectPYCYBal);
                          if(objGetPYRec){
                            intPYCYRec = objGetPYRec.length;
                            idPYBalTrans = objGetPYRec[0].getId();
                            if(intPYCYRec>1){
                               // nlapiSubmitField('customrecord_month_end_rel_trans',idPYBalTrans,'custrecord_me_rel_trans_error_msg','This fund is spread across multiple account streams. Please handle this fund manually');
                            }else{
                                var existingRevStream = objGetPYRec[0].getValue('custrecord_fa_rev_stream_for_py_bal');
                                if(existingRevStream == null || existingRevStream == '' || acctStreamPYCYBal == null || acctStreamPYCYBal == ''){
                                    var totalPYAmt = parseFloat(objGetPYRec[0].getValue('custrecord_fa_net_asset_acct_bal'))+parseFloat(amtPYCYBal);
                                    nlapiLogExecution('DEBUG', stMethod, 'totalPYAmt: ' + totalPYAmt);
                                    nlapiSubmitField('customrecord_fa_py_fund_bal_w_seg', idPYBalTrans, 'custrecord_fa_net_asset_acct_bal', totalPYAmt);
                                    if(existingRevStream == null || existingRevStream == ''){
                                        nlapiSubmitField('customrecord_fa_py_fund_bal_w_seg', idPYBalTrans, 'custrecord_fa_rev_stream_for_py_bal', acctStreamPYCYBal);
                                    }
                                }
                                if(existingRevStream!=null && existingRevStream!='' && acctStreamPYCYBal!=null && acctStreamPYCYBal!='' && amtPYCYBal!=0){
                                    recPYCYBal = nlapiCreateRecord('customrecord_fa_py_fund_bal_w_seg');
                                    recPYCYBal.setFieldValue('custrecord_fa_fund_for_py_bal', fundPYCYBal);
                                    recPYCYBal.setFieldValue('custrecord_fa_cy_use_of_py_bal', parseFloat('0'));
                                    recPYCYBal.setFieldText('custrecord_fa_acct_for_py_bal', acctPYCYBalTxt);
                                    recPYCYBal.setFieldValue('custrecord_fa_fano_mg_for_py_bal', fanoMGPYCYBal);
                                    recPYCYBal.setFieldValue('custrecord_fa_py_nar_program',programPYCYBal);
                                    recPYCYBal.setFieldValue('custrecord_fa_py_nar_project',projectPYCYBal);
                                    recPYCYBal.setFieldValue('custrecord_fa_net_asset_acct_bal', amtPYCYBal);
                                    recPYCYBal.setFieldValue('custrecord_fa_rev_stream_for_py_bal', acctStreamPYCYBal);
                                    recPYCYBal.setFieldText('custrecord_fa_rest_class_for_py_bal','Temporarily Restricted');
                                    recPYCYBalId = nlapiSubmitRecord(recPYCYBal);
                                }
                                
                            }
                          }else{
                              if(amtPYCYBal!=0){
                                    recPYCYBal = nlapiCreateRecord('customrecord_fa_py_fund_bal_w_seg');
                                    recPYCYBal.setFieldValue('custrecord_fa_fund_for_py_bal', fundPYCYBal);
                                    recPYCYBal.setFieldValue('custrecord_fa_cy_use_of_py_bal', parseFloat('0'));
                                    recPYCYBal.setFieldText('custrecord_fa_acct_for_py_bal', acctPYCYBalTxt);
                                    recPYCYBal.setFieldValue('custrecord_fa_fano_mg_for_py_bal', fanoMGPYCYBal);
                                    recPYCYBal.setFieldValue('custrecord_fa_py_nar_program',programPYCYBal);
                                    recPYCYBal.setFieldValue('custrecord_fa_py_nar_project',projectPYCYBal);
                                    recPYCYBal.setFieldValue('custrecord_fa_net_asset_acct_bal', amtPYCYBal);
                                    recPYCYBal.setFieldValue('custrecord_fa_rev_stream_for_py_bal', acctStreamPYCYBal);
                                    recPYCYBal.setFieldText('custrecord_fa_rest_class_for_py_bal','Temporarily Restricted');
                                    recPYCYBalId = nlapiSubmitRecord(recPYCYBal);
                              }
                         }
                    }
                }
                
                // This loop updates Fund CY PY Balance custom record entries to set CY used PY revenue balance and sets remaining PY balance
                objUpdateCYUsedBal = updateCYUsedBal(netAssetCYUsedBalSvdSrch, fund, fiscalStartDate, endDate);
                    if (objUpdateCYUsedBal) {
                        intUpdateCYUsedBal = objUpdateCYUsedBal.length;
                        nlapiLogExecution('DEBUG', stMethod, 'Number of PY CY Used Balance Lines: ' + intUpdateCYUsedBal);
                        for (b = 0; b < intUpdateCYUsedBal; b += 1) {
                            fundCYUsedBal = objUpdateCYUsedBal[b].getValue('location', null, 'group');
                            amtCYUsedBal = objUpdateCYUsedBal[b].getValue('formulacurrency', null, 'sum');
                            fanomgCYUsedBal = objUpdateCYUsedBal[b].getValue('custrecord_fano_or_mg', 'account', 'group');
                            programCYUsedBal = objUpdateCYUsedBal[b].getValue('department',null,'group');
                            projectCYUsedBal = objUpdateCYUsedBal[b].getValue('custcol_cseg_projects_cseg',null,'group');
                            objGetPYCYRec = getCurrYrBalPYAcct(monthEndCYBalPYAcctSvdSrch,fund,fanomgCYUsedBal,programCYUsedBal,projectCYUsedBal);
                            if(objGetPYCYRec){
                                intPYCYRec = objGetPYCYRec.length;
                                for(c=0; c<intPYCYRec; c+=1){
                                    idPYCYBalTrans = objGetPYCYRec[c].getId();
                                    fanomgPYCYRec = objGetPYCYRec[c].getValue('custrecord_fa_fano_mg_for_py_bal');
                                    nlapiSubmitField('customrecord_fa_py_fund_bal_w_seg', idPYCYBalTrans, 'custrecord_fa_cy_use_of_py_bal', amtCYUsedBal);
                                }
                            }    
                            
                        }
                    }
                nlapiLogExecution('DEBUG', stMethod, 'Start of setting funds and expenses.');

			    // Set Unrestricted Revenue Expense amount for each of the month end release transaction records
                 objGetFundTrans = getRestricUnRestrictFunds(sumUnrestrictedRestrictedFunds, fund, fiscalStartDate, endDate, unrestrictedClass, restrictedClass, expenseAccountType, revenueAccountType, netAssetAccountType, 1);
                if (objGetFundTrans) {
                    intFundTransactions = objGetFundTrans.length;
                    for (v = 0; v < intFundTransactions; v += 1) {
                        var fanoMg = objGetFundTrans[v].getValue('custrecord_fano_or_mg', 'account','group');
                        program = objGetFundTrans[v].getValue('department', null,'group');
                        var project = objGetFundTrans[v].getValue('custcol_cseg_projects_cseg', null,'group');
                        var unRestrictedRevExpenses = parseFloat(objGetFundTrans[v].getValue('formulacurrency', null, 'sum'));
                        var objGetMonthEndReleaseTrans = getMonthEndReleaseTrans(monthEndReleaseTransSearch,fund,fanoMg,program,project);
                        nlapiLogExecution('DEBUG', 'objGetMonthEndReleaseTrans: ' + objGetMonthEndReleaseTrans);
                      nlapiLogExecution('DEBUG', 'unRestrictedRevExpenses: ' + unRestrictedRevExpenses);
                        var pyNetAssetData = getCYUsedPYBal(fund, fanoMg, program, project);
                        nlapiLogExecution('DEBUG', 'pyNetAssetData: ' + pyNetAssetData,'pyNetAssetData String: '+JSON.stringify(pyNetAssetData));
                        if(objGetMonthEndReleaseTrans){
                            unRestrictedRevExpenses +=parseFloat(objGetMonthEndReleaseTrans[0].getValue('custrecord_me_rel_trans_unrest_rev_exp'));
                            objId = objGetMonthEndReleaseTrans[0].getId();
                            nlapiLogExecution('DEBUG', 'unRestrictedRevExpenses: ' + unRestrictedRevExpenses +' objId:'+objId);
                            nlapiSubmitField('customrecord_month_end_rel_trans',objId,'custrecord_me_rel_trans_unrest_rev_exp',unRestrictedRevExpenses);
                            if(unRestrictedRevExpenses==0){
                                nlapiSubmitField('customrecord_month_end_rel_trans',objId,'custrecord_me_rel_trans_error_msg','No Expenses to Release Against');
                            }
                            nlapiLogExecution('DEBUG', 'pyNetAssetData.error: ',pyNetAssetData.error)+' objId:'+objId;
                            if(pyNetAssetData.error!=null && pyNetAssetData.error!='' && (objGetMonthEndReleaseTrans[0].getValue('custrecord_me_rel_trans_error_msg')==null || 
                                objGetMonthEndReleaseTrans[0].getValue('custrecord_me_rel_trans_error_msg')=='')){
                                nlapiSubmitField('customrecord_month_end_rel_trans',objId,'custrecord_me_rel_trans_error_msg',pyNetAssetData.error);
                            }else{
                                nlapiSubmitField('customrecord_month_end_rel_trans',objId,'custrecord_cy_use_py_balance',pyNetAssetData.cyUsePyBal);
                                nlapiSubmitField('customrecord_month_end_rel_trans',objId,'custrecord_avail_rest_rev_to_rel',parseFloat(pyNetAssetData.pyNetAssetBal)-parseFloat(pyNetAssetData.cyUsePyBal));
                                nlapiSubmitField('customrecord_month_end_rel_trans',objId,'custrecord_me_rel_py_na_rev',pyNetAssetData.pyNetAssetBal);
                            }
                        }else{
                            recMonthEnd = nlapiCreateRecord('customrecord_month_end_rel_trans');
                            recMonthEnd.setFieldValue('custrecord_month_end_rel_fund', fund);
                            recMonthEnd.setFieldValue('custrecord_me_rel_trans_fanomg',fanoMg);
                            recMonthEnd.setFieldValue('custrecord_me_rel_trans_program',program);
                            recMonthEnd.setFieldValue('custrecord_me_rel_trans_proj_code',project);
                            recMonthEnd.setFieldValue('custrecord_month_end_rel_period', meRelperiod);
                            recMonthEnd.setFieldValue('custrecord_fund_processed', 'F');
                            recMonthEnd.setFieldValue('custrecord_me_rel_trans_unrest_rev_exp',unRestrictedRevExpenses);
                            if(unRestrictedRevExpenses==0){
                                recMonthEnd.setFieldValue('custrecord_me_rel_trans_error_msg','No Expenses to Release Against');
                            }
                            if(pyNetAssetData.error!=null && pyNetAssetData.error!='' && (recMonthEnd.getFieldValue('custrecord_me_rel_trans_error_msg')==null || recMonthEnd.getFieldValue('custrecord_me_rel_trans_error_msg') =='')){
                                recMonthEnd.setFieldValue('custrecord_me_rel_trans_error_msg',pyNetAssetData.error);
                            }else{
                                recMonthEnd.setFieldValue('custrecord_cy_use_py_balance',pyNetAssetData.cyUsePyBal);
                                recMonthEnd.setFieldValue('custrecord_me_rel_py_na_rev',pyNetAssetData.pyNetAssetBal);
                                recMonthEnd.setFieldValue('custrecord_avail_rest_rev_to_rel',parseFloat(pyNetAssetData.pyNetAssetBal)-parseFloat(pyNetAssetData.cyUsePyBal));
                            }
                            recMonthEndId = nlapiSubmitRecord(recMonthEnd);
                        }
                                               
                    }
                    
                    nlapiLogExecution('DEBUG', stMethod, 'Sum of UNRESTRICTED Revenue and Expenses: ' + JSON.stringify(unRestrictedRevExpenses));
                }else {
                    nlapiLogExecution('DEBUG', stMethod, 'UNRESTRICTED Revenue Search came back empty');
                }

                // Set Restricted Revenue amount for each of the month end release transaction records
                objGetFundTrans = getRestricUnRestrictFunds(sumUnrestrictedRestrictedFunds, fund, fiscalStartDate, endDate, unrestrictedClass, restrictedClass, expenseAccountType, revenueAccountType, netAssetAccountType, 2);
                if (objGetFundTrans) {
                    intFundTransactions = objGetFundTrans.length;
                    nlapiLogExecution('DEBUG', 'Number of Results for Restricted Revenue Transactions: ' + intFundTransactions);
                    nlapiLogExecution('DEBUG', 'Object for Restricted Revenue Transactions: ' + JSON.stringify(objGetFundTrans));

                    for (v = 0; v < intFundTransactions; v += 1) {
                        nlapiLogExecution('DEBUG', 'Account Type: ' + objGetFundTrans[v].getValue('accounttype', null, 'group'));
                        if (objGetFundTrans[v].getValue('accounttype', null, 'group') === 'Income'
                            || objGetFundTrans[v].getValue('accounttype', null, 'group') === 'Equity'
                            || objGetFundTrans[v].getValue('accounttype', null, 'group') === 'Net Asset') {
                                fanoMg = objGetFundTrans[v].getValue('custrecord_fano_or_mg', 'account','group');
                                program = objGetFundTrans[v].getValue('department', null,'group');
                                project = objGetFundTrans[v].getValue('custcol_cseg_projects_cseg', null,'group');
                                restrictedRevenue = parseFloat(objGetFundTrans[v].getValue('formulacurrency', null, 'sum'));
                                objGetMonthEndReleaseTrans = getMonthEndReleaseTrans(monthEndReleaseTransSearch,fund,fanoMg,program,project);
                                nlapiLogExecution('DEBUG', 'objGetMonthEndReleaseTrans: ' + JSON.stringify(objGetMonthEndReleaseTrans));
                                nlapiLogExecution('DEBUG', 'restrictedRevenue: ' + restrictedRevenue,'fanoMg: '+fanoMg+' program: '+program+' project:'+project);
                                pyNetAssetData = getCYUsedPYBal(fund, fanoMg, program, project);
                                nlapiLogExecution('DEBUG', 'pyNetAssetData: ' + pyNetAssetData,'pyNetAssetData String: '+JSON.stringify(pyNetAssetData));
                                if(objGetMonthEndReleaseTrans){
                                    var meRelTransCount = objGetMonthEndReleaseTrans.length;
                                    var objId = objGetMonthEndReleaseTrans[0].getId();
                                    nlapiLogExecution('DEBUG', 'pyNetAssetData.error: ',pyNetAssetData.error)+' objId:'+objId;
                                    if(pyNetAssetData.error!=null && pyNetAssetData.error!='' && (objGetMonthEndReleaseTrans[0].getValue('custrecord_me_rel_trans_error_msg')==null || 
                                    objGetMonthEndReleaseTrans[0].getValue('custrecord_me_rel_trans_error_msg')=='')){
                                        nlapiSubmitField('customrecord_month_end_rel_trans',objId,'custrecord_me_rel_trans_error_msg',pyNetAssetData.error);
                                       
                                    }else{
                                        restrictedRevenue +=parseFloat(objGetMonthEndReleaseTrans[0].getValue('custrecord_me_rel_trans_restric_revenue'));
                                        nlapiLogExecution('DEBUG', 'restrictedRevenue: ' + restrictedRevenue +' objId:'+objId);
                                        nlapiSubmitField('customrecord_month_end_rel_trans',objId,'custrecord_me_rel_trans_restric_revenue',parseFloat(pyNetAssetData.pyNetAssetBal)+parseFloat(restrictedRevenue));
                                        nlapiSubmitField('customrecord_month_end_rel_trans',objId,'custrecord_cy_use_py_balance',pyNetAssetData.cyUsePyBal);
                                        nlapiSubmitField('customrecord_month_end_rel_trans',objId,'custrecord_avail_rest_rev_to_rel',parseFloat(pyNetAssetData.pyNetAssetBal)-parseFloat(pyNetAssetData.cyUsePyBal)+parseFloat(restrictedRevenue));
                                        nlapiSubmitField('customrecord_month_end_rel_trans',objId,'custrecord_me_rel_py_na_rev',pyNetAssetData.pyNetAssetBal);
                                    }
                                }else{
                                    recMonthEnd = nlapiCreateRecord('customrecord_month_end_rel_trans');
                                    recMonthEnd.setFieldValue('custrecord_month_end_rel_fund', fund);
                                    recMonthEnd.setFieldValue('custrecord_me_rel_trans_fanomg',fanoMg);
                                    recMonthEnd.setFieldValue('custrecord_me_rel_trans_program',program);
                                    recMonthEnd.setFieldValue('custrecord_month_end_rel_period', meRelperiod);
                                    recMonthEnd.setFieldValue('custrecord_me_rel_trans_proj_code',project);
                                    recMonthEnd.setFieldValue('custrecord_fund_processed', 'F');
                                    recMonthEnd.setFieldValue('custrecord_me_rel_trans_restric_revenue',parseFloat(pyNetAssetData.pyNetAssetBal)+parseFloat(restrictedRevenue));
                                    
                                    if(pyNetAssetData.error!=null && pyNetAssetData.error!=''){
                                        recMonthEnd.setFieldValue('custrecord_me_rel_trans_error_msg',pyNetAssetData.error);
                                    }else{
                                        recMonthEnd.setFieldValue('custrecord_cy_use_py_balance',pyNetAssetData.cyUsePyBal);
                                        recMonthEnd.setFieldValue('custrecord_me_rel_py_na_rev',pyNetAssetData.pyNetAssetBal);
                                        recMonthEnd.setFieldValue('custrecord_avail_rest_rev_to_rel',parseFloat(pyNetAssetData.pyNetAssetBal)-parseFloat(pyNetAssetData.cyUsePyBal)+parseFloat(restrictedRevenue));
                                    }
                                    recMonthEndId = nlapiSubmitRecord(recMonthEnd);
                                    
                                }
                               
                        }
                    }
                    nlapiLogExecution('DEBUG', stMethod, 'Sum of RESTRICTED Revenue Transactions: ' + JSON.stringify(restrictedRevenue));
                } else {
                    nlapiLogExecution('DEBUG', stMethod, 'RESTRICTED Revenue Search came back empty');
                }

                // Process Month end release transaction records for the fund where expenses >0 or expenses <0
                var searchMEFundResult = searchMonthEndTrans(monthEndReleaseTransSearch, monthEndTestMode,1,fund);
                nlapiLogExecution('DEBUG', 'searchMEFundResult', JSON.stringify(searchMEFundResult));
                if(searchMEFundResult){
                    for(it=0;it<searchMEFundResult.length;it++){
                        totalExpenseBal = parseFloat(0);
                        netAssetDtlAmt = 0;
                        var releaseMaxAmountPY = parseFloat(0);
                        var releaseMaxAmountCY = parseFloat(0);
                        var pyCarryFwd = parseFloat(0);
                        var meRelTransId = searchMEFundResult[it].getId();
                        var unrestRevExp = parseFloat(searchMEFundResult[it].getValue('custrecord_me_rel_trans_unrest_rev_exp'));
                        var availRestRevToRel = parseFloat(searchMEFundResult[it].getValue('custrecord_avail_rest_rev_to_rel'));
                        var fanoMg = searchMEFundResult[it].getValue('custrecord_me_rel_trans_fanomg');
                        var program = searchMEFundResult[it].getValue('custrecord_me_rel_trans_program');
                        var project = searchMEFundResult[it].getValue('custrecord_me_rel_trans_proj_code');
                                                                       
                        nlapiLogExecution('DEBUG', 'unrestRevExp', unrestRevExp);
                        if(unrestRevExp==0){
                            nlapiSubmitField('customrecord_month_end_rel_trans',meRelTransId,'custrecord_me_rel_trans_error_msg','No Expenses to Release Against');
                            continue;
                        }

                        //Release funds from restricted class to unrestricted when expenses greater than 0 and amount available in restricted class > expenses
                        if(unrestRevExp>0){
                            nlapiLogExecution('DEBUG', 'processing month end release Trans', 'unrestRevExp greater than 0 and available restricted revenue greater than unrest expense - rest Rev:'+availRestRevToRel+' unrest exp:'+unrestRevExp);
                            if(availRestRevToRel<0){
                                if(Math.abs(availRestRevToRel)>=unrestRevExp){
                                    totalExpenseBal = unrestRevExp;
                                }else{
                                    nlapiSubmitField('customrecord_month_end_rel_trans',meRelTransId,'custrecord_me_rel_trans_error_msg','Insufficient fund to Release Expenses for');
                                    continue;
                                }
                            }else{
                                nlapiSubmitField('customrecord_month_end_rel_trans',meRelTransId,'custrecord_me_rel_trans_error_msg','Insufficient fund to Release Expenses for');
                                continue;
                            }
                            nlapiLogExecution('DEBUG', 'processing month end release Trans', 'unrestRevExp greater than 0 and available restricted revenue greater than unrest expense - rest Rev:'+availRestRevToRel+' unrest exp:'+totalExpenseBal);
                            if(totalExpenseBal>0){
                                var count = createNetExpensesReqRel(netExpReqReleaseSvdSrch, fund, fiscalStartDate, endDate, fanoMg, program, project);
                                var netAssetDtlObj = getNetAssetDetailAmountandPYCYAcct(monthEndCYBalPYAcctSvdSrch, monthEndPYCYAcctMapSvdSrch, fund, fanoMg, program, project);
                                nlapiLogExecution('DEBUG', 'processing month end release Trans:netAssetDtlObj', JSON.stringify(netAssetDtlObj)+' totalNetAssetRestRev:'+netAssetDtlObj.netAssetReleaseAmount);
                                if(netAssetDtlObj.error!=''){
                                    nlapiSubmitField('customrecord_month_end_rel_trans',meRelTransId,'custrecord_me_rel_trans_error_msg',netAssetDtlObj.error);
                                    continue;
                                }
                                if(netAssetDtlObj.netAssetReleaseAmount<0){
                                    if(Math.abs(netAssetDtlObj.netAssetReleaseAmount)>=totalExpenseBal){
                                        releaseMaxAmountPY = totalExpenseBal;
                                    }
                                    else{
                                        releaseMaxAmountPY = Math.abs(netAssetDtlObj.netAssetReleaseAmount);
                                    }   
                                }
                                releaseMaxAmountCY = totalExpenseBal - releaseMaxAmountPY;
                                pyCarryFwd = netAssetDtlObj.netAssetReleaseAmount + releaseMaxAmountPY;
                                nlapiLogExecution('DEBUG', 'processing month end release Trans:releaseMaxAmountPY', releaseMaxAmountPY+' releaseMaxAmountCY:'+releaseMaxAmountCY);
                                if(releaseMaxAmountPY>0 && netAssetDtlObj.netAssetAcct>0){
                                    var jeInfo = {
                                        endDate: endDate,
                                        monthEndJEType: monthEndJEType,
                                        netAssetPYCYAccount: netAssetDtlObj.netAssetAcct,
                                        netAssetPYCYAccountNbr: netAssetDtlObj.netAssetAcctNbr,
                                        releaseMaxAmount: releaseMaxAmountPY,
                                        expRelAcctStream: netAssetDtlObj.netAssetAcctStream,
                                        expRelProgram: program,
                                        restrictedClass: restrictedClass,
                                        unrestrictedClass:unrestrictedClass,
                                        fundText: fundText,
                                        fund: fund,
                                        expRelProject: project,
                                        currYrUsePYBal: netAssetDtlObj.netAssetReleaseAmount
                                    };
                                    nlapiLogExecution('DEBUG', 'processing month end release Trans:jeInfo', JSON.stringify(jeInfo));
                                    var jeID = createMonthEndRelJE(jeInfo);
                                    nlapiLogExecution('DEBUG', 'processing month end release Trans:jeID', jeID);
                                }
                                
                                if(releaseMaxAmountCY>0){
                                    var cyBalObj = getCYBalanceandAccount(fundsGroupByFundSvdSrch,fund, fiscalStartDate, endDate, fanoMg, program, project);
                                    nlapiSubmitField('customrecord_month_end_rel_trans',meRelTransId,'custrecord_me_rel_trans_cy_rest_rev',cyBalObj.cyBalAmount);
                                    if(cyBalObj.cyAccount>0){
                                        var jeInfo = {
                                            endDate: endDate,
                                            monthEndJEType: monthEndJEType,
                                            netAssetPYCYAccount: cyBalObj.cyAccount,
                                            netAssetPYCYAccountNbr: cyBalObj.cyAccountNbr,
                                            releaseMaxAmount: releaseMaxAmountCY,
                                            expRelAcctStream: cyBalObj.cyAcctStream,
                                            expRelProgram: program,
                                            restrictedClass: restrictedClass,
                                            unrestrictedClass:unrestrictedClass,
                                            fundText: fundText,
                                            fund: fund,
                                            expRelProject: project,
                                        };
                                        nlapiLogExecution('DEBUG', 'processing month end release Trans:jeInfo', JSON.stringify(jeInfo));
                                        var jeID = createMonthEndRelJE(jeInfo);
                                        nlapiLogExecution('DEBUG', 'processing month end release Trans:jeID', jeID);
                                    }
                                }
                                nlapiSubmitField('customrecord_month_end_rel_trans',meRelTransId,'custrecord_fund_processed','T');
                                nlapiSubmitField('customrecord_month_end_rel_trans',meRelTransId,'custrecord_me_rel_carry_fwd_bal',pyCarryFwd);
                            }
                        }
                        if(unrestRevExp<0){
                            nlapiLogExecution('DEBUG', 'processing month end release Trans', 'unrestRevExp less than 0');
                            nlapiSubmitField('customrecord_month_end_rel_trans',meRelTransId,'custrecord_me_rel_trans_unreleased_fund',unrestRevExp);
                            var netAssetDtlObj = getNetAssetDetailAmountandPYCYAcct(monthEndCYBalPYAcctSvdSrch, monthEndPYCYAcctMapSvdSrch, fund, fanoMg, program, project);
                            nlapiLogExecution('DEBUG', 'processing month end release Trans:netAssetDtlObj', JSON.stringify(netAssetDtlObj)+' totalNetAssetRestRev:'+netAssetDtlObj.netAssetReleaseAmount);
                            if(netAssetDtlObj.error!=''){
                                nlapiSubmitField('customrecord_month_end_rel_trans',meRelTransId,'custrecord_me_rel_trans_error_msg',netAssetDtlObj.error);
                                continue;
                            }
                            
                            if(netAssetDtlObj.netAssetAcct>0){
                                //interchanging restrictedclass and unrestrictedclass as amount has to be moved from unrestricted to temporarily restricted
                                var jeInfo = {
                                    endDate: endDate,
                                    monthEndJEType: monthEndJEType,
                                    netAssetPYCYAccount: netAssetDtlObj.netAssetAcct,
                                    netAssetPYCYAccountNbr:netAssetDtlObj.netAssetAcctNbr,
                                    releaseMaxAmount: Math.abs(unrestRevExp),
                                    expRelAcctStream: netAssetDtlObj.netAssetAcctStream,
                                    expRelProgram: program,
                                    restrictedClass: unrestrictedClass,
                                    unrestrictedClass:restrictedClass,
                                    fundText: fundText,
                                    fund: fund,
                                    expRelProject: project,
                                    currYrUsePYBal: netAssetDtlObj.netAssetReleaseAmount
                                };
                                nlapiLogExecution('DEBUG', 'processing month end release Trans:jeInfo', JSON.stringify(jeInfo));
                                var jeID = createMonthEndRelJE(jeInfo);
                                nlapiLogExecution('DEBUG', 'processing month end release Trans:jeID', jeID);
                                pyCarryFwd = netAssetDtlObj.netAssetReleaseAmount - Math.abs(unrestRevExp);
                            }else{
                                var cyBalObj = getCYBalanceandAccount(fundsGroupByFundSvdSrch,fund, fiscalStartDate, endDate, fanoMg, program, project);
                                nlapiSubmitField('customrecord_month_end_rel_trans',meRelTransId,'custrecord_me_rel_trans_cy_rest_rev',cyBalObj.cyBalAmount);
                                if(cyBalObj.cyAccount>0){
                                    var jeInfo = {
                                        endDate: endDate,
                                        monthEndJEType: monthEndJEType,
                                        netAssetPYCYAccount: cyBalObj.cyAccount,
                                        netAssetPYCYAccountNbr: cyBalObj.cyAccountNbr,
                                        releaseMaxAmount: Math.abs(unrestRevExp),
                                        expRelAcctStream: cyBalObj.cyAcctStream,
                                        expRelProgram: program,
                                        restrictedClass: unrestrictedClass,
                                        unrestrictedClass:restrictedClass,
                                        fundText: fundText,
                                        fund: fund,
                                        expRelProject: project,
                                        };
                                        nlapiLogExecution('DEBUG', 'processing month end release Trans:jeInfo', JSON.stringify(jeInfo));
                                        var jeID = createMonthEndRelJE(jeInfo);
                                        nlapiLogExecution('DEBUG', 'processing month end release Trans:jeID', jeID);
                                }
                            }
                            nlapiSubmitField('customrecord_month_end_rel_trans',meRelTransId,'custrecord_fund_processed','T');
                            nlapiSubmitField('customrecord_month_end_rel_trans',meRelTransId,'custrecord_me_rel_carry_fwd_bal',pyCarryFwd);
                        }
                    }
                }
                
                }
            }
          
            if (monthEndTestMode != 'T') {
                var objGetJETrans = getGroupJETrans(monthEndRelJESvdSrch, fund, 2);
                if (objGetJETrans) {
                    var intCreateJEGroupTrans = objGetJETrans.length;
                    nlapiLogExecution('DEBUG', stMethod, 'fund: ' + fund + ', fundText: ' + fundText);
                    nlapiSubmitField('scriptdeployment', SCRIPT_ID, 'custscript_kbs_objgetjetrans', JSON.stringify(objGetJETrans));
                    nlapiLogExecution('DEBUG', stMethod, 'Number of Transactions for New JE Records: ' + intCreateJEGroupTrans);


                    try {
                        for (var z = 0; z < intCreateJEGroupTrans; z++) {
                            if (z == 0) {
                                nlapiLogExecution('DEBUG', stMethod, 'CREATING JOURNAL ENTRY');
                                var recMonthEndJE = nlapiCreateRecord('journalentry');
                                jeCreated = 'T';
                                recMonthEndJE.setFieldValue('trandate', endDate);
                                recMonthEndJE.setFieldValue('custbody_fa_je_type', monthEndJEType);
                                if (monthEndRelCreateApprovedJE == 'T') {
                                    recMonthEndJE.setFieldValue('approved', 'T');
                                } else {
                                    recMonthEndJE.setFieldValue('approved', 'F');
                                }
                            }

                            jeTransAccount = objGetJETrans[z].getValue('custrecord_mnth_end_rel_je_acct');
                            jeTransDebit = objGetJETrans[z].getValue('custrecord_mnth_end_rel_je_debit');
                            jeTransCredit = objGetJETrans[z].getValue('custrecord_mnth_end_rel_je_credit');
                            jeTransAcctStream = objGetJETrans[z].getValue('custrecord_mnth_end_rel_je_acct_stream');
                            jeTransProgram = objGetJETrans[z].getValue('custrecord_mnth_end_rel_je_program');
                            jeTransRestricClass = objGetJETrans[z].getValue('custrecord_mnth_end_rel_je_class');
                            jeTransFund = objGetJETrans[z].getValue('custrecord_mnth_end_rel_je_fund');
                            jeTransProj = objGetJETrans[z].getValue('custrecord_mnth_end_rel_je_project');

                            recMonthEndJE.selectNewLineItem('line');
                            recMonthEndJE.setCurrentLineItemValue('line', 'account', jeTransAccount);

                            if (jeTransDebit > 0) {
                                recMonthEndJE.setCurrentLineItemValue('line', 'debit', jeTransDebit);
                            } else {
                                recMonthEndJE.setCurrentLineItemValue('line', 'credit', jeTransCredit);
                            }

                            recMonthEndJE.setCurrentLineItemValue('line', 'custcol_fa_acct_stream_for_ye', jeTransAcctStream);
                            recMonthEndJE.setCurrentLineItemValue('line', 'department', jeTransProgram);
                            recMonthEndJE.setCurrentLineItemValue('line', 'class', jeTransRestricClass);
                            recMonthEndJE.setCurrentLineItemValue('line', 'location', jeTransFund);
                            recMonthEndJE.setCurrentLineItemValue('line', 'custcol_cseg_projects_cseg', jeTransProj);
                            recMonthEndJE.commitLineItem('line');
                            //						}
                        }

                        nlapiSubmitField('scriptdeployment', SCRIPT_ID, 'custscript_kbs_recmonthendje', JSON.stringify(recMonthEndJE));
                        nlapiLogExecution('DEBUG', stMethod, 'SUBMITTING JOURNAL RECORD');
                        var transMonthEndJE = nlapiSubmitRecord(recMonthEndJE);
                        //

                        if (transMonthEndJE) {
                            jeNumber = nlapiLookupField('journalentry', transMonthEndJE, 'tranid');
                            nlapiLogExecution('DEBUG', stMethod, 'Created Journal Entry Record, tranid: ' + jeNumber + ', internal id: ' + transMonthEndJE);

                            var jeUrl = nlapiResolveURL('RECORD', 'journalentry', transMonthEndJE);
                            jeHtml += 'See Journal Entry: <a href="' + jeUrl + '">' + jeNumber + '</a>';
                        }
                    } catch (e) {
                        logError(e, 'submitting journal entry');
                    }
                } else {
                    nlapiLogExecution('DEBUG', stMethod, 'objGetJETrans: ' + objGetJETrans + ', so not creating JE.');
                    jeHtml += 'No month end Journal Entry created.';
                }

                
            }
        
      //This loop is deleting unnecessary entries from Month End Release Transactions custom record
                var delMeRelTransSearch = searchMonthEndTrans(monthEndRelTransToDel, monthEndTestMode, 2, 0);
                nlapiLogExecution('DEBUG','delMeRelTransSearch:'+JSON.stringify(delMeRelTransSearch));
                for (var i = 0; i < delMeRelTransSearch.length; i += 1) {
                  checkToYield('Delete Month End Rel Trans');
                    stUpdateExpId = delMeRelTransSearch[i].getId();
                    nlapiLogExecution('DEBUG','delMeRelTransSearch:ID'+stUpdateExpId);
                    nlapiDeleteRecord('customrecord_month_end_rel_trans', stUpdateExpId);
                }

        var script_email = nlapiGetContext().getSetting('SCRIPT', 'custscript_kbs_email');


        var msg = jeHtml + '\n\n Errors: ' + finalErrorMsg + '</html>';
        var subject = 'Results of Month End Release Script';

        if (script_email) {
            nlapiSendEmail(19352, script_email, subject, msg, null, null, null, null);
            nlapiLogExecution('DEBUG', stMethod, 'Got email: ' + script_email + ', finalErrorMsg: ' + finalErrorMsg);
        } else {
            nlapiLogExecution('DEBUG', stMethod, 'Email: ' + script_email + ', is empty, so none sent.');
        }

        nlapiLogExecution('DEBUG', stMethod, '>> End Script Execution <<');
    } catch (e) {
        logError(e, stMethod);
    }
}

function getPeriodEndDate(monthEndRelTransSvdSrch, period) {
    try {
        var stMethod = 'getPeriodEndDate';
        checkToYield(stMethod);
        //	nlapiLogExecution('DEBUG', stMethod, 'Started Function: ' + stMethod);

        filters = [], columns = [];

        filters.push((new nlobjSearchFilter('internalid', null, 'is', period)));

        var search = nlapiSearchRecord(null, monthEndRelTransSvdSrch, filters, null);

        return search;
    } catch (e) {
        logError(e, 'getPeriodEndDate');
    }
}

function getFiscalYear(monthEndRelTransSvdSrch, endDate) {
    try {
        var stMethod = 'getFiscalYear';
        checkToYield(stMethod);
        //	nlapiLogExecution('DEBUG', stMethod, 'Started Function: ' + stMethod);

        filters = [], columns = [];
        filters.push((new nlobjSearchFilter('enddate', null, 'onorafter', endDate)));
        filters.push((new nlobjSearchFilter('isyear', null, 'is', 'T')));

        var search = nlapiSearchRecord(null, monthEndRelTransSvdSrch, filters, null);
        return search;
    } catch (e) {
        logError(e, 'getFiscalYear');
    }
}


function searchMonthEndTrans(monthEndRelTransSvdSrch, monthEndTestMode, fundInd, fund) {
    try {
        var stMethod = 'searchMonthEndTrans';
        checkToYield(stMethod);
        //	nlapiLogExecution('DEBUG', stMethod, 'Started Function: ' + stMethod);
        filters = [], columns = [];

        //	if(monthEndTestMode == 'T') {
        if(fundInd == '1' || fundInd == '0'){
            filters.push((new nlobjSearchFilter('custrecord_fund_processed', null, 'is', 'F')));
        }

        if(fundInd == '1'){
            filters.push(new nlobjSearchFilter('custrecord_month_end_rel_fund', null, 'anyof', fund));
            filters.push(new nlobjSearchFilter('custrecord_me_rel_trans_error_msg', null, 'isempty'));
        }
        
        var search = nlapiSearchRecord(null, monthEndRelTransSvdSrch, filters, null);
        //	}
        //	else {
        //		var search = nlapiSearchRecord(null, monthEndRelTransSvdSrch, filters, null);
        //	}

        return search;
    } catch (e) {
        logError(e, 'searchMonthEndTrans');
    }
}

function getNetAssetDetailAmountandPYCYAcct(monthEndCYBalPYAcctSvdSrch, monthEndPYCYAcctMapSvdSrch, fund, fanoMg, program, project){
    
    var netAssetDtlObj = {
        netAssetReleaseAmount:0,
        netAssetAcct:0,
        netAssetAcctNbr:0,
        netAssetAcctStream:'',
        error:''
    };

    // Get remaining net asset balance and account stream from 'FA PY and NAR Fund Balances w Seg' custom record
    var objCurrYrBal = getCurrYrBalPYAcct(monthEndCYBalPYAcctSvdSrch,fund,fanoMg,program,project);
    if(objCurrYrBal){
        nlapiLogExecution('DEBUG', 'getNetAssetDetailAmountandPYCYAcct','objCurrYrBal.length='+objCurrYrBal.length);
        if(objCurrYrBal.length>1){
            netAssetDtlObj.error="The fund's net asset is spread across multiple account streams for the Program/Project/FANOMG combination. Please handle this fund manually";
            return netAssetDtlObj;
        }
        for(var i=0;i<objCurrYrBal.length;i++){
            netAssetDtlObj.netAssetReleaseAmount = netAssetDtlObj.netAssetReleaseAmount + parseFloat(objCurrYrBal[i].getValue('custrecord_fa_remaining_bal_in_py'));
            netAssetDtlObj.netAssetAcctStream = objCurrYrBal[i].getValue('custrecord_fa_rev_stream_for_py_bal');
        }
    }

    //Get correct account for the net asset release from 'FA PY CY Account Map' custom record if remaining balance >0
    if(Math.abs(netAssetDtlObj.netAssetReleaseAmount)>0){
        var objNetAssetPYCYAccount = getNetAssetPYCYAccount(monthEndPYCYAcctMapSvdSrch, netAssetDtlObj.netAssetAcctStream, fanoMg, fund);
        if (objNetAssetPYCYAccount) {
            var intNetAssetPYCYAccount = objNetAssetPYCYAccount.length;
            nlapiLogExecution('DEBUG', 'getNetAssetDetailAmountandPYCYAcct', 'Found Current Year Mappings For Prior Year Account: ' + intNetAssetPYCYAccount);
            for (var r = 0; r < intNetAssetPYCYAccount; r++) {
                netAssetDtlObj.netAssetAcct = objNetAssetPYCYAccount[r].getValue('custrecord_fa_cy_acct_for_py_release');
                netAssetDtlObj.netAssetAcctNbr = objNetAssetPYCYAccount[r].getValue('custrecord_fa_acct_nbr_cy_acct_for_py_re');
            }
        }
    }
    nlapiLogExecution('DEBUG', 'getNetAssetDetailAmountandPYCYAcct', 'netAssetDtlObj: ' + JSON.stringify(netAssetDtlObj));
    return netAssetDtlObj;
}

function getCYBalanceandAccount(fundsGroupByFundSvdSrch,fund, fiscalStartDate, endDate, fanoMg, program, project){

    var cyBalObj={
        cyBalAmount:0,
        cyAccount:0,
        cyAccountNbr:0,
        cyAcctStream:0
    };
    var objFundTransDetail = getFundTransDetail(fundsGroupByFundSvdSrch, fund, fiscalStartDate, endDate, fanoMg, program, project);
    nlapiLogExecution('DEBUG', 'getCYBalanceandAccount', 'objFundTransDetail: ' + JSON.stringify(objFundTransDetail));
    if(objFundTransDetail){
      var objFundStr = JSON.stringify(objFundTransDetail);
        for(var i=0;i<objFundTransDetail.length;i++){
            nlapiLogExecution('DEBUG', 'getCYBalanceandAccount', 'amount:'+objFundTransDetail[i].getValue('formulacurrency')+' account:'+objFundTransDetail[i].getValue('formulatext')+' acctStream:'+objFundTransDetail[i].getValue('custrecord_fa_revenue_stream','account')
            +'acctnumber='+objFundStr.number);
            cyBalObj.cyBalAmount = cyBalObj.cyBalAmount + parseFloat(objFundTransDetail[i].getValue('formulacurrency'));
            cyBalObj.cyAccount = objFundTransDetail[i].getValue('account');
            cyBalObj.cyAcctStream = objFundTransDetail[i].getValue('custrecord_fa_revenue_stream','account');
            cyBalObj.cyAccountNbr = objFundTransDetail[i].getValue('formulatext');
        }
    }
    nlapiLogExecution('DEBUG', 'getCYBalanceandAccount', 'cyBalObj: ' + JSON.stringify(cyBalObj));
    return cyBalObj;
}

function createMonthEndRelJE(jeInfo){
    
    var recMonthEndJE = nlapiCreateRecord('customrecord_month_end_release_je');
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_date', jeInfo.endDate);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_type', jeInfo.monthEndJEType);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_acct', jeInfo.netAssetPYCYAccount);
    recMonthEndJE.setFieldValue('custrecord_je_account_number', jeInfo.netAssetPYCYAccountNbr);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_debit', jeInfo.releaseMaxAmount);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_acct_stream', jeInfo.expRelAcctStream);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_program', jeInfo.expRelProgram);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_class', jeInfo.restrictedClass);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_fund', jeInfo.fund);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_project', jeInfo.expRelProject);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_unrelease', 'F');
    if(jeInfo.currYrUsePYBal){
        recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_na_acct_bal', (jeInfo.currYrUsePYBal + jeInfo.releaseMaxAmount).toFixed(2));
    }

    var transMonthEndJE = nlapiSubmitRecord(recMonthEndJE);

    nlapiLogExecution('DEBUG', 'createMonthEndRelJE', 'Adding Credit to Monthly Detail JE Record');
    var recMonthEndJE = nlapiCreateRecord('customrecord_month_end_release_je');

    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_date', jeInfo.endDate);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_type', jeInfo.monthEndJEType);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_acct', jeInfo.netAssetPYCYAccount);
    recMonthEndJE.setFieldValue('custrecord_je_account_number', jeInfo.netAssetPYCYAccountNbr);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_credit', jeInfo.releaseMaxAmount);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_acct_stream', jeInfo.expRelAcctStream);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_program', jeInfo.expRelProgram);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_class', jeInfo.unrestrictedClass);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_fund', jeInfo.fund);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_project', jeInfo.expRelProject);
    recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_unrelease', 'F');
    if(jeInfo.currYrUsePYBal){
        recMonthEndJE.setFieldValue('custrecord_mnth_end_rel_je_na_acct_bal', (jeInfo.currYrUsePYBal + jeInfo.releaseMaxAmount).toFixed(2));
    }

    var transMonthEndJE = nlapiSubmitRecord(recMonthEndJE);
    return transMonthEndJE;
                                            
}

function getFundsTrans(filterFundTransSvdSrch, fund, fiscalStartDate, endDate, unrestrictedClass, expense, revenue) {
    try {
        var stMethod = 'getFundsTrans';
        checkToYield(stMethod);
        //	nlapiLogExecution('DEBUG', stMethod, 'Started Function: ' + stMethod);
        filters = [], columns = [];
        filters.push(new nlobjSearchFilter('location', null, 'anyof', fund));
        filters.push(new nlobjSearchFilter('trandate', null, 'within', fiscalStartDate, endDate));
        filters.push(new nlobjSearchFilter('class', null, 'anyof', unrestrictedClass));
        filters.push(new nlobjSearchFilter('accounttype', null, 'anyof', [expense, revenue]));
        //	columns.push(new nlobjSearchColumn('location', null, 'group'));
        //	columns.push(new nlobjSearchColumn('class', null, 'group'));
        columns.push(new nlobjSearchColumn('formulacurrency', null, 'sum').setFormula('nvl({debitamount},0)-nvl({creditamount},0)'));

        var search = nlapiSearchRecord(null, filterFundTransSvdSrch, filters, columns);
        return search;
    } catch (e) {
        logError(e, 'getFundsTrans');
    }
}


function getFundsTransGrouped(fundsGroupByFundSvdSrch, fund, fiscalStartDate, endDate, unrestrictedClass, expense, revenue, netAsset, getMaxFundExpense) {
    try {
        var stMethod = 'getFundsTransGrouped';
        checkToYield(stMethod);
        //	nlapiLogExecution('DEBUG', stMethod, 'Argument value for Expense: '+ expense);

        filters = [], columns = [];
        filters.push(new nlobjSearchFilter('location', null, 'anyof', fund));
        filters.push(new nlobjSearchFilter('trandate', null, 'within', fiscalStartDate, endDate));

        if (getMaxFundExpense == 0) {
            //		nlapiLogExecution('DEBUG', stMethod, 'Getting Sum of Unrestricted Revenue and Expenses');
            filters.push(new nlobjSearchFilter('class', null, 'anyof', unrestrictedClass));
            filters.push(new nlobjSearchFilter('accounttype', null, 'anyof', [expense, revenue]));
            //		columns.push(new nlobjSearchColumn('department', null, 'group'));
            columns.push(new nlobjSearchColumn('class', null, 'group'));
            columns.push(new nlobjSearchColumn('accounttype', null, 'group'));
        }

        if (getMaxFundExpense == 1) {
            //		nlapiLogExecution('DEBUG', stMethod, 'Getting Sum of Unrestricted Expenses');
            filters.push(new nlobjSearchFilter('class', null, 'anyof', unrestrictedClass));
            filters.push(new nlobjSearchFilter('accounttype', null, 'anyof', expense));
        }

        if (getMaxFundExpense == 4) {
            //		nlapiLogExecution('DEBUG', stMethod, 'Function Argument is 1');
            filters.push(new nlobjSearchFilter('class', null, 'anyof', unrestrictedClass));
            filters.push(new nlobjSearchFilter('accounttype', null, 'is', netAsset));
        }

        if (getMaxFundExpense == 3) {
            filters.push(new nlobjSearchFilter('class', null, 'anyof', unrestrictedClass));
            //		filters.push(new nlobjSearchFilter('accounttype', null, 'is', revenue));
            //		filters.push(new nlobjSearchFilter('type', null, 'anyof', 'journal'));
            columns.push(new nlobjSearchColumn('custcol_cseg_projects_cseg', null, 'group'));
            columns.push(new nlobjSearchColumn('department', null, 'group'));
            columns.push(new nlobjSearchColumn('type', null, 'group'));
        }

        //	columns.push(new nlobjSearchColumn('location', null, 'group'));
        //	columns.push(new nlobjSearchColumn('class', null, 'group'));
        //	columns.push(new nlobjSearchColumn('accounttype', null, 'group'));

        if (getMaxFundExpense != 0) {
            //		nlapiLogExecution('DEBUG', stMethod, 'Function Argument is not 0');
            columns.push(new nlobjSearchColumn('custrecord_fano_or_mg', 'account', 'group'));
            columns.push(new nlobjSearchColumn('custcol_fa_acct_stream_for_ye', null, 'group'));
            columns.push(new nlobjSearchColumn('custrecord_fa_revenue_stream', 'account', 'group'));
        }
        columns.push(new nlobjSearchColumn('formulacurrency', null, 'sum').setFormula('nvl({debitamount},0)-nvl({creditamount},0)'));
        //	columns.push(new nlobjSearchColumn('amount', null, 'sum'));

        var search = nlapiSearchRecord(null, fundsGroupByFundSvdSrch, filters, columns);
        return search;
    } catch (e) {
        logError(e, 'getFundsTransGrouped');
    }
}


function createNetExpensesReqRel(netExpReqReleaseSvdSrch, fund, fiscalStartDate, endDate, fanoMg, program, project) {
    try {
        var stMethod = 'createNetExpensesReqRel';
        checkToYield(stMethod);
        filters = [], columns = [];
        filters.push(new nlobjSearchFilter('location', null, 'anyof', fund));
        filters.push(new nlobjSearchFilter('trandate', null, 'within', fiscalStartDate, endDate));
        filters.push(new nlobjSearchFilter('custrecord_fano_or_mg', 'account', 'anyof', fanoMg));
        filters.push(new nlobjSearchFilter('department', null, 'anyof', program));
        filters.push(new nlobjSearchFilter('custcol_cseg_projects_cseg', null, 'anyof', project));

        columns.push(new nlobjSearchColumn('class', null, 'group'));
        //	columns.push(new nlobjSearchColumn('custcol_cseg_projects_cseg', null, 'group'));
        columns.push(new nlobjSearchColumn('department', null, 'group'));
        columns.push(new nlobjSearchColumn('custrecord_fano_or_mg', 'account', 'group'));
        columns.push(new nlobjSearchColumn('custcol_fa_acct_stream_for_ye', null, 'group'));
        columns.push(new nlobjSearchColumn('formulacurrency', null, 'sum').setFormula('nvl({debitamount},0)-nvl({creditamount},0)'));

        var objGetExpenseDetail = nlapiSearchRecord(null, netExpReqReleaseSvdSrch, filters, columns);
        if (objGetExpenseDetail) {
            intFundExpenseDetail = objGetExpenseDetail.length;
            nlapiLogExecution('DEBUG', stMethod, 'Number of Expense Detail Lines: ' + intFundExpenseDetail);

            for (n = 0; n < intFundExpenseDetail; n += 1) {
                var columns = objGetExpenseDetail[n].getAllColumns();
                var expColumn = columns[0];
                var expDtlRestricClass = objGetExpenseDetail[n].getValue(expColumn);
                // SH							nlapiLogExecution('DEBUG', stMethod, 'TEST COLUMN VALUE RETRIEVAL 0: [CLASS]' + expDtlRestricClass);
                var columnName = columns[0].getName();
                // SH						    nlapiLogExecution('DEBUG', stMethod, 'columnName 6: ' + columnName);

                var expColumn = columns[1];
                var expDtlProgram = objGetExpenseDetail[n].getValue(expColumn);
                // SH							nlapiLogExecution('DEBUG', stMethod, 'TEST COLUMN VALUE RETRIEVAL 1 [PROGRAM]: [CLASS]' + expDtlProgram);
                var columnName = columns[1].getName();
                // SH						    nlapiLogExecution('DEBUG', stMethod, 'columnName 1: ' + columnName);


                var estTypeCol = columns[2];
                var stEstType = objGetExpenseDetail[n].getValue(estTypeCol);
                // SH							nlapiLogExecution('DEBUG', stMethod, 'TEST COLUMN VALUE RETRIEVAL 2: ' + stEstType);
                var columnName = columns[2].getName();
                // SH						    nlapiLogExecution('DEBUG', stMethod, 'columnName 2: ' + columnName);

                var estTypeCol = columns[3];
                var stEstType = objGetExpenseDetail[n].getValue(estTypeCol);
                // SH							nlapiLogExecution('DEBUG', stMethod, 'TEST COLUMN VALUE RETRIEVAL 3: ' + stEstType);
                var columnName = columns[3].getName();
                // SH						    nlapiLogExecution('DEBUG', stMethod, 'columnName 3: ' + columnName);

                //							var estTypeCol = columns[4];
                //							var stEstType = objGetExpenseDetail[n].getValue(estTypeCol);
                //							nlapiLogExecution('DEBUG', stMethod, 'TEST COLUMN VALUE RETRIEVAL 4: [AMOUNT - IGNORE] ' + stEstType);
                //						    var columnName = columns[4].getName();
                //						    nlapiLogExecution('DEBUG', stMethod, 'columnName 4: ' + columnName);

                var expColumn = columns[5];
                var stEstType = objGetExpenseDetail[n].getValue(expColumn);
                // SH							nlapiLogExecution('DEBUG', stMethod, 'TEST COLUMN VALUE RETRIEVAL 5: [FUND]' + stEstType);
                var columnName = columns[5].getName();
                // SH						    nlapiLogExecution('DEBUG', stMethod, 'columnName 5: ' + columnName);

                var expColumn = columns[7];
                var expDtlFanoMg = objGetExpenseDetail[n].getValue(expColumn);
                // SH							nlapiLogExecution('DEBUG', stMethod, 'TEST COLUMN VALUE RETRIEVAL 7: [FANO/MG]' + expDtlFanoMg);
                var columnName = columns[7].getName();
                // SH						    nlapiLogExecution('DEBUG', stMethod, 'columnName 7: ' + columnName);


                var expColumn = columns[4];
                var expDtlAmount = objGetExpenseDetail[n].getValue(expColumn);
                // SH							nlapiLogExecution('DEBUG', stMethod, 'TEST COLUMN VALUE RETRIEVAL 9: [AMOUNT]' + expDtlAmount);
                var columnName = columns[4].getName();
                // SH						    nlapiLogExecution('DEBUG', stMethod, 'columnName 4: ' + columnName);

                var expColumn = columns[10];
                var expDtlProject = objGetExpenseDetail[n].getValue(expColumn);
                // SH							nlapiLogExecution('DEBUG', stMethod, 'TEST COLUMN VALUE RETRIEVAL 10: [PROJECT]' + expDtlProject);
                var columnName = columns[10].getName();
                // SH						    nlapiLogExecution('DEBUG', stMethod, 'columnName 10: ' + columnName);

                var expColumn = columns[11];
                var expDtlAcctStream = objGetExpenseDetail[n].getValue(expColumn);
                // SH							nlapiLogExecution('DEBUG', stMethod, 'TEST COLUMN VALUE RETRIEVAL 11: [ACCT STREAM]' + expDtlAcctStream);
                var columnName = columns[11].getName();
                
                if (expDtlAmount != 0) {
                    var recExpenseDetail = nlapiCreateRecord('customrecord_month_end_release_dtl');

                    recExpenseDetail.setFieldValue('custrecord_mnth_end_dtl_fund', fund);
                    //								recExpenseDetail.setFieldValue('custrecord_mnth_end_dtl_class', expDtlRestricClass);
                    recExpenseDetail.setFieldValue('custrecord_mnth_end_dtl_program', expDtlProgram);
                    recExpenseDetail.setFieldValue('custrecord_mnth_end_dtl_fano_mg', expDtlFanoMg);
                    recExpenseDetail.setFieldValue('custrecord_mnth_end_dtl_acct_stream', expDtlAcctStream);
                    recExpenseDetail.setFieldValue('custrecord_mnth_end_dtl_projects', expDtlProject);
                    recExpenseDetail.setFieldValue('custrecord_mnth_end_dtl_amount', expDtlAmount);
                    recExpenseDetail.setFieldValue('custrecord_mnth_end_dtl_balance', expDtlAmount);
                    // For Testing
                    recExpenseDetail.setFieldValue('custrecord_mnth_end_dtl_processed', 'F');

                    var transExpenseDetail = nlapiSubmitRecord(recExpenseDetail);
                }
            }
        }

        return n;
    } catch (e) {
        logError(e, 'createNetExpensesReqRel');
    }
}


function getFundTransDetail(fundsGroupByFundSvdSrch, fund, fiscalStartDate, endDate, fanoMg, program, project) {
    try {
        var stMethod = 'getFundsExpenseDetail';
        checkToYield(stMethod);
        filters = [], columns = [];
        filters.push(new nlobjSearchFilter('location', null, 'anyof', fund));
        filters.push(new nlobjSearchFilter('trandate', null, 'within', fiscalStartDate, endDate));
        filters.push(new nlobjSearchFilter('custrecord_fano_or_mg', 'account', 'anyof', fanoMg));
        filters.push(new nlobjSearchFilter('department', null, 'anyof', program));
        filters.push(new nlobjSearchFilter('custcol_cseg_projects_cseg', null, 'anyof', project));
                
        columns.push(new nlobjSearchColumn('location'));
        columns.push(new nlobjSearchColumn('class'));
        columns.push(new nlobjSearchColumn('account'));
       // columns.push(new nlobjSearchColumn('acctnumber','account'));
       // columns.push(new nlobjSearchColumn('acctnumber','custrecord_fa_revenue_stream'));
        columns.push(new nlobjSearchColumn('accounttype'));
        columns.push(new nlobjSearchColumn('custcol_fa_acct_stream_for_ye'));
        columns.push(new nlobjSearchColumn('formulacurrency').setFormula('nvl({debitamount},0)-nvl({creditamount},0)'));
        
        var search = nlapiSearchRecord(null, fundsGroupByFundSvdSrch, filters, columns);
        return search;
    } catch (e) {
        logError(e, 'getFundTransDetail');
    }
}


// internal id of sumUnrestrictedRestrictedFunds = '249';
function getRestricUnRestrictFunds(sumUnrestrictedRestrictedFunds, fund, fiscalStartDate, endDate, unrestrictedClass, restrictedClass, expense, revenue, netAsset, getDetailTrans) {
    var stMethod = 'getRestricUnRestrictFunds';
    var filters = [], columns = [];
    var vals = {
        sumUnrestrictedRestrictedFunds: sumUnrestrictedRestrictedFunds,
        fund: fund,
        fiscalStartDate: fiscalStartDate,
        endDate: endDate,
        unrestrictedClass: unrestrictedClass,
        restrictedClass: restrictedClass,
        expense: expense,
        revenue: revenue,
        netAsset: netAsset,
        getDetailTrans: getDetailTrans
    };
    try {
        nlapiLogExecution('DEBUG', stMethod, 'Starting function with fund: ' + JSON.stringify(vals));
        checkToYield('getRestricUnRestrictFunds');
        filters.push(new nlobjSearchFilter('location', null, 'anyof', fund));
        filters.push(new nlobjSearchFilter('trandate', null, 'within', fiscalStartDate, endDate));
        
        if (getDetailTrans == '1') {
            filters.push(new nlobjSearchFilter('class', null, 'anyof', unrestrictedClass));
            filters.push(new nlobjSearchFilter('accounttype', null, 'anyof', ['Income', 'Expense']));
        }

        if (getDetailTrans == '2') {
            filters.push(new nlobjSearchFilter('class', null, 'anyof', restrictedClass));
            filters.push(new nlobjSearchFilter('custrecord_fa_cy_py_rel_acct', 'account', 'is', 'F'));
            filters.push(new nlobjSearchFilter('accounttype', null, 'anyof', ['Income']));
        }

        if (getDetailTrans == '3') {
            filters.push(new nlobjSearchFilter('class', null, 'anyof', unrestrictedClass));
            filters.push(new nlobjSearchFilter('accounttype', null, 'anyof', 'Expense'));
        }

        columns.push(new nlobjSearchColumn('location', null, 'group'));
        columns.push(new nlobjSearchColumn('class', null, 'group'));
        columns.push(new nlobjSearchColumn('accounttype', null, 'group'));
        columns.push(new nlobjSearchColumn('custrecord_fa_cy_py_rel_acct', 'account', 'group'));
        columns.push(new nlobjSearchColumn('formulacurrency', null, 'sum').setFormula('nvl({debitamount},0)-nvl({creditamount},0)'));
        columns.push(new nlobjSearchColumn('custrecord_fano_or_mg', 'account', 'group'));
        columns.push(new nlobjSearchColumn('department', null, 'group'));
        columns.push(new nlobjSearchColumn('custcol_cseg_projects_cseg', null, 'group'));

        var search = nlapiSearchRecord(null, sumUnrestrictedRestrictedFunds, filters, columns);
        nlapiLogExecution('DEBUG', stMethod, 'Prior to calling search with filters: ' + JSON.stringify(search));
        return search;
    } catch (ex) {
        nlapiLogExecution('ERROR', ex.name, JSON.stringify(ex));
    }
}


function getRelExpDetail(monthEndRelDtlExpSvdSrch, fund, getDetailExp) {
    try {
        var stMethod = 'getRelExpDetail';
        checkToYield('getRelExpDetail');
        filters = [], columns = [];
        filters.push(new nlobjSearchFilter('custrecord_mnth_end_dtl_fund', null, 'anyof', fund));

        if (getDetailExp == 1) {
            filters.push(new nlobjSearchFilter('custrecord_mnth_end_dtl_amount', null, 'greaterthan', '0'));
        }

        if (getDetailExp == 2) {
            filters.push(new nlobjSearchFilter('custrecord_mnth_end_dtl_amount', null, 'lessthan', '0'));
        }

        var search = nlapiSearchRecord(null, monthEndRelDtlExpSvdSrch, filters, null);
        return search;
    } catch (e) {
        logError(e, 'getRelExpDetail');
    }
}


function getNetAssetPYCYAccount(monthEndPYCYAcctMapSvdSrch, netAssetAcctStream, expRelFanoMg, fund) {
    try {
        var stMethod = 'getNetAssetPYCYAccount';
        checkToYield('getNetAssetPYCYAccount');
        filters = [], columns = [];
        	filters.push(new nlobjSearchFilter('custrecord_fa_py_acct_rev_stream', null, 'anyof', netAssetAcctStream));
        	filters.push(new nlobjSearchFilter('custrecord_fa_py_cy_acct_map_fano_mg', null, 'anyof', expRelFanoMg));
        var search = nlapiSearchRecord(null, monthEndPYCYAcctMapSvdSrch, filters, null);
        return search;
    } catch (e) {
        logError(e, 'getNetAssetPYCYAccount'+'Error in fund:'+fund);
    }
}

function getRevenueCYAcct(monthEndCYAcctMapSvdSrch, revenueAcct, revenueFanoMg, expRelFanoMg) {
    try {
        var stMethod = 'getRevenueCYAcct';
        checkToYield('getRevenueCYAcct');

        filters = [], columns = [];

        filters.push(new nlobjSearchFilter('custrecord_fa_cy_revenue_acct', null, 'anyof', revenueAcct));
        //	filters.push(new nlobjSearchFilter('custrecord_fa_cy_acct_fano_mg', null, 'anyof', revenueFanoMg));

        columns.push(new nlobjSearchColumn('custrecord_fa_cy_revenue_acct'));
        columns.push(new nlobjSearchColumn('custrecord_fa_cy_acct_xref_fano_mg'));

        var search = nlapiSearchRecord(null, monthEndCYAcctMapSvdSrch, filters, columns);

        return search;
    } catch (e) {
        logError(e, 'getRevenueCYAcct');
    }
}

function getGroupJETrans(monthEndRelJESvdSrch, fund, getJEGroupInd) {
    try {
        var stMethod = 'getGroupJETrans';
        checkToYield('getGroupJETrans');
        filters = [], columns = [];
        //	filters.push(new nlobjSearchFilter('custrecord_mnth_end_rel_je_fund', null, 'anyof', fund));
        /*if (getJEGroupInd == 1) {
            filters.push(new nlobjSearchFilter('custrecord_mnth_end_rel_je_fund', null, 'anyof', fund));
            filters.push(new nlobjSearchFilter('custrecord_mnth_end_rel_je_summary', null, 'is', 'F'));
        } else {
            filters.push(new nlobjSearchFilter('custrecord_mnth_end_rel_je_summary', null, 'is', 'T'));
        }*/

        if (getJEGroupInd == 1) {
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_fund', null, 'group'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_acct', null, 'group'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_date', null, 'group'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_debit', null, 'sum'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_credit', null, 'sum'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_acct_stream', null, 'group'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_program', null, 'group'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_class', null, 'group'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_project', null, 'group'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_type', null, 'group'));
            //		columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_unrelease', null, 'group'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_na_acct_bal', null, 'sum'));
        } else {
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_fund'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_acct'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_date'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_debit'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_credit'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_acct_stream'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_program'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_class'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_project'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_type'));
            columns.push(new nlobjSearchColumn('custrecord_mnth_end_rel_je_na_acct_bal'));
        }
        var search = nlapiSearchRecord(null, monthEndRelJESvdSrch, filters, columns);
        return search;

    } catch (e) {
        logError(e, 'getGroupJETrans');
    }
}

function getCurrYrBalPYAcct(monthEndCYBalPYAcctSvdSrch, fund, fanomg, program, project) {
    var stMethod = 'getCurrYrBalPYAcct';
    var filters = [], columns = [];
    try {
        nlapiLogExecution('DEBUG', stMethod, 'Starting function with fund: ' + fund );
        checkToYield('getCurrYrBalPYAcct');

        filters.push(new nlobjSearchFilter('custrecord_fa_fund_for_py_bal', null, 'anyof', fund));
        filters.push(new nlobjSearchFilter('custrecord_fa_fano_mg_for_py_bal', null, 'anyof', fanomg));
        filters.push(new nlobjSearchFilter('custrecord_fa_py_nar_program', null, 'anyof', program));
        filters.push(new nlobjSearchFilter('custrecord_fa_py_nar_project', null, 'anyof', project));

        columns.push(new nlobjSearchColumn('custrecord_fa_fund_for_py_bal'));
        columns.push(new nlobjSearchColumn('custrecord_fa_fano_mg_for_py_bal'));
        columns.push(new nlobjSearchColumn('custrecord_fa_net_asset_acct_bal'));
        columns.push(new nlobjSearchColumn('custrecord_fa_cy_use_of_py_bal'));
        columns.push(new nlobjSearchColumn('custrecord_fa_remaining_bal_in_py'));
        columns.push(new nlobjSearchColumn('custrecord_fa_rev_stream_for_py_bal'));
        var search = nlapiSearchRecord(null, monthEndCYBalPYAcctSvdSrch, filters, columns);
        return search;
    } catch (ex) {
        nlapiLogExecution('ERROR', ex.name, JSON.stringify(ex));
    }
}

function getMonthEndReleaseTrans(monthEndReleaseTransSearch,fund, fanoMg, program, project){

    var filters = [], columns = [];
    try {
        nlapiLogExecution('DEBUG', 'Starting getMonthEndReleaseTrans with fund: ' + fund+" monthEndReleaseTransSearch:"+monthEndReleaseTransSearch );
        checkToYield('getMonthEndReleaseTrans');

        filters.push(new nlobjSearchFilter('custrecord_month_end_rel_fund', null, 'anyof', fund));
        filters.push(new nlobjSearchFilter('custrecord_me_rel_trans_fanomg', null, 'anyof', fanoMg));
        filters.push(new nlobjSearchFilter('custrecord_me_rel_trans_program', null, 'anyof', program));
        filters.push(new nlobjSearchFilter('custrecord_me_rel_trans_proj_code', null, 'anyof', project));

        columns.push(new nlobjSearchColumn('custrecord_me_rel_trans_unrest_rev_exp'));
        columns.push(new nlobjSearchColumn('custrecord_me_rel_trans_restric_revenue'));
        columns.push(new nlobjSearchColumn('custrecord_me_rel_trans_unreleased_fund'));
        columns.push(new nlobjSearchColumn('custrecord_me_rel_trans_cy_rest_rev'));
        columns.push(new nlobjSearchColumn('custrecord_me_rel_trans_error_msg'));
        var search = nlapiSearchRecord(null, monthEndReleaseTransSearch, filters, columns);
        return search;
    } catch (ex) {
        nlapiLogExecution('ERROR', ex.name, ex);
    }

}

function getCYUsedPYBal(fund, fanoMg, program, project){
    var filters = [], columns = [];
    var pyNetAssetData = {
        cyUsePyBal:0,
        pyNetAssetBal:0,
        error:''
    };
    try{
        nlapiLogExecution('DEBUG', 'Starting getCYUsedPYBal with fund: ' + fund);
        checkToYield('getCYUsedPYBal');

        filters.push(new nlobjSearchFilter('custrecord_fa_fund_for_py_bal', null, 'anyof', fund));
        filters.push(new nlobjSearchFilter('custrecord_fa_fano_mg_for_py_bal', null, 'anyof', fanoMg));
        filters.push(new nlobjSearchFilter('custrecord_fa_py_nar_program', null, 'anyof', program));
        filters.push(new nlobjSearchFilter('custrecord_fa_py_nar_project', null, 'anyof', project));

        columns.push(new nlobjSearchColumn('custrecord_fa_cy_use_of_py_bal'));
        columns.push(new nlobjSearchColumn('custrecord_fa_net_asset_acct_bal'));
        
        var search = nlapiSearchRecord('customrecord_fa_py_fund_bal_w_seg', null, filters, columns);

        if(search){
            if(search.length>1){
                pyNetAssetData.error="The fund's net asset is spread across multiple account streams for the Program/Project/FANOMG combination. Please handle this fund manually";
            }else{
                pyNetAssetData.cyUsePyBal = search[0].getValue('custrecord_fa_cy_use_of_py_bal');
                pyNetAssetData.pyNetAssetBal = search[0].getValue('custrecord_fa_net_asset_acct_bal');
            }
        }

        return pyNetAssetData;

    } catch (ex) {
        nlapiLogExecution('ERROR', ex.name, ex);
    }

}

function updatePYCYBal(netAssetPYBalSvdSrch, fund, fiscalStartDate, endDate) {
    try {
        var stMethod = 'updatePYCYBal';
        checkToYield('updatePYCYBal');
        filters = [], columns = [];
       // filters.push(new nlobjSearchFilter('trandate', null, 'within', fiscalStartDate, endDate));
        filters.push(new nlobjSearchFilter('location', null, 'anyof', fund));
        columns.push(new nlobjSearchColumn('location', null, 'group'));
        columns.push(new nlobjSearchColumn('account', null, 'group'));
        columns.push(new nlobjSearchColumn('custrecord_fundraising_stream','location','group'));
        columns.push(new nlobjSearchColumn('department',null,'group'));
        columns.push(new nlobjSearchColumn('custcol_cseg_projects_cseg',null,'group'));
        columns.push(new nlobjSearchColumn('custrecord_fano_or_mg', 'account', 'group'));
        columns.push(new nlobjSearchColumn('formulacurrency', null, 'sum').setFormula('nvl({debitamount},0)-nvl({creditamount},0)'));
        var search = nlapiSearchRecord(null, netAssetPYBalSvdSrch, filters, columns);

        return search;
    } catch (e) {
        logError(e, 'updatePYCYBal');
    }
}


function updateCYUsedBal(netAssetCYUsedBalSvdSrch, fund, fiscalStartDate, endDate) {
    try {
        checkToYield('updateCYUsedBal');
        var stMethod = 'updateCYUsedBal';
        filters = [], columns = [];
        filters.push(new nlobjSearchFilter('trandate', null, 'within', fiscalStartDate, endDate));
        filters.push(new nlobjSearchFilter('location', null, 'anyof', fund));
        columns.push(new nlobjSearchColumn('location', null, 'group'));
        columns.push(new nlobjSearchColumn('custrecord_fano_or_mg', 'account', 'group'));
        columns.push(new nlobjSearchColumn('department',null,'group'));
        columns.push(new nlobjSearchColumn('custcol_cseg_projects_cseg',null,'group'));
        columns.push(new nlobjSearchColumn('formulacurrency', null, 'sum').setFormula('nvl({debitamount},0)-nvl({creditamount},0)'));
        var search = nlapiSearchRecord(null, netAssetCYUsedBalSvdSrch, filters, columns);

        return search;
    } catch (e) {
        logError(e, 'updateCYUsedBal');
    }
}

function logError(e, funcName) {
    var errorMessage = '';
    var longMsg = '';
    if (funcName.length > 99) {
        longMsg = funcName;
    }

    if (e instanceof nlobjError) {
        nlapiLogExecution('ERROR', funcName, e.getCode() + ': ' + e.getDetails() + '. ' + longMsg);
        errorMessage = funcName + ': ' + e.getCode() + ': ' + e.getDetails() + '. ' + longMsg;
    } else {
        nlapiLogExecution('ERROR', funcName, 'Unspecified: ' + e.toString() + '. ' + longMsg);
        errorMessage = funcName + ': ' + e.toString() + '. ' + longMsg;
    }

    finalErrorMsg = finalErrorMsg + '<br>' + errorMessage;
    return errorMessage;
}

function checkToYield(name) {
    var GOV_THRESHOLD = 200; // governance threshold, script will yield when remaining usage drops below this amount
    var context = nlapiGetContext();
    var remUsage = context.getRemainingUsage();
    try {
        if (remUsage < GOV_THRESHOLD) {
            nlapiLogExecution('AUDIT', 'checkToYield', 'Yielding execution for name: ' + name + ', remaining usage: ' + remUsage);
            nlapiYieldScript();
        } else {
            // nlapiLogExecution('DEBUG', 'checkToYield', 'Not yielding for name: '+name+', remaining usage: '+remUsage);
        }
    } catch (e) {
        logError(e, 'checkToYield');
    }
}
