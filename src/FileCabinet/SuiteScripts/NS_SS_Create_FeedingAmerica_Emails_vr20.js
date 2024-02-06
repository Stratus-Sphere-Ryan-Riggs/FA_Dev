nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
* Copyright (c) 1998-2014 NetSuite, Inc.
* 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
* All Rights Reserved.
* 
* This software is the confidential and proprietary information of
* NetSuite, Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with NetSuite.
* 
* This script is deployed as a scheduled script 
* This script is used to create the allocation journal entries
* 
* @author Peter August
* @version 1.0
* 
* For Opportunities accept the transaction and parse the Donor and Member data and send out emails
* 11/16/2016 - Check to see is the email was already sent.  Keep a list on transactions of the Internal ID of the email matrix record, and add to the list and check
* 03/15/2017 - For Opportunities fix the issue with not emailing the donation contact
* 04/05/2017 - For Donor Sales Order emails - pull the Donor contact internal id and use that for the email
* 05/02/2017 - Receipted contacts to receive the Donor Email
*/


var context = nlapiGetContext();
var intUsageLimit = 400;

function scheduled_CreateEmail_Main()
{
    //nlapiLogExecution('DEBUG','scheduled_emailopp','******************************SCHEDULE STARTED********************************');
    
    var type          = nlapiGetContext().getSetting('SCRIPT','custscript_opp_trans_type');
    var stOppId       = nlapiGetContext().getSetting('SCRIPT','custscript_opp_trans_internal_id');
    var trans_type    =  nlapiLookupField('transaction', stOppId, 'type');
    nlapiLogExecution('DEBUG','scheduled_CreateIC','******************************SCHEDULE FINISHED********************************' + type + ' ' + stOppId + ' ' + trans_type );

	if (trans_type ==  'Opprtnty') //SalesOr
    {
	   process_opportunity_emails(stOppId, trans_type );
    } 	   

	if (trans_type ==  'SalesOrd') //PurchOrd
    {
	   process_salesorder_emails(stOppId, trans_type );
    } 	   
	
	if (trans_type ==  'PurchOrd' || trans_type ==  'purchaseorder') //PurchOrd
    {
	   process_po_emails(stOppId, trans_type );
    } 	   

    return true;
	
	
}


