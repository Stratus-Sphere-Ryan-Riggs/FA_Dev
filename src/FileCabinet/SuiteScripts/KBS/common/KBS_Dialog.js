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
                let { title, message } = options;
                return dialog.alert({ title, message });
                // TODO: Implement using nlCallWindow or new RedWood UI
            },
            confirm: (options) => {
                let { title, message } = options;
                return dialog.confirm({ title, message });
                // TODO: Implement using nlCallWindow or new RedWood UI
            },
            create: (options) => {
                let { buttons, title, message } = options;
                return dialog.create({ buttons, title, message });
                // TODO: Implement using nlCallWindow or new RedWood UI
            }
        }
    }
);