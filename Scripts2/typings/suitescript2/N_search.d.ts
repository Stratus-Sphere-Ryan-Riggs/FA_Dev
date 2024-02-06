/**
 * Load the search module to create and run ad-hoc or saved searches and analyze and iterate through the search results.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43702
 */
declare interface N_search {

    /**Enumeration that holds the values for search operators to use with the search.Filter. */
    Operator: {
        AFTER;
        ALLOF;
        ANY;
        ANYOF;
        BEFORE;
        BETWEEN;
        CONTAINS;
        DOESNOTCONTAIN;
        DOESNOTSTARTWITH;
        EQUALTO;
        GREATERTHAN;
        GREATERTHANOREQUALTO;
        HASKEYWORDS;
        IS;
        ISEMPTY;
        ISNOT;
        ISNOTEMPTY;
        LESSTHAN;
        LESSTHANOREQUALTO;
        NONEOF;
        NOTAFTER;
        NOTALLOF;
        NOTBEFORE;
        NOTBETWEEN;
        NOTEQUALTO;
        NOTGREATERTHAN;
        NOTGREATERTHANOREQUALTO;
        NOTLESSTHAN;
        NOTLESSTHANOREQUALTO;
        NOTON;
        NOTONORAFTER;
        NOTONORBEFORE;
        NOTWITHIN;
        ON;
        ONORAFTER;
        ONORBEFORE;
        STARTSWITH;
        WITHIN;
    }
    /**Enumeration that holds the values for supported sorting directions used with search.createColumn(options). */
    Sort: {
        ASC;
        DESC;
        NONE;
    }
    /**Enumeration that holds the values for summary types used by the Column.summary or Filter.summary properties */
    Summary: {
        GROUP;
        COUNT;
        SUM;
        AVG;
        MIN;
        MAX;
    }
    /**Enumeration that holds the string values for record types that support search search.create(options). */
    Type: {
        ACCOUNT;
        ACCOUNTING_BOOK;
        ACCOUNTING_CONTEXT;
        ACCOUNTING_PERIOD;
        ACTIVITY;
        AMORTIZATION_SCHEDULE;
        AMORTIZATION_TEMPLATE;
        ASSEMBLY_BUILD;
        ASSEMBLY_ITEM;
        ASSEMBLY_UNBUILD;
        BILLING_ACCOUNT;
        BILLING_ACCOUNT_BILL_CYCLE;
        BILLING_ACCOUNT_BILL_REQUEST;
        BILLING_CLASS;
        BILLING_RATE_CARD;
        BILLING_SCHEDULE;
        BIN;
        BIN_TRANSFER;
        BIN_WORKSHEET;
        BLANKET_PURCHASE_ORDER;
        BUNDLE_INSTALLATION_SCRIPT;
        CALENDAR_EVENT;
        CAMPAIGN;
        CASH_REFUND;
        CASH_SALE;
        CHARGE;
        CHECK;
        CLASSIFICATION;
        CLIENT_SCRIPT;
        COMMERCE_CATEGORY;
        COMPETITOR;
        CONSOLIDATED_EXCHANGE_RATE;
        CONTACT;
        COUPON_CODE;
        CREDIT_CARD_CHARGE;
        CREDIT_CARD_REFUND;
        CREDIT_MEMO;
        CURRENCY;
        CUSTOMER;
        CUSTOMER_CATEGORY;
        CUSTOMER_DEPOSIT;
        CUSTOMER_PAYMENT;
        CUSTOMER_PAYMENT_AUTHORIZATION;
        CUSTOMER_REFUND;
        CUSTOM_TRANSACTION;
        DELETED_RECORD;
        DEPARTMENT;
        DEPOSIT;
        DEPOSIT_APPLICATION;
        DESCRIPTION_ITEM;
        DISCOUNT_ITEM;
        DOWNLOAD_ITEM;
        DRIVERS_LICENSE;
        EMPLOYEE;
        END_TO_END_TIME;
        ENTITY;
        ENTITY_ACCOUNT_MAPPING;
        ESTIMATE;
        EXPENSE_CATEGORY;
        EXPENSE_REPORT;
        FAIR_VALUE_PRICE;
        FOLDER;
        GENERIC_RESOURCE;
        GIFT_CERTIFICATE;
        GIFT_CERTIFICATE_ITEM;
        GLOBAL_ACCOUNT_MAPPING;
        GL_LINES_AUDIT_LOG;
        GOVERNMENT_ISSUED_ID_TYPE;
        HCM_JOB;
        INTER_COMPANY_JOURNAL_ENTRY;
        INTER_COMPANY_TRANSFER_ORDER;
        INVENTORY_ADJUSTMENT;
        INVENTORY_COST_REVALUATION;
        INVENTORY_COUNT;
        INVENTORY_DETAIL;
        INVENTORY_ITEM;
        INVENTORY_NUMBER;
        INVENTORY_TRANSFER;
        INVOICE;
        ISSUE;
        ITEM;
        ITEM_ACCOUNT_MAPPING;
        ITEM_DEMAND_PLAN;
        ITEM_FULFILLMENT;
        ITEM_GROUP;
        ITEM_RECEIPT;
        ITEM_REVISION;
        ITEM_SUPPLY_PLAN;
        JOB;
        JOB_REQUISITION;
        JOURNAL_ENTRY;
        KIT_ITEM;
        KUDOS;
        LEAD;
        LOCATION;
        LOT_NUMBERED_ASSEMBLY_ITEM;
        LOT_NUMBERED_INVENTORY_ITEM;
        MANUFACTURING_COST_TEMPLATE;
        MANUFACTURING_OPERATION_TASK;
        MANUFACTURING_ROUTING;
        MAP_REDUCE_SCRIPT;
        MARKUP_ITEM;
        MASSUPDATE_SCRIPT;
        MESSAGE;
        MFG_PLANNED_TIME;
        NEXUS;
        NON_INVENTORY_ITEM;
        NOTE;
        OPPORTUNITY;
        ORGANIZATION_VALUE;
        OTHER_CHARGE_ITEM;
        OTHER_GOVERNMENT_ISSUED_ID;
        OTHER_NAME;
        PARTNER;
        PASSPORT;
        PAYCHECK;
        PAYCHECK_JOURNAL;
        PAYMENT_ITEM;
        PAYROL_BATCH;
        PAYROLL_ITEM;
        PHONE_CALL;
        PORTLET;
        POSITION;
        PRICE_LEVEL;
        PROJECT_EXPENSE_TYPE;
        PROJECT_TASK;
        PROJECT_TEMPLATE;
        PROMOTION_CODE;
        PROSPECT;
        PURCHASE_CONTRACT;
        PURCHASE_ORDER;
        PURCHASE_REQUISITION;
        RATE_PLAN;
        RECENT_RECORD;
        RESOURCE_ALLOCATION;
        RESTLET;
        RETURN_AUTHORIZATION;
        REVENUE_ARRANGEMENT;
        REVENUE_COMMITMENT;
        REVENUE_COMMITMENT_REVERSAL;
        REVENUE_PLAN;
        REV_REC_SCHEDULE;
        REV_REC_TEMPLATE;
        ROLE;
        SALES_ORDER;
        SALES_TAX_ITEM;
        SAVED_SEARCH;
        SCHEDULED_SCRIPT;
        SCHEDULED_SCRIPT_INSTANCE;
        SCRIPT_DEPLOYMENT;
        SERIALIZED_ASSEMBLY_ITEM;
        SERIALIZED_INVENTORY_ITEM;
        SERVICE_ITEM;
        SHIP_ITEM;
        SOLUTION;
        STATISTICAL_JOURNAL_ENTRY;
        SUBSCRIPTION;
        SUBSCRIPTION_CHANGE_OWNER;
        SUBSCRIPTION_LINE;
        SUBSCRIPTION_PLAN;
        SUBSCRIPTION_RENEWAL_HISTORY;
        SUBSIDIARY;
        SUBTOTAL_ITEM;
        SUITELET;
        SUITE_SCRIPT_DETAIL;
        SUPPORT_CASE;
        TASK;
        TAX_DETAIL;
        TAX_GROUP;
        TAX_PERIOD;
        TAX_TYPE;
        TERM;
        TERMINATION_REASON;
        TIME_BILL;
        TIME_OFF_CHANGE;
        TIME_OFF_PLAN;
        TIME_OFF_REQUEST;
        TIME_OFF_RULE;
        TIME_OFF_TYPE;
        TOPIC;
        TRANSACTION;
        TRANSFER_ORDER;
        UBER;
        UNITS_TYPE;
        USEREVENT_SCRIPT;
        VENDOR;
        VENDOR_BILL;
        VENDOR_CATEGORY;
        VENDOR_CREDIT;
        VENDOR_PAYMENT;
        VENDOR_RETURN_AUTHORIZATION;
        WEBSITE;
        WORKFLOW_ACTION_SCRIPT;
        WORK_ORDER;
        WORK_ORDER_CLOSE;
        WORK_ORDER_COMPLETION;
        WORK_ORDER_ISSUE;
        WORKPLACE;
    }

