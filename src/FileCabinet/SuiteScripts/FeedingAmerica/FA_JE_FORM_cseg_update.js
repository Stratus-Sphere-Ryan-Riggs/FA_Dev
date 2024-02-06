nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Oct 2016     US37907
 * 1.1		  12 Oct 2016	  US34734		updating from demo account to FA account
 *
 *
 *Description:
 *This script will take the value from a custom list/record column on the Journal Entry, 
 *from a specific form, and use it to populate the custom segment column on the JE line.
 *
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, xedit

 * @returns {Void}
 */

function userEventAfterSubmit(type){
	
	//make sure we are only working on the appropriate records submitted through the integration form
	//use a script parameter to make sure the correct form is being used.
	
	var requiredForm = nlapiGetContext().getSetting('SCRIPT','custscript_trans_form_for_script_trigger');
	
	nlapiLogExecution('DEBUG', 'Form IDs', 'current / required: ' + nlapiGetFieldValue('customform') + ' / ' + requiredForm);

	if(nlapiGetFieldValue('customform') == requiredForm){
		
			if(type == 'create' || type == 'edit' || type == 'xedit'){
						
			// Get the line count on the Journal Entry
			var newJournalRec = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId(),{recordmode: 'dynamic'});
			var lineCount = newJournalRec.getLineItemCount('line');
						
			for (var i = 1; i <= lineCount; i++){
				nlapiLogExecution('DEBUG', 'Inside of line loop', i + ' of ' + lineCount);
				
				//get value from custom list/record field
				var projectCustSegCol = newJournalRec.getLineItemText('line', 'custcol_project_cseg',i);
				nlapiLogExecution('DEBUG', 'projectCustSegCol',"-"+projectCustSegCol+"-");
				
				if(projectCustSegCol != null && projectCustSegCol != ''){

					newJournalRec.selectLineItem('line', i);
					newJournalRec.setCurrentLineItemText('line', 'custcol_cseg_projects_cseg', projectCustSegCol);
					newJournalRec.commitLineItem('line');
				}
			}
			//submit record changes
			nlapiSubmitRecord(newJournalRec, true);
			
			}
		}
	}
