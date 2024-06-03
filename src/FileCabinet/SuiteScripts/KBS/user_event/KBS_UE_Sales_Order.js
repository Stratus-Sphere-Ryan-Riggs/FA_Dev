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
        '../modules/KBS_Issues'
    ],
    (
        KBS_Issues
    ) => {
        const MODULE = `KBS|UE`;

        const beforeLoad = (context) => {
            const TITLE = `${MODULE}.BeforeLoad`;
            log.debug({ title: TITLE, details: `*** START ***` });

            // TODO: NS | UE | SET MEMBERS ON THE SALES ORDER
            // TODO: KBS Sales Order UE
            
            log.debug({ title: TITLE, details: `*** END ***` });
        };

        const beforeSubmit = (context) => {
            const TITLE = `${MODULE}.BeforeSubmit`;
            log.debug({ title: TITLE, details: `*** START ***` });

            // TODO: NS UE | Set Auction Time

            // NS WF | Has Issues Setting
            KBS_Issues.run(context);
            
            // TODO: NS | Update Transport Purchase Order
            // TODO: KBS Sales Order UE

            log.debug({ title: TITLE, details: `*** END ***` });
        };

        const afterSubmit = (context) => {
            const TITLE = `${MODULE}.AfterSubmit`;
            log.debug({ title: TITLE, details: `*** START ***` });

            // TODO: NS UE | Set Auction Time
            // TODO: NS UE | Add Transport Fees
            // TODO: NS | Script Create Transport PO from SO
            // TODO: NS WF | Has Issues Setting
            // TODO: NS| UE | CALCULATE MILEAGE
            // TODO: NS | Update Transport Purchase Order
            // TODO: KBS Sales Order UE
            // TODO: KBS Set Sales Order Flat Promos UE
            // TODO: UE | Seafood Item Update
            // TODO: Email Campaign Sales Order User Event

            log.debug({ title: TITLE, details: `*** END ***` });
        };

        return {
            beforeLoad,
            beforeSubmit,
            afterSubmit
        };
    }
);