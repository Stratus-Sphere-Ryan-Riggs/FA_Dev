
/**Use the url module to determine URL navigation paths within NetSuite and format URL strings.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44703#bridgehead_4419860905
 */
declare interface N_url {
    HostType: {
        APPLICATION;
        CUSTOMER_CENTER;
        FORM;
        RESTLET;
        SUITETALK;
    }

    /**
    * Creates a serialized representation of an object containing query parameters.Use the returned value to build a URL query string.
    * @Supported All server-side scripts
    * @Governance None
    * @Since Version 2015 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44706
    */
    format(options: {
        /** (required) The domain name. */
        domain: string
        /** (required) Additional URL parameters as name/value pairs. */
        parameters: object
    }): string

    /**
    * Returns a domain name for a NetSuite account.
    * @Supported Client and server-side scripts
    * @Governance None
    * @Since 2017.1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/63125
    */
    resolveDomain(options: {
        /** (required) The type of domain name you want to retrieve. Set this value using the url.HostType enum. */
        hostType: string
        /** (optional) The NetSuite account ID for which you want to retrieve data. If no account is specified, the system returns data on the account that is running the script. */
        accountId: string
    }): string

    /**
    * Returns the URL string to a NetSuite record.
    * @Supported All server-side scripts
    * @Governance None
    * @Since 2015.1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43752
    */
    resolveRecord(options: {
        /** (required) The type of record. For example, ‘transaction’. */
        recordType: string
        /** (required) The internal ID of the target record instance. */
        recordId: string
        /** (required) If set to true, returns a URL for the record in Edit mode.If set to false, returns a URL for the record in View modeThe default value is View. */
        isEditMode: boolean
        /** (required) Object used to add parameters for a custom URL. For example, a query to a database or to a search engine */
        params: object
    }): string

    /**
    * Returns an external or internal URL string to a script.
    * @Supported All server-side scripts
    * @Governance None
    * @Since 2015.1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44705
    */
    resolveScript(options: {
        /** (required) The internal ID of the script. The ID must identify a RESTlet or a Suitelet. */
        scriptId: string
        /** (required) The internal ID of the deployment script */
        deploymentId: string
        /** (required) Indicates whether to return the External URL.By default, the internal URL is returned. */
        returnExternalUrl: boolean
        /** (optional) The object containing name/value pairs to describe the query. */
        params: object
    }): string

    /**
    * Returns the internal URL to a NetSuite tasklink.
    * @Supported All server-side scripts
    * @Governance None
    * @Since 2015.2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44704
    */
    resolveTaskLink(options: {
        /** (required) Internal ID for the tasklink.Each page in NetSuite has a unique Tasklink Id associated with it for a specific record type. You can determine the Tasklink for a page within NetSuite by viewing the HTML page source. Search for a string similar to the following, where LIST_SCRIPT refers to the TASKLINK: onclick="nlPopupHelp('LIST_SCRIPT','help'). */
        id: string
        /** (optional) The Map object containing name/value pairs to describe the query. */
        params: map
    }): string

}
