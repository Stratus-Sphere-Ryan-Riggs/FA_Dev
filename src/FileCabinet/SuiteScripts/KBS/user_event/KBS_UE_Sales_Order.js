/**
 * Copyright 2024 Keystone Business Solutions
 * 
 * @NApiVersion         2.1
 * @NScriptType         UserEventScript
 * @NModuleScope        SameAccount
 * 
 * @description         User event script for sales orders
 * 
 * This script consolidates logic across all user event scripts and workflows using server triggers.
 * 
 * Date                 Author                      Notes
 * 2024-05-22           Marlon Villarama            Initial setup
 * 
 */

define(
    [],
    () => {
        const MODULE = `KBS|UE`;

        const beforeLoad = (context) => {
            const TITLE = `${MODULE}.BeforeLoad`;
            log.debug({ title: TITLE, details: `*** START ***` });
            log.debug({ title: TITLE, details: `*** END ***` });
        };

        const beforeSubmit = (context) => {
            const TITLE = `${MODULE}.BeforeSubmit`;
            log.debug({ title: TITLE, details: `*** START ***` });
            log.debug({ title: TITLE, details: `*** END ***` });
        };

        const afterSubmit = (context) => {
            const TITLE = `${MODULE}.AfterSubmit`;
            log.debug({ title: TITLE, details: `*** START ***` });
            log.debug({ title: TITLE, details: `*** END ***` });
        };

        return {
            beforeLoad,
            beforeSubmit,
            afterSubmit
        };
    }
);