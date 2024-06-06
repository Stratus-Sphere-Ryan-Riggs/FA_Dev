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
    [
        './KBS_BeforeLoad',
        './KBS_BeforeSubmit',
        './KBS_AfterSubmit'
    ],
    (
        KBS_BeforeLoad,
        KBS_BeforeSubmit,
        KBS_AfterSubmit
    ) => {
        const MODULE = `KBS|UE`;

        const beforeLoad = (context) => {
            const TITLE = `${MODULE}.BeforeLoad`;
            log.debug({ title: TITLE, details: `*** START ***` });

            KBS_BeforeLoad.run(context);

            log.debug({ title: TITLE, details: `*** END ***` });
        };

        const beforeSubmit = (context) => {
            const TITLE = `${MODULE}.BeforeSubmit`;
            log.debug({ title: TITLE, details: `*** START ***` });

            KBS_BeforeSubmit.run();

            log.debug({ title: TITLE, details: `*** END ***` });
        };

        const afterSubmit = (context) => {
            const TITLE = `${MODULE}.AfterSubmit`;
            log.debug({ title: TITLE, details: `*** START ***` });

            KBS_AfterSubmit.run();
            
            // TODO: Workflows
            // TODO: Carrier email trigger
            // TODO: Donation order status update
            // TODO: FA WF|Disallow edit of Closed orders
            // TODO: Incoming member comments alert
            // TODO: FA | SO Check NO TMS
            // TODO: FA | SO Check Transportation Svc & CHEP
            // TODO: FA | Sales Order Bill To Freight
            // TODO: FA | Send TMS File Alert Email
            // TODO: NS Sales Order Balances
            // TODO: NS WF | Accept Sales Order
            // TODO: NS WF | Check for Product Hold
            // TODO: NS WF | Check Has Issues
            // TODO: NS WF | Disaster SO Set Est Freight
            // TODO: NS WF | Donation Sales Orders
            // TODO: NS WF | Inactive Vendor/Customer Block
            // TODO: NS WF | Sales Order Approval Checkbox
            // TODO: NS WF | Sales Order Set TMS Comments
            // TODO: NS Workflow | Supply Chain Management
            // TODO: Original_ReleaseDat_On_SalesOrder
            // TODO: PO Admin Sales Order Edit
            // TODO: Sales Order Cancel

            log.debug({ title: TITLE, details: `*** END ***` });
        };

        return {
            beforeLoad,
            beforeSubmit,
            afterSubmit
        };
    }
);