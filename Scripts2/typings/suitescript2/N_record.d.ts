/**
 * Load the record module to work with NetSuite records.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45152
 */
declare interface N_record {

    Type: {
        ACCOUNT;
        ACCOUNTING_BOOK;
        ACCOUNTING_PERIOD;
        AMORTIZATION_SCHEDULE;
        AMORTIZATION_TEMPLATE;
        ASSEMBLY_BUILD;
        ASSEMBLY_ITEM;
        ASSEMBLY_UNBUILD;
        BILLING_ACCOUNT;
        BILLING_CLASS;
        BILLING_SCHEDULE;
        BIN;
        BIN_TRANSFER;
        BIN_WORKSHEET;
        BLANKET_PURCHASE_ORDER;
        BUNDLE_INSTALLATION_SCRIPT;
        CALENDAR_EVENT;
        CAMPAIGN;
        CAMPAIGN_TEMPLATE;
        CASH_REFUND;
        CASH_SALE;
        CHARGE;
        CHECK;
        CLASSIFICATION;
        CLIENT_SCRIPT;
        COMPETITOR;
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
        CUSTOMER_REFUND;
        CUSTOM_TRANSACTION;
        DEPARTMENT;
        DEPOSIT;
        DEPOSIT_APPLICATION;
        DESCRIPTION_ITEM;
        DISCOUNT_ITEM;
        DOWNLOAD_ITEM;
        DRIVERS_LICENSE;
        EMAIL_TEMPLATE;
        EMPLOYEE;
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
        ORDER_SCHEDULE;
        ORGANIZATION_VALUE;
        OTHER_CHARGE_ITEM;
        OTHER_GOVERNMENT_ISSUED_ID;
        OTHER_NAME;
        PARTNER;
        PASSPORT;
        PAYCHECK_JOURNAL;
        PAYMENT_ITEM;
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
        REALLOCATE_ITEM;
        RESOURCE_ALLOCATION;
        RESTLET;
        RETURN_AUTHORIZATION;
        REVENUE_ARRANGEMENT;
        REVENUE_COMMITMENT;
        REVENUE_COMMITMENT_REVERSAL;
        REVENUE_PLAN;
        REV_REC_SCHEDULE;
        REV_REC_TEMPLATE;
        SALES_ORDER;
        SALES_TAX_ITEM;
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
        SUBSCRIPTION_CHANGE_ORDER;
        SUBSCRIPTION_LINE;
        SUBSCRIPTION_PLAN;
        SUBSIDIARY;
        SUBTOTAL_ITEM;
        SUITELET;
        SUPPORT_CASE;
        TASK;
        TAX_ACCT;
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
        TRANSFER_ORDER;
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
    }

    /** () | Promise Attaches a record to another record.*/
    attach: {
        /**
        * Attaches a record to another record.For the promise version of this method, see record.attach.promise(options). Note that promises are only supported in client scripts.
        * @Supported Client and server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45159
        */
        (options: {
            record: {
                /** (required) The type of record to attach.Set the value using the record.Type enum.To attach a file from the file cabinet to a record, set type to file. */
                type: string
                /** (required) The internal ID of the record to attach. */
                id: number | string
            }
            to: {
                /** (required) The record type of the record to attach to.Set the value using the record.Type enum.To attach a file from the file cabinet to a record, set type to file. */
                type: string
                /** (required) The internal ID of the record to attach to. */
                id: number | string
            }
            /** (optional) The name-value pairs containing attributes for the attachment.By default, this value is null. */
            attributes: object
        }): void

        /**
        * Attaches a record asynchronously to another record.For information about the parameters and errors thrown for this method, see record.attach(options). For more information about promises, see Promise object.
        * @Supported Client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45239
        */
        promise(options: {
            record: {
                /** (required) The type of record to attach.Set the value using the record.Type enum.To attach a file from the file cabinet to a record, set type to file. */
                type: string
                /** (required) The internal ID of the record to attach. */
                id: number | string
            }
            to: {
                /** (required) The record type of the record to attach to.Set the value using the record.Type enum.To attach a file from the file cabinet to a record, set type to file. */
                type: string
                /** (required) The internal ID of the record to attach to. */
                id: number | string
            }
            /** (optional) The name-value pairs containing attributes for the attachment.By default, this value is null. */
            attributes: object
        }): Promise<>

    }

