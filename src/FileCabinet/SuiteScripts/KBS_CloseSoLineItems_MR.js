/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
// Case 6743
define(
    [
        'N/record',
        'N/search',
        'N/runtime'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_search} nsSearch
     * @param {N_runtime} nsRuntime
     */
    function (
        nsRecord,
        nsSearch,
        nsRuntime
    ) {
        // This is where you will build your search criteria.
        function getInputData() {
            var scriptObj = nsRuntime.getCurrentScript();
            //var searchName = scriptObj.getParameter({ name: 'custscript_kbs_search_closelineitems' });
            var searchId = scriptObj.getParameter({ name: 'custscript_kbs_searchid_closelineitems' });
            log.audit('searchId ' + searchId);
            //log.audit('searchName', searchName);
            return {
                type: 'search',
                id: searchId
                // internalId: 2251  - 'customsearch_kbs_invoicevenbill_gp_4'
            };
        }

        function map(context) {
            // var result = JSON.parse(context.value).values; // In case you need it for something, otherwise remove this var.
            var searchResult = JSON.parse(context.value);
            var intId = searchResult.values['GROUP(internalid.CUSTBODY_ASSOCIATED_SALESORDER)'].value;
            var rec;
            var itemCount;
            var x;
            context.write({
                key: intId,
                value: intId
            });

            // log.audit('searchResult ', searchResult);
            log.debug('internalId ', intId);
          
          
          	 var doNotProcess = false;
             var billSearch = nsSearch.create({
              	             type: nsSearch.Type.VENDOR_BILL,
                            filters: [
                                ['custbody_associated_salesorder.internalid', nsSearch.Operator.IS, intId],'AND',
                              ['mainline',nsSearch.Operator.IS,'T'],'AND',
                              ['custbody_associated_salesorder.mainline', nsSearch.Operator.IS, 'T']
                            ],
                            columns: [
                                'tranid',
                                'internalid',
                                'status'
                            ]
                        });
                        var billSearchResults = billSearch.run().getRange({
                            start: 0,
                            end: 10
                            });
                        //log.debug('billSearchResults=',billSearchResults[0].getValue('internalid'));
             			if(billSearchResults!=null){
                            var billSearchLen = billSearchResults.length;
                            log.debug('billSearchLen=',billSearchLen);
                            for(var z=0;z<billSearchLen;z++){
                              if(!doNotProcess) {
                              var billId = billSearchResults[z].getValue('internalid');
                              var billStatus = billSearchResults[z].getValue('status');
                              log.debug('tranid & status',billId+' '+billStatus);
                              if(billStatus =='paidInFull'){
                                doNotProcess = false;
                              }else{
                                doNotProcess = true;
                              }
                              }
                            }
                        }
             var invSearch = nsSearch.create({
              	             type: nsSearch.Type.INVOICE,
                            filters: [
                                ['custbody_associated_salesorder.internalid', nsSearch.Operator.IS, intId],'AND',
                              ['mainline',nsSearch.Operator.IS,'T'],'AND',
                              ['custbody_associated_salesorder.mainline', nsSearch.Operator.IS, 'T']
                            ],
                            columns: [
                                'tranid',
                                'internalid',
                                'status'
                            ]
                        });
                        var invSearchResults = invSearch.run().getRange({
                            start: 0,
                            end: 10
                            });
                        //log.debug('invSearchResults=',invSearchResults[0].getValue('internalid'));
             			if(invSearchResults!=null){
                            var invSearchLen = invSearchResults.length;
                            log.debug('invSearchLen=',invSearchLen);
                            for(var z=0;z<invSearchLen;z++){
                              if(!doNotProcess) {
                              var invId = invSearchResults[z].getValue('internalid');
                              var invStatus = invSearchResults[z].getValue('status');
                              log.debug('tranid & status',invId+' '+invStatus);
                              if(invStatus =='paidInFull'){
                                doNotProcess = false;
                              }else{
                                doNotProcess = true;
                              }
                              }
                            }
                        }
                            log.debug('doNotProcess1',doNotProcess);
          if(!doNotProcess) {
                            log.debug('doNotProcess2',doNotProcess);
            rec = nsRecord.load({
                type: nsRecord.Type.SALES_ORDER,
                id: intId
            });

            itemCount = rec.getLineCount({ sublistId: 'item' });
            log.audit('sublist length ' + itemCount);

            // loop through the item sublist and close all line items.
            for (x = 0; x < itemCount; x += 1) {
                // rec.selectLine({
                //     sublistId: 'item',
                //     line: x
                // });
                // rec.setCurrentSublistValue({
                //     sublistId: 'item',
                //     fieldId: 'isclosed',
                //     value: true,
                //     ignoreFieldChange: true
                // });
                rec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'isclosed',
                    line: x,
                    value: true
                });
                // rec.commitLine({
                //     sublistId: 'item'
                // });
            }
            rec.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
        }

        }

        // function reduce(context) {
        //
        // }

        function summarize(summary) {
            var mapArray = [];
            var arrCtr = 0;
            try {
                summary.mapSummary.keys.iterator().each(function (key) {
                    mapArray.push(key);
                    arrCtr += 1;
                    return true;
                });
                log.audit('mapSummary', 'Processed ' + arrCtr + ', transactions');
                log.audit('mapSummary', 'mapArray: ' + JSON.stringify(mapArray));

                log.debug('summary', JSON.stringify(summary));
                // This is the error iterator. It will trigger for each error that ocurred during the map stage (if any).
                // The below function will log out each of those errors for you.
                summary.mapSummary.errors.iterator().each(function (key, error, executionNo) {
                    log.error('map key = ' + key, 'Message is ' + JSON.stringify(error));
                    return true;
                });
            } catch (ex) {
                log.error(ex.name, JSON.stringify(ex));
            }

        }
        return {
            getInputData: getInputData,
            map: map,
            // reduce: reduce,
            summarize: summarize
        };
    }
);