    /** () | Promise  Creates a new search and returns it as a search.Search object.*/
    create: {
        /**
        * Creates a new search and returns it as a search.Search object.The search can be modified and run as an ad-hoc search with Search.run(), without saving it. Alternatively, calling Search.save() will save the search to the database, so it can be reused later in the UI or loaded with search.load(options).This method is agnostic in terms of its options.filters argument. It can accept input of a single search.Filter object, an array of search.Filter objects, or a search filter expression.The search.create(options) method also includes a promise version, search.create.promise(options). For more information about promises, see Promise object.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_REQD_ARGUMENT > {1}: Missing a required argument: {2}
        * @Throws SSS_INVALID_​SRCH_​FILTER_​EXPR > Malformed search filter expression.This is a general error raised when a filter expression cannot be parsed. For example:[ f1, 'and', 'and', f2 ]
        * @Throws SSS_INVALID_SRCH_COLUMN > An search.Column Object contains an invalid column, or is not in proper syntax: {1}.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44081
        */
        (options: {
            /** (Required) Record internal ID for the record type you want to search. Use the search.Type enum for this argument. */
            type: string
            /** (Optional) A single search.Filter object, an array of search.Filter objects, a search filter expression, or an array of search filter expressions.A search filter expression can be passed in as an Object with the following properties:name (required)joinoperator (required)summaryformulaFor more information about these properties, see Filter Object Members.You can further filter the returned search.Search object by adding additional filters with Search.filters or Search.filterExpression. */
            filters: N_search.filter
            /** (Optional) Search filter expression for the search as an array of expression objects.A search filter expression is a JavaScript string array of zero or more elements. Each element is one of the following:Operator - either ‘NOT', ‘AND', or ‘OR'Filter termNested search filter expressionYou set this value with an array of expression objects or single filter expression object to overwrite any prior filter expressions. Use null to set an empty array and remove any existing filter expressions on this search.If you want to get or set a search filters, use the Search.filters property.This parameter sets the value for the Search.filterExpression property. */
            filterExpression: object[]
            /** (Optional) A single search.Column object or array of search.Column objects.You can optionally pass in an Object or array of Objects with the following properties to represent a Column:name (required)formulafunctionjoinlabelsortsummaryFor more information about these properties, see Column Object Members. */
            columns: N_search.column
            /** (Optional) The name for a saved search. The title property is required to save a search with Search.save(). */
            title: string
            /** (Optional) Script ID for a saved search. If you do not set the saved search ID, NetSuite generates one for you. See Search.id. */
            id: string
            /** (Optional) Set to true to make the search public. Otherwise, set to false.This parameter sets the value for the Search.isPublic property. */
            isPublic: boolean
        }): N_search.Search

        /**
        * Creates a new search asynchronously and returns it as a search.Search object.For information about the parameters and errors thrown for this method, see search.create(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45222
        */
        promise(options: {
            /** (Required) Record internal ID for the record type you want to search. Use the search.Type enum for this argument. */
            type: string
            /** (Optional) A single search.Filter object, an array of search.Filter objects, a search filter expression, or an array of search filter expressions.A search filter expression can be passed in as an Object with the following properties:name (required)joinoperator (required)summaryformulaFor more information about these properties, see Filter Object Members.You can further filter the returned search.Search object by adding additional filters with Search.filters or Search.filterExpression. */
            filters: N_search.filter
            /** (Optional) Search filter expression for the search as an array of expression objects.A search filter expression is a JavaScript string array of zero or more elements. Each element is one of the following:Operator - either ‘NOT', ‘AND', or ‘OR'Filter termNested search filter expressionYou set this value with an array of expression objects or single filter expression object to overwrite any prior filter expressions. Use null to set an empty array and remove any existing filter expressions on this search.If you want to get or set a search filters, use the Search.filters property.This parameter sets the value for the Search.filterExpression property. */
            filterExpression: object[]
            /** (Optional) A single search.Column object or array of search.Column objects.You can optionally pass in an Object or array of Objects with the following properties to represent a Column:name (required)formulafunctionjoinlabelsortsummaryFor more information about these properties, see Column Object Members. */
            columns: N_search.column
            /** (Optional) The name for a saved search. The title property is required to save a search with Search.save(). */
            title: string
            /** (Optional) Script ID for a saved search. If you do not set the saved search ID, NetSuite generates one for you. See Search.id. */
            id: string
            /** (Optional) Set to true to make the search public. Otherwise, set to false.This parameter sets the value for the Search.isPublic property. */
            isPublic: boolean
        }): Promise<N_search.Search>
    }