    /** () | Promise Creates a new record by copying an existing record in NetSuite.*/
    copy: {
        /**
        * Creates a new record by copying an existing record in NetSuite.For the promise version of this method, see record.copy.promise(options). Note that promises are only supported in client scripts.
        * @Supported Client and server-side scripts
        * @Governance Transaction records: 10 usage unitsCustom records: 2 usage unitsAll other records: 5 usage units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45154
        */
        (options: {
            /** (required) The record type.Set the value using the record.Type enum. */
            type: string
            /** (required) The internal ID of the existing record instance in NetSuite. */
            id: number
            /** (optional) Determines whether the new record is created in dynamic mode.If set to true, the new record is created in dynamic mode.If set to false, the new record is created in standard mode.By default, this value is false.For additional information on standard and dynamic mode, see record.Record. */
            isDynamic: boolean
            /** (optional) Name-value pairs containing default values of fields in the new record.By default, this value is null.For a list of available record default values, see N/record Default Values in the NetSuite Help Center. */
            defaultValues: object
        }): N_record.Record

        /**
        * Creates a new record asynchronously by copying an existing record in NetSuite.For information about the parameters and errors thrown for this method, see record.copy(options). For more information on promises, see Promise object.
        * @Supported Client-side scripts
        * @Governance Transaction records: 10 usage unitsCustom records: 2 usage unitsAll other records: 5 usage units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45240
        */
        promise(options: {
            /** (required) The record type.Set the value using the record.Type enum. */
            type: string
            /** (required) The internal ID of the existing record instance in NetSuite. */
            id: number
            /** (optional) Determines whether the new record is created in dynamic mode.If set to true, the new record is created in dynamic mode.If set to false, the new record is created in standard mode.By default, this value is false.For additional information on standard and dynamic mode, see record.Record. */
            isDynamic: boolean
            /** (optional) Name-value pairs containing default values of fields in the new record.By default, this value is null. */
            defaultValues: object
        }): Promise<N_record.Record>
    }

    /** () | Promise Creates a new record.For the promise version of this method, see record.create.promise(options) */
    create: {
        /**
        * Creates a new record.For the promise version of this method, see record.create.promise(options). Note that promises are only supported in client scripts.
        * @Supported Client and server-side scripts
        * @Governance Transaction records: 10 usage unitsCustom records: 2 usage unitsAll other records: 5 usage units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45153
        */
        (options: {
            /** (required) The record type.This value sets the Record.type property of this record. This property is read-only and cannot be changed after the record is created.Set the value using the record.Type enum. */
            type: string
            /** (optional) Determines whether the new record is created in dynamic mode.If set to true, the new record is created in dynamic mode.If set to false, the new record is created in standard mode.By default, this value is false.For additional information on standard and dynamic mode, see record.Record. */
            isDynamic: boolean
            /** (optional) Name-value pairs containing default values of fields in the new record.By default, this value is null.For a list of available record default values, see N/record Default Values in the NetSuite Help Center. */
            defaultValues: object
        }): N_record.Record

        /**
        * Creates a new record asynchronously.For information about the parameters and errors thrown for this method, see record.create(options). For more information on promises, see Promise object.
        * @Supported Client-side scripts
        * @Governance Transaction records: 10 usage unitsCustom records: 2 usage unitsAll other records: 5 usage units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45241
        */
        promise(options: {
            /** (required) The record type.This value sets the Record.type property of this record. This property is read-only and cannot be changed after the record is created.Set the value using the record.Type enum. */
            type: string
            /** (optional) Determines whether the new record is created in dynamic mode.If set to true, the new record is created in dynamic mode.If set to false, the new record is created in standard mode.By default, this value is false.For additional information on standard and dynamic mode, see record.Record. */
            isDynamic: boolean
            /** (optional) Name-value pairs containing default values of fields in the new record.By default, this value is null. */
            defaultValues: object
        }): Promise<N_record.Record>
    }

    /** () | Promise Deletes a record.For the promise version of this method, see record.delete.promise(options) */
    delete: {
        /**
        * Deletes a record.For the promise version of this method, see record.delete.promise(options). Note that promises are only supported in client scripts.
        * @Supported Client and server-side scripts
        * @Governance Transaction records: 20 usage unitsCustom records: 4 usage unitsAll other records: 10 usage units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45157
        */
        (options: {
            /** (required) The record type.Set the value using the record.Type enum. */
            type: string
            /** (required) The internal ID of the record instance to be deleted. */
            id: number | string
        }): number

        /**
        * Deletes a record asynchronously.For information about the parameters and errors thrown for this method, see record.delete(options). For more information on promises, see Promise object.
        * @Supported Client-side scripts
        * @Governance Transaction records: 20 usage unitsCustom records: 4 usage unitsAll other records: 10 usage units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45242
        */
        promise(options: {
            /** (required) The record type.Set this value using the record.Type enum. */
            type: string
            /** (required) The internal ID of the record instance to be deleted. */
            id: number | string
        }): Promise<number>

    }

