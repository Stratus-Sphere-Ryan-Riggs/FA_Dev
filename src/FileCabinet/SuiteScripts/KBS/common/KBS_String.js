/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for string manipulation.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [],
    () => {
        const MODULE = `F5.String`;

        const normalize = (input) => {
            const TITLE = `${MODULE}.Normalize`;

            let output = input.replace('^[A-Za-z]/g', '');

            return output;
        };

        return {
            normalize
        };
    }
);