/**
 *@NApiVersion 2.x
 *@NScriptType scheduledscript
 * @NAmdConfig /SuiteScripts/af_scripts/ss_2_configs/email_campaign_configs.json
 */
define([
		'N/email'
		, 'N/runtime'
		, 'N/search'
		, 'N/record'
		, 'N/render'
		, 'N/file'
		, 'N/log'
		, 'N/https'
		, 'underscore'
		, 'underscore_contrib'
		, 'underscore_string'
		, 'string_functions'
		, 'underscore_add_ins'
		, 'XDate'
		, 'ns_utils'
		, 'email_campaigns_cm'
	],
	function (email
		, runtime
		, search
		, record
		, render
		, file
		, log
		, https
		, underscore
		, underscore_contrib
		, underscore_string
		, string_functions
		, underscore_add_ins
		, XDate
		, ns_utils
		, campaign) {
	    "use strict";
	    var production = false;
	    var debug = true;


	    return {
	        execute: function (context) {
	            //	var foo = runtime.ContextType;
	            //	var et = runtime.EnvType;
	            //	var ec = runtime.executionContext;
	            debug && _.NSLogDebug(log, "schedule call", "schedule call"+runtime[ 'executionContext' ]);
              var isEdit = true;
				var isCreate = false;
				var isApproval = false;
				var isDropShip = false;
	            var scriptObj = runtime.getCurrentScript();
	            log.debug("Script parameter of custscript_transID: " + scriptObj.getParameter({ name: 'custscript_transID' }));
	            //const EXECUTION_CONTEXT = campaign.EXECUTION_CONTEXT;
	            //const USEREVENTTYPES = campaign.USEREVENTTYPES;

	            //var typeName = context[ 'newRecord' ][ 'type' ];
	            var internalId = scriptObj.getParameter({ name: 'custscript_transIntID' });
	            var tranId = scriptObj.getParameter({ name: 'custscript_transID' });
	            var typeName = scriptObj.getParameter({ name: 'custscript_transType' });
              	var tranStatus = scriptObj.getParameter({ name: '	custscript_trans_status' });
	            log.debug("Script parameters: " + internalId + " " + tranId + " " + typeName+" "+tranStatus);
	            var transactionAndType = campaign.prepareScheduledScriptObject(internalId, tranId, typeName);
	            var transactionRecord = transactionAndType['transactionRecord'];





	            /** @define get the record typename from the transaction object  */

	            /** @define load the email matrix into the module  */
	            campaign.loadEmailNotificationMatrix();
	            /**
	            * @param Context record from user event
	            * @param The transaction Type
	            */
log.debug("Order status " + transactionRecord['statusRef']+" type"+transactionRecord['type']+" Custom Order Status "+transactionRecord['custbody_po_status']);
transactionRecord[ 'isApproval' ] = isApproval;
//added by Thilaga for ticket #5244
              var arrCustomers = new Array;
              if(transactionRecord['type']=='salesord'){
              var salesRecObj= record.load({
                type:'salesorder',
                id: new Number(transactionRecord['id']),
                isDynamic:true
              });
        	var numLines = salesRecObj.getLineCount({
                sublistId: 'item'
                });

              for(var i=0;i<numLines;i++){
                var colMemId=salesRecObj.getSublistValue({
                sublistId: 'item',
                  fieldId:'custcol_member_bank',
                  line:i
                });
                 arrCustomers.push(colMemId);
               }
            var arrColmembers = _.uniq(arrCustomers);
            
              transactionRecord['arrcolMembers']=arrColmembers;
              }
              
              if(tranStatus!=null && tranStatus!="" && transactionRecord['type']=='purchord'){
                transactionRecord['custbody_po_status']=tranStatus;
              }
	            //noinspection JSUnresolvedFunction
	            /**
	            * @param transactionAndType which carries the transaction record and the transaction type and id object
	            */
	            var success = campaign.processRecord(transactionAndType);

	            if (success) {

	                //noinspection AmdModulesDependencies
	                debug && campaign.LogDebugAndSendEmail(String.format("{0} {1}", "Success", transactionAndType['transactionTypeAndId']['tranid']), String.format("{0} {1}", "Success", transactionAndType['transactionTypeAndId']['tranid']), campaign.ERROR_EMAIL_RECIPIENT.sendEmail);

	            }
	            else {
	                //noinspection AmdModulesDependencies
	                debug && campaign.LogDebugAndSendEmail(String.format("{0} {1}", "Failed", transactionAndType['transactionTypeAndId']['tranid']), String.format("{0} {1}", "Failed", transactionAndType['transactionTypeAndId']['tranid']), campaign.ERROR_EMAIL_RECIPIENT.sendEmail);
	            }
	        }
	    }
	});