    /** () | Promise  Detaches a record from another record */
    detach: {
        /**
        * Detaches a record from another record.For the promise version of this method, see record.detach.promise(options). Note that promises are only supported in client scripts.
        * @Supported Client and server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45160
        */
        (options: {
            record: {
                /** (required) The type of record to be detached.Set this value using the record.Type enum. */
                type: string
                /** (required) The ID of the record to be detached. */
                id: number | string
            }
            from: {
                /** (required) The type of the destination.Set this value using the record.Type enum. */
                type: string
                /** (required) The ID of the destination. */
                id: number | string
            }
            /** (optional) Name-value pairs containing default values of fields in the new record.By default, this value is null. */
            attributes: object
        }): void

        /**
        * Detaches a record from another record asynchronously.For information about the parameters and errors thrown for this method, see record.detach(options). For more information on promises, see Promise object.
        * @Supported Client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45243
        */
        promise(options: {
            record: {
                /** (required) The type of record to be detached.Set this value using the record.Type enum. */
                type: string
                /** (required) The ID of the record to be detached. */
                id: number | string
            }
            from: {
                /** (required) The type of the destination.Set this value using the record.Type enum. */
                type: string
                /** (required) The ID of the destination. */
                id: number | string
            }
            /** (optional) Name-value pairs containing default values of fields in the new record.By default, this value is null. */
            attributes: object
        }): Promise<void>

    }

    /** () | Promise Loads an existing record. */
    load: {
        /**
        * Loads an existing record.For the promise version of this method, see record.load.promise(options). Note that promises are only supported in client scripts.
        * @Supported Client and server-side scripts
        * @Governance Transaction records: 10 usage unitsCustom records: 2 usage unitsAll other records: 5 usage units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45155
        */
        (options: {
            /** (required) The type of record to load.This value sets the Record.type property for the record.Set this value using the record.Type enum. */
            type: string
            /** (required) The internal ID of the existing record instance in NetSuite. The internal ID of the record is displayed on the list page for the record type. */
            id: number
            /** (optional) Determines whether the record is loaded in dynamic mode.If set to true, the record is loaded in dynamic mode.If set to false, the record is loaded in standard mode.By default, this value is false.For additional information on standard and dynamic mode, see record.Record. */
            isDynamic: boolean
            /** (optional) Name-value pairs containing default values of fields in the new record.By default, this value is null.For a list of available record default values, see N/record Default Values in the NetSuite Help Center. */
            defaultValues: object
        }): N_record.Record

        /**
        * Loads an existing record asynchronously.For information about the parameters and errors thrown for this method, see record.load(options). For more information on promises, see Promise object.
        * @Supported Client-side scripts
        * @Governance Transaction records: 10 usage unitsCustom records: 2 usage unitsAll other records: 5 usage units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45244
        */
        promise(options: {
            /** (required) The type of record to load.This value sets the Record.type property for the record.Set this value using the record.Type enum. */
            type: string
            /** (required) The internal ID of the existing record instance in NetSuite. The internal ID of the record is displayed on the list page for the record type. */
            id: number
            /** (optional) Determines whether the record is loaded in dynamic mode.If set to true, the record is loaded in dynamic mode.If set to false, the record is loaded in standard mode.By default, this value is false.For additional information on standard and dynamic mode, see record.Record. */
            isDynamic: boolean
            /** (optional) Name-value pairs containing default values of fields in the new record.By default, this value is null. */
            defaultValues: object
        }): Promise<N_record.Record>

    }

    /** () | Promise Updates and submits one or more body fields on an existing record in NetSuite, and returns the internal ID of the parent record */
    submitFields: {
        /**
        * Updates and submits one or more body fields on an existing record in NetSuite, and returns the internal ID of the parent record.When you use this method, you do not need to load or submit the parent record.You can use this method to edit and submit the following:Standard body fields that support inline editing (direct list editing). For more information, see Using Inline Editing.Custom body fields that support inline editing.You cannot use this method to edit and submit the following:Select fieldsSublist line item fieldsSubrecord fields (for example, address fields)For the promise version of this method, see record.submitFields.promise(options). Note that promises are only supported in client scripts.
        * @Supported Client and server-side scripts
        * @Governance Transaction records: 10 usage unitsCustom records: 2 usage unitsAll other records: 5 usage units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45158
        */
        (options: {
            /** (required) The type of record.This value sets the Record.type property for the record.Set this value using the record.Type enum. */
            type: string
            /** (required) The internal ID of the existing record instance in NetSuite. */
            id: number | string
            /** (required) The ID-value pairs for each field you want to edit and submit. */
            values: object
            options: {
                /** (optional) Indicates whether to enable sourcing during the record update.By default, this value is true. */
                enablesourcing: boolean
                /** (optional) Indicates whether to ignore mandatory fields during record submission.By default, this value is false. */
                ignoreMandatoryFields: boolean
            }
        }): number

        /**
        * Updates and submits one or more body fields asynchronously on an existing record in NetSuite, and returns the internal ID of the parent record.When you use this method, you do not need to load or submit the parent record.You can use this method to edit and submit the following:Standard body fields that support inline editing (direct list editing). For more information, see Using Inline Editing.Custom body fields that support inline editing.You cannot use this method to edit and submit the following:Select fieldsSublist line item fieldsSubrecord fields (for example, address fields)For information about the parameters and errors thrown for this method, see record.submitFields(options). For more information on promises, see Promise object.
        * @Supported Client-side scripts
        * @Governance Transaction records: 10 usage unitsCustom records: 2 usage unitsAll other records: 5 usage units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45245
        */
        promise(options: {
            /** (required) The type of record.This value sets the Record.type property for the record.Set this value using the record.Type enum. */
            type: string
            /** (required) The internal ID of the existing record instance in NetSuite. */
            id: number | string
            /** (required) The ID-value pairs for each field you want to edit and submit. */
            values: object
            options: {
                /** (optional) Indicates whether to enable sourcing during the record update.By default, this value is true. */
                enablesourcing: boolean
                /** (optional) Indicates whether to ignore mandatory fields during record submission.By default, this value is false. */
                ignoreMandatoryFields: boolean
            }
        }): Promise<number>
    }

