/**
* Company			Feeding America
* Type				NetSuite UserEvent SuiteScript
* Version			1.0.0.0
* Description		Mark Needs ACH Approval checkbox on vendor record as true when Avid ACH Account record is created or updated
*
**/

function beforeSubmit_ACH(type, name)
{
  
  if (type == 'edit' || type == 'create')
  {
  
  var vendor = nlapiGetFieldValue('custrecord_pp_ach_entity');
  nlapiSubmitField('vendor', vendor, 'custentity_needs_ach_approval', 'T');
  return true;
  }
  
}