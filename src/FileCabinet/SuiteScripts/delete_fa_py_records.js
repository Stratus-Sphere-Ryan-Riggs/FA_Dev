nlapiLogExecution("audit","FLOStart",new Date().getTime());
function scheduled_delete_fa_py_records(type)
{
	var context = nlapiGetContext();
	var deleteFAPYCYAcctMap = context.getSetting('SCRIPT', 'custscript_del_fa_py_cy_acct_map');
	var deleteFAPYNARFundBal = context.getSetting('SCRIPT', 'custscript_del_fa_py_nar_fund_bal');

	var arrColumns = [new nlobjSearchColumn('internalid')];

	if(deleteFAPYCYAcctMap == 'T')
	{
		var arrFAPYCYResults = nlapiSearchRecord('customrecord_fa_py_cy_acct_map', null, null, arrColumns);

		if (arrFAPYCYResults)
		{
			for (var i = 0; i < arrFAPYCYResults.length; i++)
			{
				var stUpdateExpId = arrFAPYCYResults[i].getValue('internalid');

				nlapiDeleteRecord('customrecord_fa_py_cy_acct_map',stUpdateExpId);
			}
		}
	}

	if(deleteFAPYNARFundBal == 'T')
	{
		var arrFAPYNARResults = nlapiSearchRecord('customrecord_fa_py_fund_bal_w_seg', null, null, arrColumns);

		if (arrFAPYNARResults)
		{
			for (var i = 0; i < arrFAPYNARResults.length; i++)
			{
				var stUpdateExpId = arrFAPYNARResults[i].getValue('internalid');

				nlapiDeleteRecord('customrecord_fa_py_fund_bal_w_seg',stUpdateExpId);
			}
		}
	}
}