 /**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        'N/record',
        'N/search',
        'N/runtime',
      	'N/format'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_search} nsSearch
     * @param {N_runtime} nsRuntime
     * @param {N_format} nsFormat
     */
    function (
        nsRecord,
        nsSearch,
        nsRuntime,
        nsFormat
    ) {
        // This is where you will build your search criteria.
        function getInputData() {
            var scriptObj = nsRuntime.getCurrentScript();
            var searchName = scriptObj.getParameter({ name: 'custscript_search_salesorderstobill' });
            // var searchId = scriptObj.getParameter({ name: 'custscript_kbs_searchid_closelineitems' });
            // log.audit('searchId ' + searchId);
            log.audit('searchName', searchName);
            return {
                type: 'search',
                id: searchName
            };
        }

        function map(context) {
            // var result = JSON.parse(context.value).values; // In case you need it for something, otherwise remove this var.
            var scriptObj = nsRuntime.getCurrentScript();
            var daysToApprov = parseInt(scriptObj.getParameter({ name: 'custscript_days_to_approve' }));
            var searchResult = JSON.parse(context.value);
          log.audit('searchResult ', searchResult);
            var intId = searchResult.values['GROUP(internalid.CUSTBODY_ASSOCIATED_SALESORDER)'].value;
          	var billApprovDate = searchResult.values['MAX(formuladate)'];
          	var orderType = searchResult.values['GROUP(custbody_order_type)'].text;
            var vendorBillType = searchResult.values['GROUP(custbody_vendor_bill_type)'].text;
          	var docNum = searchResult.values['GROUP(tranid)'];
          	var productPO = false;
            var rec;
            var itemCount;
            var x;
            context.write({
                key: intId,
                value: intId
            });

            // log.audit('searchResult ', searchResult);
            log.audit('internalId ', intId+ 'bill approval date:'+billApprovDate+' orderType:'+orderType+' vendorBillType:'+vendorBillType);
          	var invCreateDate = new Date(billApprovDate);
          	var validDate = false;
          	var createInv = false;
           if((orderType == 'Grocery' || orderType== 'Produce') && (vendorBillType!='Admin Fee')){
             var poSearch = nsSearch.create({
              	             type: nsSearch.Type.PURCHASE_ORDER,
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
                        var poSearchResults = poSearch.run().getRange({
                            start: 0,
                            end: 10
                            });
                        log.debug('poSearchResults=',poSearchResults[0].getValue('internalid'));
                        createInv = true;
             			if(poSearchResults!=null){
                            var poSearchLen = poSearchResults.length;
                          log.debug('poSearchLen=',poSearchLen);
                            for(var z=0;z<poSearchLen;z++){
                              var poId = poSearchResults[z].getValue('internalid');
                              var poStatus = poSearchResults[z].getValue('status');
                              log.debug('tranid & status',poId+' '+poStatus);
                              if(poStatus =='fullyBilled' || poStatus == 'partiallyReceived'){
                                createInv = true;
                              }else{
                                createInv = false;
                              }
                                
                            }
                        }
          	
             
        } else if (orderType == 'Transportation'){
           var poSearch = nsSearch.create({
              	             type: nsSearch.Type.PURCHASE_ORDER,
                            filters: [
                                ['custbody_associated_salesorder.internalid', nsSearch.Operator.IS, intId],'AND',
                              ['mainline',nsSearch.Operator.IS,'T'],'AND',
                              ['custbody_associated_salesorder.mainline', nsSearch.Operator.IS, 'T']
                            ],
                            columns: [
                                'tranid',
                                'internalid',
                                'status',
                              	'total',
                              	'custbody_vendor_bill_type'
                            ]
                        });
                        var poSearchResults = poSearch.run().getRange({
                            start: 0,
                            end: 10
                            });
                        log.debug('poSearchResults1=',poSearchResults[0].getValue('internalid'));
                        
             			if(poSearchResults!=null){
                            var poSearchLen = poSearchResults.length;
                          log.debug('poSearchLen=',poSearchLen);
                            for(var z=0;z<poSearchLen;z++){
                              var poId = poSearchResults[z].getValue('internalid');
                              var poStatus = poSearchResults[z].getValue('status');
                              var poTotal = poSearchResults[z].getValue('total');
                              var venBillType = poSearchResults[z].getText('custbody_vendor_bill_type');
                              log.debug('tranid & status & total & venBillType',poId+' '+poStatus+' '+ poTotal+' '+venBillType);
                              if(((poStatus =='fullyBilled' || poStatus == 'partiallyReceived') && (venBillType == 'Admin Fee')) || ((venBillType != 'Admin Fee') && (parseFloat(poTotal) ==0.00))){
                                createInv = true;
                              } else{
                                createInv = false;
                              }
                        log.debug('createInv0=',createInv);
                               
                            }
                        }
                   
        }else if(orderType == 'Produce' && vendorBillType=='Admin Fee'){
          var poSearch = nsSearch.create({
              	             type: nsSearch.Type.PURCHASE_ORDER,
                            filters: [
                                ['custbody_associated_salesorder.internalid', nsSearch.Operator.IS, intId],'AND',
                              ['mainline',nsSearch.Operator.IS,'T'],'AND',
                              ['custbody_associated_salesorder.mainline', nsSearch.Operator.IS, 'T']
                            ],
                            columns: [
                                'tranid',
                                'internalid',
                                'status',
                              	'total'
                            ]
                        });
                        var poSearchResults = poSearch.run().getRange({
                            start: 0,
                            end: 10
                            });
                        log.debug('poSearchResults=',poSearchResults[0].getValue('internalid'));
                        
             			if(poSearchResults!=null){
                            var poSearchLen = poSearchResults.length;
                          log.debug('poSearchLen=',poSearchLen);
                            for(var z=0;z<poSearchLen;z++){
                              var poId = poSearchResults[z].getValue('internalid');
                              var poStatus = poSearchResults[z].getValue('status');
                              var poTotal = poSearchResults[z].getValue('total');
                              log.debug('tranid & status & total',poId+' '+poStatus+' '+ poTotal);
                              if(parseFloat(poTotal) ==0.00){
                                createInv = true;
                              }else{
                                createInv = false;
                              }
                                
                            }
                        }
                 }
          if(createInv){
            for(var i = 0; i <= daysToApprov; i++){
              invCreateDate.setDate(invCreateDate.getDate() + 1);
              
              while(!validDate){
                log.audit('invCreateDate: ', invCreateDate+' validDate= '+validDate);
                log.audit('validateDate(invCreateDate) ',validateDate(invCreateDate));
              	if (!validateDate(invCreateDate)) {
                        invCreateDate.setDate(invCreateDate.getDate() + 1);
                } else {
                        validDate = true;
                }
                
              }
              validDate = false;
             }
          }
          	//invCreateDate.setDate(invCreateDate.getDate() + 1);
          var parsedInvDate = nsFormat.format({
            value:invCreateDate,
            type:nsFormat.Type.DATE
          });
          	log.audit('invCreateDate', parsedInvDate);
          	var today = new Date();
          	var parsedToday = nsFormat.format({
            value:today,
            type:nsFormat.Type.DATE
          });
          	log.audit('today: ', parsedToday );
          log.audit('productPO: ', productPO+' docNum: '+docNum);
           
           
             log.debug('createInv1=',createInv);
             	if(createInv && invCreateDate<=today){
                  var vbSearch = nsSearch.create({
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
                        var vbSearchResults = vbSearch.run().getRange({
                            start: 0,
                            end: 10
                            });
                        log.debug('poSearchResults=',vbSearchResults[0].getValue('status'));
                  if(vbSearchResults!=null){
                            var vbSearchLen = vbSearchResults.length;
                          log.debug('vbSearchLen=',vbSearchLen);
                            for(var m=0;m<vbSearchLen;m++){
                              var vbStatus = vbSearchResults[m].getValue('status');
                              log.debug('status',vbStatus);
                              if(vbStatus!='open'){
                                createInv = false;
                              }
                            }
                  }
                }
             log.debug('createInv2=',createInv + invCreateDate + intId);
             if(createInv && invCreateDate<=today){
            	var invRecord = nsRecord.transform({
                	fromType: 'salesorder',
                	fromId: intId,
                	toType: 'invoice',
                    isDynamic: true,
            	});
          	
          	var invInternalId = invRecord.save({
              enableSourcing:false,
              ignoreMandatoryFields:false
            });

            log.audit('invoice internalId ', invInternalId);
           }
           
		  productPO = false;
          createInv = false;
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
          
        function validateDate(stDate){
          //stDate = "11/28/2019";
          log.audit('stDate',stDate);
          var validDate = true;
          var newDate = new Date(stDate);
          var parsedDate = nsFormat.parse({
            value:stDate,
            type:nsFormat.Type.DATE
          });
          var formattedDate = nsFormat.format({
            value:parsedDate,
            type:nsFormat.Type.DATE
          });
          log.audit('parsedDate',parsedDate);
          log.audit('formattedDate',formattedDate);
          var dayOfWeek   = newDate.getDay();
              if(dayOfWeek == 6){
                 validDate = false;
               }
               if(dayOfWeek == 0){
                 validDate = false;
              }
           var mySearch = nsSearch.create({
        		type: nsSearch.Type.CUSTOM_RECORD + '_auction_holiday',
        		filters: [{name:'custrecord_holiday_date',
                           operator:nsSearch.Operator.ON,
                           values:formattedDate}],
             	columns:[{name:'custrecord_holiday_date'}]
    	   });
       
          mySearch.run().each(function(result) {
        	var holDate = result.getValue({
            	name: 'custrecord_holiday_date'
        	});
            log.debug('holiday Date:',holDate);
            if(formattedDate==holDate){
              log.debug('holiday Date& invoice date:','match');
              validDate = false;
            }
          });
         return validDate;
        } 
          
        return {
            getInputData: getInputData,
            map: map,
            // reduce: reduce,
            summarize: summarize
        };
    }
);
