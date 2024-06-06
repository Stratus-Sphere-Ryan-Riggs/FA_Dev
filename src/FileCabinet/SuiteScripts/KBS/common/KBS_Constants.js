/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for all constants used within this account.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        './KBS_Entity.js',
        './KBS_Transaction.js'
    ],
    (
        KBS_Entity,
        KBS_Transaction
    ) => {
        const ADVANCED_PDF_TEMPLATES = {};
        const BUTTONS = {
            INVOICE_HEADER_MEMBER: {
                id: 'custpage_btn_invoice_member',
                label: 'Invoice Header Member',
                functionName: 'invoiceHeaderMember'
            }
        };
        const CUSTOM_RECORDS = {
            CARRIER: {
                Id: 'customrecord_carrier',
                Fields: {
                    CARRIER_EMAIL: 'custrecord_carrier_email'
                }
            }
        };
        const DEPLOYMENTS = {
            MR_HAS_ISSUES: '',

            SL_SUIT_MEMBERS_ON_SO: 'customdeploy_suit_members_sales_order'
        };
        const ERRORS = {
            MISSING_PARAMETER: `Missing required parameter: {name}.`
        };
        const FORMS = {};
        const LISTS = {
            ORDER_TYPE: {
                Id: 'customlist_order_type',
                Values: {
                    DISASTER: '9',
                    DONATION_BLUE: '6',
                    DONATION_MAROON: '5',
                    DONATION_YELLOW: '3',
                    GROCERY: '1',
                    OTHER: '4',
                    PRODUCE: '1',
                    SEAFOOD: '8',
                    TRANSPORTATION: '7'
                }
            }
        };
        const QUERIES = {
            CURRENCIES: `SELECT
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
                    Symbol`,
            CUSTOM_LIST_VALUES: `SELECT
                    Name, 
                    ID
                FROM
                    {CUSTOM_LIST_ID}
                WHERE
                    IsInactive = 'F'
                ORDER BY
                    Name`,
            CUSTOM_LISTS: `SELECT
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
                    Name`,
            STATE_COUNTRIES: `SELECT
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
                    StateShortName`,
            TRANSACTIONS_ASSOCIATED_TO_SALES_ORDER: `SELECT
                    id,
                    type
                FROM
                    Transaction
                WHERE
                    custbody_associated_salesorder = {ID}`
        };
        const RECORD_TYPES = {
            CustInvc: 'invoice',
            PurchOrd: 'purchaseorder',
            VendBill: 'vendorbill'
        };
        const SCRIPT_PARAMETERS = {
            HAS_ISSUES_ASSOCIATED_SO: ''
        };
        const SCRIPTS = {
            MR_HAS_ISSUES: '',

            SL_SUIT_MEMBERS_ON_SO: 'customscript_suit_members_sales_order'
        };

        return {
            AdvancedPDFTemplates: ADVANCED_PDF_TEMPLATES,
            CustomRecords: CUSTOM_RECORDS,
            Deployments: DEPLOYMENTS,
            Entity: KBS_Entity,
            Errors: ERRORS,
            Forms: FORMS,
            Lists: LISTS,
            Queries: QUERIES,
            RecordTypes: RECORD_TYPES,
            ScriptParameters: SCRIPT_PARAMETERS,
            Scripts: SCRIPTS,
            Transaction: KBS_Transaction
        };
    }
);