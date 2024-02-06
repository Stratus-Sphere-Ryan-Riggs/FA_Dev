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
* 5/8/2017   - Pull Reminder Days and First Receipt flag - if a first receipt set the value on the sales order
*/


var context = nlapiGetContext();
var intUsageLimit = 400;

function scheduled_CreateEmail_Main()
{
    
    var searchName        = nlapiGetContext().getSetting('SCRIPT','custscript_reminder_search');
    var trans_type    =  'SalesOrd';

    var results = fetchtransactions(searchName);
    if(results != null)
    {
            for(var i = 0; i < results.length; i++)
            {

			   process_salesorder_emails(results[i].getId(),trans_type);
			   
  			   	if (context.getRemainingUsage() <= intUsageLimit) 
				{
		           
		           nlapiLogExecution('ERROR','Monitor usage', 'Remaining usage='+context.getRemainingUsage());
				   monitorUsageLimit();

                }

            }
    }


    return true;
	
	
}

//-------------------------Local Functions----------------------
function fetchtransactions(searchName)
{
    try
    {
        // Look for Sales orders not committed
        nlapiLogExecution("DEBUG", "Sales Orders", "Fetching orders");
        var results = nlapiSearchRecord('transaction', searchName, null, null);
        if(results == null)
        {
            nlapiLogExecution("DEBUG", "Sales Orders", "Nothing to Fetch.");
        }    
        else
        {
            nlapiLogExecution("DEBUG", "Sales Orders", results.length + " Order entries.");

        }
        return results;
    }
    catch(e)
    {
       customererror(e, 'Sales Orders', 'Failed in Fetch Info');   
    }
}



