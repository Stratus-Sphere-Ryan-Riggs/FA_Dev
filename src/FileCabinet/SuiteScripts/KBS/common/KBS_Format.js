/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for the N/format module.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/format'
    ],
    (
        format
    ) => {
        const MODULE = 'KBS.Format';

        const toDate = (options) => {
            return options.value ? format.format({ type: format.Type.DATE, value: options.value }) : '';
        };

        const toFloat = (options) => {
            return options.value ? format.format({ type: format.Type.FLOAT, value: options.value }) : '';
        };

        const toInteger = (options) => {
            return options.value ? format.format({ type: format.Type.INTEGER, value: options.value }) : '';
        };

        return {
            get Type() {
                return format.Type;
            },

            format(options) {
                let { toType, value } = options;
                switch(toType) {
                    case this.Type.DATE: {
                        return toDate({ value });
                    }
                    case this.Type.FLOAT: {
                        return toFloat({ value });
                    }
                    case this.Type.INTEGER: {
                        return toInteger({ value });
                    }
                }
            }
        };
    }
);