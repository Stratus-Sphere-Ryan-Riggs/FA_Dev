/**
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 * 
 * @description         Module containing client event handlers
 * 
 * Date                 Author                      Notes
 * 2024-06-07           Marlon Villarama            Initial setup
 * 
 */

define(
    [
    ],
    (
    ) => {
        const MODULE = `KBS.ClientHandlers`;

        const invoiceHeaderButton = () => {
            return `<script>
            window.{NAME} = () => {
                alert('add invoice header button');
            };
            </script>`;
        }

        return {
            invoiceHeaderButton
        };
    }
);