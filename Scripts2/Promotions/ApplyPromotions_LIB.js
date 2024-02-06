/**
 * KBS_ApplyPromotions_LIB.js
 * @NApiVersion 2.x
 */
define(
    [
        'N/search',
        './moment-v2.24.0',
        'N/record'
    ],
    /**
     * @param {search} nsSearch
     * @param {moment} moment
     * @param {record} nsRecord
     */
    function (
        nsSearch,
        moment,
        nsRecord
    ) {

        function deleteLines(rec) {
            var lineCount;
            var i;

            log.debug('deleteLines started');
            lineCount = rec.getLineCount({
                sublistId: 'promotions'
            });
            if (lineCount > 0) {
                for (i = 0; i < lineCount; i += 1) {
                    rec.removeLine({
                        sublistId: 'promotions',
                        line: 0,
                        ignoreRecalc: true
                    });
                    log.debug('Removing line', 'Line #' + i);
                }
            }
            log.debug('deleteLines finished');
        }
        function setPromotionsClient(curRec, promoIds) {
            var i;

            for (i = 0; i < promoIds.length; i += 1) {
                curRec.selectNewLine({
                    sublistId: 'promotions'
                });
                curRec.setCurrentSublistValue({
                    sublistId: 'promotions',
                    fieldId: 'promocode',
                    value: promoIds[i],
                    ignoreFieldChange: false,
                    fireSlavingSync: true
                });
                curRec.commitLine({
                    sublistId: 'promotions'
                });
            }

        }
        function setPromotionsUE(rec, promoIds, type) {
            var i;

            log.debug('setPromotionsUE started');
            // deleteLines(rec);
            log.debug('setting Promotions UE');
            log.debug('type', type);
            log.debug('rec', rec);
            // need to load record for xedit
            if (type === 'xedit') {
                var rec = nsRecord.load({
                    type: nsRecord.Type.SALES_ORDER,
                    id: rec.id
                });
            }
            if (promoIds.length > 0) {
                for (i = 0; i < promoIds.length; i += 1) {
                    rec.setSublistValue({
                        sublistId: 'promotions',
                        fieldId: 'promocode',
                        line: i,
                        value: promoIds[i]
                    });
                }
            }
            log.debug('setPromotionsUE finished');
        }
        function changePromos(rec, promoIds) {
            var excludedPromos;
            var x;
            var promoLineCount;
            var promoId;
            var y;
            var alreadyApplied = false;

            excludedPromos = rec.getValue('custbody_kbs_excludepromotion');
            // check all lines and remove any that are in the excludePromos array
            promoLineCount = rec.getLineCount({
                sublistId: 'promotions'
            });

            for (x = promoLineCount - 1; x >= 0; x -= 1) {
                promoId = rec.getSublistValue({
                    sublistId: 'promotions',
                    fieldId: 'promocode',
                    line: x
                });
                log.debug('line num and promoid', x + ' ' + promoId);
                log.debug('excludedPromos', excludedPromos);
                log.debug('excludedPromos.indexOf(promoId)', excludedPromos.indexOf(promoId));
                if (excludedPromos.indexOf(promoId) !== -1) {
                    log.debug('removing line', 'Line: ' + x);
                    rec.removeLine({ sublistId: 'promotions', line: x, ignoreRecalc: true });
                    log.debug('removing line', 'Line: ' + x);
                }
            }
            // Get new line count and add promos if not already there
            for (x = 0; x < promoIds.length; x += 1) {
                promoLineCount = rec.getLineCount({
                    sublistId: 'promotions'
                });
                for (y = 0; y < promoLineCount; y += 1) {
                    promoId = rec.getSublistValue({
                        sublistId: 'promotions',
                        fieldId: 'promocode',
                        line: y
                    });
                    if (promoIds[x] === promoId) {
                        alreadyApplied = true;
                        return;
                    }
                }
                if (alreadyApplied === false) {
                    rec.setSublistValue({
                        sublistId: 'promotions',
                        fieldId: 'promocode',
                        line: promoLineCount,
                        value: promoIds[x]
                    });
                }
            }
        }

        function searchPromotions(rec, scriptType, excludeChanged, type) {
            // log.debug('rec', rec);

            // need to load record for xedit
            if (type === 'xedit') {
                rec = nsRecord.load({
                    type: nsRecord.Type.SALES_ORDER,
                    id: rec.id
                });
            }
            var promoIds = [];
            var tranDate = rec.getValue('trandate');
            var orderType = rec.getValue('custbody_order_type');
            var shipMethodCode = rec.getValue('custbody_shipping_method_code') || '@NONE@';
            var orderCustomer = rec.getValue('entity');
            var promotioncodeSearchObj;
            var searchResultCount;
            var subsidyBudget;
            var salesorderSearchObj;
            var searchResultCount2;
            var usedBudget;
            var excludedPromos;
            var transactionSearchObj;
            var vendorExclusions;
            var vendor = rec.getValue('custbody_opportunity_donor');

            excludedPromos = rec.getValue('custbody_kbs_excludepromotion');
            tranDate = moment.utc(tranDate).format('MM/DD/YYYY');
            log.debug('excludedPromos', excludedPromos);
            log.debug('tranDate', tranDate);
            promotioncodeSearchObj = nsSearch.create({
                type: 'promotioncode',
                filters:
                [
                    ['custrecord_kbs_promotionsubsidyapply', 'is', 'T'],
                    'AND',
                    ['startdate', 'onorbefore', tranDate],
                    'AND',
                    ['enddate', 'onorafter', tranDate],
                    'AND',
                    ['custrecord_kbs_promotionordertype', 'anyof', orderType],
                    'AND',
                    // ['custrecord_kbs_relatedflatpromo', 'noneof', '@NONE@'],
                    // 'AND',
                    ['custrecord_kbs_promotionshipmethodcode', 'anyof', shipMethodCode],
                    'AND',
                    ['isinactive', 'is', 'F'],
                    'AND',
                    [
                        ['ispublic', 'is', 'T'],
                        'OR',
                        ['customers', 'anyof', orderCustomer]
                    ]
                ],
                columns:
                [
                    nsSearch.createColumn({
                        name: 'name',
                        sort: nsSearch.Sort.ASC,
                        label: 'Name'
                    }),
                    'custrecord_kbs_promotionsubsidybudget',
                    'custrecord_kbs_promotionvendorexclusion'
                ]
            });
            searchResultCount = promotioncodeSearchObj.runPaged().count;
            log.debug('promotioncodeSearchObj result count', searchResultCount);
            promotioncodeSearchObj.run().each(function (result) {
                subsidyBudget = parseFloat(result.getValue('custrecord_kbs_promotionsubsidybudget'));
                vendorExclusions = result.getValue('custrecord_kbs_promotionvendorexclusion').split(',');
                log.debug('vendorExclusions', vendorExclusions);
                log.debug('vendor', vendor + typeof vendor);
                transactionSearchObj = nsSearch.create({
                    type: 'transaction',
                    filters:
                    [
                        ['type', 'anyof', 'SalesOrd', 'CustCred'],
                        'AND',
                        ['taxline', 'is', 'F'],
                        'AND',
                        ['shipping', 'is', 'F'],
                        'AND',
                        ['mainline', 'is', 'T'],
                        'AND',
                        ['promocode', 'anyof', result.id],
                        'AND',
                        ['status', 'noneof', 'SalesOrd:C', 'SalesOrd:H', 'CustCred:V']
                    ],
                    columns:
                    [
                        nsSearch.createColumn({
                            name: 'promocode',
                            summary: 'GROUP',
                            label: 'Promotion'
                        }),
                        nsSearch.createColumn({
                            name: 'purchasediscount',
                            summary: 'SUM',
                            label: 'Purchase Discount'
                        })
                    ]
                });
                searchResultCount2 = transactionSearchObj.runPaged().count;
                log.debug('transactionSearchObj result count', searchResultCount2);
                transactionSearchObj.run().each(function (result2) {
                    usedBudget = parseFloat(result2.getValue({ name: 'purchasediscount', summary: 'SUM' }));
                    // .run().each has a limit of 4,000 results
                    return false;
                });
                if (!usedBudget) {
                    usedBudget = 0;
                }
                if (usedBudget < 0) {
                    usedBudget *= -1;
                }
                log.debug('usedBudget', usedBudget + typeof usedBudget);
                log.debug('subsidyBudget', subsidyBudget + typeof subsidyBudget);
                log.debug('result.id', result.id + typeof result.id);

                if (subsidyBudget > usedBudget && excludedPromos.indexOf(result.id) === -1 && vendorExclusions.indexOf(vendor) === -1) { // used budget is negative so need to add
                    promoIds.push(result.id);
                }
                // .run().each has a limit of 4,000 results
                return true;
            });
            log.debug('promoIds', promoIds);
            if (scriptType === 'userevent' && !excludeChanged) {
                setPromotionsUE(rec, promoIds, type);
            }
            if (scriptType === 'client') {
                setPromotionsClient(rec, promoIds);
            }
            if (scriptType === 'userevent' && excludeChanged) {
                changePromos(rec, promoIds);
            }

        }
        // function applyPromotionsClient(rec) {
        //     searchPromotions(rec, 'client', false);
        // }
        function applyPromotionsUE(rec, type) {
            log.debug('applyPromotionsUE started');
            searchPromotions(rec, 'userevent', false, type);
            log.debug('applyPromotionsUE finished');
        }
        function excludePromoChange(rec, type) {
            searchPromotions(rec, 'userevent', true, type);
        }
        function revertToPercentageBased(rec, promoId, index) {
            var promotioncodeSearchObj = nsSearch.create({
                type: 'promotioncode',
                filters:
                [
                    ['custrecord_kbs_relatedflatpromo', 'anyof', promoId]
                ],
                columns: []
            });
            var searchResultCount = promotioncodeSearchObj.runPaged().count;
            log.debug('promotioncodeSearchObj result count', searchResultCount);
            promotioncodeSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                rec.setSublistValue({
                    sublistId: 'promotions',
                    fieldId: 'promocode',
                    line: index,
                    value: result.id
                });
                return false;
            });
            return rec;
        }
        function getCustRecData(rec, orderType, shippingMethodCode) {
            var custRecData = {};
            var customerId = rec.getValue('entity');
            var tranDate = rec.getValue('trandate');
            var oppDonor = rec.getValue('custbody_opportunity_donor');
            var tfsSearchObj;
            var searchResultCount;

            tranDate = moment.utc(tranDate).format('MM/DD/YYYY');
            log.audit('orderType', orderType);
            log.audit('shippingMethodCode', shippingMethodCode);
            tfsSearchObj = nsSearch.create({
                type: 'customrecord_kbs_tfs',
                filters:
                [
                    ['isinactive', 'is', 'F'],
                    'AND',
                    ['custrecord_tfs_startdate', 'onorbefore', tranDate],
                    'AND',
                    ['custrecord_tfs_enddate', 'onorafter', tranDate],
                    'AND',
                    ['custrecord_tfs_customer', 'anyof', customerId],
                    'AND',
                    ['custrecord_tfs_ordertype', 'anyof', orderType],
                    'AND',
                    ['custrecord_tfs_smc', 'anyof', shippingMethodCode],
                    'AND',
                    ['custrecord_tfs_excludeddonors', 'noneof', oppDonor]
                ],
                columns:
                [
                    nsSearch.createColumn({
                        name: 'name',
                        sort: nsSearch.Sort.ASC,
                        label: 'Name'
                    }),
                    nsSearch.createColumn({ name: 'scriptid', label: 'Script ID' }),
                    nsSearch.createColumn({ name: 'custrecord_tfs_startdate', label: 'Start Date' }),
                    nsSearch.createColumn({ name: 'custrecord_tfs_enddate', label: 'End Date' }),
                    nsSearch.createColumn({ name: 'custrecord_tfs_budgetused', label: 'Budget Used' }),
                    nsSearch.createColumn({ name: 'custrecord_tfs_budgetremaining', label: 'Budget Remaining' }),
                    nsSearch.createColumn({ name: 'custrecord_tfs_discountitem', label: 'Discount Item' }),
                    nsSearch.createColumn({ name: 'custrecord_tfs_itemtodiscount', label: 'Item to Discount' }),
                    nsSearch.createColumn({ name: 'custrecord_tfs_faproject', label: 'FA Project' }),
                    nsSearch.createColumn({ name: 'custrecord_tfs_fund', label: 'Fund' })
                ]
            });
            searchResultCount = tfsSearchObj.runPaged().count;
            log.debug('tfsSearchObj result count', searchResultCount);
            tfsSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                custRecData.id = result.id;
                custRecData.name = result.getValue({ name: 'name' });
                custRecData.scriptId = result.getValue({ name: 'scriptid' });
                custRecData.startDate = result.getValue({ name: 'custrecord_tfs_startdate' });
                custRecData.endDate = result.getValue({ name: 'custrecord_tfs_enddate' });
                custRecData.budgetUsed = parseFloat(result.getValue({ name: 'custrecord_tfs_budgetused' }) || 0);
                custRecData.budgetRemaining = parseFloat(result.getValue({ name: 'custrecord_tfs_budgetremaining' }) || 0);
                custRecData.discountItem = result.getValue({ name: 'custrecord_tfs_discountitem' });
                custRecData.itemToDiscount = (result.getValue({ name: 'custrecord_tfs_itemtodiscount' }).split(','));
                custRecData.project = result.getValue({ name: 'custrecord_tfs_faproject' });
                custRecData.fund = result.getValue({ name: 'custrecord_tfs_fund' });
                return false;
            });

            /*
             customrecord_kbs_tfsSearchObj.id="customsearch1689701323568";
             customrecord_kbs_tfsSearchObj.title="KBS - Active Targeted Freight Support Search (copy)";
             var newSearchId = customrecord_kbs_tfsSearchObj.save();
             */
            return custRecData;
        }
        function calcFreightSubsidy(rec, type, status, orderStatus, oldRec, orderType, shippingMethodCode, removeTFS) {
            var itemsToDiscount = [];
            var custRecData = {};
            var x;
            var lineIndex;
            var freightAmt = 0;
            var discountItem;
            var budgetUsed;
            var budgetRemaining;
            var custRecId;
            var discountAmt;
            var lineCount = rec.getLineCount({ sublistId: 'item' });
            var discountIndex;
            var oldLineIndex;
            var oldRecAmount = 0;
            var currentDiscountItemIndex;
            var currentDiscountAmt = 0;
            var shipMethodCode;
            var faCodes = ['3', '4', '5'];
            var actLineHaul;
            var actfuel;
            var estLineHaul;
            var estFuel;

            if (type === 'create' || type === 'edit') {
                custRecData = getCustRecData(rec, orderType, shippingMethodCode);
                discountItem = custRecData.discountItem;
                log.audit('discountItem', discountItem);
                if (((status === 'Closed' || status === 'Cancelled') && orderStatus === '3') || removeTFS) {
                    log.debug('calcFreightSubsidy', 'status is closed or cancelled');
                    // remove all tfs fields

                    for (x = 0; x < lineCount; x += 1) {
                        if (rec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: x
                        }) === discountItem) {
                            rec.removeLine({
                                sublistId: 'item',
                                line: x,
                                ignoreRecalc: true
                            });
                        }
                    }
                } else {
                    log.audit('calcFreightSubsidy', 'status is not billed, closed, partially fulfilled, pending billing, or pending billing/partially fulfilled');

                    log.audit('custRecData', custRecData);
                    if (custRecData.itemToDiscount && custRecData.itemToDiscount.length > 0) {
                        itemsToDiscount = custRecData.itemToDiscount;
                        log.audit('itemsToDiscount', itemsToDiscount);
                        for (x = 0; x < itemsToDiscount.length; x += 1) {
                            lineIndex = rec.findSublistLineWithValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: itemsToDiscount[x]
                            });
                            if (lineIndex > -1) {
                                break;
                            }
                        }
                        if (lineIndex > -1) {
                            log.audit('lineIndex', lineIndex);
                            shipMethodCode = rec.getValue('custbody_shipping_method_code');
                            if (faCodes.indexOf(shipMethodCode) > -1) {
                                if (orderType === '1') {
                                    estLineHaul = parseFloat(rec.getValue('custbody_benchmark_line_hall_cost') || 0);
                                    estFuel = parseFloat(rec.getValue('custbody_benchmark_fuel_sur') || 0);
                                    freightAmt = estLineHaul + estFuel;
                                } else {
                                    actLineHaul = parseFloat(rec.getValue('custbody_linehaul_cost_actual') || 0);
                                    actfuel = parseFloat(rec.getValue('custbody_fuel_sur_cost_actual') || 0);
                                    freightAmt = actLineHaul + actfuel;
                                }
                                rec.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    line: lineIndex,
                                    value: freightAmt
                                });
                            } else {
                                freightAmt = rec.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    line: lineIndex
                                });
                            }

                            log.audit('freightAmt', freightAmt);

                            budgetRemaining = custRecData.budgetRemaining;
                            log.debug('budgetRemaining', budgetRemaining);
                            budgetUsed = custRecData.budgetUsed;
                            log.debug('budgetUsed', budgetUsed);
                            custRecId = custRecData.id;
                            log.debug('custRecId', custRecId);
                            if (freightAmt > budgetRemaining) {
                                discountAmt = budgetRemaining * -1;
                            } else {
                                discountAmt = freightAmt * -1;
                            }
                            // check to see if changed from old record
                            if (oldRec) {
                                oldLineIndex = oldRec.findSublistLineWithValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    value: discountItem
                                });
                                if (oldLineIndex > -1) {
                                    oldRecAmount = (oldRec.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'amount',
                                        line: oldLineIndex
                                    }) || 0) * -1;
                                }
                            }
                            log.audit('discountAmt', discountAmt);
                            log.audit('oldRecAmount', oldRecAmount);
                            discountIndex = rec.findSublistLineWithValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                value: discountItem
                            });
                            if (!oldRec || (discountAmt !== oldRecAmount) || (discountIndex === -1)) {
                                currentDiscountAmt = parseFloat(rec.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    line: discountIndex
                                }) || 0) * -1;
                                // if discount item is already on the order, update the amount
                                budgetRemaining += oldRecAmount;
                                log.audit('budgetRemaining', budgetRemaining);
                                log.debug('currentDiscountAmt', currentDiscountAmt);
                                log.debug('freightAmt', freightAmt);
                                if (freightAmt > budgetRemaining) {
                                    discountAmt = budgetRemaining * -1;
                                } else {
                                    discountAmt = freightAmt * -1;
                                }
                                log.debug('discountAmt', discountAmt);
                                if (discountIndex === -1) {
                                    discountIndex = lineCount;
                                }
                                rec.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    line: discountIndex,
                                    value: discountItem
                                });
                                rec.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'quantity',
                                    line: discountIndex,
                                    value: 1
                                });
                                rec.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'rate',
                                    line: discountIndex,
                                    value: discountAmt
                                });
                                rec.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    line: discountIndex,
                                    value: discountAmt
                                });
                                rec.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_kbs_tfs',
                                    line: discountIndex,
                                    value: custRecId
                                });
                                rec.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_cseg_projects_cseg',
                                    line: discountIndex,
                                    value: custRecData.project
                                });
                                rec.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'location',
                                    line: discountIndex,
                                    value: custRecData.fund
                                });
                                rec.setValue({
                                    fieldId: 'custbody_kbs_tfs',
                                    value: custRecId
                                });


                            } else {
                                log.debug('discountAmt', 'no change');
                            }

                        }
                    }
                }
            }
        }
        function updateFreightSubsidy(freightSubsidyRecId, rec, type) {
            var status = rec.getValue('status');
            var orderStatus = rec.getValue({ fieldId: 'custbody_order_status' });
            var customerId = rec.getValue('entity');
            var salesorderSearchObj;
            var searchResultCount;
            var discountItem;
            var lookup;
            var budgetRemaining;
            var budgetTotal;
            var actuallyUsed;
            var submitValues = {};
            var noteRec;
            var noteRecId;
            var tfsRecName;

            lookup = nsSearch.lookupFields({
                type: 'customrecord_kbs_tfs',
                id: freightSubsidyRecId,
                columns: ['custrecord_tfs_discountitem']
            });
            if (lookup.custrecord_tfs_discountitem.length > 0) {
                discountItem = lookup.custrecord_tfs_discountitem[0].value;
            }
            if (discountItem) {
                salesorderSearchObj = nsSearch.create({
                    type: 'salesorder',
                    filters:
                        [
                            ['type', 'anyof', 'SalesOrd'],
                            'AND',
                            ['customermain.internalidnumber', 'equalto', customerId],
                            'AND',
                            ['trandate', 'within', 'thisyear'],
                            'AND',
                            ['item', 'anyof', discountItem],
                            'AND',
                            ['custcol_kbs_tfs', 'anyof', freightSubsidyRecId]
                        ],
                    columns:
                        [
                            nsSearch.createColumn({
                                name: 'custcol_kbs_tfs',
                                summary: 'GROUP',
                                label: 'Targeted Freight Support Applied'
                            }),
                            nsSearch.createColumn({
                                name: 'custrecord_tfs_budgettotal',
                                join: 'CUSTCOL_KBS_TFS',
                                summary: 'GROUP',
                                label: 'Budget Total'
                            }),
                            nsSearch.createColumn({
                                name: 'amount',
                                summary: 'SUM',
                                label: 'Amount'
                            }),
                            nsSearch.createColumn({
                                name: 'custrecord_tfs_budgetremaining',
                                join: 'CUSTCOL_KBS_TFS',
                                summary: 'GROUP',
                                label: 'Budget Remaining'
                            })
                        ]
                });

                searchResultCount = salesorderSearchObj.runPaged().count;
                log.debug('salesorderSearchObj for freight promos result count', searchResultCount);
                salesorderSearchObj.run().each(function (result) {
                    // .run().each has a limit of 4,000 results
                    tfsRecName = result.getText({ name: 'custcol_kbs_tfs', summary: 'GROUP' });
                    budgetTotal = parseFloat(result.getValue({ name: 'custrecord_tfs_budgettotal', join: 'CUSTCOL_KBS_TFS', summary: 'GROUP' }) || 0);
                    actuallyUsed = parseFloat(result.getValue({ name: 'amount', summary: 'SUM' }) || 0) * -1;
                    budgetRemaining = parseFloat(result.getValue({ name: 'custrecord_tfs_budgetremaining', join: 'CUSTCOL_KBS_TFS', summary: 'GROUP' }) || 0);
                    if (budgetTotal - actuallyUsed !== budgetRemaining) {
                        // update record
                        submitValues.custrecord_tfs_budgetremaining = budgetTotal - actuallyUsed;
                        submitValues.custrecord_tfs_budgetused = actuallyUsed;

                        if (budgetTotal - actuallyUsed === 0) {
                            // create note
                            noteRec = nsRecord.create({
                                type: nsRecord.Type.NOTE
                            });
                            noteRec.setValue({
                                fieldId: 'title',
                                value: tfsRecName + ' has been exhausted'
                            });
                            // The date is like it is to set it to the CST timezone
                            noteRec.setValue({
                                fieldId: 'note',
                                value: '$0 Targeted Freight Subsidy Balance Has Been Reached For '
                                    + tfsRecName + ' on ' + new Date()
                            });
                            noteRec.setValue({
                                fieldId: 'entity',
                                value: customerId
                            });
                            noteRec.setValue({
                                fieldId: 'author',
                                value: 19352
                            });
                            noteRecId = noteRec.save();
                            log.audit('noteRecId', noteRecId);

                        } else {
                            submitValues.custrecord_tfs_budgetexhausted = false;
                        }
                        nsRecord.submitFields({
                            type: 'customrecord_kbs_tfs',
                            id: freightSubsidyRecId,
                            values: submitValues,
                            options: {
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            }
                        });
                    }
                    return false;
                });

                /*
                 salesorderSearchObj.id="customsearch1689786077062";
                 salesorderSearchObj.title="Targeted Freight Support - BUDGET USED NI-FB (FOR SCRIPT) (copy)";
                 var newSearchId = salesorderSearchObj.save();
                 */
            }
            if (type !== 'delete' && (status === 'Closed' || status === 'Cancelled') && orderStatus === '3') { // Cancelled - Id: 3
                nsRecord.submitFields({
                    type: 'salesorder',
                    id: rec.id,
                    values: {
                        custbody_kbs_tfs: ''
                    },
                    options: {
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    }
                });
            }
        }

        return {
            // applyPromotionsClient: applyPromotionsClient,
            applyPromotionsUE: applyPromotionsUE,
            deleteLines: deleteLines,
            excludePromoChange: excludePromoChange,
            revertToPercentageBased: revertToPercentageBased,
            calcFreightSubsidy: calcFreightSubsidy,
            updateFreightSubsidy: updateFreightSubsidy
        };
    }
);