    /** () | Promise Transforms a record from one type into another, using data from an existing record */
    transform: {
        /**
        * Transforms a record from one type into another, using data from an existing record.You can use this method to automate order processing, creating item fulfillment transactions and invoices off of orders.For a list of supported transformations, see Supported Transformation Types.For the promise version of this method, see record.transform.promise(options). Note that promises are only supported in client scripts.
        * @Supported Client and server-side scripts
        * @Governance Transaction records: 10 usage unitsCustom records: 2 usage unitsAll other record types: 5 usage units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45156
        */
        (options: {
            /** (required) The record type of the existing record instance being transformed.This value sets the Record.type property for the record. This property is read-only and cannot be changed after the record is loaded.Set this value using the record.Type. */
            fromType: string
            /** (required) The internal ID of the existing record instance being transformed. */
            fromId: number
            /** (required) The record type of the record returned when the transformation is complete. */
            toType: string
            /** (optional) Determines whether the new record is created in dynamic mode.If set to true, the new record is created in dynamic mode.If set to false, the new record is created in standard mode.By default, this value is false.For additional information on standard and dynamic mode, see record.Record. */
            isDynamic: boolean
            /** (optional) Name-value pairs containing default values of fields in the new record.By default, this value is null.For a list of available record default values, see N/record Default Values in the NetSuite Help Center. */
            defaultValues: object
        }): N_record.Record

        /**
        * Transforms a record from one type into another asynchronously, using data from an existing record.You can use this method to automate order processing, creating item fulfillment transactions and invoices off of orders.For a list of supported transformations, see Supported Transformation Types.For information about the parameters and errors thrown for this method, see record.transform(options). For more information on promises, see Promise object.
        * @Supported Client-side scripts
        * @Governance Transaction records: 10 usage unitsCustom records: 2 usage unitsAll other record types: 5 usage units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45247
        */
        promise(options: {
            /** (required) The record type of the existing record instance being transformed.This value sets the Record.type property for the record. This property is read-only and cannot be changed after the record is loaded.Set this value using the record.Type. */
            fromType: string
            /** (required) The internal ID of the existing record instance being transformed. */
            fromId: number
            /** (required) The record type of the record returned when the transformation is complete. */
            toType: string
            /** (optional) Determines whether the new record is created in dynamic mode.If set to true, the new record is created in dynamic mode.If set to false, the new record is created in standard mode.By default, this value is false.For additional information on standard and dynamic mode, see record.Record. */
            isDynamic: boolean
            /** (optional) Name-value pairs containing default values of fields in the new record.By default, this value is null. */
            defaultValues: object
        }): Promise<N_record.Record>




    }

}

declare namespace N_record {
    interface Column {
        /**Returns the internal ID of the column. */
        id: string
        /**Returns the UI label for the column. */
        label: string
        /**Returns the internal ID of the standard or custom sublist that contains the column. */
        sublistId: string
        /**Returns the column type. */
        type: string
    }

    interface Field {
        /**Returns the UI label for a standard or custom field body or sublist field. */
        label: string
        /**Returns the internal ID of a standard or custom body or sublist field. */
        id: string
        /**Returns the type of a body or sublist field. */
        type: string
        /**Returns true if the standard or custom field is mandatory on the record form, or false otherwise. */
        isMandatory: boolean
        /**Returns the ID of the sublist associated with the specified sublist field. */
        sublistId: string

        /**
        * Returns an array of available options on a standard or custom select, multi-select, or radio field as key-value pairs. Only the first 1,000 available options are returned.This function returns an array in the following format:This function returns Type Error if the field is not a select field.You can only use this method on a record in dynamic mode. For additional information on dynamic mode, see record.Record.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45210
        */
        getSelectOptions(options: {
            /** (Required) The search string to filter the select options that are returned.Filter values are case insensitive. */
            filter: string
            /** (Required) The following operators are supported:contains (default)isstartswith */
            operator: string
        }): array
    }

