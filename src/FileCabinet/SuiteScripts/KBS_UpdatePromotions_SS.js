/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(
    [
        'N/search',
        'N/record'
    ],
    /**
     * @param {N_search} nsSearch
     * @param {N_record} nsRecord
     */
    function (
        nsSearch,
        nsRecord
    ) {
        /**
        * @param {ScheduledScriptContext.execute} context
        */
        function execute(context) {
            var searchResultCount;
            var promoRec;
            var searchResultCount2;
            var usedBudget;
            var transactionSearchObj;
            var promotioncodeSearchObj = nsSearch.create({
                type: 'promotioncode',
                filters:
                [
                    // ['custrecord_kbs_promotionsubsidyapply', 'is', 'T'],
                    // 'AND',
                    ['isinactive', 'is', 'F']
                ],
                columns:
                [
                    nsSearch.createColumn({
                        name: 'name',
                        sort: nsSearch.Sort.ASC,
                        label: 'Name'
                    }),
                    'custrecord_kbs_promotionsubsidybudget'
                ]
            });
            searchResultCount = promotioncodeSearchObj.runPaged().count;
            log.debug('promotioncodeSearchObj result count', searchResultCount);
            promotioncodeSearchObj.run().each(function (result) {
                transactionSearchObj = nsSearch.create({
                    type: 'transaction',
                    filters:
                    [
                        ['type', 'anyof', 'CustCred', 'SalesOrd'],
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
                log.debug('result.id', result.id);
                log.debug('usedBudget', usedBudget);
                // nsRecord.submitFields({
                //     type: nsRecord.Type.PROMOTION_CODE,
                //     id: result.id,
                //     values: { custrecord_kbs_promosubsidybudgetused: usedBudget },
                //     options: { enablesourcing: true, ignoreMandatoryFields: true }
                // });
                promoRec = nsRecord.load({ type: nsRecord.Type.PROMOTION_CODE, id: result.id, isDynamic: false });
                promoRec.setValue({ fieldId: 'custrecord_kbs_promosubsidybudgetused', value: usedBudget, ignoreFieldChange: false });
                promoRec.save({ enableSourcing: true, ignoreMandatoryFields: true });

                log.debug('Promotion Subsidy Budget Used field populated', 'promo id: ' + result.id + ' amount: ' + usedBudget);

                return true;
            });
            // sum used budgets for fixed and percentage-based promotions
            promotioncodeSearchObj = nsSearch.create({
                type: 'promotioncode',
                filters:
                [
                    ['custrecord_kbs_relatedflatpromo', 'noneof', '@NONE@']
                ],
                columns:
                [
                    nsSearch.createColumn({
                        name: 'custrecord_kbs_promosubsidybudgetused',
                        join: 'CUSTRECORD_KBS_RELATEDFLATPROMO',
                        label: 'Subsidy Budget Used'
                    }),
                    nsSearch.createColumn({
                        name: 'internalid',
                        join: 'CUSTRECORD_KBS_RELATEDFLATPROMO',
                        label: 'Internal ID'
                    }),
                    nsSearch.createColumn({ name: 'custrecord_kbs_promosubsidybudgetused', label: 'Subsidy Budget Used' })
                ]
            });
            searchResultCount = promotioncodeSearchObj.runPaged().count;
            log.debug('promotioncodeSearchObj result count', searchResultCount);
            promotioncodeSearchObj.run().each(function (result3) {
                // .run().each has a limit of 4,000 results
                var percentPromoId = result3.id;
                var fixedPromoId = result3.getValue({ name: 'internalid', join: 'CUSTRECORD_KBS_RELATEDFLATPROMO' });
                var usedAmtPercent = parseFloat(result3.getValue({ name: 'custrecord_kbs_promosubsidybudgetused' }) || 0);
                var usedAmtFixed = parseFloat(result3.getValue({ name: 'custrecord_kbs_promosubsidybudgetused', join: 'CUSTRECORD_KBS_RELATEDFLATPROMO' }) || 0);
                var totalUsed = usedAmtPercent + usedAmtFixed;
                var promoRecords;
                log.debug('usedAmtPercent', usedAmtPercent);
                log.debug('usedAmtFixed', usedAmtFixed);
                // set on percentage based promotion
                promoRecords = nsRecord.load({ type: nsRecord.Type.PROMOTION_CODE, id: percentPromoId, isDynamic: false });
                promoRecords.setValue({ fieldId: 'custrecord_kbs_promosubsidybudgetused', value: totalUsed, ignoreFieldChange: false });
                promoRecords.save({ enableSourcing: true, ignoreMandatoryFields: true });
                // set on fixed based promotion
                promoRecords = nsRecord.load({ type: nsRecord.Type.PROMOTION_CODE, id: fixedPromoId, isDynamic: false });
                promoRecords.setValue({ fieldId: 'custrecord_kbs_promosubsidybudgetused', value: totalUsed, ignoreFieldChange: false });
                promoRecords.save({ enableSourcing: true, ignoreMandatoryFields: true });
                return true;
            });
        }
        return {
            execute: execute
        };
    }
);