function process_opportunity_emails (stOppId, trans_type)
{
	
				var recTran     = nlapiLoadRecord('opportunity',stOppId);

				var donor    = recTran.getFieldValue('custbody_opportunity_donor'); //custbody_order_type  custbody_opportunity_status
				var order_type    = recTran.getFieldValue('custbody_order_type'); //custbody_order_type  custbody_opportunity_status
				var opp_status    = recTran.getFieldValue('custbody_opportunity_status');
				var sent_emails   = recTran.getFieldValue('custbody_fa_emails_sent');
		        var salesEmails = new Array();


				if  (donor == '' || donor == null || order_type == '' || order_type == null || opp_status == '' || opp_status == null)
			    {
					return true;
									
                }					

				var order_type    = recTran.getFieldValue('custbody_order_type'); //custbody_order_type  custbody_opportunity_status
				var opp_status    = recTran.getFieldValue('custbody_opportunity_status');
				
				//1. See if this type of opportunity and status is setup in the email matrix.  This will determine the email templateNow
				//nlapiLogExecution('DEBUG','email template','in found results' + opp_status + ' ' + order_type);	

		        var efilters = new Array();
                efilters[0] = new nlobjSearchFilter( 'custrecord_transaction_type', null, 'is', 'opportunity'); 
                efilters[1] = new nlobjSearchFilter( 'custrecord_donation_status' , null, 'is', opp_status); 
                //efilters[2] = new nlobjSearchFilter( 'custrecord_order_type'     , null, 'is', order_type); 
		        var eCols = new Array();
                eCols.push(new nlobjSearchColumn('custrecord_member_email_template'));
                eCols.push(new nlobjSearchColumn('custrecord_internal_email_list'));
                eCols.push(new nlobjSearchColumn('custrecord_contact_field_id'));
                eCols.push(new nlobjSearchColumn('custrecord_email_donor_contact'));
                eCols.push(new nlobjSearchColumn('custrecord_email_warehouse_contact'));
                eCols.push(new nlobjSearchColumn('custrecord_email_receipt_contact'));
                eCols.push(new nlobjSearchColumn('custrecord_email_member_contact'));
                eCols.push(new nlobjSearchColumn('custrecord_sent_from_email'));
                var esearchResults = nlapiSearchRecord( 'customrecord_email_notification_matrix', null, efilters, eCols);
				nlapiLogExecution('DEBUG','email template','in found results' + esearchResults);	
		        if (esearchResults == null) return true;
		        if (esearchResults != null)
		        {
 				   var objCommResult = esearchResults[0];
	 	           var stComm_Id     = objCommResult.getId();
				   eMail_Template    = objCommResult.getValue('custrecord_member_email_template');
				   eInternal_list    = objCommResult.getValue('custrecord_internal_email_list'); //custrecord_contact_field_id
				   fieldid           = objCommResult.getValue('custrecord_contact_field_id');
				   emailDonor        = objCommResult.getValue('custrecord_email_donor_contact');
				   emailWarehouse    = objCommResult.getValue('custrecord_email_warehouse_contact');
				   emailReceipt      = objCommResult.getValue('custrecord_email_receipt_contact');
				   emailMember       = objCommResult.getValue('custrecord_email_member_contact');
				   sentfromemail     = objCommResult.getValue('custrecord_sent_from_email');
				   nlapiLogExecution('DEBUG','email template','in found results' + eMail_Template + ' ' + fieldid + emailDonor + ' ' + emailWarehouse + ' ' + emailReceipt + ' ' + emailMember);	
					
				}	
				
				if (!isEmpty(sent_emails))
				{
					var emailid = '(' + stComm_Id + ')';
					var emailindex = sent_emails.indexOf(emailid);
					nlapiLogExecution('DEBUG','ISEMAILFOUND ',' EMAILINDEX ' + emailindex);	
					if (emailindex != -1)
				    {
					    nlapiLogExecution('DEBUG','ISEMAILFOUND ',' EMAILINDEX RETURNING' + emailindex);	
						return true;
                    }						
				
				} 

				if (!isEmpty(recTran.getFieldValue('custbody_donorcontactcode')))
				{
					var donorEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_donorcontactcode'), 'email');
				    nlapiLogExecution('DEBUG','donor email ','in found results ' + donorEmail);
                    if (!isEmpty(donorEmail))
                    {						
					 send_email ( stOppId, donorEmail,eMail_Template, trans_type, sentfromemail);
					 salesEmails.push(donorEmail);
 
                    }					 
				}	
				
				
				if (emailDonor == 'T' && (!isEmpty(recTran.getFieldValue('custbody_donation_contact'))))
				{
					var donorEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_donation_contact'), 'email');
				    nlapiLogExecution('DEBUG','donor email ','in found results ' + donorEmail);
                    if (!isEmpty(donorEmail))
                    {						
					 send_email ( stOppId, donorEmail,eMail_Template, trans_type, sentfromemail);
					 salesEmails.push(donorEmail);
 
                    }					 
				}	
				
				if (emailWarehouse == 'T' && (!isEmpty(recTran.getFieldValue('custbody_warehouse_contact'))))
				{
					var warehouseEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_warehouse_contact'), 'email');
				    nlapiLogExecution('DEBUG','warehouse email ','in found results ' +  warehouseEmail);
                    if (!isEmpty(warehouseEmail))
                    {						
					 send_email ( stOppId, warehouseEmail,eMail_Template, trans_type, sentfromemail);
 					 salesEmails.push(warehouseEmail);

                    }					 
				}	

				if (emailReceipt == 'T' && (!isEmpty(recTran.getFieldValue('custbody_receipt_contact'))))
				{
					var receiptEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_receipt_contact'), 'email');
				    nlapiLogExecution('DEBUG','warehouse email ','in found results ' +  receiptEmail);
                    if (!isEmpty(receiptEmail))
                    {						
					 send_email ( stOppId, receiptEmail,eMail_Template, trans_type, sentfromemail);
 					 salesEmails.push(receiptEmail);
                    }					 
				}	

				if (emailMember == 'T' && (!isEmpty(recTran.getFieldValue('custbody_member_contact'))))
				{
					var memberEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_member_contact'), 'email');
				    nlapiLogExecution('DEBUG','warehouse email ','in found results ' +  memberEmail);
                    if (!isEmpty(memberEmail))
                    {						
					 send_email ( stOppId, memberEmail,eMail_Template, trans_type, sentfromemail);
 					 salesEmails.push(memberEmail);
                    }					 
				}	
				
				//2. Now Find all the Donor emails and send the email
				if (donor != '' && donor != null)
			    {		
				   // Loop through for the Member and Donor and find the contact emails and send
				   var filters = new Array();
                   filters[0] = new nlobjSearchFilter( fieldid, null, 'is', 'T'); 
                   filters[1] = new nlobjSearchFilter('formulatext', null, 'is', donor);
				   filters[1].setFormula('{company.internalid}');
                   //filters[1] = new nlobjSearchFilter( 'isinactive', null, 'is', 'F'); 
                   nlapiLogExecution('DEBUG','email_opp','in found results donor' + donor);
                   var searchResults = nlapiSearchRecord( 'contact', 'customsearch_company_contacts', filters);
                   nlapiLogExecution('DEBUG','email_opp','in found results After Search' + searchResults);
		           if (searchResults != null)
		           {
                    nlapiLogExecution('DEBUG','email_opp','in found results After Search 2' + searchResults.length);
  				    for(var j = 0; j < searchResults.length; j++)
                    {
				      nlapiLogExecution('DEBUG','email_opp','in found results email Index ' + j);	
				      var contactemail    = searchResults[j].getValue('email',null,'group');
				      nlapiLogExecution('DEBUG','email_opp','in found results email ' + contactemail);	
                       var existsEmailr = existsEmail(contactemail, salesEmails );	
                       nlapiLogExecution('DEBUG','email template','Member Email List ' + contactemail);	
                       if (!existsEmailr)
                       {
                         send_email ( stOppId, contactemail,eMail_Template, trans_type, sentfromemail);	
 					    salesEmails.push(contactemail);
					   }
                     }
			       }
                }	
				
				sent_emails = sent_emails + '(' + stComm_Id + ')' ;
				nlapiSubmitField('opportunity', stOppId, 'custbody_fa_emails_sent', sent_emails);

				
				if (eInternal_list != '' && eInternal_list != null)
			    {		
				      nlapiLogExecution('DEBUG','email_opp','sending internal email' + eInternal_list);	
                      send_email ( stOppId, eInternal_list ,eMail_Template, trans_type, sentfromemail);				  
                }	

				
}


