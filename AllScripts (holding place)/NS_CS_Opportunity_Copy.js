nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
* Company			Feeding America
* Type				NetSuite Client-Side SuiteScript
* Version			1.0.0.0
* Description		This script will clear out fields on a copy
*
* Change History
* 09/08/2016 - Clear out 
* 09/29/2016 - Add a save check to ensure only 1 first pickup location is
* 10/27/2016 - Disable Vendor on UI
**/

function pageinit(type, name)
{

 
   if (type == 'copy')
   {
	   nlapiSetFieldValue('custbody_release_date','');
	   nlapiSetFieldValue('custbody_produce_passing','');
	   nlapiSetFieldValue('custbody_finance_approved','F');
	   nlapiSetFieldValue('custbody_order_has_issues','F');
	   nlapiSetFieldValue('custbody_associated_transaction','');
	   nlapiSetFieldValue('custbody_order_issues','');
	   nlapiSetFieldValue('custbody_order_has_issues_reason','');
	   nlapiSetFieldValue('custbody_freight_po_number','');
	   nlapiSetFieldValue('custbody_transporation_po_number','');
	   nlapiSetFieldValue('custbody_fa_emails_sent','');
	   nlapiSetFieldValue('custbody_admin_fees', nlapiFormatCurrency('0.00')); 
	   nlapiSetFieldValue('custbody_admin_fee_per_pound_rate', nlapiFormatCurrency('0.00')); 

   }

   return true;
}
