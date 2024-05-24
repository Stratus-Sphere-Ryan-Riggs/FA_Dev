/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for the N/ui/dialog module.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/ui/dialog'
    ],
    (
        dialog
    ) => {
        const MODULE = 'KBS.Dialog';

        return {
            alert: (options) => {
                // TODO: Implement using nlCallWindow or new RedWood UI
            },
            confirm: (options) => {
                // TODO: Implement using nlCallWindow or new RedWood UI
            },
            create: (options) => {
                // TODO: Implement using nlCallWindow or new RedWood UI
            }
        }
    }
);