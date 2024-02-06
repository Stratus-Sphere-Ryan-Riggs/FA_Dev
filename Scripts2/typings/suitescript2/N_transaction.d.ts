/**
 * Load the transaction module to void transactions.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44628
 */
declare interface N_transaction {
    /**Enumeration that holds the string values for supported transaction record types. */
    Type: {
        CASH_REFUND;
        CASH_SALE;
        CHECK;
        CREDIT_MEMO;
        CUSTOMER_DEPOSIT;
        CUSTOMER_PAYMENT;
        CUSTOMER_REFUND;
        ESTIMATE_QUOTE;
        EXPENSE_REPORT;
        INTERCOMPANY_JOURNAL_ENTRY;
        INVOICE;
        JOURNAL_ENTRY;
        PAYCHECK_JOURNAL;
        RETURN_AUTHORIZATION;
        SALES_ORDER;
        TRANSFER_ORDER;
        VENDOR_BILL;
        VENDOR_CREDIT;
        VENDOR_PAYMENT;
        VENDOR_RETURN_AUTHORIZATION;
        WORK_ORDER;
    }

    /** () | Promise  Method used to void a transaction record object and return an id that indicates the type of void performed */
    void:{
        /**
        * Method used to void a transaction record object and return an id that indicates the type of void performed.The type of void performed depends on the targeted account’s preference settings.After you void a transaction, you cannot make changes to the transaction that impact the general ledger.
        * @Supported All client and server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws INVALID_RECORD_TYPE  > 
        * @Throws THAT_RECORD_​DOES_​NOT_​EXIST > 
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > 
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44629
        */
        (options: {
            /** (required) Internal ID of the specific transaction record instance to void. */
            id: number | string
            /** (required) Internal ID of the type of transaction record to void */
            type: string
        }) : number

        /**
        * Method used to void a transaction record object asynchronously and return an id that indicates the type of void performed.The type of void performed depends on the targeted account’s preference settings.After you void a transaction, you cannot make changes to the transaction that impact the general ledger.For information about the parameters and errors thrown for this method, see transaction.void(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45248
        */
        promise(options: {
            /** (required) Internal ID of the specific transaction record instance to void. */
            id: number | string
            /** (required) Internal ID of the type of transaction record to void */
            type: string
        }) : Promise<number>
    }
}