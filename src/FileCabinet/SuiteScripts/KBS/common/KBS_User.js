/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for the runtime.Script module.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/runtime'
    ],
    (
        runtime
    ) => {
        const MODULE = `KBS.Runtime`;

        return {
            get User() {
                return runtime.getCurrentUser();
            }
        };
    }
);