    /** () | Promise Loads an existing saved search and returns it as a search.Search. */
    load: {
        /**
        * Loads an existing saved search and returns it as a search.Search. The saved search could have been created using the UI or created with search.create(options) and Search.save().The search.load(options) method also includes a promise version, search.load.promise(options). For more information about promises, see Promise object.
        * @Supported All script types
        * @Governance 5 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_REQD_ARGUMENT > {1}: Missing a required argument: {2}
        * @Throws INVALID_SEARCH > That search or mass update does not exist.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43707
        */
        (options: {
            /** (Required) Internal ID or script ID of a saved search. The script ID starts with customsearch. See Search.id. */
            id: string
        }): N_search.Search

        /**
        * Loads an existing saved search asynchronously and returns it as a search.Search object. The saved search could have been created using the UI or created with search.create(options) and Search.save().For information about the parameters and errors thrown for this method, see search.load(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 5 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45223
        */
        promise(options: {
            /** (Required) Internal ID or script ID of a saved search. The script ID starts with customsearch. See Search.id. */
            id: string
        }): Promise<N_search.Search>

    }

    /** () | Promise Deletes an existing saved search. */
    delete: {
        /**
        * Deletes an existing saved search. The saved search could have been created using the UI or created with search.create(options) and Search.save().The search.delete(options) method also includes a promise version, search.delete.promise(options). For more information about promises, see Promise object.
        * @Supported All script types
        * @Governance 5 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_REQD_ARGUMENT > {1}: Missing a required argument: {2}
        * @Throws INVALID_SEARCH > That search or mass update does not exist.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43708
        */
        (options: {
            /** (Required) Internal ID or script ID of a saved search. The script ID starts with customsearch. See Search.id. */
            id: string
        }): void
        /**
        * Deletes an existing saved search asynchronously and returns it as a search.Search object. The saved search can be created using the UI or created with search.create(options) and Search.save().For information about the parameters and errors thrown for this method, see search.delete(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 5 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45224
        */
        promise(options: {
            /** (Required) Internal ID or script ID of a saved search. The script ID starts with customsearch. See Search.id. */
            id: string
        }): Promise<void>
    }

