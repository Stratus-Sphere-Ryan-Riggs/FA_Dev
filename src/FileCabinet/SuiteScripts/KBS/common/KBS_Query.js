/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for the N/query module.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/query',
        './KBS_Constants'
    ],
    (
        query,
        constants
    ) => {
        return {
            get Currencies() {
                return this.run(constants.Queries.CURRENCIES);
            },
            get CustomLists() {
                return this.run(constants.Queries.CUSTOM_LISTS);
            },
            get StatesWithCountries() {
                return this.run(constants.Queries.STATE_COUNTRIES);
            },
            
            getCustomListValues(id) {
                return this.run(CUSTOM_LIST_VALUES.replace('{CUSTOM_LIST_ID}', id));
            },
            run(query) {
                let queryObject = query.runSuiteQL({ query });
                return queryObject.asMappedResults();
            },
            runWithParams(options) {
                let { query, params } = options;
                let queryObject = query.runSuiteQL({ query, params });
                return queryObject.asMappedResults();
            }
        };
    }
);