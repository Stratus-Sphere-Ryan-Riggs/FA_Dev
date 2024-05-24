/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for all constants used within this account.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        './KBS_Entity.js',
        './KBS_Transaction.js'
    ],
    (
        KBS_Entity,
        KBS_Transaction
    ) => {
        const ADVANCED_PDF_TEMPLATES = {};
        const CUSTOM_RECORDS = {};
        const DEPLOYMENTS = {};
        const FORMS = {};
        const LISTS = {};
        const SCRIPT_PARAMETERS = {};
        const SCRIPTS = {};

        return {
            AdvancedPDFTemplates: ADVANCED_PDF_TEMPLATES,
            CustomRecords: CUSTOM_RECORDS,
            Deployments: DEPLOYMENTS,
            Entity: KBS_Entity,
            Forms: FORMS,
            Lists: LISTS,
            ScriptParameters: SCRIPT_PARAMETERS,
            Scripts: SCRIPTS,
            Transaction: KBS_Transaction,

        };
    }
);