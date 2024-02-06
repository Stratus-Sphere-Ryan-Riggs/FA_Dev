/**
 * Load the N/config module when you want to access NetSuite configuration settings. 
 * The config.load(options) method returns a record.Record object. 
 * Use the record.Record object members to access configuration settings. 
 * You do not need to load the record module to do this.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43574
 */
declare interface N_config {
    /**
    * Method used to load a record.Record object that encapsulates the specified NetSuite configuration page.
    * After the configuration page loads, all preference names and IDs are available to get or set. 
    * For more information, see Preference Names and IDs.
    * @Supported Server-side scripts
    * @Governance 10 useage units
    * @Since Version 2015 Release 2
    * @Throws INVALID_RC​R​D​_​​TYPE > The type argument is invalid or missing.
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43564
    */
    load(options: {
        /**
         * (required) The NetSuite configuration page you want to access. See N/config Module for supported configuration pages.
         * Sets the value for the Record.type property. This property is read-only and cannot be changed after record.Record is loaded.
         * Use the config.Type enum to set the value.
         */
        type: N_config.Type
    }): N_record.Record;

    /**
     * Enumeration that holds the string values for supported configuration pages. 
     * This enum is used to set the value of the Record.type property.
     * @Since Version 2015 Release 2
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43565
     */
    Type : {
        /**
         * Set Preferences page (Home > Set Preferences)
         * For more information about the fields on the page, see User Preferences.
         */
        USER_PREFERENCES,
        /**
         * Company Information page (Setup > Company > Setup Tasks > Company Information)
         * For more information about the fields on the page, see Company Information.
         */
        COMPANY_INFORMATION,
        /**	
         * General Preferences page (Setup > Company > Preferences > General Preferences)
         * For more information about the fields on the page, see General Preferences.
         */
        COMPANY_PREFERENCES,
        /**
         * Accounting Preferences page (Setup > Accounting > Preferences > Accounting Preferences)
         * For more information about the fields on the page, see Accounting Preferences.
         */
        ACCOUNTING_PREFERENCES,
        /**
         * Accounting Periods page (Setup > Accounting > Manage G/L > Manage Accounting Periods)
         * For more information about the fields on the page, see Accounting Periods.
         */
        ACCOUNTING_PERIODS,
        /**
         * Tax Periods page (Setup > Accounting > Taxes > Manage Tax Periods (Administrator))
         * For more information about the fields on the page, see Tax Periods.
         */
        TAX_PERIODS,
        /**
         * Enable Features page (Setup > Company > Setup Tasks > Enable Features)
         * For more information about feature names and IDs, see Feature Names and IDs.
         */
        FEATURES
    }
}