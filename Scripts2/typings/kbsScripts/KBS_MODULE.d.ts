/**
 * Load the KBS_MODULE module to make use of helper functions such as: fixup, lookupThings, setHeaderVals, setSublistVals, and searchForEachResult.
 */
declare interface KBS_MODULE {

    /**
     * Creates a new fixed-up string using DEV, TEST, or PROD parameter.
     */
    fixup(
        /** (required) The value if we are executing in the DEV environment. */
        dev: String | Number,
        /** (optional) The value if we are executing in the TEST environment. */
        test: String | Number,
        /** (optional) The value if we are executing in the PROD environment. */
        prod: String | Number
    ): String | Number

    /**
    * Performs a search for one or more body fields on a record. For example, this method returns results in the following form lookupThings.field_internalId, or lookupThings.field_internalId.text && lookupThings.field_internalId.value
    * ****NOTE: DOES NOT WORK WITH MULTI-SELECT FIELDS!!****
    * @Supported All script types
    * @Governance 1 unit
    */
    lookupThings(
        /** (required) Record internal ID name for which you want to look up fields. Use the KBS_MODULE.Rectype enum for this argument. */
        type: string,
        /** (Required) Internal ID for the record, for example 777 or 87. */
        id: number,
        /** (Required) Array of column/field names to look up, or a single column/field name. */
        columns: string[] | string,
        /** (optional) Set to true if you want select fields to return an object with text and value properties. */
        text: boolean
    ): {}

    /**
    * Use a developer-defined function to invoke on each row in the search results. Uses the search.runPaged().fetch().forEach(function(result){}) to perform an action on each result returned. No limit on number of results.
    * @Supported All script types
    * @Governance 10 units
    */
    searchForEachResult(
        /** (Required) The N_search.Search object from the nsSearch.create() or nsSearch.load() functions. */
        search: N_search.Search,
        /** (Required) Named JavaScript function or anonymous inline function that contains the logic to process a search.Result object. */
        callback: (result: N_search.Result) => void
    ): void

    /** Sets the value(s) for a single sublist line by accepting an object of Key value pairs and setting the value for each property in the object. */
    setSublistVals(
        /** (Required) The The NetSuite N_record.Record object. */
        rec: N_record.Record,
        /** (Required) String representing the sublist id. */
        list: string,
        /** (Required) Number of the Sublist Index. */
        index: number,
        /** (Required) Key value pairs object for all fields to set on a single sublist line. */
        data: {}
    ): void

    /** Sets the header value(s) of a N_record.Record object by accepting an object of Key Value pairs and setting the value for each. */
    setHeaderVals(
        /** (Required) The The NetSuite N_record.Record object. */
        rec: N_record.Record,
        /** (Required) Sets the ignoreFieldChange property of the N_record.Record.setValue({}) property. */
        fieldChange: boolean,
        /** (Required) Key value pairs as fieldId: value. */
        data: {}
    ): void

    /** Accepts Name and Message parameters, logs an error message that displays both. Returns an object containing the Name and Message parameters*/
    CodeException(
        /** (Required) The Error Name. */
        Name: String,
        /** (Required) The Error Message. */
        Message: String
    ): {Name: String, Message: String}
}
