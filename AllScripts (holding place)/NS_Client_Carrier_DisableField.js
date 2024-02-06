nlapiLogExecution("audit","FLOStart",new Date().getTime());
/**
* Company			Feeding America
* Type				NetSuite UserEvent SuiteScript
* Version			1.0.0.0
* Description		Remove some fields from the carrier form
*
* Change History
* 08/29/2016 - Initially Set
**/

function beforeLoad_Carrier(type, name)
{
   form.getField('printoncheckas').setDisplayType('hidden');
   form.getField('image').setDisplayType('hidden');
   form.getField('taxidnum').setDisplayType('hidden');
   //form.getField('otherrelationships').setDisplayType('disabled');
   form.getField('emailpreference').setDisplayType('hidden');
}


function beforeSubmit_Carrier(type, name)
{
  
  if (type != 'edit')
  {
    return true;
  }	
  
  var today = getCurrentTimestamp();
  nlapiSetDateTimeValue('custentity_last_update_time', today,10);
  return true;
  
}

function getCurrentTimestamp() 
{
	var today = new Date();
	var fullDate = nlapiDateToString(today);
	
	var intMins = today.getMinutes();
	
	var intHours = today.getHours();	
	if (intHours > 12)
	{
		intHours = intHours - 12;
	}	
   
    return (fullDate + ' ' + (intHours < 10 ? "0" + intHours : intHours) + ":" + intMins + ":00" + " " + (intHours < 12 ? 'am' : 'pm'));
}
