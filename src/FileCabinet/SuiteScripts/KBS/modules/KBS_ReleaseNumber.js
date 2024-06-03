/**
 * Copyright 2024 Keystone Business Solutions
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 * 
 * @description         This module replaces the UE script "NS WF | Has Issues Setting" (After Submit).
 * 
 * Date                 Author                      Notes
 * 2024-05-26           Marlon Villarama            Initial dev
 * 
 */

define(
    [
        '../common/KBS'
    ],
    (
        KBS
    ) => {
        const MODULE = `KBS|ReleaseNumber`;
        const PARAMS = KBS.Constants.ScriptParameters;
        const RECORD = KBS.Record;
        const TRANSACTION = KBS.Transaction;
        const FIELDS = KBS.Transaction.Fields;

        const run = (options) => {
            const TITLE = `${MODULE}.Run`;
            
            let { newRecord } = options;
            newRecord = RECORD.cast(newRecord);
            let newValues = newRecord.getValues({ fields: FIELDS });

            switch (newRecord.type) {
                case RECORD.Type.PURCHASE_ORDER: {
                    updatePurchaseOrder({ values: newValues });
                    break;
                }
                case RECORD.Type.SALES_ORDER: {
                    updateSalesOrder({ values: newValues });
                    break;
                }
            }
        };

        const updatePurchaseOrder = (options) => {
            if (validatePurchaseOrder())
        };

        const updateSalesOrder = (options) => {};

        const validatePurchaseOrder = (options) => {

        };

        const validateSalesOrder = (options) => {};

        return {
            run
        };
    }
);