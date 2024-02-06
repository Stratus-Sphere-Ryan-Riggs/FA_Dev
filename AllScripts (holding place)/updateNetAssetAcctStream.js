function setMissingAcctStream(){
    var objContext = nlapiGetContext();
    var jeObjects = objContext.getSetting('SCRIPT', 'custscript_jes_to_update');
    var jeArray = JSON.parse(jeObjects);
  	var changeJeObj = "No";
    for(var i=0;i<jeArray.length;i++){
        var jeInternalId = jeArray[i].internalid;
      	var jeInternalIdNext = '';
        var jeLineId = parseInt(jeArray[i].lineid)+1;
        var jeAcctStream = jeArray[i].acctstream;
        var jeTransObj;
      var jeAcctStreamValue;
      if(jeAcctStream=="CORPORATE"){
        jeAcctStreamValue = '1';
      }
      if(jeAcctStream=="MAJOR GIFTS"){
        jeAcctStreamValue = '5';
      }
      if(jeAcctStream=="FOUNDATIONS"){
        jeAcctStreamValue = '4';
      }
      if(jeAcctStream=="CAUSE MARKETING"){
        jeAcctStreamValue = '3';
      }
      if(jeAcctStream=="DIRECT MARKETING"){
        jeAcctStreamValue = '2';
      }
      if(i!=jeArray.length-1){
         jeInternalIdNext = jeArray[i+1].internalid;
      }
      
        nlapiLogExecution('DEBUG','setMissingAcctStream',JSON.stringify(jeArray[i]));
      
      if(changeJeObj=="Yes" || i==0){  
      	jeTransObj = nlapiLoadRecord('journalentry',jeInternalId);  
      }
        		jeTransObj.setLineItemValue('line','custcol_fa_acct_stream_for_ye',jeLineId,jeAcctStreamValue);
              
	nlapiLogExecution('DEBUG','jeInternalId:jeInternalIdNext',jeInternalId+":"+jeInternalIdNext);
      
      if(jeInternalId!=jeInternalIdNext){
        var recId = nlapiSubmitRecord(jeTransObj);
        nlapiLogExecution('DEBUG','recId:',recId);
        changeJeObj = "Yes";
        jeTransObj = '';
      }else{
        changeJeObj = "No";
      }
     /* jeTransObj = nlapiLoadRecord('journalentry',jeInternalId);
        var acctStream = jeTransObj.getLineItemText('line','custcol_fa_acct_stream_for_ye',jeLineId);
		nlapiLogExecution('DEBUG','setMissingAcctStream:acctStream',acctStream);*/
    }
}