    /**() | Promise Performs a search for duplicate records based on the account's duplicate detection configuration */
    duplicates: {
        /**
        * Performs a search for duplicate records based on the account's duplicate detection configuration.The search.duplicates(options) method also includes a promise version, search.duplicates.promise(options). For more information about promises, see Promise object.This API is for only records that support duplicate record detection. For example, customers, leads, prospects, contacts, partners, and vendors records.For more information about duplicate record detection, see Duplicate Record Detection
        * @Supported All script types
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > {1}: Missing a required argument: {2}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43709
        */
        (options: {
            /** (Required) Record internal ID name for which you want to check for duplicates.Use the search.Type enum for this argument. */
            type: N_search.Type
            /** (Optional) A set of key/value pairs used to detect duplicates. For example, email:'sample@test.com'.The keys are internal ID names of the fields used to detect the duplicate. For example, use companyname | email | name | phone | address1 | city | state | zipcode. */
            fields: object
            /** (Optional) Internal ID of an existing record. */
            id: number
        }): N_search.Result[]

        /**
        * Performs a search for duplicate records asynchronously based on the Duplicate Detection configuration for the account. Returns an array of search.Result objects. This method only applies to records that support duplicate record detection. These records include customer | lead | prospect | partner | vendor | contact.For information about the parameters and errors thrown for this method, see search.duplicates(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45225
        */
        promise(options: {
            /** (Required) Record internal ID name for which you want to check for duplicates.Use the search.Type enum for this argument. */
            type: N_search.Type
            /** (Optional) A set of key/value pairs used to detect duplicates. For example, email:'sample@test.com'.The keys are internal ID names of the fields used to detect the duplicate. For example, use companyname | email | name | phone | address1 | city | state | zipcode. */
            fields: object
            /** (Optional) Internal ID of an existing record. */
            id: number
        }): Promise<search.Result[]>

    }

