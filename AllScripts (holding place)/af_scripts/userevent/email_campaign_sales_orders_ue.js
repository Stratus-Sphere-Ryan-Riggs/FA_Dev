/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 * @NAmdConfig /SuiteScripts/af_scripts/ss_2_configs/email_campaign_configs.json
 */
define( [
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
		, 'underscore_add_ins'
		, 'XDate'
		, 'ns_utils'
		, 'email_campaigns_cm'
	],
	function( email
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
		, underscore_add_ins
		, XDate
		, ns_utils
		, campaign ) {
		"use strict";
		var production = true;
		var debug = false;


		function afterSubmit( context ) {
			var foo = runtime.ContextType;
			var et = runtime.EnvType;
			var ec = runtime.executionContext;
			debug && _.NSLogDebug( log, "afterSubmit", "afterSubmit" + context.type);
			const EXECUTION_CONTEXT = campaign.EXECUTION_CONTEXT;
			const USEREVENTTYPES = campaign.USEREVENTTYPES;
          
          var typeName = context[ 'newRecord' ][ 'type' ];
          var transactionAndType = campaign.prepareUserEventContextObject( context, typeName );
					var transactionRecord = transactionAndType[ 'transactionRecord' ];

			if ( context.type === USEREVENTTYPES.EDIT || context.type === USEREVENTTYPES.CREATE || context.type === USEREVENTTYPES.APPROVE || context.type === USEREVENTTYPES.DROPSHIP ) {
				/** @define prepare user event types as boolean event variables for whether to by-pass the object comparison check */
             	var isEdit = context.type === USEREVENTTYPES.EDIT;
				var isCreate = context.type === USEREVENTTYPES.CREATE;
				var isApproval = context.type === USEREVENTTYPES.APPROVE;
				var isDropShip = context.type === USEREVENTTYPES.DROPSHIP;
              var isModified = false;
              if(transactionRecord['custbody_transaction_changes']!=null){
                //commented by Thilaga for testing
                isModified = true;
              }
               
              if(transactionRecord['custbody_odyssey_offer_date']!=null && transactionRecord['custbody_odyssey_offer_date']!=''){
                return;
              }
              //Added by Elizabeth for Task 7327
              if(transactionRecord['custbody_order_status']== '3' && transactionRecord['status']=='Pending Fulfillment'){
                return;
              }
				/**
				 * @define add boolean event variables to this array for
				 * events that you wish to by pass the object comparison check
				 */
				var byPassCheck = [ isApproval ];
				/** @define use some to determine if one of the values is true, other wise the value of byPass will be false */
				var byPass = _.some( byPassCheck );
				/**
				 * @define This is the object comparison check that will...
				 * firstly see if any of the relevant statuses on the object have changed,
				 * if so will execute the module if not the module will by-passed
				 * this is necessary in order that the form can be edited and saved without
				 * triggering the module and sending emails again
				 *
				 * secondly, pass in as the last parameter the byPass variable created above that will force a bypass
				 * ignoring the sameness of both objects, if any of the items in the array are true
				 * if the array is empty the value will return false, with the implication that the module
				 * never needs a forced by-pass
				 *
				 * This is necessary in order to control when the module is executed
				 */
              //added by Thilaga for ticket #5244
              var arrCustomers = new Array;
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
				if ( campaign.isValidCampaignAction( context[ 'oldRecord' ], context[ 'newRecord' ], byPass ) ) {
					// if (true) {
					/** @define get the record typename from the transaction object  */
					
					/** @define load the email matrix into the module  */
					campaign.loadEmailNotificationMatrix();
					/**
					 * @param Context record from user event
					 * @param The transaction Type
					 */
                  //Added for Bug 6271 by Thilaga
               if(transactionRecord['custbody_order_status']=='2' && transactionRecord['status']=='Pending Fulfillment' && (transactionRecord['custbody_order_type']=='1' || transactionRecord['custbody_order_type']=='2')){
                 isApproval = true;
              }
					
					transactionRecord[ 'isApproval' ] = isApproval;

					//noinspection JSUnresolvedFunction
					/**
					 * @param transactionAndType which carries the transaction record and the transaction type and id object
					 */
					var success = campaign.processRecord( transactionAndType );

					if ( success ) {
                      
						//noinspection AmdModulesDependencies
					//	debug && campaign.LogDebugAndSendEmail( String.format( "{0} {1}", "Success", transactionAndType[ 'transactionTypeAndId' ][ 'tranid' ] ), String.format( "{0} {1}", "Success", transactionAndType[ 'transactionTypeAndId' ][ 'tranid' ] ), campaign.ERROR_EMAIL_RECIPIENT.sendEmail);

					}
					else {
						//noinspection AmdModulesDependencies
					//	debug && campaign.LogDebugAndSendEmail( String.format( "{0} {1}", "Failed", transactionAndType[ 'transactionTypeAndId' ][ 'tranid' ] ), String.format( "{0} {1}", "Failed", transactionAndType[ 'transactionTypeAndId' ][ 'tranid' ] ), campaign.ERROR_EMAIL_RECIPIENT.sendEmail );
					}
				}if( isModified && (transactionRecord['custbody_order_status']=='2') && (transactionRecord['status']=='Pending Fulfillment') ){
                  debug && _.NSLogDebug( log, "afterSubmit >> inside trans change", transactionRecord['custbody_transaction_changes']);
                 
                  /** @define load the email matrix into the module  */
					campaign.loadEmailNotificationMatrix();
					/**
					 * @param Context record from user event
					 * @param The transaction Type
					 */
					
					transactionRecord[ 'isModified' ] = isModified;
                  	transactionRecord['custbody_order_status']='13';

					//noinspection JSUnresolvedFunction
					/**
					 * @param transactionAndType which carries the transaction record and the transaction type and id object
					 */
					var success = campaign.processRecord( transactionAndType );

					if ( success ) {
               //    debug && campaign.LogDebugAndSendEmail( String.format( "{0} {1}", "Success", transactionAndType[ 'transactionTypeAndId' ][ 'tranid' ] ), String.format( "{0} {1}", "Success", transactionAndType[ 'transactionTypeAndId' ][ 'tranid' ] ), campaign.ERROR_EMAIL_RECIPIENT.sendEmail );

					}
					else {
						//noinspection AmdModulesDependencies
				//		debug && campaign.LogDebugAndSendEmail( String.format( "{0} {1}", "Failed", transactionAndType[ 'transactionTypeAndId' ][ 'tranid' ] ), String.format( "{0} {1}", "Failed", transactionAndType[ 'transactionTypeAndId' ][ 'tranid' ] ), campaign.ERROR_EMAIL_RECIPIENT.sendEmail );
					}
                  
                }
				else {
					return;
				}
			}
			else {
			//	debug && campaign.LogDebugAndSendEmail( "Campaign aborted Not Compatible", "Campaign aborted Not Compatible", campaign.ERROR_EMAIL_RECIPIENT.sendEmail );
			}
		}

		return {
			afterSubmit: afterSubmit
		};
	} );