function process_salesorder_emails (stOppId, trans_type)
{
	
				var recTran       = nlapiLoadRecord('salesorder',stOppId);
				var receiptType   = nlapiGetContext().getSetting('SCRIPT','custscript_reminder_type');

				var member        = recTran.getFieldValue('entity'); // custbody_opportunity_donor
				var donor         = recTran.getFieldValue('custbody_opportunity_donor');
				var order_type    = recTran.getFieldValue('custbody_order_type'); 
				var order_status  = recTran.getFieldValue('custbody_order_status');
				var sent_emails   = recTran.getFieldValue('custbody_fa_emails_sent');//'custbody_transaction_changes'
				var orderChanges  = recTran.getFieldValue('custbody_transaction_changes');

		        var salesEmails = new Array();


				if  (member == '' || member == null || order_type == '' || order_type == null || order_status == '' || order_status == null)
			    {
					return true;
									
                }

                // Check for a Blocked Vendor custscript_check_for_blocked
                var checkBlocked    = nlapiGetContext().getSetting('SCRIPT','custscript_check_for_blocked');				
                var checkUnBlocked  = nlapiGetContext().getSetting('SCRIPT','custscript_check_for_unblocked');
				var vendorBlocked   = false;
				var nbrVendors      = parseFloat('0');
                if (checkBlocked == 'T' || checkUnBlocked == 'T')
                {
			        for (var j = 1; j <= recTran.getLineItemCount('item'); j++ ) 
                    {
						var vendorID = recTran.getLineItemValue('item', 'povendor', j);
						if (!isEmpty(vendorID))
						{
							nbrVendors++;
							var disableAutoRecepting = nlapiLookupField('vendor', vendorID, 'custentity_approvedvendorforgrfreight');
							if (disableAutoRecepting == 'T')
							{
								vendorBlocked = true;
                            }								
                        }
		            }
	                nlapiLogExecution("DEBUG", "Sales Orders", "Checking Block/Unblock " + checkBlocked + " un " + checkUnBlocked);
	                nlapiLogExecution("DEBUG", "Sales Orders", "Vendor Blocked " + vendorBlocked + " un " + nbrVendors);
					
					if (checkBlocked == 'T' && !vendorBlocked && nbrVendors > 0) // If checking for blocked and no vendors are blocked bypass
					{
                        return true;
					}
					if (checkUnBlocked == 'T' && vendorBlocked && nbrVendors > 0) // If checking for Unblocked and a vendor is blocked bypass
					{
                        return true;
					}
                }					

				nlapiLogExecution('DEBUG','email template','in found results ' + order_status + ' ' + order_type + ' ' + receiptType);	
	            var efilters = new Array();
                efilters[0] = new nlobjSearchFilter( 'custrecord_transaction_type', null, 'is', 'salesorder'); 
                efilters[1] = new nlobjSearchFilter( 'custrecord_order_type'    , null, 'is', order_type); 
                efilters[2] = new nlobjSearchFilter( 'custrecord_receipt_reminder_type' , null, 'is', receiptType); 
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
	            eCols.push(new nlobjSearchColumn('custrecord_donor_contact_internal_id'));//custrecord_reminder_days
	            eCols.push(new nlobjSearchColumn('custrecord_reminder_days'));
	            eCols.push(new nlobjSearchColumn('custrecord_first_reminder'));//custrecord_reminder_date_field
	            eCols.push(new nlobjSearchColumn('custrecord_reminder_date_field'));//custrecord_reminder_date_field

               var esearchResults = nlapiSearchRecord( 'customrecord_email_notification_matrix', null, efilters, eCols);
		       if (esearchResults == null) return true;
				nlapiLogExecution('DEBUG','email template','PAST THE SEARCH ');	
				
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
				   emailMember             = objCommResult.getValue('custrecord_email_member_contact');
   				   sentfromemail           = objCommResult.getValue('custrecord_sent_from_email');
				   donor_eMail_Template    = objCommResult.getValue('custrecord_donor_vendor_email_template');
				   donorFieldId            = objCommResult.getValue('custrecord_donor_contact_internal_id');
				   reminderdays            = objCommResult.getValue('custrecord_reminder_days');
				   firstReminder           = objCommResult.getValue('custrecord_first_reminder');
				   dateField               = objCommResult.getValue('custrecord_reminder_date_field');

				   nlapiLogExecution('DEBUG','email template','in found results' + eMail_Template + ' ' + fieldid + emailDonor + ' ' + emailWarehouse + ' ' + emailReceipt + ' ' + emailMember);	
				   nlapiLogExecution('DEBUG','email template','Reminder Days and First Reminder' + firstReminder + ' ' + reminderdays + ' ' + dateField);	

					
				}	
				
				// If today is Sat, Sunday or a holiday - exit and do not send
			     var today       = new Date();
		         var dayOfWeek   = today.getDay();
				 nlapiLogExecution('DEBUG','ISEMAILFOUND ','Day of week ' + dayOfWeek);
			     if(dayOfWeek == 6){
					return true;
                 }
                 if(dayOfWeek == 0){
					return true;
                 }
				 
	            var filters = new Array();
                filters[0] = new nlobjSearchFilter( 'custrecord_holiday_date', null, 'on', nlapiDateToString(today)); 

                var searchResults = nlapiSearchRecord( 'customrecord_auction_holiday', null, filters);
				nlapiLogExecution('DEBUG','Search Resultes Holiday ','Today  ' + searchResults);
                if (searchResults != null)
		        {
					nlapiLogExecution('DEBUG','FOUND HOLIDAY ','Today  ');
					return true;
			    }
				
				if (!isEmpty(dateField))
				{
        			var dateBasis  = recTran.getFieldValue(dateField);
					nlapiLogExecution('DEBUG','Date Basis ','datebasis  ' + dateBasis);
                    if (isEmpty(dateBasis) && !isEmpty(reminderdays)) // exit the process - there is no reminder
					{
						return true;
                    }

                    if (!isEmpty(dateBasis) && !isEmpty(reminderdays) && reminderdays >= 1) // Calculate the projected business days and exit is not > business days
					{
						var dateCalcF = new Date();
	                    dateCalcF     =  recTran.getFieldValue(dateField);
			            var newdate   = nlapiDateToString(nlapiAddDays(nlapiStringToDate(dateCalcF), 0));
					    nlapiLogExecution('DEBUG','New Date','ReminderDays ' + reminderdays);
		                var validDate = false;
						var newdateC = nlapiStringToDate(dateCalcF);
  				        for(var j = 0; j < reminderdays; j++)
                        {
			               newdateC.setDate(newdateC.getDate() + 1);
		                   var dayOfWeek   = newdateC.getDay();
		                   var validDate = false;
                           dayOfWeek   = newdateC.getDay();
                           nlapiLogExecution('DEBUG','New Date','Loop 1 ' + j + ' ' + newdateC + ' ' + dayOfWeek);
						   if(dayOfWeek == 6){
                             newdateC.setDate(newdateC.getDate() + 2);
                           }
                           if(dayOfWeek == 0){
                              newdateC.setDate(newdateC.getDate() + 1);
                           }
			               /// Search the holiday table
		                   var filters = new Array();
                           filters[0] = new nlobjSearchFilter( 'custrecord_holiday_date', null, 'on', nlapiDateToString(newdateC)); // add in item type value
                           filters[1] = new nlobjSearchFilter( 'isinactive', null, 'is', 'F'); 

                           var searchResults = nlapiSearchRecord( 'customrecord_auction_holiday', null, filters);
                           if (searchResults != null)
		                   {
				            newdateC.setDate(newdateC.getDate() + 1);
			               } 
						}
						
					    nlapiLogExecution('DEBUG','New Date','New Date ' + newdateC);
					    nlapiLogExecution('DEBUG','New Date','Today    ' + today);
						if (newdateC >= today)
					    {
						  nlapiLogExecution('DEBUG','After Date');	
                           return true;						  
                        }							
						if (newdateC < today)
					    {
						  nlapiLogExecution('DEBUG','Before Date');	 
                        }							

                    }
                     					
                }  

				if (!isEmpty(sent_emails))
				{
					var emailid = '(' + stComm_Id + ')';
					var emailindex = sent_emails.indexOf(emailid);
					nlapiLogExecution('DEBUG','ISEMAILFOUND ',' EMAILINDEX ' + emailindex);	
					if (emailindex != -1)
				    {
					   //Now check for Modifications - if so find that template
						nlapiLogExecution('DEBUG','IN EMPTY ISEMAILFOUND ',' EMAILINDEX RETURNING' + emailindex);	
						return true;
                    }						

				}

				if (!isEmpty(donor_eMail_Template) && (!isEmpty(recTran.getFieldValue('custbody_donation_contact'))))
				{
					var donorEmail = nlapiLookupField('contact', recTran.getFieldValue('custbody_donation_contact'), 'email');
				    nlapiLogExecution('DEBUG','donor email ','in found results ' + donorEmail);
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
				
				//2. Now Find all the member emails and send the email
				if (member != '' && member != null)
			    {		
				   // Loop through for the Member and member and find the contact emails and send
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
				if (firstReminder == 'T')
				{
					nlapiSubmitField('salesorder', stOppId, 'custbody_first_reminder_sent', 'T');
				}

				
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
			  var Transaction_PDF = nlapiPrintRecord('TRANSACTION', stOppId, 'PDF', null);
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