function process_salesorder_emails (stOppId, trans_type)
{
	
				var recTran     = nlapiLoadRecord('salesorder',stOppId);

				var member       = recTran.getFieldValue('entity'); // custbody_opportunity_donor
				var donor        = recTran.getFieldValue('custbody_opportunity_donor');
				var order_type  = recTran.getFieldValue('custbody_order_type'); 
				var order_status  = recTran.getFieldValue('custbody_order_status');
				var sent_emails   = recTran.getFieldValue('custbody_fa_emails_sent');//'custbody_transaction_changes'
				var orderChanges  = recTran.getFieldValue('custbody_transaction_changes');

		        var salesEmails = new Array();


				if  (member == '' || member == null || order_type == '' || order_type == null || order_status == '' || order_status == null)
			    {
					return true;
									
                }					

				//nlapiLogExecution('DEBUG','email template','in found results ' + order_status + ' ' + order_type);	
	            var efilters = new Array();
                efilters[0] = new nlobjSearchFilter( 'custrecord_transaction_type', null, 'is', 'salesorder'); 
                efilters[1] = new nlobjSearchFilter( 'custrecord_order_type'    , null, 'is', order_type); 
                efilters[2] = new nlobjSearchFilter( 'custrecord_order_status' , null, 'is', order_status); 
 		        var eCols = new Array();
                eCols.push(new nlobjSearchColumn('custrecord_member_email_template'));
                eCols.push(new nlobjSearchColumn('custrecord_internal_email_list'));
                eCols.push(new nlobjSearchColumn('custrecord_contact_field_id'));
                eCols.push(new nlobjSearchColumn('custrecord_email_donor_contact'));
                eCols.push(new nlobjSearchColumn('custrecord_email_warehouse_contact'));
                eCols.push(new nlobjSearchColumn('custrecord_email_receipt_contact'));
                eCols.push(new nlobjSearchColumn('custrecord_email_member_contact'));
				eCols.push(new nlobjSearchColumn('custrecord_sent_from_email'));
				eCols.push(new nlobjSearchColumn('custrecord_donor_vendor_email_template'));
                eCols.push(new nlobjSearchColumn('custrecord_donor_contact_internal_id'));

               var esearchResults = nlapiSearchRecord( 'customrecord_email_notification_matrix', null, efilters, eCols);
		        if (esearchResults == null) return true;
				
		        if (esearchResults != null)
		        {
 				   var objCommResult = esearchResults[0];
	 	           var stComm_Id     = objCommResult.getId();
				   eMail_Template    = objCommResult.getValue('custrecord_member_email_template');
				   eInternal_list    = objCommResult.getValue('custrecord_internal_email_list');
				   fieldid           = objCommResult.getValue('custrecord_contact_field_id');
				   emailDonor        = objCommResult.getValue('custrecord_email_donor_contact');
				   emailWarehouse    = objCommResult.getValue('custrecord_email_warehouse_contact');
				   emailReceipt      = objCommResult.getValue('custrecord_email_receipt_contact');
				   emailMember       = objCommResult.getValue('custrecord_email_member_contact');
   				   sentfromemail     = objCommResult.getValue('custrecord_sent_from_email');
				   donor_eMail_Template   = objCommResult.getValue('custrecord_donor_vendor_email_template');
				   donorFieldId           = objCommResult.getValue('custrecord_donor_contact_internal_id');
					
				}	
				
				//  var netappindex   = parseInt(memo.indexOf("/"));
				if (!isEmpty(sent_emails))
				{
					var emailid = '(' + stComm_Id + ')';
					var emailindex = sent_emails.indexOf(emailid);
					nlapiLogExecution('DEBUG','ISEMAILFOUND ',' EMAILINDEX ' + emailindex);	
					if (emailindex != -1 && isEmpty(orderChanges))
				    {
					    //Now check for Modifications - if so find that template
						nlapiLogExecution('DEBUG','IN EMPTY ISEMAILFOUND ',' EMAILINDEX RETURNING' + emailindex);	
						return true;
                    }						

					if (emailindex != -1 && !isEmpty(orderChanges))
				    {
					    //Now check for Modifications - if so find that template
						nlapiLogExecution('DEBUG','ISEMAILFOUND ','NOT EMPTY EMAILINDEX RETURNING' + emailindex);	
			            var efilters = new Array();
                        efilters[0] = new nlobjSearchFilter( 'custrecord_transaction_type', null, 'is', 'salesorder'); 
                        efilters[1] = new nlobjSearchFilter( 'custrecord_order_type'    , null, 'is', order_type); 
                        efilters[2] = new nlobjSearchFilter( 'custrecord_order_status' , null, 'is', nlapiGetContext().getSetting('SCRIPT','custscript_modified_order_status')); 
 		                var eCols = new Array();
                        eCols.push(new nlobjSearchColumn('custrecord_member_email_template'));
                        eCols.push(new nlobjSearchColumn('custrecord_internal_email_list'));
                        eCols.push(new nlobjSearchColumn('custrecord_contact_field_id'));
                        eCols.push(new nlobjSearchColumn('custrecord_email_donor_contact'));
                        eCols.push(new nlobjSearchColumn('custrecord_email_warehouse_contact'));
                        eCols.push(new nlobjSearchColumn('custrecord_email_receipt_contact'));
                        eCols.push(new nlobjSearchColumn('custrecord_email_member_contact'));
				        eCols.push(new nlobjSearchColumn('custrecord_sent_from_email'));
				        eCols.push(new nlobjSearchColumn('custrecord_donor_vendor_email_template'));
                        eCols.push(new nlobjSearchColumn('custrecord_donor_contact_internal_id'));

                        var esearchResults = nlapiSearchRecord( 'customrecord_email_notification_matrix', null, efilters, eCols);
		                if (esearchResults == null) return true;

						nlapiLogExecution('DEBUG','ISEMAILFOUND ','searchresults ' + esearchResults.length );	
						if (esearchResults != null)
					    {
 				           var objCommResult = esearchResults[0];
	 	                   var stComm_Id     = objCommResult.getId();
						   nlapiLogExecution('DEBUG','EMAIL MATRIX ',' XXXE ' + objCommResult.getId());	
			               eMail_Template    = objCommResult.getValue('custrecord_member_email_template');
				           eInternal_list    = objCommResult.getValue('custrecord_internal_email_list');
				           fieldid           = objCommResult.getValue('custrecord_contact_field_id');
				           emailDonor        = objCommResult.getValue('custrecord_email_donor_contact');
				           emailWarehouse    = objCommResult.getValue('custrecord_email_warehouse_contact');
				           emailReceipt      = objCommResult.getValue('custrecord_email_receipt_contact');
				           emailMember       = objCommResult.getValue('custrecord_email_member_contact');
   				           sentfromemail     = objCommResult.getValue('custrecord_sent_from_email');
		   				   donor_eMail_Template   = objCommResult.getValue('custrecord_donor_vendor_email_template');
				           donorFieldId      = objCommResult.getValue('custrecord_donor_contact_internal_id');
						   nlapiLogExecution('DEBUG','ISEMAILFOUND ','EMAIL TEMPLATE ' + eMail_Template);	

				        }	

                    }						

				}

				if (!isEmpty(donor_eMail_Template) && (!isEmpty(recTran.getFieldValue('custbody_donation_contact'))))
				{
					var donorEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_donation_contact'), 'email');
				    nlapiLogExecution('DEBUG','donor email ','in found results ' + donorEmail + ' donorfield ' + donorFieldId);
                    if (!isEmpty(donorEmail))
                    {						
					 send_email ( stOppId, donorEmail,donor_eMail_Template, trans_type, sentfromemail);
					 salesEmails.push(donorEmail);
                    }

					var donorid = recTran.getFieldValue('custbody_opportunity_donor');
				    if (donorid != '' && donorid != null && !isEmpty(donorFieldId))
			        {		
			          var filters = new Array();
                      filters[0] = new nlobjSearchFilter('formulatext', null, 'is', donorid);
				      filters[0].setFormula('{company.internalid}');
                      filters[1] = new nlobjSearchFilter( 'isinactive', null, 'is', 'F'); 
                      filters[2] = new nlobjSearchFilter( donorFieldId, null, 'is', 'T'); 
                      var searchResults = nlapiSearchRecord( 'contact', 'customsearch_company_contacts', filters);
		              if (searchResults != null)
		              {
  				       for(var i = 0; i < searchResults.length; i++)
                       {
				         var contactemail    = searchResults[i].getValue('email',null,'group');
                         var existsEmailr = existsEmail(contactemail, salesEmails );	
                         if (!existsEmailr)
					     {						   
                           send_email ( stOppId, contactemail,donor_eMail_Template, trans_type, sentfromemail);	
                           salesEmails.push(contactemail);
					     } 
                       }
			          }
                    }	

					
				}	
				
				if (emailWarehouse == 'T' && (!isEmpty(recTran.getFieldValue('custbody_warehouse_contact'))))
				{
					var warehouseEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_warehouse_contact'), 'email');
				    nlapiLogExecution('DEBUG','warehouse email ','in found results ' +  warehouseEmail);
                    if (!isEmpty(warehouseEmail))
                    {						
					 send_email ( stOppId, warehouseEmail,eMail_Template, trans_type, sentfromemail);
 					 salesEmails.push(warehouseEmail);
                    }					 
				}	

				if (!isEmpty(donor_eMail_Template) && emailReceipt == 'T' && (!isEmpty(recTran.getFieldValue('custbody_receipt_contact'))))
				{
					var receiptEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_receipt_contact'), 'email');
				    nlapiLogExecution('DEBUG','warehouse email ','in found results ' +  receiptEmail);
                    if (!isEmpty(receiptEmail))
                    {						
					 send_email ( stOppId, receiptEmail,donor_eMail_Template, trans_type, sentfromemail);
  					 salesEmails.push(receiptEmail);
                    }					 
				}	

				if (emailMember == 'T' && (!isEmpty(recTran.getFieldValue('custbody_member_contact'))))
				{
					var memberEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_member_contact'), 'email');
				    nlapiLogExecution('DEBUG','warehouse email ','in found results ' +  memberEmail);
                    if (!isEmpty(memberEmail))
                    {						
					 send_email ( stOppId, memberEmail,eMail_Template, trans_type, sentfromemail);
   					 salesEmails.push(memberEmail);
                    }					 
				}	
				
				//2. Now Find all the member emails and send the email
				if (member != '' && member != null)
			    {		
				   // Loop through for the Member and member and find the contact emails and send
				    nlapiLogExecution('DEBUG','Contact Field ','in found results ' + fieldid);
			       var filters = new Array();
                   filters[0] = new nlobjSearchFilter('formulatext', null, 'is', member);
				   filters[0].setFormula('{company.internalid}');
                   filters[1] = new nlobjSearchFilter( 'isinactive', null, 'is', 'F'); 
                   filters[2] = new nlobjSearchFilter( fieldid, null, 'is', 'T'); 
                   var searchResults = nlapiSearchRecord( 'contact', 'customsearch_company_contacts', filters);
		           if (searchResults != null)
		           {
  				     for(var i = 0; i < searchResults.length; i++)
                     {
				       var contactemail    = searchResults[i].getValue('email',null,'group');
                       var existsEmailr = existsEmail(contactemail, salesEmails );	
                       nlapiLogExecution('DEBUG','email template','Member Email List ' + contactemail);	
                       if (!existsEmailr)
					   {						   
                         send_email ( stOppId, contactemail,eMail_Template, trans_type, sentfromemail);	
                         salesEmails.push(contactemail);
					   } 
                     }
			       }
                }	
			
				//2. Now Find all the donor emails and send the email
				if (donor != '' && donor != null)
			    {		
				   // Loop through for the Member and member and find the contact emails and send
			       var filters = new Array();
                   filters[0] = new nlobjSearchFilter('formulatext', null, 'is', donor);
				   filters[0].setFormula('{company.internalid}');
                   filters[1] = new nlobjSearchFilter( 'isinactive', null, 'is', 'F'); 
                   filters[2] = new nlobjSearchFilter( fieldid, null, 'is', 'T'); 
                   var searchResults = nlapiSearchRecord( 'contact', 'customsearch_company_contacts', filters);
		           if (searchResults != null)
		           {
  				     for(var i = 0; i < searchResults.length; i++)
                     {
				       var contactemail    = searchResults[i].getValue('email',null,'group');
                       var existsEmailr = existsEmail(contactemail, salesEmails );	
                       nlapiLogExecution('DEBUG','email template','Donor Email List ' + contactemail);	
                       if (!existsEmailr)
					   {						   
                         send_email ( stOppId, contactemail,eMail_Template, trans_type, sentfromemail);	
                         salesEmails.push(contactemail);
					   } 
                     }
			       }
                }	
	
		       for (var i = 1; i <= recTran.getLineItemCount('item'); i++ ) 
               {
				   var lineMember = recTran.getLineItemValue('item','custcol_member_bank',i);
				   var dropofflocation = recTran.getLineItemValue('item','custcol_drop_off_location',i);
				   if (lineMember != member && lineMember != '' && lineMember != null)
				   {
						var linefilters = new Array();
                        linefilters[0] = new nlobjSearchFilter('formulatext', null, 'is', lineMember);
				        linefilters[0].setFormula('{company.internalid}');
                        linefilters[1] = new nlobjSearchFilter( 'isinactive', null, 'is', 'F'); 
                        linefilters[2] = new nlobjSearchFilter( fieldid, null, 'is', 'T'); 
                        nlapiLogExecution('DEBUG','email_opp','in found results Line member' + lineMember);
                        var linesearchResults = nlapiSearchRecord( 'contact', 'customsearch_company_contacts', linefilters);
		                if (linesearchResults != null)
		                {
                          nlapiLogExecution('DEBUG','email_opp','in found results linemember nbr ' + searchResults.length);
  				          for(var j = 0; j < linesearchResults.length; j++)
                          {
				           var contactemail    = linesearchResults[j].getValue('email',null,'group');
                           var existsEmailr = existsEmail(contactemail, salesEmails );	
                           nlapiLogExecution('DEBUG','email template','Line Item Member ' + contactemail);					   
                           if (!existsEmailr)
					       {						   
                             send_email ( stOppId, contactemail,eMail_Template, trans_type, sentfromemail);	
                             salesEmails.push(contactemail);
					       } 
						  }
			            }
   
                    }
				   
				   if (dropofflocation != '' && dropofflocation != null)
				   {
					   	nlapiLogExecution('DEBUG','email_opp','in found results drop off  ' + dropofflocation);
						var dropoff_whse = nlapiLookupField('customrecord_address_contact_association', dropofflocation, 'custrecord_assoc_master_warehouse');
						var dofilters = new Array();
                        dofilters[0] = new nlobjSearchFilter( 'custrecord_warehouse_association', null, 'is', dropoff_whse); 
                        var dosearchResults = nlapiSearchRecord( 'customrecord_warehouse_contacts', 'customsearch_warehouse_contacts', dofilters);
		                if (dosearchResults != null)
		                {
  				          
						  nlapiLogExecution('DEBUG','email_opp','in found results drop off  ' + dosearchResults.length);
						  for(var k = 0; k < dosearchResults.length; k++)
                          {
				            var contactemail    = dosearchResults[k].getValue('formulatext',null,'group');
							nlapiLogExecution('DEBUG','email_opp','in found results drop off  ' + contactemail);
                           //send_email ( stOppId, contactemail,eMail_Template, trans_type);
                           salesEmails.push(contactemail);					                          
                          }
					    }	
                   }
				   
			   }				   

				   
				   
				sent_emails = sent_emails + '(' + stComm_Id + ')' ;
				nlapiSubmitField('salesorder', stOppId, 'custbody_fa_emails_sent', sent_emails);

				
				// Add the Line level member.  if the line member = header bypass
				// add the line level dropp off location lookup
				
				if (eInternal_list != '' && eInternal_list != null)
			    {		
				     // nlapiLogExecution('DEBUG','email_opp','sending internal email' + eInternal_list);	
                      send_email ( stOppId, eInternal_list ,eMail_Template, trans_type, sentfromemail);				  
                }	
				
				for (i = 0; i < salesEmails.length; i++) 
				{
					nlapiLogExecution('DEBUG','email_opp','Email List final' +  i + ' email: ' + salesEmails[i]);
		        }
				

}

