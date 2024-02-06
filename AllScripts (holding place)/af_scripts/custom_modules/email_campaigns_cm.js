/**
 * email_campaigns_cm.js
 * @NApiVersion 2.x
 * @NAmdConfig /SuiteScripts/af_scripts/ss_2_configs/library_config.json
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
        , 'string_functions'
  		, 'XDate'
		, 'ns_utils'
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
        , string_functions
      	, XDate
		, ns_utils ) {
		"use strict";
		const debug = false; //TODO: CHANGE TO FALSE IN PRODUCTION
		const production = true; //TODO: CHANGE TO TRUE IN PRODUCTION
		/**
		 * @type const Matrix Transaction Status
		 * carries  keys the same as the native list itself but has different values list
		 * but is representative of the same list
		 * members will be added as needed
		 **/
		const MATRIX_TRANSACTION_STATUS = {
			SALES_ORDER_PENDING_FULFILLMENT: {
				name       : 'Sales Order:Pending fulfillment'
				, value    : '1'
				, statusRef: 'pendingFulfillment'//NetSuite property as it is on the actual transaction it self
				, status   : 'Sales Order:Pending Fulfillment'//textual value from the transaction itself
			}
		}
		/**
		 * @type const  company Recipient types
		 */
		const COMPANY_RECIPIENT = {
			DONOR   : {
				name   : 'donor'
				, text : 'Donor'
				, value: '1'
			}
			, MEMBER: {
				name   : 'member'
				, text : 'Member'
				, value: '2'
			}
		}
		/**
		 * @type const  Execution context constants for use in place of the NetSuite object variables
		 * anomalies are commented as the return value differs in spelling
		 * also these return all upper case even though other enums return lower case
		 */
		const EXECUTION_CONTEXT = {
			USER_INTERFACE       : runtime.ContextType[ 'USER_INTERFACE' ]//returns USERINTERFACE
			, WEBSERVICES        : runtime.ContextType[ 'WEBSERVICES' ]
			, WEBSTORE           : runtime.ContextType[ 'WEBSTORE' ]
			, PORTLET            : runtime.ContextType[ 'PORTLET' ]
			, SCHEDULED          : runtime.ContextType[ 'SCHEDULED' ]
			, SUITELET           : runtime.ContextType[ 'SUITELET' ]
			, CSV_IMPORT         : runtime.ContextType[ 'CSV_IMPORT' ]//returns CSVIMPORT
			, CUSTOM_MASSUPDATE  : runtime.ContextType[ 'CUSTOM_MASSUPDATE' ]//returns CUSTOMMASSUPDATE
			, WORKFLOW           : runtime.ContextType[ 'WORKFLOW' ]
			, USEREVENT          : runtime.ContextType[ 'USEREVENT' ]
			, ACTION             : runtime.ContextType[ 'ACTION' ]
			, DEBUGGER           : runtime.ContextType[ 'DEBUGGER' ]
			, CLIENT             : runtime.ContextType[ 'CLIENT' ]
			, BUNDLE_INSTALLATION: runtime.ContextType[ 'BUNDLE_INSTALLATION' ]
			, RESTLET            : runtime.ContextType[ 'RESTLET' ]
			, WEBAPPLICATION     : runtime.ContextType[ 'WEBAPPLICATION' ]
			, PAYMENTGATEWAY     : runtime.ContextType[ 'PAYMENTGATEWAY' ]
			, CONSOLRATEADJUSTOR : runtime.ContextType[ 'CONSOLRATEADJUSTOR' ]
			, PROMOTIONS         : runtime.ContextType[ 'PROMOTIONS' ]
			, CUSTOMGLLINES      : runtime.ContextType[ 'CUSTOMGLLINES' ]
			, TAX_CALCULATION    : runtime.ContextType[ 'TAX_CALCULATION' ]//returns TAXCALCULATION
			, SHIPPING_PARTNERS  : runtime.ContextType[ 'SHIPPING_PARTNERS' ]//returns SHIPPINGPARTNERS
			, EMAIL_CAPTURE      : runtime.ContextType[ 'EMAIL_CAPTURE' ]//returns EMAILCAPTURE
			, MAP_REDUCE         : runtime.ContextType[ 'MAP_REDUCE' ]//returns MAPREDUCE
		};
		/**
		 * @type const  UserEvent Types constants for use in place of the NetSuite object variables
		 */
		const USEREVENTTYPES = {
			COPY            : 'copy'
			, CREATE        : 'create'
			, VIEW          : 'view'
			, EDIT          : 'edit'
			, XEDIT         : 'xedit'
			, DELETE        : 'delete'
			, DROPSHIP      : 'dropship'
			, SPECIALORDER  : 'specialorder'
			, ORDERITEMS    : 'orderitems'
			, CANCEL        : 'cancel'
			, APPROVE       : 'approve'
			, REJECT        : 'reject'
			, PACK          : 'pack'
			, SHIP          : 'ship'
			, EDITFORECAST  : 'editforecast'
			, REASSIGN      : 'reassign'
			, MARKCOMPLETE  : 'markcomplete'
			, PRINT         : 'print'
			, EMAIL         : 'email'
			, CHANGEPASSWORD: 'changepassword'
			, TRANSFORM     : 'transform'
			, PAYBILLS      : 'paybills'
			, QUICKVIEW     : 'quickview'
		}
		/**
		 * @type const  enum to hold contact field ids and bitvalues for lookup, aggregation and iteration
		 * @define The ID value is contains the matrix column internal id information and
		 * the internal id of the contact column on the transaction
		 * @define the BITVALUE value is an associated binary integer value to facilitate the lookup and
		 * aggregation of multiple fields into an iterable data structure
		 */
		const CONTACT_IDS_AND_BITVALUES = {
			CUSTRECORD_EMAIL_DONOR_CONTACT      : {
				ID        : {
					MATRIX_COLUMN       : 'custrecord_email_donor_contact'
					, CONTACT_COLUMN_ONE: 'custbody_donorcontactcode'
					, CONTACT_COLUMN_TWO: 'custbody_donation_contact'
				}
				, BITVALUE: '1'
			}
			, CUSTRECORD_EMAIL_WAREHOUSE_CONTACT: {
				ID        : {
					MATRIX_COLUMN   : 'custrecord_email_warehouse_contact'
					, CONTACT_COLUMN: 'custbody_warehouse_contact'
				}
				, BITVALUE: '2'
			}
			, CUSTRECORD_EMAIL_RECEIPT_CONTACT  : {
				ID        : {
					MATRIX_COLUMN   : 'custrecord_email_receipt_contact'
					, CONTACT_COLUMN: 'custbody_receipt_contact'
				}
				, BITVALUE: '4'
			}
			, CUSTRECORD_EMAIL_MEMBER_CONTACT   : {
				ID        : {
					MATRIX_COLUMN   : 'custrecord_email_member_contact'
					, CONTACT_COLUMN: 'custbody_member_contact'
				}
				, BITVALUE: '8'
			}
		}
		/**
		 * @type const  constant to hold the error email sender and recipient
		 */
		const ERROR_EMAIL_RECIPIENT = {
			senderId        : 12838  //internalId of the sender
			, senderEmail   : 'tshanmugam@feedingamerica.org' //email of sender
			, recipientId   : 12838  //internalId of the recipient
			, recipientEmail: 'tshanmugam@feedingamerica.org' //email of recipient
			, sendEmail     : true //whether to send emails   //TODO: CHANGE TO TRUE IN PRODUCTION
		}
		/**
		 * @type const  variable to hold the Email Notification Matrix
		 */
		//transaction types currently scoped for this application
		/**
		 * @type const  {OPPORTUNITY: {name:string, value:string}, SALESORDER: {name:string, value:string}, PURCHASEORDER: {name:string, value:string}} enum
		 */
		const TRANSACTION_TYPE = {
			OPPORTUNITY    : {
				name   : 'opportunity'
				, value: '37'
				, text : 'Opportunity'
			}
			, SALESORDER   : {
				name   : 'salesorder'
				, value: '31'
				, text : 'Sales Order'
			}
			, PURCHASEORDER: {
				name   : 'purchaseorder'
				, value: '15'
				, text : 'Purchase Order'
			}
		};
		//customlist_order_type custom list type
		/**
		 * @type const  {PRODUCE: string, DISASTER: string, DONATION_BLUE: string, DONATION_MAROON: string, DONATION_YELLOW: string, GROCERY: string, OTHER: string, SEAFOOD: string, TRANSPORTATION: string} enum
		 */
		const ORDER_TYPE = {
			PRODUCE          : '2'
			, DISASTER       : '9'
			, DONATION_BLUE  : '6'
			, DONATION_MAROON: '5'
			, DONATION_YELLOW: '3'
			, GROCERY        : '1'
			, OTHER          : '4'
			, SEAFOOD        : '8'
			, TRANSPORTATION : '7'
		};
		//customlist_opportunity_status_list custom list type
		/**
		 * @type const  {ACKNOWLEDGED: string, ACKNOWLEDGED_DECLINED_LINES: string, ACKNOWLEDGED_CANCELLED_LINES: string, ACKNOWLEDGED_MODIFIED: string, DECLINED: string, CANCELLED: string, OFFERED: string, MODIFIED: string, TURNDOWN: string, NEW: string, ALLOCATED: string, IN_PROCESS: string} enum
		 */
		const OPPORTUNITY_STATUS = {
			ACKNOWLEDGED                  : '1'
			, ACKNOWLEDGED_DECLINED_LINES : '2'
			, ACKNOWLEDGED_CANCELLED_LINES: '3'
			, ACKNOWLEDGED_MODIFIED       : '4'
			, DECLINED                    : '5'
			, CANCELLED                   : '6'
			, OFFERED                     : '7'
			, MODIFIED                    : '8'
			, TURN_DOWN                   : '9'
			, NEW                         : '10'
			, ALLOCATED                   : '11'
			, IN_PROCESS                  : '12'
		};
		//customlist_fa_order_status custom List, this appears to be the one in use in the opportunity form
		/**
		 * @type const  {ACCEPTED: string, ACKNOWLEDGED: string, CANCELLED: string, CLOSED: string, DECLINED: string, MODIFIED: string, MODIFIED_ITEMS: string, OFFERED: string, ON_HOLD_PER_FINANCE: string, READY_FOR_TRANSPORT: string, RECEIPT_MODIFIED: string, RECEIPTED: string, RECEIVED: string, RELEASE: string, SENT_TO_TMS: string, TND_TEST_SO1: string} enum
		 */
		const ORDER_STATUS = {
			ACCEPTED             : '2'
			, ACKNOWLEDGED       : '10'
			// , CANCELLED          : '14' marked inactive
			, CANCELLED          : '3'
			, CLOSED             : '8'
			, DECLINED           : '16'
			, MODIFIED           : '13'
			, MODIFIED_ITEMS     : '12'
			, OFFERED            : '11'
			, ON_HOLD_PER_FINANCE: '9'
			, READY_FOR_TRANSPORT: '5'
			, RECEIPT_MODIFIED   : '15'
			, RECEIPTED          : '4'
			, RECEIVED           : '19'
			, RELEASE            : '1'
			, SENT_TO_TMS        : '6'
			, TND_TEST_SO1       : '7'
		};
		//customlist_po_status_list custom list type,
		// this type only shows up in the 'FA Drop Ship Purchase Order'
		// form and the 'FA Drop Ship Purchase Order' form, it however
		// does not show up in the 'FA - Finance Purchase Order' form
		/**
		 * @type const  {PO_PENDING_APPROVAL: string, PO_APPROVED: string, PO_MODIFIED: string, PO_CANCELLED: string, PO_RECEIPTED: string, PO_RECEIPT_MODIFIED: string} enum
		 */
		const PURCHASE_ORDER_STATUS = {
			PO_PENDING_APPROVAL  : '1'
			, PO_APPROVED        : '2'
			, PO_MODIFIED        : '3'
			, PO_CANCELLED       : '4'
			, PO_RECEIPTED       : '5'
			, PO_RECEIPT_MODIFIED: '6'
		};
		/**
		 * @type const  {DONOR_CONTACT: string} enum
		 */
		const CONTACT_FIELDS = {
			DONOR_CONTACT       : 'custbody_donorcontactcode'
			, MEMBER_CONTACT    : 'custbody_member_contact'
			, RECEIPT_CONTACT   : 'custbody_receipt_contact'
			, WAREHOUSE_CONTACT1: 'custbody_warehouse_contact1'
		};
		/**
		 * @type const  containing possible contact fields based on transaction type
		 */
		const CONTACT_FLAGS = {
			OPPORTUNITY     : {
				CUSTENTITY_DONATION_ACKNOWLEDGED          : "custentity_donation_acknowledged"
				, CUSTENTITY_DONATION_DECLINED            : "custentity_donation_declined"
				, CUSTENTITY_DONATION_CANCELLED           : "custentity_donation_cancelled"
				, CUSTENTITY_DONATION_ACK_LINES_CANCELLED : "custentity_donation_ack_lines_cancelled"
				, CUSTENTITY_DONATION_ACKNOWLEDGE_LINE_DEC: "custentity_donation_acknowledge_line_dec"
			}
			, SALES_ORDER   : {
				CUSTENTITY_OFFER_ACCEPTED                 : "custentity_offer_accepted"
				, CUSTENTITY_OFFER_RECEIPTED              : "custentity_offer_receipted"
				, CUSTENTITY_OFFER_RECEIPT_MODIFIED       : "custentity_offer_receipt_modified"
				, CUSTENTITY_NEW_DONATION_OFFER           : "custentity_new_donation_offer"
				, CUSTENTITY_DONATION_ACCEPTED_ORDER_CREAT: "custentity_donation_accepted_order_creat"
				, CUSTENTITY_DONATION_RECEIPT_MODIFIED    : "custentity_donation_receipt_modified"
				, CUSTENTITY_DONATION_TURNDOWN            : "custentity_donation_turndown"
				, CUSTENTITY_ORDER_CANCELLED_SALES_ORDER  : "custentity_order_cancelled_sales_order"
				, CUSTENTITY_MEMBER_RECEIPTED             : "custentity_member_receipted"
				, CUSTENTITY_OFFER_MODIFIED_ITEM_LEVEL    : "custentity_offer_modified_item_level"
				, CUSTENTITY_OFFER_MODIFIED_HEADER        : "custentity_offer_modified_header"
			}
			, PURCHASE_ORDER: {
				CUSTENTITY_PRODUCE_ORDER_CONFIRMATION     : "custentity_produce_order_confirmation"
				, CUSTENTITY_PRODUCE_ORDER_MODIFIED_SO    : "custentity_produce_order_modified_so"
				, CUSTENTITY_FA_GROCERY_ORDER_CONFIRMATION: "custentity_fa_grocery_order_confirmation"
				, CUSTENTITY_FA_PRODUCE_DELIVERY_CONFIRMAT: "custentity_fa_produce_delivery_confirmat"
				, CUSTENTITY_FA_PRODUCE_ORDER_CONFIRMATION: "custentity_fa_produce_order_confirmation"
				, CUSTENTITY_GROCERY_ORDER_CANCALLED_SALES: "custentity_grocery_order_cancalled_sales"
				, CUSTENTITY_GROCERY_ORDER_DELIVERY_CONFIR: "custentity_grocery_order_delivery_confir"
				, CUSTENTITY_GROCERY_ORDER_MODIFIED_SALES : "custentity_grocery_order_modified_sales"
				, CUSTENTITY_GROCERY_RECEIPT_REMINDER     : "custentity_grocery_receipt_reminder"
				, CUSTENTITY_NEW_GROCERY_ORDER            : "custentity_new_grocery_order"
				, CUSTENTITY_NEW_PRODUCE_ORDER            : "custentity_new_produce_order"
				, CUSTENTITY_PRODUCE_ORDER_CANCALLED_SO   : "custentity_produce_order_cancalled_so"
				, CUSTENTITY_PRODUCE_ORDER_RECEIPTED      : "custentity_produce_order_receipted"
				, CUSTENTITY_PRODUCE_RECEIPT_REMINDER     : "custentity_produce_receipt_reminder"

			}
		};
		/**
		 * @type const Email Template values and names
		 **/
		const EMAIL_TEMPLATES = {
			ACKNOWLEDGED                      : { id: '133', name: 'Y1 Donor - Acknowledged' }
			, ACKNOWLEDGED_LINES_CANCELLED    : { id: '135', name: 'Y1A Donor - Acknowledged Line Cancelled' }
			, ACKNOWLEDGED_LINES_DECLINED     : { id: '134', name: 'Y1B Donor - Acknowledged Lines Declined' }
			, Y1C_DONOR_DECLINED              : { id: '136', name: 'Y1C Donor - Declined' }
			, Y1D_DONOR_CANCELLED             : { id: '137', name: 'Y1D Donor - Cancelled' }
			, Y2_MEMBER_OFFERED               : { id: '143', name: 'Y2 Member - Offered' }
			, Y2A_MEMBER_ACCEPTED             : { id: '105', name: 'Y2A Member - Accepted' }
			, Y2B_DONOR_ACCEPTED              : { id: '138', name: 'Y2B Donor - Accepted' }
			, Y2D_MEMBER_DECLINED             : { id: '108', name: 'Y2D Member - Declined' }
			, Y2G_MEMBER_OFFER_CANCELLED      : { id: '139', name: 'Y2G Member - Offer Cancelled' }
			, Y3A_MEMBER_OFFER_HEADER_MODIFIED: { id: '142', name: 'Y3A Member - Offer Header Modified' }
			, Y3B_MEMBER_OFFER_ITEM_CANCELLED : { id: '106', name: 'Y3B Member - Offer Item Cancelled' }
			, Y3C_MEMBER_OFFER_ITEM_DECLINED  : { id: '160', name: 'Y3C Member - Offer Item Declined' }
			, Y4A_MEMBER_RECEIPT_REMINDER     : { id: '110', name: 'Y4A Member - Receipt Reminder' }
			, Y4C_MEMBER_RECEIPT              : { id: '109', name: 'Y4C Member - Receipt' }
			, Y4D_DONOR_RECEIPTED             : { id: '140', name: 'Y4D Donor - Receipted' }
			, Y4F_MEMBER_REVISED_RECEIPT      : { id: '111', name: 'Y4F Member - Revised Receipt' }
			, Y4G_DONOR_REVISED_RECEIPT       : { id: '141', name: 'Y4G Donor - Revised Receipt' }
		};
		var handleOrderTypeForMatrixItems = function( transactionRecord, transactionType, orderType ) {
			/** @define extract the Matrix Transaction Value added to the object in the prepareUserEventContextObject method  */
			var matrix_transaction_status = transactionRecord[ 'matrix_transaction_status' ];
			/** @define extract the value portion of the object */
			var matrix_transaction_status_value = matrix_transaction_status && matrix_transaction_status[ 'value' ];
			/** @define  and add it back to the transaction object as a property */
			transactionRecord[ 'matrix_transaction_status_value' ] = matrix_transaction_status_value;
			/** @define   */
			return _.filter( emailNotificationMatrix, function( item ) {
				var passOrFail = false;
				switch ( transactionType.name ) {
					case TRANSACTION_TYPE.OPPORTUNITY.name:
						passOrFail = parseInt( item[ 'custrecord_order_type' ] ) == parseInt( orderType )
							&& parseInt( item[ 'custrecord_transaction_type' ] ) == parseInt( transactionType.value )
							&& item[ 'custrecord_donation_status' ] == _.ifNothingReturnEmptyString( transactionRecord[ 'custbody_opportunity_status' ] );
						break;
					case TRANSACTION_TYPE.SALESORDER.name:
						if ( transactionRecord[ 'isApproval' ] ) {
							passOrFail = parseInt( item[ 'custrecord_order_type' ] ) == parseInt( orderType )
								&& parseInt( item[ 'custrecord_transaction_type' ] ) == parseInt( transactionType.value )
								&& item[ 'custrecord_order_status' ] == _.ifNothingReturnEmptyString( transactionRecord[ 'custbody_order_status' ] )
								&& item[ 'custrecord_matrix_transaction_status' ] == _.ifNothingReturnEmptyString( transactionRecord[ 'matrix_transaction_status_value' ] );
						}
                    else if ( transactionRecord[ 'isModified' ] ) {
                     		passOrFail = parseInt( item[ 'custrecord_order_type' ] ) == parseInt( orderType )
								&& parseInt( item[ 'custrecord_transaction_type' ] ) == parseInt( transactionType.value )
								&& item[ 'custrecord_order_status' ] == _.ifNothingReturnEmptyString( transactionRecord[ 'custbody_order_status' ] )
								&& _.ifNothingReturnEmptyString( item[ 'custrecord_matrix_transaction_status' ] ) == "";

						}
						else {
							passOrFail = parseInt( item[ 'custrecord_order_type' ] ) == parseInt( orderType )
								&& parseInt( item[ 'custrecord_transaction_type' ] ) == parseInt( transactionType.value )
								&& item[ 'custrecord_order_status' ] == _.ifNothingReturnEmptyString( transactionRecord[ 'custbody_order_status' ] )
								&& _.ifNothingReturnEmptyString( item[ 'custrecord_matrix_transaction_status' ] ) == "";
						}

						break;
					case TRANSACTION_TYPE.PURCHASEORDER.name:
						passOrFail = (item[ 'custrecord_order_type' ] == orderType
							&& item[ 'custrecord_transaction_type' ] == transactionType.value
							&& item[ 'custrecord_po_status' ] == _.ifNothingReturnEmptyString( transactionRecord[ 'custbody_po_status' ] ))
						break;
				}
				return passOrFail;
			} );
		}
		/** @define this is new consolidation of several methods to open up the matrix for variation
		 * this will make the code more generic  */
		var handleTransactionForMatrixItems = function( transactionRecord, transactionType ) {
			var orderType = transactionRecord[ 'custbody_order_type' ];
			return handleOrderTypeForMatrixItems( transactionRecord, transactionType, orderType );
		}

		/**
		 * @param transactionRecord, transactionType
		 * @returns matrixItem Item
		 * @define separates the different transaction types
		 */
		var getEmailSender = function( id ) {
			var employeeId = _.ensureInt( id );
			var foo = record;
			try {
				var employee = id && _.NSLoadRecord( record, 'employee', employeeId );
			}
			catch ( e ) {
				var foo = e;
				//noinspection AmdModulesDependencies

				var errorBody = _.isObject( e ) ? JSON.stringify( e ) : e;
                var errorSubject = "getEmailSender Suffered fatal Error {0}" + errorBody;
				//noinspection AmdModulesDependencies
				debug && LogDebugAndSendEmail( errorSubject , errorBody, true );
			}
			var employeeName = employee && _.NSGetRecordValue( employee, 'entityid' ) || '';
			var email = employee && _.NSGetRecordValue( employee, 'email' ) || '';
			//noinspection AmdModulesDependencies
			var name = employeeName.indexOf( ',' ) > -1 ? employeeName.split( ',' ).arrayTrim().reverse().join( ' ' ) : employeeName;
			return {
				email : email
				, name: name
				, id  : id
			}

		};
		/**
		 * @param company
		 * @returns collection of contacts for that company
		 */
		var getCompanyContactsList = function( company, matrixItem, sender ) {
			var filters = [
				[ "company", "anyof", company.id ]
			];
			var columns = [
				_.NSSearchCreateColumn( search, 'entityid', 'ASC' )
				, "email"
				, "company"
				, "altemail"
				, "custentity_donation_acknowledged" //opportunity
				, "custentity_donation_declined"//opportunity
				, "custentity_donation_cancelled"//opportunity
				, "custentity_donation_ack_lines_cancelled"//opportunity
				, "custentity_donation_acknowledge_line_dec"//opportunity
				, "custentity_offer_accepted"//sales order
				, "custentity_offer_receipted"//sales order
				, "custentity_offer_receipt_modified"//sales order
				, "custentity_new_donation_offer"//sales order
				, "custentity_donation_accepted_order_creat"//sales order
				, "custentity_donation_receipt_modified"//sales order
				, "custentity_donation_turndown"//sales order
				, "custentity_order_cancelled_sales_order"//sales order
				, "custentity_member_receipted"//sales order
				, "custentity_offer_modified_item_level"//sales order
				, "custentity_offer_modified_header"//sales order
				, "custentity_donation_receipt_reminder"//sales order

				, "custentity_product_po_cancelled"//sales order
				, "custentity_produce_order_confirmation"//sales order
				, "custentity_produce_order_revisions_rpo"//sales order
				, "custentity_produce_order_receipted"//sales order

				, "custentity_donor_pass_confirmation"//sales order
				, "custentity_new_produce_order"//sales order
				, "custentity_fa_produce_order_confirmation"//sales order
				, "custentity_produce_order_cancalled_so"//sales order

				, "custentity_produce_order_modified_so"//sales order
				, "custentity_fa_produce_delivery_confirmat"//sales order
				, "custentity_produce_receipt_reminder"//sales order

				, "custentity_feeding_america_grocery_po"//sales order
				, "custentity_grocery_purchase_order_cancel"//sales order
				, "custentity_grocery_order_revisiion_po"//sales order

				, "custentity_new_grocery_order"//sales order
				, "custentity_fa_grocery_order_confirmation"//sales order
				, "custentity_grocery_order_cancalled_sales"//sales order

				, "custentity_grocery_order_modified_sales"//sales order
				, "custentity_grocery_order_delivery_confir"//sales order
				, "custentity_grocery_receipt_reminder"//sales order
			];
			var searchObject = _.NSSearchCreate( search, 'contact', null, columns, filters );
			var mappedResult = _.NSSearchObjectRunMapped( searchObject, false, true );
			var contactArray = _.map( mappedResult, function( contact ) {
				// var obj = _.NSMappedObjectTruthyValues(contact);
				var obj = contact;
				obj[ 'template' ] = matrixItem[ 'custrecord_member_email_template' ];
                obj[ 'companyRecipient'] = matrixItem[ 'custrecord_company_recipient' ];
				obj[ 'isInternalEmail' ] = false;
				obj[ 'sender' ] = sender;
				return obj;
			} );
			return contactArray;
		};
		/**
		 * @params transactionType, transactionId
		 * @returns mapped transaction object
		 */
		var getTransactionRecord = function( transactionTypeAndId ) {
			//retrieve transaction record involved
			var transactionRecord = _.NSLoadRecord( record, transactionTypeAndId[ 'name' ], parseInt( transactionTypeAndId[ 'id' ] ),true );

             transactionRecord && _.functionalizeStatements( this, function() {
				transactionTypeAndId[ 'tranid' ] = _.NSGetRecordValue( transactionRecord, 'tranid' );
			} );


			//map fields on to object
			return transactionRecord && _.NSRecordMapFieldsToObject( transactionRecord );
		};
		/**
		 * @param companyType
		 * @param companyId
		 * @returns mapped company object
		 */
		var getCompany = function( companyType, companyId ) {
			var comp = companyId && record.load( {
				id    : parseInt( companyId )
				, type: companyType
			} );
			return comp && _.NSRecordMapFieldsToObject( comp );
		};
		/**
		 * @define - Search companies list for contacts and whether a given contact is assigned as the contact
		 * to receive email notices
		 */
		var sendEmail = function( contact, transactionRecord ) {

            // added by: gerald
            var compId = transactionRecord[ 'custbody_opportunity_donor' ];
            var myVendor = compId && _.NSLoadRecord( record, 'vendor', compId );
            var emailPdfAttachment = compId && _.NSGetRecordValue( myVendor, 'custentity_kbs_email_pdf_attach_vendor' );
            debug && LogDebugAndSendEmail( 'Vendor emailPdfAttachment:' , emailPdfAttachment, false );
            //

			var documentNumber = transactionRecord[ 'tranid' ];

			if ( contact[ 'isInternalEmail' ] ) {
				contact[ 'id' ] = parseInt( -5 );
			}
			/**
			 * @define create options object for merge email functionality
			 */
			var options = {
				templateId     : contact[ 'template' ]
				, entity       : {
					type: 'employee'
					, id: parseInt( contact[ 'sender' ].id.toString() ) //36609
				}
				, recipient    : {
					type: 'contact'
					, id: parseInt( contact[ 'id' ].toString() ) //32246

				}
				, supportCaseId: null
				// TODO: verify this field name
				, transactionId: parseInt( transactionRecord[ 'id' ] )//228667
				, customRecord : null

			};
			/**
			 * @define execute merge email
			 */
				//noinspection JSCheckFunctionSignatures
			var mergeResult = render.mergeEmail( options );
			var body = mergeResult.body;
			var subject = mergeResult.subject;

			try {
				if ( transactionRecord.recordType == 'opportunity' ) {
					_.NSSendEmail( email, _.ensureInt( contact[ 'sender' ].id ), contact.email, contact[ 'sender' ].email, subject, body, null, null, { transactionId: _.ensureInt( transactionRecord[ 'id' ] ) } )
					//noinspection AmdModulesDependencies
					debug && LogDebugAndSendEmail( String.format( "{0} {1} {2}", "Email sent", contact[ 'email' ], transactionRecord[ 'tranid' ] ), String.format( "{0} {1} {2}", "Email sent", contact[ 'email' ], transactionRecord[ 'tranid' ] ), false );
				}
				else {
                  debug && LogDebugAndSendEmail( String.format( "{0} {1} {2}", "Email sent", contact[ 'email' ], transactionRecord[ 'id' ] ), String.format( "{0} {1} {2}", "Email sent", contact[ 'email' ], transactionRecord[ 'id' ] ), false );
                 /*  var file = _.NSRenderTransaction( render, new Number( transactionRecord[ 'id' ] ), render.PrintMode.PDF );*/
                  _.NSLogDebug( log, 'PO internal ID', transactionRecord[ 'id' ] );
                  var transInternalId = transactionRecord[ 'id' ];
                  //Edited for ticket #5325
                  var file = render.transaction( {
			            entityId : new Number(transInternalId),
			            printMode: render.PrintMode.PDF
		            } );
                  if(transactionRecord['custbody_order_type']=='5' || transactionRecord['custbody_order_type']=='3' || transactionRecord['custbody_order_type']=='9'
                        || transactionRecord['custbody_order_type']=='8'){
                        file.name='Donation_'+transactionRecord['custbody_product_offer_no']+'.pdf';
                  }
					var files = new Array;
					files.push(file);
               //   _.NSLogDebug( log, 'file object', files );
					//noinspection AmdModulesDependencies
                 /*  email.send({
                    author: new Number( contact[ 'sender' ].id ),
                recipients: contact.email,
                replyTo:contact[ 'sender' ].email,
                subject: subject,
                body: body,

                attachments: [file]
                    });*/
                  if(
                      (transactionRecord['custbody_order_type']=='5' || transactionRecord['custbody_order_type']=='3' || transactionRecord['custbody_order_type']=='9' || transactionRecord['custbody_order_type']=='8')
                      &&
                      (contact['companyRecipient']==COMPANY_RECIPIENT.DONOR.value)

                      //gerald
                      &&
                      (!emailPdfAttachment)
                      //

                    ){
                    _.NSSendEmail( email, _.ensureInt( contact[ 'sender' ].id ), contact.email, contact[ 'sender' ].email, subject, body, null, null, { transactionId: _.ensureInt( transactionRecord[ 'id' ] ) } );
                  }else{
					_.NSSendEmail( email, _.ensureInt( contact[ 'sender' ].id ), contact.email, contact[ 'sender' ].email, subject, body, null, null, { transactionId: _.ensureInt( transactionRecord[ 'id' ] ) },[file] );
                  }
					debug && LogDebugAndSendEmail( String.format( "{0} {1} {2}", "Thi test Email sent", contact[ 'email' ], transactionRecord[ 'tranid' ] ), String.format( "{0} {1} {2} {3}", "Thi test Email sent", contact[ 'email' ], transactionRecord[ 'tranid' ], "Vendor email attach flag: " + emailPdfAttachment) ,true );
				}

			}
			catch ( e ) {
				var errorSubject = "No Email Sent";
				//noinspection AmdModulesDependencies
				var errorSubject = String.format( "No Email Sent {0} {1}", contact.email, _.isObject( e ) ? JSON.stringify( e ) : e );
				var errorBody = _.isObject( e ) ? JSON.stringify( e ) : e;
				//noinspection AmdModulesDependencies
				debug && LogDebugAndSendEmail( errorSubject, errorBody, ERROR_EMAIL_RECIPIENT.sendEmail );
			}
		};
		var sendEmails = function( recipients, transactionRecord ) {
			/**
			 * @define create unique list of emails
			 */
			recipients = _.uniq( recipients, function( recipient ) {
				return recipient.email;
			} );
			/**
			 * @define - check for valid state of pertinent variables and than iterate and send email to each one
			 */
			recipients && _.isArray( recipients ) && !!recipients.length && _.functionalizeStatements( this, function() {
				_.each( recipients, function( contact, index, list ) {
					/**
					 * @define debugging
					 */
					var s = contact[ 'sender' ];
					var c = contact;
					var t = transactionRecord;
					sendEmail( contact, transactionRecord );
				} );
			} );
			return recipients;
		};
		/**
		 * @param email of the contacts you wish to locate
		 */
		var getContactsFromEmail = function( email ) {
			var filters = [
				[ "email", "is", email ]
				, "OR"
				, [ "altemail", "is", email ]
			];

			var columns = [
				"entityid"
				, "email"
				, "phone"
				, "altphone"
				, "fax"
				, "company"
				, "altemail"
			];

			var searchObject = _.NSSearchCreate( search, 'contact', null, columns, filters );
			return _.NSSearchObjectRunMapped( searchObject, true );
		};
		/**
		 * @param email of the messages you receive
		 */
		var getMessagesByEmail = function( email ) {
			var filters = [
				[ "recipientemail", "is", email ]
				, "AND"
				, [ "isemailed", "is", "T" ]
				, [ "isincoming", "is", "F" ]
			];
			var columns = [
				"view"
				, "messagedate"
				, "subject"
				//, "message"
				, "recipient"
				, "messagetype"
				, "hasattachment"
				, "isemailed"
				, "isincoming"
				, "cc"
				, "bcc"
				, "attachments"
			];
			var searchObject = _.NSSearchCreate( search, 'contact', null, columns, filters );
			return _.NSSearchObjectRunMapped( searchObject, true );
		};
		/**
		 * @param document_number (String)
		 * @returns ex. {name   : 'opportunity', value: '37', text : 'Opportunity', id : 98787756, tranid:'DON000130969'}
		 */
		var getTransactionTypeByDocumentNumber = function( document_number ) {
			/**
			 * @define search for transaction by document number only in order to get the
			 * record type
			 */
			var filters = [ [ "numbertext", "is", document_number ] ];
			var columns = [
				'type'
				, 'tranid'
			];
			var searchObject = _.NSSearchCreate( search, 'transaction', null, columns, filters );
			var rec = _.NSSearchObjectRun( searchObject );
			//noinspection AmdModulesDependencies
			/**
			 * @define pull the first record from the set and extract the record type
			 */
			var transaction_type = (_.isArray( rec ) && _.first( rec ).recordType) || '';
			//noinspection AmdModulesDependencies
			var internalId = (_.isArray( rec ) && _.first( rec ).id) || '';
			//noinspection AmdModulesDependencies
			var tranid = (_.isArray( rec ) && _.NSGetResultValue( _.first( rec ), 'tranid' )) || '';
			/**
			 * @define use the record type to pull the TRANSACTION_TYPE from the campaign email module
			 * @param transaction_type ex. 'opportunity'
			 * @returns ex. {name   : 'opportunity', value: '37', text : 'Opportunity', id : 98787756, tranid:'DON000130969'}
			 */
			var transRecord = getTransactionTypeByName( transaction_type );
			transRecord[ 'id' ] = internalId;
			transRecord[ 'tranid' ] = tranid;
			return transRecord;
		};
		var getTransactionTypeById = function( id ) {
			//noinspection AmdModulesDependencies
			return _.find( TRANSACTION_TYPE, function( type ) {
				return type.value == id;
			} );
		};
		/**
		 * @param internal id of type ex. opportunity, salesorder, purchaseorder
		 */
		var getTransactionTypeByName = function( name ) {
			//noinspection AmdModulesDependencies
			return _.find( TRANSACTION_TYPE, function( type ) {
				return type.name == name;
			} );
		};
		/**
		 * @param external display text of type, ex "Opportunity", "Sales Order", "Purchase Order"
		 */
		var getTransactionTypeByText = function( Text ) {
			//noinspection AmdModulesDependencies
			return _.find( TRANSACTION_TYPE, function( type ) {
				return type[ 'Text' ] == Text;
			} );
		};
		var getInternalEmails = function( matrixItem, sender ) {
			var internalEmails = matrixItem[ 'custrecord_internal_email_list' ] || '';
			var internalEmailList = [];

			internalEmails && _.functionalizeStatements( this, function() {
				internalEmailList = internalEmails.split( ';' );
			} );
			/** @define filter out the malformed emails  */
			var filtered = _.filter( internalEmailList, function( email ) {
				var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				return re.test( email );
			} );

			var mapped = _.map( filtered, function( email ) {
				return {
					email            : email
					, entityid       : email
					, isValid        : true
					, isInternalEmail: true
					, template       : matrixItem[ 'custrecord_member_email_template' ]
					, sender         : sender
				}

			} );
			return mapped;
		}
		/**
		 * @define get ancillary contacts from the transaction record.
		 */
		var getContactsFromCompanies = function( matrixItem, transactionAndType, sender ) {
			var transactionRecord = transactionAndType[ 'transactionRecord' ];
			var documentNumber = transactionRecord[ 'tranid' ];
			var recipients = [];//end result output of contacts

			/** @define retrieve list of companies involved, companies have a type attribute specifying "vendor" or "customer" returns safe value */
			var companies = getCompanies( transactionRecord, matrixItem );
			//noinspection AmdModulesDependencies
			if ( _.isArray( companies ) && !!companies.length ) {
				//noinspection AmdModulesDependencies
				debug && LogDebugAndSendEmail( String.format( "{0} {1} {2}", "Company Records Found", companies.length, documentNumber ), String.format( "{0} {1} {2}", "Company Records Found", companies.length, documentNumber ), false );
			}

			_.each( companies, function( comp, index, list ) {
				var company = comp[ 'company' ];

				//noinspection AmdModulesDependencies
				debug && _.NSLogDebug( log, "Company Found", company[ 'entitytitle' ] );
				if ( matrixItem[ 'custrecord_member_email_template' ] ) {
					//noinspection AmdModulesDependencies
					debug && LogDebugAndSendEmail( String.format( "{0} {1} {2}", "Template Found", "Template Found", documentNumber ), String.format( "{0} {1} {2}", "Template Found", "Template Found", documentNumber ), false );
				}
				else {
					//noinspection AmdModulesDependencies
					debug && LogDebugAndSendEmail( String.format( "{0} {1} {2}", "No Template Found", "No Template Found", documentNumber ), String.format( "{0} {1} {2}", "No Template Found", "No Template Found", documentNumber ), false );
				}

				/** @define returns list of contacts safe values  */
					//noinspection JSUnresolvedFunction
				var companyContactList = getCompanyContactsList( company, matrixItem, sender );


				var m = matrixItem;
				//noinspection AmdModulesDependencies
				matrixItem[ 'custrecord_member_email_template' ] && _.isArray( companyContactList ) && !!companyContactList.length && _.functionalizeStatements( this, function() {
					var message = "";
					/** @define contact field to be checked for truth */
					var emailAcknowledgementField = matrixItem[ 'custrecord_contact_field_id' ];
					var isThereDesignatedContact = false;
					_.each( companyContactList, function( contact, index, list ) {
						if ( contact[ _.trim( emailAcknowledgementField ) ] && contact[ 'email' ] ) {
							isThereDesignatedContact = true;
							contact[ 'isValid' ] = true;
							recipients.push( contact );
							//noinspection AmdModulesDependencies
							debug && _.NSLogDebug( log, "Designated Contact", String.format( "Designated Contact {0}, email:{1}", contact[ 'entityid' ], contact[ 'email' ] || '' ) );
							//noinspection AmdModulesDependencies
							debug && LogDebugAndSendEmail( String.format( "Designated Contact Name: {0}, email:{1} {2}", contact[ 'entityid' ], contact[ 'email' ] || '', documentNumber ), String.format( "Designated Contact Name: {0}, email:{1} {2}", contact[ 'entityid' ], contact[ 'email' ] || '', documentNumber ), false );
						}
						else {
							//noinspection AmdModulesDependencies
							debug && LogDebugAndSendEmail( String.format( "Contact name {0}, email:{1} {2}", contact[ 'entityid' ], contact[ 'email' ] || '', documentNumber ), String.format( "Contact name {0}, email:{1} {2}", contact[ 'entityid' ], contact[ 'email' ] || '', documentNumber ), false );
						}


					} );
					if ( !isThereDesignatedContact ) {
						//noinspection AmdModulesDependencies
						debug && LogDebugAndSendEmail( String.format( "{0} {1} {2}", "No designated contact listed", "No designated contact listed", documentNumber ), String.format( "{0} {1} {2}", "No designated contact listed", "No designated contact listed", documentNumber ), false );
					}
				} );

				if ( sender ) {
					debug && _.NSLogDebug( log, "Sender found", sender.name );
					//noinspection AmdModulesDependencies
					debug && LogDebugAndSendEmail( String.format( "{0} {1} {2}", "Sender found", sender.name, documentNumber ), String.format( "{0} {1} {2}", "Sender found", sender.name, documentNumber ), false );
				}
				else {
					//noinspection AmdModulesDependencies
					debug && LogDebugAndSendEmail( String.format( "{0} {1} {2}", "No Sender Found", "No Sender Found", documentNumber ), String.format( "{0} {1} {2}", "No Sender Found", "No Sender Found", documentNumber ), false );
				}
				var foo = this;
			} );
			return recipients;
		};
		/**
		 * @param transactionRecord
		 * @param transactionType
		 * @returns collection of companies
		 */
		var getCompanies = function( transactionRecord, matrixItem ) {
			var transactionType = matrixItem[ 'custrecord_transaction_type' ];
			var companyRecipient = matrixItem[ 'custrecord_company_recipient' ];
			/**
			 * @define variable to hold the list of companies
			 */
			var companyCollection = [];
			/**
			 * @param matrix item column that holds the transaction type
			 */
			switch ( transactionType ) {
				/** @define handle Opportunity transactions */
				case TRANSACTION_TYPE.OPPORTUNITY.value:
					/** @define extract company id */
					var compId = transactionRecord[ 'custbody_opportunity_donor' ];
					/** @define pull company */
					var companyAll = getCompany( 'vendor', compId );
					/** @define push company record onto array */
					companyAll && companyCollection.push( {
						company          : _.NSMappedObjectTruthyValues( companyAll )
						, type           : 'vendor'
						, fa_type        : 'Donor'
						, transactionType: getTransactionTypeById( matrixItem[ 'custrecord_transaction_type' ] ).name
					} );
					break;
				/** @define handle Sales Order transactions */
				case TRANSACTION_TYPE.SALESORDER.value:
					switch ( companyRecipient ) {
						case COMPANY_RECIPIENT.MEMBER.value:
							/** @define extract company id */
							var companyList = transactionRecord[ 'arrcolMembers' ];
                        for(var i=0;i<companyList.length;i++){
                          var companyId = companyList[i];
							companyId && _.functionalizeStatements( this, function() {
								/** @define pull company */
								var companyAll = getCompany( 'customer', companyId );
								/** @define push company record onto array */
								companyAll && companyCollection.push( {
									company        : _.NSMappedObjectTruthyValues( companyAll )
									,
									type           : 'customer'
									,
									fa_type        : 'Member'
									,
									transactionType: getTransactionTypeById( matrixItem[ 'custrecord_transaction_type' ] ).name
								} );
							});
                          }
							break;
						case COMPANY_RECIPIENT.DONOR.value:
							/** @define extract company id */
							var companyId = transactionRecord[ 'custbody_opportunity_donor' ];
							companyId && _.functionalizeStatements( this, function() {
								/** @define pull company */
								var companyAll = getCompany( 'vendor', companyId );
								/** @define push company record onto array */
								companyAll && companyCollection.push( {
									company        : _.NSMappedObjectTruthyValues( companyAll )
									,
									type           : 'vendor'
									,
									fa_type        : 'Donor'
									,
									transactionType: getTransactionTypeById( matrixItem[ 'custrecord_transaction_type' ] ).name
								} );
							} );
							break;
					}
					break;
				/** @define handle Purchase Order transactions */
				case TRANSACTION_TYPE.PURCHASEORDER.value:
					/** @define extract company id*/
					var companyId = transactionRecord[ 'entity' ];
					companyId && _.functionalizeStatements( this, function() {
						/** @define pull company */
						var companyAll = getCompany( 'vendor', companyId );
						/** @define push company record onto array */
						companyAll && companyCollection.push( {
							company          : _.NSMappedObjectTruthyValues( companyAll )
							, type           : 'vendor'
							, fa_type        : 'Donor'
							, transactionType: getTransactionTypeById( matrixItem[ 'custrecord_transaction_type' ] ).name
						} );
					} );
					break;
				default:
					throw('Unknown Transaction Type');
					break;
			}

			return companyCollection;
		};
		/**
		 * @define get contact record from the transaction based on the field id contained in the Matrix row
		 **/
		var getContactRecord = function( transactionAndType, field ) {
			var transactionRecord = transactionAndType[ 'transactionRecord' ];
			var contactId = field[ 'BITVALUE' ] == '1' ? transactionRecord[ field[ 'ID' ][ 'CONTACT_COLUMN_ONE' ] ] || transactionRecord[ field[ 'ID' ][ 'CONTACT_COLUMN_TWO' ] ] : transactionRecord[ field[ 'ID' ][ 'CONTACT_COLUMN' ] ];
			var foo = transactionRecord[ field[ 'ID' ][ 'CONTACT_COLUMN_ONE' ] ];
			var foo1 = transactionRecord[ field[ 'ID' ][ 'CONTACT_COLUMN_TWO' ] ];
			var contact = _.isInteger( contactId ) && _.NSLoadRecord( record, 'contact', _.int( contactId ) );
			return contact && _.NSMappedObjectTruthyValues( _.NSRecordMapFieldsToObject( contact, 'contact' ) );
		}
		/**
		 * @param transactionRecord
		 * @param transactionType
		 * @returns mapped company contact record
		 */
		var getCompanyContactRecord = function( transactionRecord, matrixItem ) {

			var recipients = [];
			var template;

			var contactId;
			switch ( matrixItem[ 'custrecord_transaction_type' ] ) {
				case TRANSACTION_TYPE.OPPORTUNITY.value:
					contactId = transactionRecord[ 'custbody_donorcontactcode' ];
					template = matrixItem[ 'custrecord_member_email_template' ] || matrixItem[ 'custrecord_donor_vendor_email_template' ];
					break;
				case TRANSACTION_TYPE.SALESORDER.value:
					contactId = transactionRecord[ 'custbody_member_contact' ];
					template = matrixItem[ 'custrecord_member_email_template' ] || matrixItem[ 'custrecord_donor_vendor_email_template' ];
					break;
				/**
				 * @define there isn't any primary contact on purchase orders
				 */
				case TRANSACTION_TYPE.PURCHASEORDER.value:
					//contactId = transactionRecord['custbody_donorcontactcode'];
					break;
			}
			var contactRecord = contactId ? _.NSLoadRecord( record, 'contact', contactId ) : '';
			var contactObject;
			contactRecord && _.functionalizeStatements( this, function() {
				contactObject = _.NSRecordMapFieldsToObject( contactRecord );
				contactObject = _.NSMappedObjectTruthyValues( contactObject );
			} );

			contactObject && _.functionalizeStatements( this, function() {
				var recipient = {
					id                                      : contactId,
					template                                : template,
					transactionRecord                       : transactionRecord,
					name                                    : contactObject[ 'entityid' ],
					email                                   : contactObject[ 'email' ],
					company                                 : contactObject[ 'company' ],
					altemail                                : contactObject[ 'altemail' ],
					custentity_donation_acknowledged        : contactObject[ 'custentity_donation_acknowledged' ],
					custentity_donation_declined            : contactObject[ 'custentity_donation_declined' ],
					custentity_donation_cancelled           : contactObject[ 'custentity_donation_cancelled' ],
					custentity_donation_ack_lines_cancelled : contactObject[ 'custentity_donation_ack_lines_cancelled' ],
					custentity_donation_acknowledge_line_dec: contactObject[ 'custentity_donation_acknowledge_line_dec' ]
				}
				contactRecord = recipient;
			} );
			return contactRecord;
		};
		/**
		 * @define collect the fields from the Matrix Item based on the contactBits field
		 * this stores the ids in the lookup table as a bitfield such as 1|2|4|8=15 would indicate that
		 * the value 15 would indicate that the bits 1,2,4 and 8 were utilized
		 * You take that value and use it to look up the names of the associated fields.
		 */
		var getContactFieldsFromMatrixItem = function( matrixItem ) {
			var contactBits = matrixItem[ 'contactBits' ];
			var contactFields = [];
			_.each( CONTACT_IDS_AND_BITVALUES, function( value, key, list ) {
				((_.int( contactBits ) & _.int( value[ 'BITVALUE' ] )) == _.int( value[ 'BITVALUE' ] )) && _.functionalizeStatements( this, function() {
					/** @define add the field in the matrix that carries the field on the contact that is to be checked for truth  */
					value[ 'custrecord_contact_field_id' ] = matrixItem[ 'custrecord_contact_field_id' ];
					/** @define add to the contact fields array */
					contactFields.push( value );
				} );
			} );
			return contactFields;
		}
		/**
		 * @define determine and extract the contact records for the matrix item
		 * @param matrixItem (one row from the Matrix)
		 * @param transactionTypeAndId object that contains the transaction record and the transactionType object
		 */
		var getContactRecordsFromMatrixItem = function( matrixItem, transactionAndType, sender ) {
			var transactionRecord = transactionAndType[ 'transactionRecord' ];
			var transactionTypeAndId = transactionAndType[ 'transactionTypeAndId' ];
			var documentNumber = transactionRecord[ 'tranid' ];
			/** @define variable to hold the list of contacts */
			var listOfContacts = [];
			/** @param Retrieve a list of contact field ids marked as true from the Matrix Item
			 * this provides us with a list of the email contacts  */
			var contactFields = getContactFieldsFromMatrixItem( matrixItem );
			/**
			 * @define iterate the contact fields to know whom to email and pull contact records and check to see if an email exists
			 * mark that record as valid
			 */
			_.each( contactFields, function( field, index, list ) {
				/**
				 * @define the field object has the structure that follows
				 * field {
						ID        : {
							MATRIX_COLUMN   : 'custrecord_email_donor_contact' //column in the matrix that contains true or false to email contact
							, CONTACT_COLUMN: 'custbody_donorcontactcode' //column that contains the contacts internal id
						}
						, BITVALUE: '1' //bitvalue for indexing and aggregation of data
						, custrecord_contact_field_id:'custentity_donation_acknowledged' //flag to confirm the email to be sent
				}
				 */
				var contact = getContactRecord( transactionAndType, field );
				if ( contact && contact[ 'email' ] ) {
					contact[ 'isValid' ] = true;
					contact[ 'sender' ] = sender;
					contact[ 'isInternalEmail' ] = false;
					/** @define grab the template id from the matrix */
					contact[ 'template' ] = matrixItem[ 'custrecord_member_email_template' ];
                    contact[ 'companyRecipient'] = matrixItem[ 'custrecord_company_recipient' ];
					listOfContacts.push( contact );
				}
              debug && LogDebugAndSendEmail( "listOfContactsIsValid", contact, false );
			} );
			/** @define if list is array and has length > 0 then the list is valid  */
			var listOfContactsIsValid = _.isArray( listOfContacts ) && !!listOfContacts.length;

			if ( listOfContactsIsValid ) {
				//noinspection AmdModulesDependencies
				debug && LogDebugAndSendEmail( "Valid list of contacts found", "Valid list of contacts found", false );
			}
			else {
				debug && LogDebugAndSendEmail( "No Valid list of contacts found", "No Valid list of contacts found", false );
			}

			_.each( listOfContactsIsValid && listOfContacts, function( contact, index, list ) {
				//noinspection AmdModulesDependencies
				debug && LogDebugAndSendEmail( String.format( "{0} {1} {2}", "Contact email", contact[ 'email' ], documentNumber ), String.format( "{0} {1} {2}", "Primary Contact email", contact[ 'email' ], documentNumber ), false );
			} );

			if ( !!matrixItem[ 'custrecord_member_email_template' ] ) {
				//noinspection AmdModulesDependencies
				debug && LogDebugAndSendEmail( String.format( "{0} {1} {2}", "Contact template", matrixItem[ 'custrecord_member_email_template' ], documentNumber ), String.format( "{0} {1} {2}", "Contact template", matrixItem[ 'custrecord_member_email_template' ], documentNumber ), false );
			}
			else {
				//noinspection AmdModulesDependencies
				//debug && LogDebugAndSendEmail( String.format( "{0} {1}", "No Contact template found", documentNumber ), String.format( "{0} {1}", "No Contact template found", documentNumber ), false );
			}
			return !!matrixItem[ 'custrecord_member_email_template' ] && listOfContactsIsValid && listOfContacts;
		};
		/**
		 * @define process the matrix items one by one and send email based on the information within each row
		 * @param list of matrix items
		 * @param transaction record
		 * @param
		 */
		var processMatrixItems = function( matrixItems, transactionAndType ) {
			var transactionRecord = transactionAndType[ 'transactionRecord' ];
			var transactionTypeAndId = transactionAndType[ 'transactionTypeAndId' ];
			var documentNumber = transactionRecord[ 'tranid' ];
			var recipients = [];

			/**
			 * @define iterate the Matrix items
			 */
			_.isArray( matrixItems ) && _.each( matrixItems, function( matrixItem, index, list ) {
				/**
				 * @param matrix item
				 * returns matrix item with truthy values only
				 */
				matrixItem = _.NSMappedObjectTruthyValues( matrixItem );
				var sender = matrixItem && getEmailSender( parseInt( matrixItem[ 'custrecord_sent_from_email' ] ) );

				/**
				 * @define if matrixItem exists
				 */
				matrixItem && _.functionalizeStatements( this, function() {
					/**
					 * @define retrieve list of contacts from the Matrix Item
					 */
					/** @define packaged list of matrix contact emails in the form {
					email            : email
					, entityid       : email
					, isValid        : true
					, isInternalEmail: true
					, template       : 'Y1 Donor - Acknowledged'
					, sender         : sender
					} */
					var contactRecords = getContactRecordsFromMatrixItem( matrixItem, transactionAndType, sender );
					/**
					 * @define if viable add the contact records to recipients array
					 */
					_.isArray( contactRecords ) && !!contactRecords.length && _.functionalizeStatements( this, function() {
						recipients = _.cat( recipients, contactRecords );
					} );
					/**
					 * @define - Get Ancillary contacts from connected companies that are marked to receive emails
					 * to receive email notices
					 */
					/** @define packaged list of connected companies emails in the form {
					email            : email
					, entityid       : email
					, isValid        : true
					, isInternalEmail: true
					, template       : 'Y1 Donor - Acknowledged'
					, sender         : sender
					} */
					var ancillaryContacts = getContactsFromCompanies( matrixItem, transactionAndType, sender );

					/**
					 * @define if viable add the contact records to recipients array
					 */
					_.isArray( ancillaryContacts ) && !!ancillaryContacts.length && _.functionalizeStatements( this, function() {
						recipients = _.cat( recipients, ancillaryContacts );
					} );

					/** @define packaged list of internal emails in the form {
					email            : email
					, entityid       : email
					, isValid        : true
					, isInternalEmail: true
					, template       : 'Y1 Donor - Acknowledged'
					, sender         : sender
					} */
					var internalEmailRecipients = getInternalEmails( matrixItem, sender );

					/**
					 * @define if viable add the contact records to recipients array
					 */
					_.isArray( internalEmailRecipients ) && !!internalEmailRecipients.length && _.functionalizeStatements( this, function() {
						recipients = _.cat( recipients, internalEmailRecipients );
					} );


					var foo = this;
				} );
				var r = recipients;
				!!!matrixItem && _.functionalizeStatements( this, function() {
					addMessage( "No Matrix Item Match was found" );
					//noinspection AmdModulesDependencies
					debug && LogDebugAndSendEmail( String.format( "No Matrix Item Match was found {0}", documentNumber ), String.format( "No Matrix Item Match was found {0}", documentNumber ), ERROR_EMAIL_RECIPIENT.sendEmail );
				} );
			} );
			/**
			 * @define create unique list of emails and iterate though those and send emails to each
			 */
			sendEmails( recipients, transactionRecord );
		};
		/**
		 * @define get list of Matrix Items
		 * @param transaction record
		 * @param one single element of the transaction type enum
		 * @return list of Matrix Items
		 */
		var getEmailNotificationMatrixItems = function( transactionRecord, transactionType ) {
			var matrixItems = {};
			matrixItems = handleTransactionForMatrixItems( transactionRecord, transactionType ) || [];
			// switch ( transactionType.name ) {
			// 	case TRANSACTION_TYPE.OPPORTUNITY.name:
			// 		matrixItems = handleOpportunity( transactionRecord );
			// 		break;
			// 	case TRANSACTION_TYPE.SALESORDER.name:
			// 		matrixItems = handleSalesOrder( transactionRecord );
			// 		break;
			// 	case TRANSACTION_TYPE.PURCHASEORDER.name:
			// 		matrixItems = handlePurchaseOrder( transactionRecord );
			// 		break;
			// 	default:
			// 		throw('Unknown Transaction Type "handle transaction type method');
			// 		break;
			// }
			return matrixItems;
		};
		/**
		 * @define Log Debug statement and send email to the send error email recipient
		 * @param title of message
		 * @param message
		 * @param true false as to whether to send an email also
		 */
      var LogDebugAndSendEmail = function( title, message, sendEmail ) {
			//noinspection AmdModulesDependencies
			_.NSLogDebug( log, title, message );
			sendEmail && _.functionalizeStatements( this, function() {
				//noinspection AmdModulesDependencies
				var subject =  title ;
				//noinspection JSUnresolvedFunction, JSCheckFunctionSignatures, SpellCheckingInspection
				email.send( {
					author    : ERROR_EMAIL_RECIPIENT.senderId,
					recipients: ERROR_EMAIL_RECIPIENT.recipientEmail,
					subject   : subject,
					body      : message
				} );

			} );

		}

		var LogDebugAndSendEmailwithAttach = function( title, message, sendEmail,attachment ) {
			//noinspection AmdModulesDependencies
			_.NSLogDebug( log, title, message );
			sendEmail && _.functionalizeStatements( this, function() {
				//noinspection AmdModulesDependencies
				var subject =  title ;
				//noinspection JSUnresolvedFunction, JSCheckFunctionSignatures, SpellCheckingInspection
				email.send( {
					author    : ERROR_EMAIL_RECIPIENT.senderId,
					recipients: ERROR_EMAIL_RECIPIENT.recipientEmail,
					subject   : subject,
					body      : message,
                    attachments: [attachment]
				} );

			} );

		}
		/**
		 * @param transactionRecord after preparation from the transaction record portion of the output from prepareUserEventContextObject
		 * @param transactionTypeAndId object in the form of {
				name   : 'opportunity' //netsuite internalid for transaction type
				, value: '37' //netsuite dropdown id value for type
				, text : 'Opportunity' //display transaction type name
				, id : transaction internalid
				, tranid : DON000130969
			}
		 * made from a find search on the const TRANSACTION_TYPE (type)
		 * @return "success" or "failure"
		 */
		var processRecord = function( transactionAndType ) {
			var success = true;
			var transactionRecord = transactionAndType[ 'transactionRecord' ];
			var transactionTypeAndId = transactionAndType[ 'transactionTypeAndId' ];
			try {
				/** @define Grab the execution context that the script calling the module is running in */
				var executionContext = runtime[ 'executionContext' ];
				/** @define check the context for acceptable application, ad throw fault if not */
				if ( executionContext !== EXECUTION_CONTEXT.USER_INTERFACE && executionContext !== EXECUTION_CONTEXT.WEBSERVICES && executionContext !== EXECUTION_CONTEXT.USEREVENT &&  executionContext !== EXECUTION_CONTEXT.SCHEDULED && executionContext !== EXECUTION_CONTEXT.CSV_IMPORT) {
                  //commented for testing
					throw('Unknown Execution Context');
				}

				var documentNumber = transactionRecord[ 'tranid' ]
				//noinspection AmdModulesDependencies
				debug && LogDebugAndSendEmail( String.format( "{0} {1} {2}", "Document Number", documentNumber, documentNumber ), String.format( "{0} {1} {2}", "Document Number", documentNumber, documentNumber ), true );
				/**
				 * @define if transactionRecord exists then
				 */
				transactionRecord && _.functionalizeStatements( this, function() {
					var transactionRecordTruthyValues = _.NSMappedObjectTruthyValues( transactionRecord );
					/**
					 * @param transactionObject truthy values,
					 * @param transactionType
					 */
					var matrixItems = getEmailNotificationMatrixItems( transactionRecordTruthyValues, transactionTypeAndId );
					/**
					 * @define transactionTypeAndId object in the form of {
						name   : 'opportunity' //netsuite internalid for transaction type
						, value: '37' //netsuite dropdown id value for type
						, text : 'Opportunity' //display transaction type name
						, id : transaction internalid
						, tranid : DON000130969 // document number
					}
					 * made from a find search on the const TRANSACTION_TYPE (type)
					 * @return "success" or "failure"
					 */
					/** @define interrogate matrix items */
					processMatrixItems( matrixItems, transactionAndType );
				} );
			}
			catch ( e ) {
				var foo = e;
				//noinspection AmdModulesDependencies
				var errorSubject = String.format( "Process Email Suffered fatal Error {0}", _.isObject( e ) ? JSON.stringify( e ) : e );
				var errorBody = _.isObject( e ) ? JSON.stringify( e ) : e;
                var errorSubject = "Process Email Suffered fatal Error " + errorBody;
				//noinspection AmdModulesDependencies
				debug && LogDebugAndSendEmail( String.format( "{0} {1}", errorSubject, documentNumber ), errorBody, ERROR_EMAIL_RECIPIENT.sendEmail );
				success = false;
			}
			return success;
		}
		var isValidCampaignAction = function( previousTransaction, newTransaction, bypass ) {
			bypass = !!bypass;
			if ( previousTransaction && newTransaction && !bypass ) {
				var prevTransTransactionType = _.NSGetRecordValue( previousTransaction, 'type' );
				var newTransTransactionType = _.NSGetRecordValue( newTransaction, 'type' );
				var prevTransOrderType = _.NSGetRecordValue( previousTransaction, 'custbody_order_type' );
				var newTransOrderType = _.NSGetRecordValue( newTransaction, 'custbody_order_type' );
				var prevTransOpportunityStatus = _.NSGetRecordValue( previousTransaction, 'custbody_opportunity_status' );
				var newTransOpportunityStatus = _.NSGetRecordValue( newTransaction, 'custbody_opportunity_status' );
				var prevTransOrderStatus = _.NSGetRecordValue( previousTransaction, 'custbody_order_status' );
				var newTransOrderStatus = _.NSGetRecordValue( newTransaction, 'custbody_order_status' );
				var prevTransPurchaseOrderStatus = _.NSGetRecordValue( previousTransaction, 'custbody_po_status' );
				var newTransPurchaseOrderStatus = _.NSGetRecordValue( newTransaction, 'custbody_po_status' );
				var odyofferDate = _.NSGetRecordValue( newTransaction, 'custbody_odyssey_offer_date' );
              if(odyofferDate!=null && odyofferDate!=''){
                return false;
              }
              if (prevTransOrderStatus != '9') {
				return !(prevTransTransactionType == newTransTransactionType &&
					prevTransOrderType == newTransOrderType &&
					prevTransOpportunityStatus == newTransOpportunityStatus &&
					prevTransOrderStatus == newTransOrderStatus &&
					prevTransPurchaseOrderStatus == newTransPurchaseOrderStatus );
              }
			}
			else if ( bypass ) {
              var odyofferDate = _.NSGetRecordValue( newTransaction, 'custbody_odyssey_offer_date' );
              if(odyofferDate!=null && odyofferDate!=''){
                return false;
              }
				return true;
			}
			else {
				return !!newTransaction
			}
			/** @define debug block */
			// var one = prevTransTransactionType == newTransTransactionType;
			// var two = prevTransOrderType == newTransOrderType;
			// var three = prevTransOpportunityStatus == newTransOpportunityStatus;
			// var four = prevTransOrderStatus == newTransOrderStatus;
			// var five = prevTransPurchaseOrderStatus == newTransPurchaseOrderStatus;
		}
		/**
		 * @param UserEvent Prepare Transaction record Context object for use in the Campaign Module
		 * @returns {
				transactionRecord     : transactionRecord
				, transactionTypeAndId: transactionTypeAndId
			};
		 */
		var prepareUserEventContextObject = function( context, typeName ) {
			var newRecord = context[ 'newRecord' ];
			/**
			 * @param typeName ex. opportunity
			 * @returns ex. {name   : 'opportunity', value: '37', text : 'Opportunity'}
			 */
			var transactionTypeAndId = getTransactionTypeByName( typeName );
			/** @define add internal id to transaction type object  */
			transactionTypeAndId[ 'id' ] = newRecord[ 'id' ];
			/**
			 * @define add document number to object
			 * object structure is now ex. {name   : 'opportunity', value: '37', text : 'Opportunity', id : 98787756, tranid:'DON000130969'}
			 */
			transactionTypeAndId[ 'tranid' ] = newRecord[ 'tranid' ];
			/**
			 * @define get the associated transaction record using the transactionId and the transactionType
			 * @returns Transaction Record object with all fields mapped
			 */
			var transactionRecord = getTransactionRecord( transactionTypeAndId );
			transactionRecord[ 'recordType' ] = typeName;

			/**
			 * @define evaluate transaction status (statusRef) of transaction and
			 * add property to translate to equivalent Matrix Transaction Property
			 */
			var statusRef = transactionRecord[ 'statusRef' ];

			var matrix_transaction_status = _.find( MATRIX_TRANSACTION_STATUS, function( item ) {
				return item[ 'statusRef' ] === statusRef;
			} );

			transactionRecord[ 'matrix_transaction_status' ] = matrix_transaction_status;

			/**
			 * @param transaction Record from above and returns object with only truthy values
			 */
			var transactionRecordTruthyValues = _.NSMappedObjectTruthyValues( transactionRecord );

			return {
				transactionRecord     : transactionRecordTruthyValues
				, transactionTypeAndId: transactionTypeAndId
			};
		}

        //added by Thilaga
        var prepareScheduledScriptObject = function( internalid, tranid, typeName ) {
			//var newRecord = context[ 'newRecord' ];
			/**
			 * @param typeName ex. opportunity
			 * @returns ex. {name   : 'opportunity', value: '37', text : 'Opportunity'}
			 */
			var transactionTypeAndId = getTransactionTypeByName( typeName );
			/** @define add internal id to transaction type object  */
			transactionTypeAndId[ 'id' ] = internalid;
			/**
			 * @define add document number to object
			 * object structure is now ex. {name   : 'opportunity', value: '37', text : 'Opportunity', id : 98787756, tranid:'DON000130969'}
			 */
			transactionTypeAndId[ 'tranid' ] = tranid;
			/**
			 * @define get the associated transaction record using the transactionId and the transactionType
			 * @returns Transaction Record object with all fields mapped
			 */
			var transactionRecord = getTransactionRecord( transactionTypeAndId );
			transactionRecord[ 'recordType' ] = typeName;

			/**
			 * @define evaluate transaction status (statusRef) of transaction and
			 * add property to translate to equivalent Matrix Transaction Property
			 */
			var statusRef = transactionRecord[ 'statusRef' ];

			var matrix_transaction_status = _.find( MATRIX_TRANSACTION_STATUS, function( item ) {
				return item[ 'statusRef' ] === statusRef;
			} );

			transactionRecord[ 'matrix_transaction_status' ] = matrix_transaction_status;

			/**
			 * @param transaction Record from above and returns object with only truthy values
			 */
			var transactionRecordTruthyValues = _.NSMappedObjectTruthyValues( transactionRecord );
			return {
				transactionRecord     : transactionRecordTruthyValues
				, transactionTypeAndId: transactionTypeAndId
			};
		}
		var emailNotificationMatrixForTimedEmails = [];
		var getEmailNotificationMatrixForTimedEmails = function() {
			return _.filter( emailNotificationMatrix, function( item ) {
				return !!item[ 'custrecord_receipt_reminder_type' ];
			} )
		}
		/** @define variable to hold the entire email notification matrix, it is loaded when the module is loaded */
		var emailNotificationMatrix = [];
		/**
		 * @returns the complete Email Notification Collection
		 */
		var loadEmailNotificationMatrix = function() {
			var columns = [
				"internalId"
				, "isinactive"
				, "custrecord_transaction_type"//Opportunity/Sales  Order/ Purchase Order
				, "custrecord_member_email_template"//member email template
				, "custrecord_donation_status"//opportunity status on opportunities - Acknowledged -  Acknowledged - Modified
				, "custrecord_order_status"//order status on sales orders - Accepted
				, "custrecord_po_status" //PO Status on purchase orders PO Approved
				, "custrecord_order_type" //Order Type on all types - Donation Yellow / Donation Maroon /Grocery / other / product / transportation / seafood
				, "custrecord_donor_vendor_email_template" //donor vendor email template
				, "custrecord_internal_email_list" // internal email lists
				//internal id of the contact field
				, "custrecord_contact_field_id" // contains internal id of a field to affirm sending an email to the assigned contact
				, "custrecord_email_donor_contact"//bool
				, "custrecord_email_warehouse_contact"//bool
				, "custrecord_email_receipt_contact"//bool
				, "custrecord_email_member_contact"//bool
				, "custrecord_sent_from_email"//Sent From Email - Employee record
				, "custrecord_receipt_reminder_type"//Receipt Reminder Type - is this for timed emails?
				//donor contact internal id
				, "custrecord_donor_contact_internal_id" //donor contact internal id
				, "custrecord_reminder_days" // timed emails ?
				, "custrecord_first_reminder" // bool timed emails ?
				, "custrecord_reminder_date_field" //Reminder Date Field
				, "custrecord_company_recipient" //company recipient
				, "custrecord_matrix_transaction_status" //SALES ORDER NETSUITE STATUS
			];
			var filters = [
				[ 'isinactive', 'is', 'F' ]
			];
			emailNotificationMatrix = _.NSSearchObjectRunMapped( _.NSSearchCreate( search, 'customrecord_email_notification_matrix', null, columns, filters ) );
			/**
			 * @define iterate through matrix and determine the emails sent for each row and add a bitvalue composite variable to the
			 * individual matrix row to indicate which columns are true;
			 */
			emailNotificationMatrix = _.map( emailNotificationMatrix, function( item ) {
				/** @define variable to hold composite values */
				var bits = 0;
				/**
				 * @define iterate through Contact Ids enum to create aggregate bitvalues
				 */
				_.each( CONTACT_IDS_AND_BITVALUES, function( value, key, list ) {
					var foo = item;
					/**
					 * @define extract the true false value for this contact from matrix and if
					 * true set bit for that contact
					 */
					var bit = item[ value[ 'ID' ][ 'MATRIX_COLUMN' ] ] && value[ 'BITVALUE' ];
					/**
					 * @define if value was set now "OR" the values together
					 */
					bit && _.functionalizeStatements( this, function() {
						bits = parseInt( bits ) | bit;
					} );

					item[ 'contactBits' ] = parseInt( bits );
				} );

				return item;
			} );

			var foo = emailNotificationMatrix;
			var foo = emailNotificationMatrix;

		};

		return {
			/**
			 * @param previous transaction object
			 * @param new transaction object
			 * @param byPass variable boolean - this will determine whether to by pass the object comparison check
			 */
			isValidCampaignAction                     : isValidCampaignAction
			/**
			 * @param title - Title of message
			 * @param message - body of the message
			 */
			, LogDebugAndSendEmail                    : LogDebugAndSendEmail
			/**
			 * @param UserEvent Transaction record Context object
			 * @returns simple oject of properties
			 */
          , LogDebugAndSendEmailwithAttach                    : LogDebugAndSendEmailwithAttach
			/**
			 * @param UserEvent Transaction record Context object
			 * @returns simple oject of properties
			 */
			, prepareUserEventContextObject           : prepareUserEventContextObject
            /**
			 * @param UserEvent Transaction record Context object
			 * @returns simple oject of properties
			 */
			, prepareScheduledScriptObject           : prepareScheduledScriptObject

			/**
			 * @param Process Context record received by prepareUserEventContextObject
			 * does the bulk of the processing for the given transaction
			 */
			, processRecord                           : processRecord
			/**
			 * @param document_number (String)
			 * @returns ex. {name   : 'opportunity', value: '37', text : 'Opportunity', id : 98787756, tranid:'DON000130969'}
			 */
			, getTransactionTypeByDocumentNumber      : getTransactionTypeByDocumentNumber
			/**
			 * @param email of the messages you receive
			 */
			, getMessagesByEmail                      : getMessagesByEmail
			/**
			 * @param email of the contacts yopu wish to locate
			 */
			, getContactsFromEmail                    : getContactsFromEmail
			/**
			 * @param transactionType, tranid
			 */
			, getTransactionRecord                    : getTransactionRecord
			/**
			 * @param internal numeric id of transaction type, ex. 37,31,15
			 */
			, getTransactionTypeById                  : getTransactionTypeById
			/**
			 * @param internal id of type ex. opportunity, salesorder, purchaseorder
			 */
			, getTransactionTypeByName                : getTransactionTypeByName
			/** @define external display text of type, ex "Opportunity", "Sales Order", "Purchase Order" */
			, getTransactionTypeByText                : getTransactionTypeByText
			/** @define method to return an array of matrix items that apply to timed emails loads exposed emailNotificationMatrixForTimedEmails property */
			, getEmailNotificationMatrixForTimedEmails: getEmailNotificationMatrixForTimedEmails
			/**
			 * @param transactionRecord, transactionType
			 */
			, getEmailNotificationMatrixItems         : getEmailNotificationMatrixItems
			/**
			 * @returns object mapped collection of all Email Notification Records
			 */
			, loadEmailNotificationMatrix             : loadEmailNotificationMatrix
			/**
			 * @define method to pull employees name and email from id
			 */
			, getEmailSender                          : getEmailSender
			/**
			 * @param transactionRecord
			 * @param transactionType
			 * @returns collection of companies
			 */
			, getCompanies                            : getCompanies
			/**
			 * @param companyType
			 * @param companyId
			 * @returns mapped company object
			 */
			, getCompany                              : getCompany
			/**
			 * @param transactionRecord
			 * @param transactionType
			 * @returns mapped company contact record
			 */
			, getCompanyContactRecord                 : getCompanyContactRecord
			/**
			 * @param company
			 * @returns collection of contacts for that company
			 */
			, getCompanyContactsList                  : getCompanyContactsList
			/**
			 * @type const Matrix Transaction Status
			 * carries  keys the same as the native list itself but has different values list
			 * but is representative of the same list
			 **/
			, MATRIX_TRANSACTION_STATUS               : MATRIX_TRANSACTION_STATUS
			/** @type const COMPANY RECIPIENT ENUM **/
			, COMPANY_RECIPIENT                       : COMPANY_RECIPIENT
			/** @define Execution context constants for use in place of the NetSuite object variables */
			, EXECUTION_CONTEXT                       : EXECUTION_CONTEXT
			/** @define UserEvent Types constants for use in place of the NetSuite object variables */
			, USEREVENTTYPES                          : USEREVENTTYPES
			/** @define constant to hold the error email sender and recipient */
			, ERROR_EMAIL_RECIPIENT                   : ERROR_EMAIL_RECIPIENT
			/** @type const enum */
			, EMAIL_TEMPLATES                         : EMAIL_TEMPLATES
			/** @type const enum */
			, CONTACT_FLAGS                           : CONTACT_FLAGS
			/** @type const enum */
			, CONTACT_FIELDS                          : CONTACT_FIELDS
			/** @type const enum */
			, PURCHASE_ORDER_STATUS                   : PURCHASE_ORDER_STATUS
			/** @type const enum */
			, ORDER_STATUS                            : ORDER_STATUS
			/** @type const enum */
			, OPPORTUNITY_STATUS                      : OPPORTUNITY_STATUS
			/** @type const enum */
			, ORDER_TYPE                              : ORDER_TYPE
			/** @type const enum */
			, TRANSACTION_TYPE                        : TRANSACTION_TYPE
			/** @type const enum */
			, CONTACT_IDS_AND_BITVALUES               : CONTACT_IDS_AND_BITVALUES
			/** @collection complete list of email notification items that is loaded on demand */
			, emailNotificationMatrix                 : emailNotificationMatrix
			/** @define Variable to hold an array of email matrix items for timed email consumption */
			, emailNotificationMatrixForTimedEmails   : emailNotificationMatrixForTimedEmails
		};
	}
);