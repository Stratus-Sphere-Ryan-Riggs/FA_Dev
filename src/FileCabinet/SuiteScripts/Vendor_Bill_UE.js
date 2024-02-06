/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(
    [
        'N/record',
        'N/search'
    ],
    function (
        nsRecord,
        nsSearch
    ) {

        function afterSubmit(context) {
            var newRec = context.newRecord;
            var type = context.type;
            var orderType = newRec.getValue('custbody_order_type');
            var vendorBillType = newRec.getValue('custbody_vendor_bill_type');
            var soID = newRec.getValue('custbody_associated_salesorder');
            var soShipMethodCode;
            var subsidySearch;
            var searchResults;
            var lineItem;
            var lineItemProject;
            var lineItemFund;
            var lineItemAmount;
            var objRecord;
            var itemCount;
            var itemId;
            var headerProgram;
            var headerClass;
            var headerProject;
            var headerFund;
            var totalAmount;
            var diffAmount;
            var currentLine;
            var headerMemo;
            var nonAccessorialBill = '';

            try {
                if (type === context.UserEventType.CREATE) {
                    log.debug('testScript', ' Order Type & SOID = ' + orderType + ' ' + soID);

                    if ((orderType === '7' && soID) || (orderType === '2' && soID)) {
                        subsidySearch = nsSearch.create({
                            type: nsSearch.Type.SALES_ORDER,
                            columns: ['item', 'custcol_cseg_projects_cseg', 'location', 'amount'],
                            filters: [{
                                name: 'internalid',
                                operator: 'is',
                                values: [soID]
                            }, {
                                name: 'item',
                                operator: 'is',
                                values: ['8283','9151']
                            }]
                        });

                        searchResults = subsidySearch.run().getRange(0, 100);
                        if (searchResults) {
                            lineItem = searchResults[0].getValue('item');
                            lineItemProject = searchResults[0].getValue('custcol_cseg_projects_cseg');
                            lineItemFund = searchResults[0].getValue('location');
                            lineItemAmount = (searchResults[0].getValue('amount')) * (-1);
              				soShipMethodCode = nsSearch.lookupFields({ type: nsSearch.Type.SALES_ORDER, id: soID, columns: ['custbody_shipping_method_code'] });
                            log.debug('testScript', ' lineItem = ' + lineItem + lineItemProject + lineItemFund + lineItemAmount);

                            if (lineItem === '8283' || lineItem === '9151') {
                                objRecord = nsRecord.load({
                                    type: nsRecord.Type.VENDOR_BILL,
                                    id: newRec.id,
                                    isDynamic: true
                                });
                                headerMemo = objRecord.getValue('memo');
                                if(headerMemo) {
                           		  log.debug('headerMemo', ' headerMemo = ' + headerMemo.indexOf('Accessorials'));
                                  if(headerMemo.indexOf('Accessorials') >= 0) {
                                    nonAccessorialBill = true;
                                  }
                                }

                                log.debug('testScript', ' recID = ' + newRec.id);
                                log.debug('headerMemo', ' headerMemo = ' + headerMemo);
                                log.debug('nonAccessorialBill', ' nonAccessorialBill = ' + nonAccessorialBill);
                                /* objRecord.setValue({
                                    fieldId: 'custbody_cseg_projects_cseg',
                                    value: lineItemProject,
                                    ignoreFieldChange: false
                                            });
                                objRecord.setValue({
                                    fieldId: 'location',
                                    value: lineItemFund,
                                    ignoreFieldChange: false
                                            }); */
                               if(!nonAccessorialBill) {

                                itemCount = objRecord.getLineCount({
                                    sublistId: 'item'
                                });
                                // eslint-disable-next-line no-undef
                                for (i = 0; i < itemCount; i += 1) {
                                    // eslint-disable-next-line no-undef
                                    itemId = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i });
                                    if (lineItem === '8283') {
                                    headerProgram = 22;
                                    }
                                    if (lineItem === '9151') {
                                    headerProgram = 54;
                                    }
                                    headerClass = objRecord.getValue('class');
                                    headerProject = objRecord.getValue('custbody_cseg_projects_cseg');
                                    headerFund = objRecord.getValue('location');
                                    log.debug('itemID', ' itemID = ' + itemId);
                                    if ((itemId === '4038') || (itemId === '4148')) {
                                        // eslint-disable-next-line no-undef
                                        totalAmount = objRecord.getSublistValue({ sublistId: 'item', fieldId: 'amount', line: i });
                                        diffAmount = (totalAmount - lineItemAmount);
                                        currentLine = objRecord.selectLine({
                                            sublistId: 'item',
                                            // eslint-disable-next-line no-undef
                                            line: i
                                        });
                                        currentLine.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'custcol_cseg_projects_cseg',
                                            value: headerProject
                                        });
                                        currentLine.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'location',
                                            value: headerFund
                                        });
                                        if (lineItem === '9151') {
                                            currentLine.setCurrentSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'department',
                                                value: '58'
                                            });
                                        }
                                       if (lineItem === '8283') {
                                        currentLine.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'department',
                                            value: headerProgram
                                        });
                                       }                                        
                                        currentLine.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'class',
                                            value: headerClass
                                        });
                                        currentLine.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'rate',
                                            value: diffAmount
                                        });
                                        currentLine.setCurrentSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'amount',
                                            value: diffAmount
                                        });
                                        currentLine.commitLine({
                                            sublistId: 'item'
                                        });
                                    }
                                }
                                if (orderType === '7') {
                                    objRecord.selectNewLine({
                                        sublistId: 'item'
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'item',
                                        value: '4038',
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        value: 1,
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'description',
                                        value: 'Freight Subsidy Amount',
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'rate',
                                        value: lineItemAmount,
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'amount',
                                        value: lineItemAmount,
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_cseg_projects_cseg',
                                        value: lineItemProject,
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'location',
                                        value: lineItemFund,
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'department',
                                        value: headerProgram
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'class',
                                        value: headerClass
                                    });
                                    objRecord.commitLine({
                                        sublistId: 'item'
                                    });
                                    objRecord.save({
                                        enableSourcing: true,
                                        ignoreMandatoryFields: true
                                    });
                                    log.debug('testScript', ' lineItem = ' + lineItem + lineItemProject + lineItemFund);
                                }
                                if (orderType === '2' && soShipMethodCode.custbody_shipping_method_code[0].value === '2' && vendorBillType !== '1') {
                                    objRecord.selectNewLine({
                                        sublistId: 'item'
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'item',
                                        value: '4148',
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'quantity',
                                        value: 1,
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'description',
                                        value: 'Freight Subsidy Amount',
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'rate',
                                        value: lineItemAmount,
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'amount',
                                        value: lineItemAmount,
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_cseg_projects_cseg',
                                        value: lineItemProject,
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'location',
                                        value: lineItemFund,
                                        ignoreFieldChange: true
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'department',
                                        value: headerProgram
                                    });
                                    objRecord.setCurrentSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'class',
                                        value: headerClass
                                    });
                                    objRecord.commitLine({
                                        sublistId: 'item'
                                    });
                                    objRecord.save({
                                        enableSourcing: true,
                                        ignoreMandatoryFields: true
                                    });
                                    log.debug('testScript', ' lineItem = ' + lineItem + lineItemProject + lineItemFund);
                                }
                              }
                            }
                        }
                    }
                }

            } catch (ex) {
                log.error(ex.name, JSON.stringify(ex));
            }
        }

        return {
            afterSubmit: afterSubmit
        };
    }
);