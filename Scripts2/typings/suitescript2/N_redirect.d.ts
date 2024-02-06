/**
 * Use the redirect module to customize navigation within NetSuite by setting up a redirect URL that resolves to a NetSuite resource or external URL.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44832
 */
declare interface N_redirect {
    /**
    * Method used to set the redirect to the URL of a Suitelet that is available externally (Suitelets set to Available Without Login on the Script Deployment page).
    * @Supported Suitelets, beforeLoad user events, and synchronous afterSubmit user events
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44839
    */
    redirect(options: {
        /** (required) The URL of a Suitelet that is available externally.
         * For an external URL, Available without Login must be enabled on the Script Deployment page for the Suitelet. */
        url: string
        /** (optional) Contains additional URL parameters as key/value pairs. */
        parameters: object
    }) : Void
    /**
    * Method used to set the redirect URL to a specific NetSuite record. If you redirect a user to a record, the record must first exist in NetSuite.
    * If you want to redirect a user to a new record, you must first create and submit the record before redirecting them.
    * You must also ensure that any required fields for the new record are populated before submitting the record.
    * @Supported Suitelets, beforeLoad user events, and synchronous afterSubmit user events
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44841
    */
    toRecord(options: {
        /** (required) The internal id of the target record. */
        id: string
        /** (required) The type of record. */
        type: string
        /** (optional) Determines whether to return a URL for the record in edit mode or view mode.
         * If set to true, returns the URL to an existing record in edit mode.The default value is false – returns the URL to a record in view mode. */
        isEditMode: boolean
        /** (optional) Contains additional URL parameters as key/value pairs. */
        parameters: object
    }) : Void
    /**
    * Method used to load an existing saved search and redirect to the populated search definition page.
    * @Supported Client scripts and afterSubmit user event scripts
    * @Governance 5 units
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44834
    */
    toSavedSearch(options: {
        /** (required) Internal ID of the search. */
        id: number
    }) : Void
    /**
    * Method used to redirect a user to a search results page for an existing saved search.
    * @Supported Client scripts and afterSubmit user event scripts
    * @Governance 5 units
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44835
    */
    toSavedSearchResult(options: {
        /** (required) Internal ID of the search. */
        id: number
    }) : Void
    /**
    * Method used to redirect a user to an ad-hoc search built in SuiteScript.
    * This method loads a search into the session, and then redirects to a URL that loads the search definition page.
    * @Supported Client scripts and afterSubmit user event scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44836
    */
    toSearch(options: {
        /** The search object to redirect to  */
        search: N_search.Search
    }) : Void
    /**
    * Method used to redirect a user to a search results page. For example, the results from an ad-hoc search created with the N/search Module, or a loaded search that you modified but did not save.
    * @Supported Client scripts and afterSubmit user event scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44837
    */
    toSearchResult(options: {
        /** The search object to redirect to   */
        Search: N_search.search
    }) : Void
    /**
    * Method used to redirect the user to a Suitelet.
    * @Supported Suitelets, beforeLoad user events, and synchronous afterSubmit user events
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44840
    */
    toSuitelet(options: {
        /** (required) The script ID for the Suitelet. */
        scriptId: string
        /** (required) The deployment ID for the Suitelet. */
        deploymentId: string
        /** (optional) The default value is false – indicates an external Suitelet URL. */
        isExternal: boolean
        /** (optional) Contains additional URL parameters as key/value pairs. */
        parameters: object
    }) : Void
    /**
    * Method used to redirect a user to a tasklink.
    * @Supported Suitelets, beforeLoad user events, and synchronous afterSubmit user events
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44838
    */
    toTaskLink(options: {
        /** (required) The taskId for a tasklinkFor a list of supported task IDs, see Supported Tasklinks. */
        id: string
        /** (optional) Contains additional URL parameters as key/value pairs. */
        parameters: object
    }) : Void
}