    /**() | Promise Performs a global search against a single keyword or multiple keywords. */
    global: {
        /**
        * Performs a global search against a single keyword or multiple keywords.Similar to the global search functionality in the UI, you can programmatically filter the global search results that are returned. For example, you can use the following filter to limit the returned records to Customer records:'cu: simpson'The search.global(options) method also includes a promise version, search.global.promise(options). For more information about promises, see Promise object.For more information about global search, see Global Search.
        * @Supported All script types
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > {1}: Missing a required argument: {2}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43710
        */
        (options: {
            /** (Required) Global search keywords string or expression. */
            keywords: string
        }): N_search.Result[]

        /**
        * Performs a global search asynchronously against a single keyword or multiple keywords.Returns an array of search.Result objects with four columns: name, type, info1, and info2.For information about the parameters and errors thrown for this method, see search.global(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45226
        */
        promise(options: {
            /** (Required) Global search keywords string or expression. */
            keywords: string
        }): Promise<search.Result[]>

    }

    /** () | Promise Performs a search for one or more body fields on a record.*/
    lookupFields: {
        /**
        * Performs a search for one or more body fields on a record.For example, this method returns results in the following form:You can use joined-field lookups with this method, with the following syntax:join_id.field_nameThe search.lookupFields(options) method also includes a promise version, search.lookupFields.promise(options). For more information about promises, see Promise object.
        * @Supported All script types
        * @Governance 1 unit
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > {1}: Missing a required argument: {2}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43711
        */
        (options: {
            /** (Required) Record internal ID name for which you want to look up fields. Use the search.Type enum for this argument. */
            type: N_search.Type
            /** (Required) Internal ID for the record, for example 777 or 87. */
            id: string
            /** (Required) Array of column/field names to look up, or a single column/field name. The columns parameter can also be set to reference joined fields. */
            columns: string | string[]
        }): Object | Array

        /**
        * Performs a search asynchronously for one or more body fields on a record. Returns select fields as an object with value and text properties. Returns multiselect fields as an object array with value:text pairs.For information about the parameters and errors thrown for this method, see search.lookupFields(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 1 unit
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45227
        */
        promise(options: {
            /** (Required) Record internal ID name for which you want to look up fields. Use the search.Type enum for this argument. */
            type: N_search.Type
            /** (Required) Internal ID for the record, for example 777 or 87. */
            id: string
            /** (Required) Array of column/field names to look up, or a single column/field name. The columns parameter can also be set to reference joined fields. */
            columns: string | string[]
        }): Promise<object | array>
    }

    /**
    * Creates a new search column as a search.Column object.
    * @Supported All script types
    * @Governance None
    * @Since Version 2015 Release 2
    * @Throws SSS_MISSING_REQD_ARGUMENT > {1}: Missing a required argument: {2}
    * @Throws SSS_INVALID_SRCH_COLUMN_SUM  > A search.Column object contains an invalid column summary type, or is not in proper syntax: {1}.
    * @Throws INVALID_SRCH_FUNCTN >
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43712
    */
    createColumn(options: {
        /** (Required) Name of the search column. See Column.name. */
        name: string
        /** (Optional) Join ID for the search column. See Column.join. */
        join: string
        /** (Optional) Summary type for the column. See search.Summary and Column.summary. */
        summary: N_search.Summary
        /** (Optional) Formula for the search column. See Column.formula. */
        formula: string
        /** (Optional) Special function for the search column. See Column.function. */
        function: string
        /** (Optional) Label for the search column. See Column.label. */
        label: string
        /** (Optional) The sort order of the column. Use the search.Sort enum for this argument.Also see Column.sort. */
        sort: N_search.Sort
    }): N_search.Column

    /**
    * Creates a new search filter as a search.Filter object.
    * @Supported All script types
    * @Governance None
    * @Since Version 2015 Release 2
    * @Throws SSS_MISSING_REQD_ARGUMENT > {1}: Missing a required argument: {2}
    * @Throws SSS_INVALID_SRCH_FILTER_SUM > A search.Column object contains an invalid column summary type, or is not in proper syntax: {1}.
    * @Throws SSS_INVALID_SRCH_OPERATOR > An search.Filter object contains an invalid operator, or is not in proper syntax: {1}.
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43713
    */
    createFilter(options: {
        /** (Required) Name or internal ID of the search field. */
        name: string
        /** (Optional) Join ID for the search filter. */
        join: string
        /** (Required) Operator used for the search filter. Use the search.Operator enum. */
        operator: N_search.operator
        /** (Optional) Values to be used as filter parameters. */
        values: string | date | number | string[] | date[]
        /** (Optional) Formula used by the search filter. */
        formula: string
        /** (Optional) Summary type for the search filter. See search.Summary. */
        summary: search.summary
    }): N_search.Filter
}

