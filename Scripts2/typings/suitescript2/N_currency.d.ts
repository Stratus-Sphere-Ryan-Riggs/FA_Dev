/**Load the N/currency module when you want to work with exchange rates within your NetSuite account. You can use this module to find the exchange rate between two currencies based on a certain date.
 * @link https://netsuite.custhelp.com/app/answers/detail/a_id/43735
 */
declare interface N_currency {
    /**
    * Method used to return the exchange rate between two currencies based on a certain date.The source currency  is looked up relative to the target currency on the effective date. For example, if use British pounds for the source and US dollars for the target and the method returns '1.52’, this means that if you were to enter an invoice today for a GBP customer in your USD subsidiary, the rate would be 1.52.The exchange rate values are sourced from the Currency Exchange Rate record.The Currency Exchange Rate record itself is not a scriptable record.
    * @Supported Client and server-side scripts
    * @Governance 10 units
    * @Since Version 2015 Release 2
    * @Throws MISSING_REQD_ARGUMENT > exchangeRate: Missing a required argument: <source/target>
    * @Throws SSS_INVALID_CURRENCY_ID > You have entered an invalid currency symbol or internal ID: <target/source>
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43753
    */
    exchangeRate(options: {
        /** (optional) Pass in a new Date object. For example, date: new Date('7/28/2015')If date is not specified, then it defaults to today (the current date).The date determines the exchange rate in effect. If there are multiple rates, it is the latest entry on that date.Use the same date format as your NetSuite account. */
        date: date
        /** (required) The internal ID or three-letter ISO code for the currency you are converting from.For example, you can use either 1 (internal ID) or USD (currency code). If the Multiple Currencies feature is enabled, from your account, you can view a list of all the currency internal IDs and ISO codes at Lists > Accounting > Currencies. */
        source: number | string
        /** (required) The internal ID or three-letter ISO code for the currency you are converting to. */
        target: number | string
    }): number

}