/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for the N/render module.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/render'
    ],
    (
        render
    ) => {
        const MODULE = `KBS.Render`;

        return {
            get DataSource() {
                return render.DataSource;
            },
            get PrintMode() {
                return render.PrintMode;
            },
            create: () => {
                return render.create();
            },
            mergeEmail: (options) => {
                let { entity, recipient, templateId, customRecord, supportCaseId, transactionId } = options;

                return render.mergeEmail({
                    entity,
                    recipient,
                    templateId,
                    customRecord,
                    supportCaseId,
                    transactionId
                });
            },
            transaction: (options) => {
                let { entityId, printMode, formId } = options;

                return render.transaction({
                    entityId,
                    formId,
                    printMode
                });
            }
        };
    }
);