declare namespace N_search {

    interface Search {
        /**Internal ID name of the record type on which a search is based. */
        searchType: string
        /**Internal ID of a search. */
        searchId: number
        /**Filters for the search as an array of search.Filter objects. */
        filters: N_search.Filter[]
        /**Search filter expression for the search as an array of expression objects. */
        filterExpression: object[]
        /**Columns to return for this search as an array of search.Column objects or a string array of column names. */
        columns: N_search.Column[] | string[]
        /**Title for a saved search. Use this property to set the title for a search before you save it for the first time. */
        title: string
        /**Script ID for a saved search, starting with customsearch. */
        id: string
        /**Value is true if the search is public, or false if it is not. */
        isPublic: boolean

        /** () | Promise Saves a search created by search.create(options) or loaded with search.load(options). */
        save: {
            /**
            * Saves a search created by search.create(options) or loaded with search.load(options). Returns the internal ID of the saved search.You must set the title and id properties for a new saved search before you save it, either when you create it with search.create(options) or by setting the Search.title and Search.id properties.If you do not set the saved search ID, NetSuite generates one for you. See Search.id.You do not need to set these properties if you load a previously saved search with search.load(options) and then save it.This method also includes a promise version, Search.save.promise(). For more information about promises, see Promise object.
            * @Supported All script types
            * @Governance 5 units
            * @Since Version 2015 Release 2
            * @Throws SSS_MISSING_REQD_ARGUMENT > {1}: Missing a required argument: {2}
            * @Throws NAME_ALREADY_IN_USE > A search has already been saved with that name. Please use a different name.
            * @Throws SSS_DUPLICATE_​SEARCH_​SCRIPT_​ID > Saved search script IDs must be unique. Please choose another script ID. If you are trying to modify an existing saved search, use search.load().
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43819
            */
            (): number

            /**
            * Asynchronously saves a search created by search.create(options) or loaded with search.load(options). Returns the internal ID of the saved search.For more information about using this method, see Search.save(). For additional information on promises, see Promise object.
            * @Supported All client-side scripts
            * @Governance 5 units
            * @Since Version 2015 Release 2
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45228
            */
            promise(): Promise<number>
        }

        /**
        * Runs an ad-hoc search created with search.create(options) or a search loaded with search.load(options), returning the results as a search.ResultSet . Calling this method does not save the search.Use this method with search.create(options) to create and run ad-hoc searches that are never saved to the database.After you run a search, you can use ResultSet.each(callback) to iterate through the result set and process each result.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43816
        */
        run(): N_search.ResultSet

        /** () | Promise  Runs the current search and returns summary information about paginated results*/
        runPaged: {
            /**
            * Runs the current search and returns summary information about paginated results.Calling this method does not give you the result set or save the search.To retrieve data, use PagedData.fetch(options).
            * @Supported All script types
            * @Governance 5 units
            * @Since Version 2016 Release 1
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49291
            */
            (options: {
                /** (optional) Maximum number of entries per pageThere is an upper limit, a lower limit, and a default setting:The maximum number allowed is 1000.The minimum number allowed is 5.By default, the page size is set to 50 entries per page. */
                pageSize: number
            }): N_search.PagedData

            /**
            * Runs the current search asynchronously and returns a search.PagedData Object.For more information about using this method, see Search.runPaged(options). For additional information on promises, see Promise object.
            * @Supported All client-side scripts
            * @Governance 5 units
            * @Since Version 2016 Release 1
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49313
            */
            promise(options: {
                /** (optional) Maximum number of entries per pageThere is an upper limit, a lower limit, and a default setting:The maximum number allowed is 1000.The minimum number allowed is 5.By default, the page size is set to 50 entries per page. */
                pageSize: number
            }): Promise<N_search.PagedData>

        }
    }

    interface Column {
        /**Name of a search column as a string. */
        name: string
        /**Join ID for a search column as a string. */
        join: string
        /**Returns the summary type for a search column. */
        summary: string
        /**Formula used for a search column as a string. */
        formula: string
        /**Label used for the search column. You can only get or set custom labels with this property. */
        label: string
        /**Special function used in the search column as a string. */
        function: string

