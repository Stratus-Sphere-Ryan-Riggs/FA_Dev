/**
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 * 
 * @description         Before Load module
 * 
 * Date                 Author                      Notes
 * 2024-05-22           Marlon Villarama            Initial setup
 * 
 */

define(
    [
        '../modules/KBS_AddInvoiceHeaderButton'
    ],
    (
        KBS_AddInvoiceHeaderButton
    ) => {
        const MODULE = `KBS.BeforeLoad`;

        const run = (options) => {

            // TODO: NS | UE | SET MEMBERS ON THE SALES ORDER
            KBS_AddInvoiceHeaderButton(options);
            
            // TODO: KBS Sales Order UE

        };

        return { run };
    }
);