function process_po_emails (stOppId, trans_type)
{
	
				var recTran     = nlapiLoadRecord('purchaseorder',stOppId);

				var member        = recTran.getFieldValue('entity'); 
				var order_type    = recTran.getFieldValue('custbody_order_type'); 
				var order_status  = recTran.getFieldValue('custbody_po_status');
				var sent_emails   = recTran.getFieldValue('custbody_fa_emails_sent');
		        var salesEmails = new Array();


				nlapiLogExecution('DEBUG','PO email template','exists email ' + member + ' ' + order_type + ' ' + order_status);
				if  (member == '' || member == null || order_type == '' || order_type == null || order_status == '' || order_status == null)
			    {
					return true;
									
                }					

				//nlapiLogExecution('DEBUG','email template','in found results ' + order_status + ' ' + order_type);	
	            var efilters = new Array();
                efilters[0] = new nlobjSearchFilter( 'custrecord_transaction_type', null, 'is', 'purchaseorder'); 
                efilters[1] = new nlobjSearchFilter( 'custrecord_order_type'    , null, 'is', order_type); 
                efilters[2] = new nlobjSearchFilter( 'custrecord_po_status' , null, 'is', order_status); 
 		        var eCols = new Array();
                eCols.push(new nlobjSearchColumn('custrecord_member_email_template'));
                eCols.push(new nlobjSearchColumn('custrecord_internal_email_list'));
                eCols.push(new nlobjSearchColumn('custrecord_contact_field_id'));
                eCols.push(new nlobjSearchColumn('custrecord_email_donor_contact'));
                eCols.push(new nlobjSearchColumn('custrecord_email_warehouse_contact'));
                eCols.push(new nlobjSearchColumn('custrecord_email_receipt_contact'));
                eCols.push(new nlobjSearchColumn('custrecord_email_member_contact'));
                eCols.push(new nlobjSearchColumn('custrecord_sent_from_email'));

                var esearchResults = nlapiSearchRecord( 'customrecord_email_notification_matrix', null, efilters, eCols);
				nlapiLogExecution('DEBUG','email template','exists email ' + esearchResults);
		        if (esearchResults == null) return true;
				
		        if (esearchResults != null)
		        {
 				   var objCommResult = esearchResults[0];
	 	           var stComm_Id     = objCommResult.getId();
				   eMail_Template    = objCommResult.getValue('custrecord_member_email_template');
				   eInternal_list    = objCommResult.getValue('custrecord_internal_email_list');
				   fieldid           = objCommResult.getValue('custrecord_contact_field_id');
   				   emailDonor        = objCommResult.getValue('custrecord_email_donor_contact');
				   emailWarehouse    = objCommResult.getValue('custrecord_email_warehouse_contact');
				   emailReceipt      = objCommResult.getValue('custrecord_email_receipt_contact');
				   emailMember       = objCommResult.getValue('custrecord_email_member_contact');
   				   sentfromemail     = objCommResult.getValue('custrecord_sent_from_email');

				   nlapiLogExecution('DEBUG','email template','in found results' + eMail_Template + ' ' + fieldid + emailDonor + ' ' + emailWarehouse + ' ' + emailReceipt + ' ' + emailMember);	

					
				}	
				
				if (emailDonor == 'T' && (!isEmpty(recTran.getFieldValue('custbody_donation_contact'))))
				{
					var donorEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_donation_contact'), 'email');
				    nlapiLogExecution('DEBUG','donor email ','in found results ' + donorEmail);
                    if (!isEmpty(donorEmail))
                    {						
					 send_email ( stOppId, donorEmail,eMail_Template, trans_type, sentfromemail);
                       salesEmails.push(donorEmail);
                    }					 
				}	
				
				if (emailWarehouse == 'T' && (!isEmpty(recTran.getFieldValue('custbody_warehouse_contact'))))
				{
					var warehouseEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_warehouse_contact'), 'email');
				    nlapiLogExecution('DEBUG','warehouse email ','in found results ' +  warehouseEmail);
                    if (!isEmpty(warehouseEmail))
                    {						
					 send_email ( stOppId, warehouseEmail,eMail_Template, trans_type, sentfromemail);
                       salesEmails.push(warehouseEmail);
                   }					 
				}	

				if (emailReceipt == 'T' && (!isEmpty(recTran.getFieldValue('custbody_receipt_contact'))))
				{
					var receiptEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_receipt_contact'), 'email');
				    nlapiLogExecution('DEBUG','warehouse email ','in found results ' +  receiptEmail);
                    if (!isEmpty(receiptEmail))
                    {						
					 send_email ( stOppId, receiptEmail,eMail_Template, trans_type, sentfromemail);
                      salesEmails.push(receiptEmail);
                   }					 
				}	

				if (emailMember == 'T' && (!isEmpty(recTran.getFieldValue('custbody_member_contact'))))
				{
					var memberEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_member_contact'), 'email');
				    nlapiLogExecution('DEBUG','warehouse email ','in found results ' +  memberEmail);
                    if (!isEmpty(memberEmail))
                    {						
					 send_email ( stOppId, memberEmail,eMail_Template, trans_type, sentfromemail);
                     salesEmails.push(memberEmail);

                    }					 
				}	

				//  var netappindex   = parseInt(memo.indexOf("/"));
				if (!isEmpty(sent_emails))
				{
					var emailid = '(' + stComm_Id + ')';
					var emailindex = sent_emails.indexOf(emailid);
					nlapiLogExecution('DEBUG','ISEMAILFOUND ',' EMAILINDEX ' + emailindex);	
					if (emailindex != -1)
				    {
					    nlapiLogExecution('DEBUG','ISEMAILFOUND ',' EMAILINDEX RETURNING' + emailindex);	
						return true;
                    }						
				}

				//2. Now Find all the member emails and send the email
				if (member != '' && member != null)
			    {		
				    nlapiLogExecution('DEBUG','member po email template','exists email ' + member + ' ' + fieldid );	
					// Loop through for the Member and member and find the contact emails and send
			       var filters = new Array();
                   filters[0] = new nlobjSearchFilter('formulatext', null, 'is', member);
				   filters[0].setFormula('{company.internalid}');
                   filters[1] = new nlobjSearchFilter( 'isinactive', null, 'is', 'F'); 
                   //filters[2] = new nlobjSearchFilter( fieldid, null, 'is', 'T'); 
				   nlapiLogExecution('DEBUG','presearch email template','searchresults exists email ');	
                   var searchResults = nlapiSearchRecord( 'contact', 'customsearch_company_contacts', filters);
				   nlapiLogExecution('DEBUG','postsearchemail template','searchresults exists email ' + searchResults);	
		           if (searchResults != null)
		           {
  				     for(var i = 0; i < searchResults.length; i++)
                     {
				       var contactemail    = searchResults[i].getValue('email',null,'group');
                       var existsEmailr = existsEmail(contactemail, salesEmails );	
                       nlapiLogExecution('DEBUG','email template','exists email ' + existsEmailr);	
                       if (!existsEmailr)
					   {						   
                         send_email ( stOppId, contactemail,eMail_Template, trans_type, sentfromemail);	
                         salesEmails.push(contactemail);
					   } 
                     }
			       }
                }	
				
			   for (var i = 1; i <= recTran.getLineItemCount('item'); i++ ) 
               {
				   var dropofflocation = recTran.getLineItemValue('item','custcol_pickup_location',i);
				   
				   if (dropofflocation != '' && dropofflocation != null)
				   {
					   	nlapiLogExecution('DEBUG','email_opp','in found results drop off  ' + dropofflocation);
						var dropoff_whse = nlapiLookupField('customrecord_address_contact_association', dropofflocation, 'custrecord_assoc_master_warehouse');
						var dofilters = new Array();
                        dofilters[0] = new nlobjSearchFilter( 'custrecord_warehouse_association', null, 'is', dropoff_whse); 
                        var dosearchResults = nlapiSearchRecord( 'customrecord_warehouse_contacts', 'customsearch_warehouse_contacts', dofilters);
		                if (dosearchResults != null)
		                {
  				          
						  nlapiLogExecution('DEBUG','email_opp','in found results drop off  ' + dosearchResults.length);
						  for(var k = 0; k < dosearchResults.length; k++)
                          {
				            var contactemail    = dosearchResults[k].getValue('formulatext',null,'group');
							nlapiLogExecution('DEBUG','email_opp','in found results drop off  ' + contactemail);
                           //send_email ( stOppId, contactemail,eMail_Template, trans_type);
                           salesEmails.push(contactemail);					                          
                          }
					    }	
                   }
				   
			   }				   

			    //NOw incremennt the emails sent_emails
				sent_emails = sent_emails + '(' + stComm_Id + ')' ;
				nlapiSubmitField('purchaseorder', stOppId, 'custbody_fa_emails_sent', sent_emails);
			
				// Add the Line level member.  if the line member = header bypass
				// add the line level dropp off location lookup
				
				if (eInternal_list != '' && eInternal_list != null)
			    {		
				     // nlapiLogExecution('DEBUG','email_opp','sending internal email' + eInternal_list);	
                      send_email ( stOppId, eInternal_list ,eMail_Template, trans_type, sentfromemail);				  
                }	

}