        /**
        * Returns the search column for which the minimal or maximal value should be found when returning the search.Column value.For example, can be set to find the most recent or earliest date, or the largest or smallest amount for a record, and then the search.Column value for that record is returned.You can only use this method if you use MIN or MAX as the summary type on a search column with the Result.getValue(options) method.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43898
        */
        setWhenOrderedBy(options: {
            /** (Required) The name of the search column for which the minimal or maximal value should be found. */
            name: string
            /** (Required) The join id for the search column. */
            join: string
        }): N_search.Column

    }

    interface Filter {
        /**Name or internal ID of the search field. */
        name: string
        /**Join ID for the search filter */
        join: string
        /**Operator used for the search filter */
        operator: string
        /**Summary type for the search filter. */
        summary: N_search.Summary
        /**Formula used by the search filter. */
        formula: string
    }

    interface Page {
        /**The results from a paginated search. */
        data: N_search.Result[]
        /**Indicates whether a page is the first page of data for a result set */
        isFirst: boolean
        /**Indicates whether a page is the last page of data for a result set. */
        isLast: boolean
        /**The PagedData Object used to fetch this Page Object. */
        pagedData: N_search.PagedData
        /**The PageRange Object used to fetch this Page Object. */
        pageRange: N_search.PageRange

        /** () | Promise Method used to fetch the next segment of data (bounded by search.PageRange).*/
        next: {
            /**
            * Method used to fetch the next segment of data (bounded by search.PageRange).Moves the current page to next range.
            * @Supported All script types
            * @Governance 5 units
            * @Since Version 2016 Release 1
            * @Throws INVALID_PAGE_​RANGE > Invalid page range.
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49297
            */
            (): Void

            /**
            * Method used to asynchronously fetch the next segment of data (bounded by search.PageRange).Moves the current page to another range. The promise is complete when the data for this range is loaded or rejected.For information about errors thrown for this method, see Page.next(). For additional information on promises, see Promise object.
            * @Supported All client-side scripts
            * @Governance 5 units
            * @Since Version 2016 Release 1
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49311
            */
            promise(): Promise<Void>
        }

        /** () | Promise Method used to fetch the previous segment of data (bounded by search.PageRange). */
        prev: {
            /**
            * Method used to fetch the previous segment of data (bounded by search.PageRange).Moves the current page to previous range.
            * @Supported All script types
            * @Governance 5 units
            * @Since Version 2016 Release 1
            * @Throws INVALID_PAGE_​RANGE > Invalid page range.
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49298
            */
            (): Void

            /**
            * Method used to asynchronously fetch the previous segment of data (bounded by search.PageRange).Moves the current page to another range. The promise is complete when the data for this range is loaded or rejected.For information about errors thrown for this method, see Page.prev(). For additional information on promises, see Promise object.
            * @Supported All client-side scripts
            * @Governance 5 units
            * @Since Version 2016 Release 1
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49312
            */
            promise(): Promise<Void>
        }
    }

    interface PagedData {
        /**The total number of results when Search.runPaged(options) was executed. */
        count: number
        /**The collection of PageRange objects that divide the entire result set into smaller groups. */
        pageRanges: N_search.PageRange[]
        /**The maximum number of entries per page */
        pageSize: number
        /**The search criteria used when Search.runPaged(options) was executed. */
        searchDefinition: N_search.Search

        /** () | Promise This method retrieves the data within the specified page range. */
        fetch: {
            /**
            * This method retrieves the data within the specified page range. This method also includes a promise version, PagedData.fetch.promise(). For more information about promises, see Promise object.
            * @Supported All client-side scripts
            * @Governance 5 units
            * @Since Version 2016 Release 1
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49310
            */
            (options: {
                /** (Required) The index of the page range that bounds the desired data. */
                index: number
            }): N_search.Page
            /**
            * This method asynchronously retrieves the data bounded by the pageRange parameter.For information about the parameters and errors thrown for this method, see PagedData.fetch(options). For additional information on promises, see Promise object.
            * @Supported All client-side scripts
            * @Governance 5 units
            * @Since Version 2016 Release 1
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49310
            */
            promise(options: {
                /** (Required) The index of the page range that bounds the desired data. */
                index: number
            }): Promise<N_search.Page>

        }
    }

    interface PageRange {
        /**Human-readable label with beginning and ending range identifiers */
        compoundLabel: string
        /**The index of this page range. */
        index: number
    }

    interface Result {
        /**The type of record returned in a search result row. */
        recordType: string
        /**The internal ID for the record returned in a search result row. */
        id: number
        /**Array of search.Column objects that encapsulate the columns returned in the search result row. */
        columns: N_search.Column[]

