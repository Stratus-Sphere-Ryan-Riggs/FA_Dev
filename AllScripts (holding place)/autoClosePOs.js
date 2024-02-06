/**
 *@NApiVersion 2.x
 *@NScriptType scheduledscript
 */

 define([
     'N/search',
     'N/record',
     'N/runtime'
 ],
 /**
     * @param {N_search} nssearch
     * @param {N_record} nsrecord
     * @param {N_runtime} nsruntime
  */
 function(
     nssearch,
    nsrecord,
     nsruntime){
   function yieldScript(remainingUsage){
     
   }
      return{
          execute:function(context){
              var scriptObj = nsruntime.getCurrentScript();
              log.debug("Script parameter of custscript_searchID: " + scriptObj.getParameter({ name: 'custscript_poCloseSearchID' }));
              var searchID = scriptObj.getParameter({name:'custscript_poCloseSearchID'});
              var searchRec = nssearch.load({
                id:searchID
              });
              var searchResults = searchRec.run().getRange({
    			start: 0,
    			end: 100
    			});
              for(var k=0;k<searchResults.length;k++){
                var poID = searchResults[k].getValue({name:'createdfrom_internalid'}); 
                log.debug("po Number: " + searchResults[k].getValue({name:'createdfrom_tranid'}));
                var poRec = nsrecord.load({
                    type:'purchaseorder',
                    id:poID
                });
                var poLines = poRec.getLineCount({
                    sublistId:'item'
                });
                //log.debug("poLines: " + poLines);
                   for(var i=0;i<poLines;i++){
                     //log.debug("i: " + i);
                       poRec.setSublistValue({
                           sublistId:'item',
                           fieldId:'isclosed',
                           line:i,
                           value:true
                       });
                     }
                try{
                   var recID = poRec.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                   });
                //log.debug("recID: " + recID);
               //log.debug("getRemainingUsage: " + scriptObj.getRemainingUsage());
                }catch(e){
                  log.debug("error: " + e);
                }
                }
              
          }
      }
 }
 );
