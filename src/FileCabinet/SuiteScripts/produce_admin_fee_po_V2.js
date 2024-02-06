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
  
  function createPO(poData,createdfrom){
    
      var poRec = nsrecord.create({
    				type: nsrecord.Type.PURCHASE_ORDER, 
    				isDynamic: true,
      				});
      	poRec.setValue({
            fieldId: 'entity',
            value: poData.vendor
        });
      poRec.setValue({
            fieldId: 'custbody_associated_salesorder',
            value: parseInt(poData.createdfrom),
    		ignoreFieldChange: true
        });
      	poRec.setValue({
            fieldId: 'custbody_order_type',
            value: '2'
        });
      	poRec.setValue({
            fieldId: 'department',
            value: '22'
        });
      	poRec.setValue({
            fieldId: 'class',
            value: '6'
        });
      	poRec.setValue({
            fieldId: 'location',
            value: '224'
        });
    	poRec.setText({
            fieldId: 'approvalstatus',
            text: 'Approved'
        });
        poRec.setValue({
            fieldId: 'custbody_vendor_bill_type',
            value: '1'
        });
      	var itemLen = poData.itemList.length;
		for(var j=0;j<itemLen;j++){
            var itemObj = poData.itemList[j];
          log.debug('PO Rate:',itemObj.porate);
          poRec.selectNewLine({
            sublistId: 'item'
          });
          poRec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            value: '4032'
          });
          poRec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'description',
            value: itemObj.itemId+' - '+itemObj.description
          });
          poRec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_vendor_item_no',
            value: itemObj.vendor_item_no
          });
          poRec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            value: itemObj.quantity
          });
          poRec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            value: itemObj.porate
          });
          poRec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'amount',
            value: parseFloat(itemObj.porate*itemObj.quantity)
          });
          poRec.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'custcol_mag_ref_no',
            value: itemObj.magref
          });
          poRec.commitLine({
            sublistId: 'item'
        });
     }
      var recordId = poRec.save();
      log.debug('recordId',recordId);
      nsrecord.submitFields({
      type: nsrecord.Type.PURCHASE_ORDER,
      id: recordId,
      values: {
          custbody_associated_salesorder: parseInt(poData.createdfrom)
      },
      options: {
          enableSourcing: false,
          ignoreMandatoryFields : true
      }
  });
  }
  
  function callPOMethod(poObjs,createdfrom,createPOType){
    log.debug('poObjs.length',poObjs.poAdminFeeObj.length);
    log.debug('poObjs',JSON.stringify(poObjs));
    log.debug('createdfrom',createdfrom);
    
    var searchRec = nssearch.create({
                type: nssearch.Type.PURCHASE_ORDER,
                filters: [
                    ['custbody_vendor_bill_type',nssearch.Operator.IS, '1'],
                    'AND',
                    ['custbody_associated_salesorder.internalid', nssearch.Operator.IS, createdfrom],
                 'AND',
                    ['custbody_associated_salesorder.mainline', nssearch.Operator.IS, 'T'],   
                ],
                columns: [
                  nssearch.createColumn({
                        name: 'tranid',
                        sort: nssearch.Sort.ASC
                    }),
                  	'internalid',
                  	'status',
                    'entity',
                  	'custcol_vendor_item_no',
                  	'custcol_mag_ref_no',
                    'linesequencenumber',
                    'quantity',
                  	'rate'
                	]
              });
    var searchResults = searchRec.run().getRange({
               start: 0,
               end: 200
               });
    if(searchResults!=null && searchResults.length>0 && createPOType == 'RevdQty'){
      log.debug('searchResults.length',searchResults.length);
       var len = poObjs.poAdminFeeObj.length;
	for(var i=0;i<len;i++){
    var poExists = false;
   	var poData = poObjs.poAdminFeeObj[i];
    var vendor = '';
    var itemLen = poData.itemList.length;
    for(var j=0;j<itemLen;j++){
        var itemObj = poData.itemList[j];
        log.debug('mag_ref_no:'+itemObj.magref);
        log.debug('item_fulfill_no:'+itemObj.vendor_item_no);
        var lineFound = false;
        var lineInserted = false;
        for(var k=0;k<searchResults.length;k++){
            var tranId = searchResults[k].getValue({name:'tranid'});
          	var line = searchResults[k].getValue({name:'linesequencenumber'});
          	var quantity = searchResults[k].getValue({name:'quantity'});
          	var status = searchResults[k].getValue({name:'status'});
          	var rate = searchResults[k].getValue({name:'rate'});
          	var internalId = searchResults[k].getValue({name:'internalid'});
          	if(line==0){
      			vendor = searchResults[k].getValue({name:'entity'});
              	continue;
          	}
            var itemFulfillNo = searchResults[k].getValue({name:'custcol_vendor_item_no'});
          	var mag_ref = searchResults[k].getValue({name:'custcol_mag_ref_no'});
        	log.debug('tranId',tranId+ ' line:'+line +' vendor: '+vendor+'  itemFulfillNo:'+itemFulfillNo+' mag_ref:'+mag_ref+' internalId:'+internalId);
       		log.debug('poData.vendor: ',poData.vendor);
            if(poData.vendor==vendor){
                poExists = true;
                if(itemObj.magref==mag_ref && itemObj.vendor_item_no==itemFulfillNo){
                    log.debug('update needed','PO quantity:'+quantity+' Item fulfill Qty:'+itemObj.quantity+' Status:'+status);
                    if(quantity != itemObj.quantity){
                      if(status == 'pendingSupApproval' || status == 'pendingBilling'){
                        var objRecord = nsrecord.load({
    					    type: nsrecord.Type.PURCHASE_ORDER,
    					    id: internalId,
                        });
                        objRecord.setSublistValue({
                    	    sublistId: 'item',
    					    fieldId: 'quantity',
    					    line: line-1,
    					    value: itemObj.quantity
                    	    });
                        var recID = objRecord.save();
                        log.debug('recID:',recID);
                      }else{
                        log.debug('Send alert email to A/P');
                        // var dueDate = '02/04/2020';
                    	//log.debug('DEBUG','due date',dueDate);
                    	var taskRec = nsrecord.create({
    							type: nsrecord.Type.TASK, 
    							isDynamic: true,
      							});
                    	taskRec.setValue({
                          fieldId: 'title',
                          value: 'Accounts Payable Analyst:Quantity change in Admin Fee PO after approval'
                        });
                    	taskRec.setValue({
                          fieldId: 'assigned',
                          value: 447343
                        });
                    	taskRec.setValue({
                          fieldId: 'owner',
                          value: 19692
                        });
                    	taskRec.setText({
                          fieldId: 'priority',
                          text: 'High'
                        });
                        taskRec.setValue({
                          fieldId: 'company',
                          value: vendor
                        });
                        taskRec.setText({
                          fieldId: 'transaction',
                          text: 'Purchase Order #'+tranId
                        });
                    	taskRec.setValue({
                          fieldId: 'sendemail',
                          value: true
                        });
                    	/*taskRec.setValue({
                          fieldId: 'duedate',
                          value: dueDate
                        });*/
                    var taskId = taskRec.save();
                   /* var taskRec2 = nsrecord.load({
    					    type: nsrecord.Type.TASK,
    					    id: taskId,
                        });
                      taskRec2.setText({
                          fieldId: 'transaction',
                          text: 'Purchase Order #'+tranId
                        }); 
                        taskId = taskRec2.save();*/
                    	log.debug('DEBUG','created task',taskId);
                    	log.debug('DEBUG','sending email',' to A/P');
                      }
                    }
                  	if(rate != itemObj.porate){
                        var objRecord = nsrecord.load({
    					    type: nsrecord.Type.PURCHASE_ORDER,
    					    id: internalId,
                        });
                        objRecord.setSublistValue({
                    	    sublistId: 'item',
    					    fieldId: 'rate',
    					    line: line-1,
    					    value: itemObj.porate
                    	    });
                        var recID = objRecord.save();
                        log.debug('recID:',recID);
                    }
                    lineFound=true;
                    break;
                }
                else{
                    if(k==searchResults.length-1){
                        lineFound=false;
                    }
                }         
            }
        }
        if(!lineFound && !lineInserted){
            log.debug('insert needed');
            var objRecord = nsrecord.load({
    			type: nsrecord.Type.PURCHASE_ORDER,
    			id: internalId,
                });
            objRecord.insertLine({
            	sublistId: 'item',
                line: line
            });
          	objRecord.setSublistValue({
            	sublistId: 'item',
            	fieldId: 'item',
               	line: line,
            	value: '4032'
          	});
          	objRecord.setSublistValue({
            	sublistId: 'item',
            	fieldId: 'description',
               	line: line,
            	value: itemObj.itemId+' - '+itemObj.description
          	});
          	objRecord.setSublistValue({
            	sublistId: 'item',
            	fieldId: 'custcol_vendor_item_no',
               	line: line,
            	value: itemObj.vendor_item_no
          	});
          	objRecord.setSublistValue({
            	sublistId: 'item',
            	fieldId: 'quantity',
               	line: line,
                value: itemObj.quantity
            });
          	objRecord.setSublistValue({
           		sublistId: 'item',
           		fieldId: 'rate',
               	line: line,
           		value: itemObj.porate
          	});
          	objRecord.setSublistValue({
           		sublistId: 'item',
           		fieldId: 'custcol_mag_ref_no',
               	line: line,
           		value: itemObj.magref
          	});
            var recID = objRecord.save();
            log.debug('recID:',recID);
            lineInserted =  true;
        }
    }
    if(!poExists){
        log.debug('No PO exists for the vendor -> create PO');
        createPO(poData,createdfrom);
    }
	}   
    } else if (searchResults!=null && searchResults.length>0 && createPOType == 'FlatFee'){
               log.debug('PO Exists->>Flat fee');
      //TODO code for flat fee update
    }
    else{
      	log.debug('No PO Exists->>create PO');
    	var len = poObjs.poAdminFeeObj.length;
    	for(var i=0;i<len;i++){
      		var poData = poObjs.poAdminFeeObj[i];
    		createPO(poData,createdfrom);
        }
    }
    
  }

     return{
         execute:function(context){
             var scriptObj = nsruntime.getCurrentScript();
             log.debug("Script parameter of custscript_searchID: " + scriptObj.getParameter({ name: 'custscript_produce_adm_fee_so' }));
             var masterSO = scriptObj.getParameter({name:'custscript_produce_adm_fee_so'});
             var searchID = scriptObj.getParameter({name:'custscript_search_item_fulfill'});
           		
           	 var createFlatFeePO = nssearch.lookupFields({
               					type: nssearch.Type.SALES_ORDER,
    							id: masterSO,
               					columns:['custbody_adm_flat_fee_po']
             					});
           log.debug("createFlatFeePO: ", createFlatFeePO);
           		log.debug("createFlatFeePO: ", createFlatFeePO);
           if(createFlatFeePO.custbody_adm_flat_fee_po){
             var flatFeePORate = nssearch.lookupFields({
               					type: nssearch.Type.SALES_ORDER,
    							id: masterSO,
               					columns:['custbody_adm_fee_flat_rate']
             					});
             log.debug("flatFeePORate: ", flatFeePORate.custbody_adm_fee_flat_rate);
             //	log.debug("flatFeePORate: ", flatFeePORate);
             var vendor = nssearch.lookupFields({
               					type: nssearch.Type.SALES_ORDER,
    							id: masterSO,
               					columns:['custbodycustbody_admin_fee_recipient']
             					});
             log.debug("vendor: ", vendor.custbodycustbody_admin_fee_recipient[0].value);
            // log.debug("vendor: ", vendor[0].value);
             	var poObjs = {
                 poAdminFeeObj:[]
           		};
             	var poData = {
               		vendor:'',
                  	itemList:[]
           		};
                poData.vendor = vendor.custbodycustbody_admin_fee_recipient[0].value;
             	poData.createdfrom = masterSO;
             	poData.createPOType = 'FlatFee';
             	var itemObj = {
                    item:'Flat Rate',
					itemId:'Flat Rate',
                    quantity:parseInt('1'),
                    porate:parseFloat(flatFeePORate.custbody_adm_fee_flat_rate),
                    magref:'1001',
                    description:'Flat Rate Fee',
                    vendor_item_no:''
                  };
				poData.itemList[0]=itemObj;
             	poObjs.poAdminFeeObj.push(poData);
                callPOMethod(poObjs,masterSO,'FlatFee');
           }else{
             var searchRec = nssearch.create({
                type: nssearch.Type.ITEM_FULFILLMENT,
                filters: [
                    [['custcol_admin_fee_vendor', 'anyof', '1'], 'or',
                     ['custcol_admin_fee_vendor', 'anyof', '2'], 'or',
                     ['custcol_admin_fee_vendor', 'anyof', '3']],
                    'AND',
                    ['createdfrom.internalid', nssearch.Operator.IS, masterSO]
                    ],
                columns: [
                    'tranid',
                  	'createdfrom',
                  	nssearch.createColumn({
                        name: 'custcol_admin_fee_vendor',
                        sort: nssearch.Sort.ASC
                    }),
                    'quantity',
                    'custcol_produce_adm_fee_qty',
                  	'item',
                  	nssearch.createColumn({
                        name: 'itemid',
                        join: 'item'
                    }),
                  	'custcolfa_vendor_item_name',
                  	'custcol_mag_ref_no',
                  	'custbodycustbody_admin_fee_recipient',
                  	'custbody_admin_fee_recp_2',
                  	'custbody_admin_fee_recp_3',
                  	'custbody_admin_fees',
                  	'custbody_admin_fee_for_rec1',
                  	'custbody_admin_fee_for_rec2',
                  	'custbody_admin_fee_for_rec3'
                ]
            });
        
             var searchResults = searchRec.run().getRange({
               start: 0,
               end: 200
               });
           var itemCount1 = parseInt(0);
           var itemCount2 = parseInt(0);
           var itemCount3 = parseInt(0);
           var poObjs = {
                 poAdminFeeObj:[]
           };
           var poData = {
               vendor:'',
               itemList:[]
           }
           if(searchResults!=null){	 
           	var searchLen = searchResults.length;
             for(var k=0;k<searchResults.length;k++){
               var tranId = searchResults[k].getValue({name:'tranid'});
               var quantity = searchResults[k].getValue({name:'quantity'});
               var description = searchResults[k].getValue({name:'custcolfa_vendor_item_name'});
               var createdfrom = searchResults[k].getValue({name:'createdfrom'});
               var sub_admin_fee = searchResults[k].getValue({name:'custcol_admin_fee_vendor'});
               var item = searchResults[k].getValue({name:'item'});
               var mag_ref_no = searchResults[k].getValue({name:'custcol_mag_ref_no'});
               var itemId = searchResults[k].getValue({name:'itemid',join:'item'});
               var adminFeeRec1 = searchResults[k].getValue({name:'custbodycustbody_admin_fee_recipient'});
               var adminFeeRec2 = searchResults[k].getValue({name:'custbody_admin_fee_recp_2'});
               var adminFeeRec3 = searchResults[k].getValue({name:'custbody_admin_fee_recp_3'});
			   //Added for ticket #7342 by Thilaga
               var admin_fee_per_qty = parseFloat(searchResults[k].getValue({name:'custcol_produce_adm_fee_qty'})).toFixed(2);
               log.debug("quantity: " + quantity+ ' sub_admin_fee:'+sub_admin_fee+' item:'+item+' itemId:'+itemId);
               
               	if(sub_admin_fee=='1'){
                  if(itemCount1==0){
                    poData.vendor = adminFeeRec1;
                    poData.createdfrom = createdfrom;
                    poData.createPOType = 'RevdQty';
                  }
                  var itemObj = {
                    item:item,
					itemId:itemId,
                    quantity:quantity,
                    porate:admin_fee_per_qty,
                    magref:mag_ref_no,
                    description:description,
                    vendor_item_no:tranId
                  };
                  log.debug('itemCount1',itemCount1);
                  poData.itemList[itemCount1]=itemObj;
                  itemCount1++;
                  log.debug('poData for admin1',poData);
                }
               if(sub_admin_fee=='2'){
                  if(itemCount2==0){
                    poObjs.poAdminFeeObj.push(poData);
                    poData = {
                    	vendor:'',
                    	itemList:[]
                  	}
                    poData.vendor = adminFeeRec2;
                    poData.createdfrom = createdfrom;
                    poData.createPOType = 'RevdQty';
                  }
                  var itemObj = {
                    item:item,
					itemId:itemId,
                    quantity:quantity,
                    porate:admin_fee_per_qty,
                    magref:mag_ref_no,
                    description:description,
                    vendor_item_no:tranId
                  };
                  poData.itemList[itemCount2]=itemObj;
                  itemCount2++;
                 log.debug('poData for admin2',poData);
                }
               if(sub_admin_fee=='3'){
                  if(itemCount3==0){
                    poObjs.poAdminFeeObj.push(poData);
                    poData = {
                    	vendor:'',
                    	itemList:[]
                  	}
                    poData.vendor = adminFeeRec3;
                    poData.createdfrom = createdfrom;
                    poData.createPOType = 'RevdQty';
                  }
                  var itemObj = {
                    item:item,
					itemId:itemId,
                    quantity:quantity,
                    porate:admin_fee_per_qty,
                    magref:mag_ref_no,
                    description:description,
                    vendor_item_no:tranId
                  };
                  poData.itemList[itemCount3]=itemObj;
                  itemCount3++;
                 log.debug('poData for admin3',poData);
                }
               if(k==searchLen-1){
                 poObjs.poAdminFeeObj.push(poData);
                 callPOMethod(poObjs,createdfrom,'RevdQty');
               }
             }
            }
           }
             
       		
         }
     }
}
);