        /**
        * Used on formula fields and non-formula (standard) fields to get the value of a specified search return column by specifying the name, join, and summary properties.This method is overloaded. You can also use Result.getValue(column) to get column values. For convenience, you can pass in a single search.Column.If you have multiple search return columns and you apply grouping, all columns must include a summary property.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43989
        */
        getValue(options: {
            /** (Required) The search return column name. */
            name: string
            /** (Optional) The join id for this search return column.Join IDs are listed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            join: string
            /** (Optional) The summary type for this column. See search.Summary. */
            summary: N_search.summary
        }): string
        /**
        * Used on formula fields and non-formula (standard) fields to get the value of a specified search return column. For convenience, this method takes a single search.Column.This method is overloaded. You can also use Result.getValue(options) to get column values based on name, join and summary properties for a column.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43990
        */
        getValue(column): string
        /**
        * The text value for a search.Column if it is a stored select field.This method is overloaded. You can also use Result.getText(column) to get column text value based on name, join and summary properties for a column.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43958
        */
        getText(column): string
        /**
        * The UI display name, or text value, for a search result column.The following field types are supported: select, image, or document fields.This method is overloaded. You can also use Result.getText(column) to get a column value. For convenience, you can pass in a single search.Column.
        * @Supported All script types
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43888
        */
        getText(options: {
            /** (Required) The name of the search column. */
            name: string
            /** (Optional) The join internal ID for the search column. */
            join: string
            /** (Optional) The summary type used for the search column. See search.Summary. */
            summary: N_search.summary
        }): string

    }

    interface ResultSet {
        /**An array of search.Column objects that represent the columns returned in the search results. */
        columns: N_search.Column[]

        /**() | Promise Retrieve a slice of the search result as an array of search.Result objects. */
        getRange: {
            /**
            * Retrieve a slice of the search result as an array of search.Result objects.The start parameter is the inclusive index of the first result to return. The end parameter is the exclusive index of the last result to return. For example, getRange(0, 10) retrieves 10 search results, at index 0 through index 9. Unlimited rows in the result are supported, however you can only return 1,000 at a time based on the index values.If there are fewer results available than requested, then the array will contain fewer than end - start entries. For example, if there are only 25 search results, then getRange(20, 30) will return an array of 5 search.Result objects.
            * @Supported All script types
            * @Governance 10 units
            * @Since Version 2015 Release 2
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43871
            */
            (options: {
                /** (Required) Index number of the first result to return, inclusive. */
                start: number
                /** (Required) Index number of the last result to return, exclusive. */
                end: number
            }): N_search.Result[]

            /**
            * Method used to asynchronously retrieve a slice of the search result as an array of search.Result objects.For information about the parameters and errors thrown for this method, see ResultSet.getRange(options). For additional information on promises, see Promise object.
            * @Supported All client-side scripts
            * @Governance 10 units
            * @Since Version 2015 Release 2
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50847
            */
            promise(options: {
                /** (Required) Index number of the first result to return, inclusive. */
                start: number
                /** (Required) Index number of the last result to return, exclusive. */
                end: number
            }): Promise<search.Result[]>
        }

        /**() | Promise Use a developer-defined function to invoke on each row in the search results, up to 4000 results at a time. */
        each: {
            /**
            * Use a developer-defined function to invoke on each row in the search results, up to 4000 results at a time. The callback function must use the following signature:boolean callback(result.Result result);The callback function takes a search.Result object as an input parameter and returns a boolean which can be used to stop the iteration with a value of false, or continue the iteration with a value of true.The work done in the context of the callback function counts towards the governance of the script that called it. For example, if the callback function is running in the context of a scheduled script, which has a 10,000 unit governance limit, make sure the amount of processing within the callback function does not put the entire script at risk of exceeding scheduled script governance limits.
            * @Supported All script types
            * @Governance 10 units
            * @Since Version 2015 Release 2
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43899
            */
            /**Named JavaScript function or anonymous inline function that contains the logic to process a search.Result object. */
            (callback: (result: N_search.Result) => void): void

            /**
            * Asynchronously uses a developer-defined function to invoke on each row in the search results, up to 4000 results at a time. The callback function must use the following signature:For information about the parameters and errors thrown for this method, see ResultSet.each(callback). For additional information on promises, see Promise object.
            * @Supported All client-side scripts
            * @Governance 10 units
            * @Since Version 2015 Release 2
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50848
            */
            promise(callback: (result: N_search.Result) => void): Promise<void>

        }
    }
}
