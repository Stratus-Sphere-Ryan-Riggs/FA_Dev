/**
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 * 
 * @description         Before Submit module
 * 
 * Date                 Author                      Notes
 * 2024-06-04           Marlon Villarama            Initial setup
 * 
 */

define(
    [
        '../modules/KBS_Issues'
    ],
    (
        KBS_Issues
    ) => {
        const MODULE = `KBS.BeforeSubmit`;

        const run = (options) => {

            // TODO: NS UE | Set Auction Time

            // NS WF | Has Issues Setting
            KBS_Issues.run(context);
            
            // TODO: NS | Update Transport Purchase Order
            // TODO: KBS Sales Order UE

        };

        return { run };
    }
);