function send_email (stOppId, receivingEmail, eMail_Template, trans_type,sendfromemail)
{
	
	
            var sending_email = nlapiGetContext().getSetting('SCRIPT','custscript_opp_email_sent_from');
			
			if (!isEmpty(sendfromemail))
			{
				sending_email = sendfromemail;
			}
			
            monitorUsageLimit();
	        nlapiLogExecution('DEBUG','email_opp','in send email' + receivingEmail);
			var emailMerger = nlapiCreateEmailMerger(eMail_Template);
            emailMerger.setTransaction(stOppId);
            var mergeResult = emailMerger.merge();
            var emailBody = mergeResult.getBody();
            var emailSubject = mergeResult.getSubject();
			
			if (trans_type ==  'Opprtnty')
		    {
              nlapiSendEmail(sending_email, receivingEmail, emailSubject, emailBody, null, null, { 'transaction': stOppId },  null, true);
			}  

			if (trans_type !=  'Opprtnty')
		    {
			  var Transaction_PDF = nlapiPrintRecord('TRANSACTION', stOppId, 'PDF', true);
              nlapiSendEmail(sending_email, receivingEmail, emailSubject, emailBody, null, null, { 'transaction': stOppId },  Transaction_PDF, true);
			}  
			nlapiLogExecution('DEBUG','email_opp','after sent email');
			return true;
	
}

