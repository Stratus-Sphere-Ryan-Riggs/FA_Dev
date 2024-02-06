/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(
    [
        'N/record',
        'N/search'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_search} nsSearch
     */
    function (
        nsRecord,
        nsSearch
    ) {

        // /**
        // * @param {UserEventContext.beforeLoad} context
        // */
        // function beforeLoad(context) {
        //
        // }

        // /**
        // * @param {UserEventContext.beforeSubmit} context
        // */
        // function beforeSubmit(context) {
        //
        // }

        /**
        * @param {UserEventContext.afterSubmit} context
        */
        function afterSubmit(context) {
            var promoCount;
            var purchaseDiscount;
            var promoId;
            var lookup;
            var objRecord;
            var j;
            var maxDiscount;
            var type = context.type;
            var rec = context.newRecord;
            var status;
            var itemId;
            var fund;
            var project;
            var y;
            var itemCount;
            var lineItemId;
            var promoCode;
            var promoInfo;

            status = rec.getValue('status');
            if (status !== 'Billed' && status !== 'Closed' && type !== context.UserEventType.DELETE) {
            // change necessary lines to flat rate promo
                objRecord = nsRecord.load({ type: nsRecord.Type.SALES_ORDER, id: context.newRecord.id, isDynamic: false });
                promoCount = objRecord.getLineCount('promotions');
                itemCount = objRecord.getLineCount('item');
                for (j = 0; j < promoCount; j += 1) {
                    purchaseDiscount = -parseFloat(objRecord.getSublistValue({
                        sublistId: 'promotions', fieldId: 'purchasediscount', line: j
                    }));
                    // log.debug('purchaseDiscount', purchaseDiscount + ' ' + typeof purchaseDiscount);
                    promoId = objRecord.getSublistValue({
                        sublistId: 'promotions', fieldId: 'promocode', line: j
                    });

                    if (promoId) {
                        lookup = nsSearch.lookupFields({
                            type: nsRecord.Type.PROMOTION_CODE,
                            id: promoId,
                            columns: ['custrecord_kbs_uptoflatamount', 'custrecord_kbs_relatedflatpromo']
                        });
                        maxDiscount = parseFloat(lookup.custrecord_kbs_uptoflatamount);
                        if (lookup.custrecord_kbs_relatedflatpromo && lookup.custrecord_kbs_relatedflatpromo[0]) {
                            promoId = lookup.custrecord_kbs_relatedflatpromo[0].value;
                            log.debug('purchaseDiscount', purchaseDiscount + ' ' + maxDiscount + ' ' + promoId);
                            if (purchaseDiscount >= maxDiscount) {
                            // log.debug('setting promoId', promoId);
                                objRecord.setSublistValue({
                                    sublistId: 'promotions', fieldId: 'promocode', line: j, value: promoId
                                });
                                purchaseDiscount = maxDiscount;
                            }
                        }
                    }
                    log.debug('2nd purchaseDiscount', purchaseDiscount);
                    // set fund and project on item lines
                    itemId = objRecord.getSublistValue({
                        sublistId: 'promotions', fieldId: 'discount', line: j
                    });
                    lookup = nsSearch.lookupFields({ type: 'promotioncode', id: promoId, columns: ['name'] });
                    log.debug('lookup', lookup);
                    promoCode = lookup.name;
                    if (j === 0) {
                        promoInfo = 'Promotion: ' + promoCode + ' | Discount: -' + purchaseDiscount;
                    } else {
                        promoInfo += '\nPromotion: ' + promoCode + ' | Discount: -' + purchaseDiscount;
                    }
                }
                objRecord.setValue({ fieldId: 'custbody_subsidy_information', value: promoInfo, ignoreFieldChange: false });
                objRecord.save({ enableSourcing: true, ignoreMandatoryFields: true });

                objRecord = nsRecord.load({ type: nsRecord.Type.SALES_ORDER, id: context.newRecord.id, isDynamic: false });
                promoCount = objRecord.getLineCount('promotions');
                itemCount = objRecord.getLineCount('item');
                for (j = 0; j < promoCount; j += 1) {
                    promoId = objRecord.getSublistValue({
                        sublistId: 'promotions', fieldId: 'promocode', line: j
                    });
                    // set fund and project on item lines
                    itemId = objRecord.getSublistValue({
                        sublistId: 'promotions', fieldId: 'discount', line: j
                    });
                    lookup = nsSearch.lookupFields({ type: 'promotioncode', id: promoId, columns: ['custrecord_kbs_promo_faproject', 'custrecord_kbs_promotionfund'] });
                    if (lookup.custrecord_kbs_promotionfund && lookup.custrecord_kbs_promotionfund[0]) {
                        fund = lookup.custrecord_kbs_promotionfund[0].value;
                    }
                    if (lookup.custrecord_kbs_promo_faproject && lookup.custrecord_kbs_promo_faproject[0]) {
                        project = lookup.custrecord_kbs_promo_faproject[0].value;
                    }
                    log.debug('project & fund', project + ' ' + fund);
                    for (y = 0; y < itemCount; y += 1) {
                        lineItemId = objRecord.getSublistValue({
                            sublistId: 'item', fieldId: 'item', line: y
                        });
                        log.debug('itemId & lineItemId', itemId + ' ' + lineItemId);
                        if (itemId === lineItemId) {
                            log.debug('item ids match');
                            if (fund) {
                                objRecord.setSublistValue({
                                    sublistId: 'item', fieldId: 'location', line: y, value: fund
                                });
                            }
                            if (project) {
                                objRecord.setSublistValue({
                                    sublistId: 'item', fieldId: 'custcol_cseg_projects_cseg', line: y, value: project
                                });
                            }
                            log.debug('set line ' + y, 'fund = ' + fund + ' project = ' + project);
                        }
                    }
                }
                objRecord.setValue({ fieldId: 'custbody_subsidy_information', value: promoInfo, ignoreFieldChange: false });
                objRecord.save({ enableSourcing: true, ignoreMandatoryFields: true });
            }
        }

        return {
            // beforeLoad: beforeLoad,
            // beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    }
);