    interface Record {
        /**The internal ID of a specific record. */
        id: number
        /**Indicates whether the record is in dynamic or standard mode. */
        isDynamic: boolean
        /**The record type. */
        type: string

        /**
        * Cancels the currently selected line on a sublist.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45399
        */
        cancelLine(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
        }): N_record.Record

        /**
        * Commits the currently selected line on a sublist.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45400
        */
        commitLine(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
        }): N_record.Record

        /**
        * Returns the line number of the first instance where a specified value is found in a specified column of the matrix.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50204
        */
        findMatrixSublistLineWithValue(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The ID of the matrix field. */
            fieldId: string
            /** (required) The value to search for. */
            value: number
            /** (required) The column number of the field. Note that column indexing begins at 0 with SuiteScript 2.0. */
            column: number
        }): number

        /**
        * Returns the line number for the first occurrence of a field value in a sublist.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or not defined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45391
        */
        findSublistLineWithValue(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (optional) The value to search for. */
            value: number | date | string | array | boolean
        }): number

        /**
        * Gets the value for the currently selected line in the matrix.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50206
        */
        getCurrentMatrixSublistValue(options: {
            /** (required) The internal ID of the sublist that contains the matrix.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the matrix field. Note that column indexing begins at 0 with SuiteScript 2.0. */
            column: number
        }): number | Date | string | array | boolean

        /**
        * Returns metadata about a sublist field.You can only use this method on a record in dynamic mode. For additional information on dynamic mode, see record.Record.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51400
        */
        getCurrentSublistField(options: {
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
        }): N_record.Field

        /**
        * Returns the line number of the currently selected line.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45406
        */
        getCurrentSublistIndex(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
        }): number

        /**
        * Gets the subrecord for the associated sublist field on the current line.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45420
        */
        getCurrentSublistSubrecord(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
        }): N_record.Record

        /**
        * Returns a text representation of the field value in the currently selected line.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45405
        */
        getCurrentSublistText(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
        }): string

        /**
        * Returns the value of a sublist field on the currently selected sublist line.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45403
        */
        getCurrentSublistValue(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
        }): number | Date | string | array | boolean

        /**
        * Returns a field object from a record.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45385
        */
        getField(options: {
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
        }): N_record.Field

        /**
        * Returns the body field names (internal ids) of all the fields in the record, including machine header field and matrix header fields.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45383
        */
        getFields(): string[]

        /**
        * Returns the number of lines in a sublist.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45392
        */
        getLineCount(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
        }): number

        /**
        * Returns the number of columns for the specified matrix.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50207
        */
        getMatrixHeaderCount(options: {
            /** (required) The internal ID of the sublist that contains the matrix.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
        }): number

        /**
        * Gets the field for the specified header in the matrix.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50208
        */
        getMatrixHeaderField(options: {
            /** (required) The internal ID of the sublist that contains the matrix.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. Note that column indexing begins at 0 with SuiteScript 2.0. */
            column: number
        }): N_record.Field

        /**
        * Gets the value for the associated header in the matrix.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50209
        */
        getMatrixHeaderValue(options: {
            /** (required) The internal ID of the sublist that contains the matrix.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. Note that column indexing begins at 0 with SuiteScript 2.0. */
            column: number
        }): number | Date | string | array | boolean

        /**
        * Gets the field for the specified sublist in the matrix.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50210
        */
        getMatrixSublistField(options: {
            /** (required) The internal ID of the sublist that contains the matrix.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. Note that column indexing begins at 0 with SuiteScript 2.0. */
            column: number
            /** (required) The line number for the field. Note that line indexing begins at 0 with SuiteScript 2.0. */
            line: number
        }): N_record.Field

        /**
        * Gets the value for the associated field in the matrix.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50211
        */
        getMatrixSublistValue(options: {
            /** (required) The internal ID of the sublist that contains the matrix.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. Note that column indexing begins at 0 with SuiteScript 2.0. */
            column: number
            /** (required) The line number for the field. Note that line indexing begins at 0 with SuiteScript 2.0. */
            line: number
        }): number | Date | string | array | boolean

        /**
        * Returns the specified sublist.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50212
        */
        getSublist(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
        }): N_record.Sublist

        /**
        * Returns all the names of all the sublists.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50213
        */
        getSublists(): string[]

        /**
        * Returns a field object from a sublist.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45386
        */
        getSublistField(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The line number for the field. Note that line indexing begins at 0 with SuiteScript 2.0. */
            line: number
        }): N_record.Field

        /**
        * Returns all the field names in a sublist.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45384
        */
        getSublistFields(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
        }): string[]

        /**
        * Gets the subrecord associated with a sublist field. (standard mode only)When working in dynamic mode, get a sublist subrecord using the following methods:Record.selectLine(options)Record.hasCurrentSublistSubrecord(options)Record.getCurrentSublistSubrecord(options)
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45421
        */
        getSublistSubrecord(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The line number for the field. Note that line indexing begins at 0 with SuiteScript 2.0. */
            line: number
        }): N_record.Record

        /**
        * Returns the value of a sublist field in a text representation.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_INVALID_API_USAGE > Invoked prior to using setSublistText in standard record mode.
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45397
        */
        getSublistText(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The line number for the field. Note that line indexing begins at 0 with SuiteScript 2.0. */
            line: number
        }): string

        /**
        * Returns the value of a sublist field.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_INVALID_API_USAGE > Invoked prior to using setSublistValue in standard record mode.
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45395
        */
        getSublistValue(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The line number for the field. Note that line indexing begins at 0 with SuiteScript 2.0. */
            line: number
        }): number | Date | string | array | boolean

        /**
        * Gets the subrecord for the associated field.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_REQD_ARGUMENT > A required argument is missing or undefined.
        * @Throws FIELD_1_IS_NOT_A_SUBRECORD_FIELD > The specified field is not a subrecord field.
        * @Throws FIELD_1_IS_​DISABLED_​YOU_​CANNOT_​APPLY_​SUBRECORD_​OPERATION_​ON_​THIS_​FIELD > The specified field is disabled.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45418
        */
        getSubrecord(options: {
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
        }): N_record.Record

        /**
        * Returns the text representation of a field value.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_API_USAGE > Invoked prior to using setText in standard record mode.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45389
        */
        getText(options: {
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
        }): string

        /**
        * Returns the value of a field.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_API_USAGE > Invoked prior to using setValue in standard record mode.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45387
        */
        getValue(options: {
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
        }): number | Date | string | array | boolean

        /**
        * Returns a value indicating whether the associated sublist field has a subrecord on the current line.You can only use this method on a record in dynamic mode. For additional information on dynamic mode, see record.Record.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50219
        */
        hasCurrentSublistSubrecord(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a subrecord. */
            fieldId: string
        }): boolean

        /**
        * Returns a value indicating whether the associated sublist field contains a subrecord.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50220
        */
        hasSublistSubrecord(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a subrecord. */
            fieldId: string
            /** (required) The line number for the field. Note that line indexing begins at 0 with SuiteScript 2.0. */
            line: number
        }): boolean

        /**
        * Returns a value indicating whether the field contains a subrecord.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50221
        */
        hasSubrecord(options: {
            /** (required) The internal ID of the field that may contain a subrecord. */
            fieldId: string
        }): boolean

        /**
        * Inserts a sublist line.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45393
        */
        insertLine(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The line number to insert. */
            line: number
            /** (optional) If set to true, scripting recalculation is ignored.The default value is false. */
            ignoreRecalc: boolean
        }): N_record.Record

        /**
        * Removes the subrecord for the associated sublist field on the current line.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45422
        */
        removeCurrentSublistSubrecord(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
        }): N_record.Record

        /**
        * Removes a sublist line.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45394
        */
        removeLine(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The line number of the sublist to remove. Note that line indexing begins at 0 with SuiteScript 2.0. */
            line: number
            /** (optional) If set to true, scripting recalculation is ignored.The default value is false. */
            ignoreRecalc: boolean
        }): N_record.Record

        /**
        * Removes the subrecord for the associated sublist field. (standard mode only)When working in dynamic mode, remove a sublist subrecord using the following methods:Record.selectLine(options)Record.hasCurrentSublistSubrecord(options)Record.removeCurrentSublistSubrecord(options)Record.commitLine(options)
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45423
        */
        removeSublistSubrecord(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The line number in the sublist that contains the subrecord to remove. Note that line indexing begins at 0 with SuiteScript 2.0. */
            line: number
        }): N_record.Record

        /**
        * Removes the subrecord for the associated field.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45419
        */
        removeSubrecord(options: {
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
        }): N_record.Record

        /** () | Promise Submits a new record or saves edits to an existing record. */
        save: {
            /**
            * Submits a new record or saves edits to an existing record.When working with records in standard mode, you must submit and then load the record to obtain sourced, validated, and calculated field values.This method has an asynchronous counterpart you can use with client scripts. See Record.save.promise(options).
            * @Supported Client and server-side scripts
            * @Governance Transaction records: 20 usage unitsCustom records: 4 usage unitsAll other records: 10 usage units
            * @Since Version 2015 Release 2
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45382
            */
            (options: {
                /** (optional) Enables sourcing during the record update.If set to true, sources dependent field information for empty fields.Defaults to false – dependent field values are not sourced.This parameter applies to records in standard mode only. When working with records in dynamic mode, field values are always sourced and the value you provide for enableSourcing is ignored. */
                enableSourcing: boolean
                /** (optional) Disables mandatory field validation for this save operation.If set to true, all standard and custom fields that were made mandatory through customization are ignored. All fields that were made mandatory through company preferences are also ignored.By default, this parameter is false.Use the ignoreMandatoryFields argument with caution. This argument should be used mostly with Scheduled scripts, rather than User Event scripts. This ensures that UI users do not bypass the business logic enforced through form customization. */
                ignoreMandatoryFields: boolean
            }): number

            /**
            * Submits a new record asynchronously or saves edits to an existing record asynchronously.For information about the parameters and errors thrown for this method, see Record.save(options). For more information on promises, see Promise object.
            * @Supported Client-side scripts
            * @Governance Transaction records: 20 usage unitsCustom records: 4 usage unitsAll other records: 10 usage units
            * @Since Version 2015 Release 2
            * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45246
            */
            promise(options: {
                /** (optional) Enables sourcing during the record update.If set to true, sources dependent field information for empty fields.Defaults to false – dependent field values are not sourced.This parameter applies to records in standard mode only. When working with records in dynamic mode, field values are always sourced and the value you provide for enableSourcing is ignored. */
                enableSourcing: boolean
                /** (optional) Disables mandatory field validation for this save operation.If set to true, all standard and custom fields that were made mandatory through customization are ignored. All fields that were made mandatory through company preferences are also ignored.By default, this parameter is false.Use the ignoreMandatoryFields argument with caution. This argument should be used mostly with Scheduled scripts, rather than User Event scripts. This ensures that UI users do not bypass the business logic enforced through form customization. */
                ignoreMandatoryFields: boolean
            }): Promise<number>
        }
        /**
        * Selects an existing line in a sublist.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45401
        */
        selectLine(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The line number to select in the sublist. Note that line indexing begins at 0 with SuiteScript 2.0. */
            line: number
        }): N_record.Record

        /**
        * Selects a new line at the end of a sublist.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45402
        */
        selectNewLine(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
        }): N_record.Record

        /**
        * Sets the value for the line currently selected in the matrix.This method is not available for standard records.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws INVALID_FLD_VALUE > The options.value type does not match the field type.
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50222
        */
        setCurrentMatrixSublistValue(options: {
            /** (required) The internal ID of the sublist that contains the matrix.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. Note that column indexing begins at 0 with SuiteScript 2.0. */
            column: number
            /** (required) The value to set the field to.The value type must correspond to the field type being set. For example:Text, Radio and Select fields accept string values.Checkbox fields accept Boolean values.Date and DateTime fields accept Date values.Integer, Float, Currency and Percent fields accept number values. */
            value: number | date | string | array | boolean
            /** (optional) If set to true, the field change and slaving event is ignored.By default, this value is false. */
            ignoreFieldChange: boolean
            /** (optional) Indicates whether to perform slaving synchronously.By default, this value is false. */
            fireSlavingSync: boolean
        }): N_record.Record

        /**
        * Sets the value for the field in the currently selected line by a text representation.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_REQD_ARGUMENT > A required argument is missing or undefined.
        * @Throws A_SCRIPT_IS_​ATTEMPTING_​TO_​EDIT_​THE_​1_​SUBLIST_​THIS_​SUBLIST_​IS_​CURRENTLY_​IN_​READONLY_​MODE_​AND_​CANNOT_​BE_​EDITED_​CALL_​YOUR_​NETSUITE_​ADMINISTRATOR_​TO_​DISABLE_​THIS_​SCRIPT_​IF_​YOU_​NEED_​TO_​SUBMIT_​THIS_​RECORD > A user tries to edit a read-only sublist field.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45417
        */
        setCurrentSublistText(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The text to set the value to. */
            text: string
            /** (optional) If set to true, the field change and slaving event is ignored.By default, this value is false. */
            ignoreFieldChange: boolean
        }): N_record.Record

        /**
        * Sets the value for the field in the currently selected line.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws INVALID_FLD_VALUE > The options.value type does not match the field type.
        * @Throws SSS_MISSING_REQD_ARGUMENT > A required argument is missing or undefined.
        * @Throws A_SCRIPT_IS_​ATTEMPTING_​TO_​EDIT_​THE_​1_​SUBLIST_​THIS_​SUBLIST_​IS_​CURRENTLY_​IN_​READONLY_​MODE_​AND_​CANNOT_​BE_​EDITED_​CALL_​YOUR_​NETSUITE_​ADMINISTRATOR_​TO_​DISABLE_​THIS_​SCRIPT_​IF_​YOU_​NEED_​TO_​SUBMIT_​THIS_​RECORD > A user tries to edit a read-only sublist field.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45404
        */
        setCurrentSublistValue(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The value to set the field to.The value type must correspond to the field type being set. For example:Text, Radio and Select fields accept string values.Checkbox fields accept Boolean values.Date and DateTime fields accept Date values.Integer, Float, Currency and Percent fields accept number values. */
            value: number | date | string | array | boolean
            /** (optional) If set to true, the field change and slaving event is ignored.By default, this value is false. */
            ignoreFieldChange: boolean
        }): N_record.Record

        /**
        * Sets the value for the associated header in the matrix.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws INVALID_FLD_VALUE > The options.value type does not match the field type.
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50224
        */
        setMatrixHeaderValue(options: {
            /** (required) The internal ID of the sublist that contains the matrix.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. Note that column indexing begins at 0 with SuiteScript 2.0. */
            column: number
            /** (required) The value to set the field to.The value type must correspond to the field type being set. For example:Text, Radio and Select fields accept string values.Checkbox fields accept Boolean values.Date and DateTime fields accept Date values.Integer, Float, Currency and Percent fields accept number values. */
            value: number | date | string | array | boolean
            /** (optional) If set to true, the field change and slaving event is ignored.By default, this value is false. */
            ignoreFieldChange: boolean
            /** (optional) Indicates whether to perform slaving synchronously.By default, this value is false. */
            fireSlavingSync: boolean
        }): N_record.Record

        /**
        * Sets the value for the associated field in the matrix.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws INVALID_FLD_VALUE > The options.value type does not match the field type.
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50225
        */
        setMatrixSublistValue(options: {
            /** (required) The internal ID of the sublist that contains the matrix.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. Note that column indexing begins at 0 with SuiteScript 2.0. */
            column: number
            /** (required) The line number for the field. Note that line indexing begins at 0 with SuiteScript 2.0. */
            line: number
            /** (required) The value to set the field to.The value type must correspond to the field type being set. For example:Text, Radio and Select fields accept string values.Checkbox fields accept Boolean values.Date and DateTime fields accept Date values.Integer, Float, Currency and Percent fields accept number values. */
            value: number | date | string | array | boolean
        }): N_record.Record

        /**
        * Sets the value of a sublist field by a text representation. (standard mode only)When working in dynamic mode, set a sublist field text using the following methods:Record.selectLine(options)Record.setCurrentSublistText(options)Record.commitLine(options)
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45398
        */
        setSublistText(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The line number for the field. Note that line indexing begins at 0 with SuiteScript 2.0. */
            line: number
            /** (required) The text to set the value to. */
            text: string
        }): N_record.Record

        /**
        * Sets the value of a sublist field. (standard mode only)When working in dynamic mode, set a sublist field value using the following methods:Record.selectLine(options)Record.setCurrentSublistValue(options)Record.commitLine(options)
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws INVALID_FLD_VALUE > The options.value type does not match the field type.
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45396
        */
        setSublistValue(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The line number of the sublist. Note that line indexing begins at 0 with SuiteScript 2.0. */
            line: number
            /** (required) The value to set the sublist field to.The value type must correspond to the field type being set. For example:Text, Radio and Select fields accept string values.Checkbox fields accept Boolean values.Date and DateTime fields accept Date values.Integer, Float, Currency and Percent fields accept number values. */
            value: number | date | string | array | boolean
        }): N_record.Record

        /**
        * Sets the value of the field by a text representation.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45390
        */
        setText(options: {
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
            /** (required) The text or texts to change the field value to.If the field type is multiselect:This parameter accepts an array of string values.This parameter accepts a null value. Passing in null deselects all currently selected values.If the field type is not multiselect, this parameter accepts only a single string value. */
            text: string | array
            /** (optional) If set to true, the field change and slaving event is ignored.By default, this value is false. */
            ignoreFieldChange: boolean
        }): N_record.Record

        /**
        * Sets the value of a field.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws INVALID_FLD_VALUE > The options.value type does not match the field type.
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45388
        */
        setValue(options: {
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
            /** (required) The value to set the field to.The value type must correspond to the field type being set. For example:Text, Radio, Select and Multi-Select fields accept string values.Checkbox fields accept Boolean values.Date and DateTime fields accept Date values.Integer, Float, Currency and Percent fields accept number values. */
            value: number | date | string | array | boolean
            /** (optional) If set to true, the field change and slaving event is ignored.By default, this value is false. */
            ignoreFieldChange: boolean
        }): N_record.Record
    }

    interface Sublist {
        /**Returns the internal ID of the sublist. */
        id: string
        /**Indicates whether the sublist has changed on the record form. */
        isChanged: boolean
        /**Indicates whether the sublist is displayed on the record form. */
        isDisplay: boolean
        /**Returns the sublist type. */
        type: string

        /**
        * Returns a column in the sublist.
        * @Supported Client and server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50229
        */
        getColumn(options: {
            /** (required) The internal ID of the column field in the sublist. */
            fieldId: string
        }) : N_record.Column
    }
}
