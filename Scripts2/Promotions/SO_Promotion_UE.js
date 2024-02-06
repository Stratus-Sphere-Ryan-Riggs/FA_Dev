/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(
    [
        'N/search',
        'N/record',
        './KBS_ApplyPromotions_LIB'
    ],
    /**
     * @param {N_search} nsSearch
     * @param {N_record} nsRecord
     */
    function (
        nsSearch,
        nsRecord,
        kbsApplyPromo
    ) {

        /**
        * @param {UserEventContext.beforeLoad} context
        */
        function beforeLoad(context) {
            var rec = context.newRecord;
            var type = context.type;

            if (type === context.UserEventType.COPY || type === context.UserEventType.CREATE) {
                kbsApplyPromo.deleteLines(rec);
            }
        }

        /**
        * @param {UserEventContext.beforeSubmit} context
        */
        function beforeSubmit(context) {
            var rec = context.newRecord;
            var oldRec = context.oldRecord;
            var promoCount;
            var status;
            var type = context.type;
            var oldExcludedPromos;
            var excludePromos;

            log.debug('type', type);
            if (oldRec) {
                oldExcludedPromos = oldRec.getValue('custbody_kbs_excludepromotion');
                excludePromos = rec.getValue('custbody_kbs_excludepromotion');
            }
            status = rec.getValue('status');
            if (status !== 'Billed' && status !== 'Closed' && type !== context.UserEventType.DELETE) {
                promoCount = rec.getLineCount({
                    sublistId: 'promotions'
                });
                if (promoCount < 1 || type === context.UserEventType.COPY || type === context.UserEventType.CREATE) {
                    kbsApplyPromo.applyPromotionsUE(rec);
                    kbsApplyPromo.excludePromoChange(rec);
                } else if (oldExcludedPromos && (oldExcludedPromos !== excludePromos)) {
                    // if exclude field changes then either remove or add promos
                    kbsApplyPromo.excludePromoChange(rec);
                }
            }

        }

        /**
        * @param {UserEventContext.afterSubmit} context
        */
        function afterSubmit(context) {
            var promoCount;
            var promoInfo;
            var x;
            var promoCode;
            var discountItem;
            var purchaseDiscount;
            var itemId;
            var fund;
            var project;
            var promoId;
            var lookup;
            var objRecord = nsRecord.load({ type: nsRecord.Type.SALES_ORDER, id: context.newRecord.id, isDynamic: false });
            var y;
            var itemCount;
            var lineItemId;

            promoCount = objRecord.getLineCount({
                sublistId: 'promotions'
            });
            itemCount = objRecord.getLineCount({
                sublistId: 'item'
            });
            log.debug('promoCount', promoCount);
            for (x = 0; x < promoCount; x += 1) {
                // set fund and project on item lines
                promoId = objRecord.getSublistValue({
                    sublistId: 'promotions', fieldId: 'promocode', line: x
                });
                itemId = objRecord.getSublistValue({
                    sublistId: 'promotions', fieldId: 'discount', line: x
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
                    if (itemId === lineItemId) {
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
                    }
                }

                promoCode = objRecord.getSublistText({
                    sublistId: 'promotions', fieldId: 'promocode', line: x
                });
                discountItem = objRecord.getSublistText({
                    sublistId: 'promotions', fieldId: 'discount', line: x
                });
                purchaseDiscount = objRecord.getSublistValue({
                    sublistId: 'promotions', fieldId: 'purchasediscount', line: x
                });
                if (x === 0) {
                    promoInfo = 'Promotion: ' + promoCode + ' | Item: ' + discountItem + ' | Discount: ' + purchaseDiscount;
                } else {
                    promoInfo += '\nPromotion: ' + promoCode + ' | Item: ' + discountItem + ' | Discount: ' + purchaseDiscount;
                }
            }
            objRecord.setValue({ fieldId: 'custbody_subsidy_information', value: promoInfo, ignoreFieldChange: false });
            objRecord.save({ enableSourcing: true, ignoreMandatoryFields: true });
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    }
);
