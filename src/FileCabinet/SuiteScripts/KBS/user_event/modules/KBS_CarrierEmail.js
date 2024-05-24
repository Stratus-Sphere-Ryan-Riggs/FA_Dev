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
        '../../common/KBS'
    ],
    (
        KBS
    ) => {
        const MODULE = `KBS.CarrierEmail`;
        

        const run = (options) => {
            const TITLE = `${MODULE}.Run`;

            if (validate(options) === false) { return; }

            let { newRecord, oldRecord } = options;

        };

        const validate = (options) => {
            const TITLE = `${MODULE}.Validate`;
            let { newRecord, oldRecord, type } = options;

            return (
                [].indexOf()
            );
        };

        return {
            run
        };
    }
);