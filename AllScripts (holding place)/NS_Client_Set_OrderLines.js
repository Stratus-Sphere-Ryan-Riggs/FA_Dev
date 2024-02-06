/**
* Company			FBR
* Type				NetSuite Client-Side SuiteScript
* Version			1.0.0.0
* Description		This script will set the sales order bill to member and the Vendor 
*
* Change History
* 08/17/2016 - Create
*/


function ns_client_lineinit(type, name)
{
	   nlapiLogExecution('DEBUG','lineinit','|------------SCRIPT START------------||' + type + name);
	   
	   if (type == 'item')
	   {
		      
	        nlapiLogExecution('DEBUG','lineinit','In Line item' + type + name);
			nlapiSetCurrentLineItemValue('item', 'custcol_member_bank', nlapiGetFieldValue('entity'));
	   }

	   return true;

}
