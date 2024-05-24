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
        'N/query'
    ],
    (
        query
    ) => {
        const CURRENCIES = `SELECT
            Symbol,
            Name,
            ExchangeRate,
            DisplaySymbol,
            SymbolPlacement,
            CurrencyPrecision,
            IsBaseCurrency
        FROM
            Currency
        WHERE
            ( IsInactive = 'F' )
        ORDER BY
            Symbol`;
        
        const CUSTOM_LIST_VALUES = `
        SELECT
            Name, 
            ID
        FROM
            {CUSTOM_LIST_ID}
        WHERE
            IsInactive = 'F'
        ORDER BY
            Name
        `;

        const CUSTOM_LISTS = `SELECT
            Name,
            Description,
            ScriptID,
            BUILTIN.DF( Owner ) AS Owner,
            IsOrdered
        FROM 
            CustomList
        WHERE
            ( IsInactive = 'F' )
        ORDER BY
            Name`;

        const STATE_COUNTRIES = `SELECT
            Country.ID AS CountryID,
            Country.Name AS CountryName,
            Country.Edition,
            Country.Nationality,
            State.ID AS StateID,
            State.ShortName AS StateShortName,
            State.FullName AS StateFullName
        FROM
            Country
            LEFT OUTER JOIN State ON
                ( State.Country = Country.ID )
        ORDER BY
            CountryName,
            StateShortName`;
    
        return {
            get Currencies() {
                return this.run(CURRENCIES);
            },
            get CustomLists() {
                return this.run(CUSTOM_LISTS);
            },
            get StatesWithCountries() {
                return this.run(STATE_COUNTRIES);
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