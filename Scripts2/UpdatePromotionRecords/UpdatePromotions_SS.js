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
                    ['custrecord_kbs_promotionsubsidyapply', 'is', 'T'],
                    'AND',
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
        }
        return {
            execute: execute
        };
    }
);
