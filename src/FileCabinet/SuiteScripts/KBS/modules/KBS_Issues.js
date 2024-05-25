/**
 * Copyright 2024 Keystone Business Solutions
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 * 
 * @description         This module replaces the UE script "NS WF | Has Issues Setting".
 * 
 * Date                 Author                      Notes
 * 2024-05-23           Marlon Villarama            Initial setup
 * 
 */

define(
    [
        '../common/KBS'
    ],
    (
        KBS
    ) => {
        const MODULE = `KBS|Issues`;
        const PARAMS = KBS.Constants.ScriptParameters;
        const RECORD = KBS.Record;
        const TRANSACTION = KBS.Transaction;
        const FIELDS = KBS.Transaction.Fields;
        const FieldsToCheck = [
            FIELDS.Custom.ORDER_HAS_ISSUES,
            FIELDS.Custom.ORDER_HAS_ISSUES_REASON,
            FIELDS.Custom.ORDER_ISSUES_COMMENTS
        ];

        const run = (options) => {
            const TITLE = `${MODULE}.Run`;
            
            if (validate(options) === false) { return; }

            let { oldRecord, newRecord } = options;
            oldRecord = RECORD.cast(oldRecord);
            newRecord = RECORD.cast(newRecord);

            // let oldValues = oldRecord.getValues({ fields: FIELDS });
            let newValues = oldRecord.getValues({ fields: FIELDS });

            let salesOrderId = newRecord.ASSOCIATED_MASTER_SO || newRecord.id;
            // TODO: Verify custbody_sw_abm_vendor_invoice_doc
            // if(stType=='xedit' && recType=='vendorbill' && nlapiGetFieldValue('custbody_sw_abm_vendor_invoice_doc')) {
            //     var currentRec =  nlapiGetRecordId();
            //     var currentRecType = nlapiGetRecordType();
            //     var soId = nlapiLookupField(currentRecType, currentRec, 'custbody_associated_salesorder');
            // }

            updateSalesOrder({ id: salesOrderId, values: newValues });
            // TODO: Verify custbody_sw_abm_vendor_invoice_doc
            // if (stType=='xedit' && nlapiGetFieldValue('custbody_associated_salesorder') == null && recType=='vendorbill' && nlapiGetFieldValue('custbody_sw_abm_vendor_invoice_doc')) {
            //     if(soId){
            //         nlapiSubmitField('salesorder', soId, ['custbody_order_has_issues', 'custbody_has_issues_comments', 'custbody_order_has_issues_reason'], [newIssueTag, newIssueComment, newIssueReason ] );	 
            //     }
            // }

            let params = {};
            params[PARAMS.HAS_ISSUES_ASSOCIATED_SO] = salesOrderId;
            params[PARAMS.HAS_ISSUES_UPDATE_VALUES] = JSON.stringify(newValues);
            log.debug({ title: `${TITLE} params`, details: JSON.stringify(params) });

            let taskId = KBS.Task.createMapReduceTask({
                scriptId: KBS.Constants.Scripts.MR_HAS_ISSUES,
                deploymentId: KBS.Constants.Deployments.MR_HAS_ISSUES,
                params
            });
            log.debug({ title: TITLE, details: `Successfully created MR task ID = ${taskId}` });
        };

        const updateSalesOrder = (options) => {
            const TITLE = `${MODULE}.UpdateSalesOrder`;
            let { id, values } = options;

            let salesOrderUpdateValues = {};
            if (values.ASSOCIATED_MASTER_SO) {
                FieldsToCheck.map(field => salesOrderUpdateValues[field] = values[field]);
                RECORD.update({
                    type: RECORD.Type.SALES_ORDER,
                    id: id,
                    values: salesOrderUpdateValues
                });
            }
        };

        const validate = (options) => {
            const TITLE = `${MODULE}.Validate`;
            let { oldRecord, newRecord, type } = options;

            if ([
                options.UserEventType.EDIT,
                options.UserEventType.INLINE_EDIT
            ].indexOf(type) < 0) {
                log.debug({ title: TITLE, details: `Invalid event type = ${type}. Skipping...` });
                return false;
            }

            let vendorBillType = newRecord.getText({ fieldID: FIELDS.VENDOR_BILL_TYPE }) || '';
            if (
                newRecord.type === KBS.Record.Type.VENDOR_BILL &&
                vendorBillType.toLowerCase() === 'admin fee'
            ) {
                log.debug({ title: TITLE, details: `Transaction is an Admin Fee vendor bill. Skipping...` });
                return false;
            }

            let changeCount = 0;
            let fieldsToCheck = [
                FIELDS.Custom.ORDER_HAS_ISSUES,
                FIELDS.Custom.ORDER_HAS_ISSUES_REASON,
                FIELDS.Custom.ORDER_ISSUES_COMMENTS
            ];
            fieldsToCheck.forEach(f => {
                let field = { fieldId: f };
                changeCount += oldRecord.getValue(field) === newRecord.getValue(field) ? 0 : 1;
            });
            if (changeCount > 0) {
                log.debug({ title: TITLE, details: `Issue fields were not changed. Skipping...` });
                return false;
            }

            return true;
        };

        return {
            run
        };
    }
);