function monitorUsageLimit() {
	
	nlapiLogExecution('ERROR','Monitor usage', 'Remaining usage='+context.getRemainingUsage());
	
	// Monitor usage limit
	//if (context.getRemainingUsage() <= intUsageLimit) {
     //   var stateMain = nlapiYieldScript(); 
        
       // if (stateMain.status == 'FAILURE') { 
       // 	nlapiLogExecution('ERROR', 'Failed to yield script, exiting', 'Reason='+stateMain.reason+', Size='+stateMain.size); 
       //     throw "Failed to yield script";
              
      //  } else if (stateMain.status == 'RESUME') { 
      //  	nlapiLogExecution('ERROR', 'Resuming script', 'Reason='+stateMain.reason+ ', Size='+stateMain.size); 
     //   } 

	//}
	
}

function existsEmail(emailaddress, arr ){

	
	var bIsValueFound = false;
    nlapiLogExecution('DEBUG', 'Exists Email ', 'EMAILLSIT='+arr+ ', EMAIL='+emailaddress);
    for(var i = 0; arr !== null && i < arr.length; i++)
    {
        if(emailaddress == arr[i])
        {
            bIsValueFound = true;
            break;
        }
    }

    return bIsValueFound;
}

function isEmpty(stValue) {   
	if ((stValue == '') || (stValue == null) || (typeof stValue == "undefined"))  
	{        
		return true;   
	}
	return false; 
}
