/**
 * The render module encapsulates functionality for printing, PDF creation, form creation from templates, and email creation from templates.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44622
 */
declare interface N_render {
    /**
    * Use this method to create a PDF or HTML object of a bill of material.
    * @Supported Server-side scripts
    * @Governance 10 units
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44652
    */
    bom(options: {
        /** (required) The internal ID of the bill of material to print */
        entityId: number
        /** (optional) The print output type. Set using the render.PrintMode enum. By default, uses the company/user preference for print output. */
        printMode: N_render.PrintMode
    }) : N_file.File
    /**
    * Use this method to produce HTML and PDF printed forms with advanced PDF/HTML templates. Creates render.TemplateRenderer.
    * This object includes methods that pass in a template as string to be interpreted by FreeMarker,
    * and render interpreted content in your choice of two different formats:
    * as HTML output to http.ServerResponse, or as XML string that can be passed to render.xmlToPdf(options) to produce a PDF.
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44645
    */
    create() : N_render.TemplateRenderer
    /**
    * Creates a render.EmailMergeResult object for a mail merge with an existing scriptable email template
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44644
    */
    mergeEmail(options: {
        /** (required) Internal ID of the template */
        templateId: number
        /** (required) Entity */
        entity: recordref
        /** (required) Recipient */
        recipient: recordref
        /** (required) Custom record */
        customRecord: recordref
        /** (required) Support case ID */
        supportCaseId: number
        /** (required) Transaction ID */
        transactionId: number
    }) : N_render.EmailMergeResult
    /**
    * Use this method to create a PDF or HTML object of a packing slip.
    * @Supported Server-side scripts
    * @Governance 10 units
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44653
    */
    packingSlip(options: {
        /** (required) The internal ID of the packing slip to print */
        entityId: number
        /** (optional) The print output type. Set using the render.PrintMode enum. By default, uses the company/user preference for print output. */
        printMode: N_render.PrintMode
        /** (optional) The packing slip form number */
        formId: number
        /** (optional) Fulfillment ID number */
        fulfillmentId: number
    }) : N_file.File
    /**
    * Use this method to create a PDF or HTML object of a picking ticket.
    * @Supported Server-side scripts
    * @Governance 10 units
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44651
    */
    pickingTicket(options: {
        /** (required) The internal ID of the picking ticket to print */
        entityId: number
        /** (optional) The print output type. Set using the render.PrintMode enum. By default, uses the company/user preference for print output. */
        printMode: N_render.PrintMode
        /** (optional) The packing slip form number */
        formId: number
        /** (optional) Shipping group for the ticket */
        shipgroup: number
        /** (optional) Location for the ticket */
        location: number
    }) : N_file.File
    /**
    * Use this method to create a PDF or HTML object of a statement.
    * @Supported Server-side scripts
    * @Governance 10 units
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44646
    */
    statement(options: {
        /** (required) The internal ID of the statement to print */
        entityId: number
        /** (optional) The print output type. Set using the render.PrintMode enum. By default, uses the company/user preference for print output. */
        printMode: N_render.PrintMode
        /** (optional) Internal ID of the form to use to print the statement */
        formId: number
        /** (optional) Date of the oldest transaction to appear on the statement */
        startDate: date
        /** (optional) Statement date */
        statementDate: date
        /** (optional) Include only open transactions */
        openTransactionsOnly: boolean
    }) : N_file.File
    /**
    * Use this method to create a PDF or HTML object of a transaction.File size is limited to 10MB.If the Advanced PDF/HTML Templates feature is enabled, you can associate an advanced template with the custom form saved for a transaction. The advanced template is used to format the printed transaction. For details about this feature, see Advanced PDF/HTML Templates
    * @Supported Server-side scripts
    * @Governance 10 units
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44642
    */
    transaction(options: {
        /** (required) The internal ID of the transaction to print */
        entityId: number
        /** (optional) The print output type. Set using the render.PrintMode enum.By default, uses the company/user preference for print output. */
        printMode: N_render.PrintMode
        /** (optional) The transaction form number */
        formId: number
    }) : N_file.File
    /**
    * Method used to pass XML to the Big Faceless Organization tag library (which is stored by NetSuite), and return a PDF file. File size cannot exceed 10MB.
    * @Supported Server-side scripts
    * @Governance 10 units
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44654
    */
    xmlToPdf(options: {
        /** (required) XML document or string to convert to PDF */
        xmlString: N_xml.Document
    }) : N_file.File

    /**
     * Holds the string values for supported print output types. Use this enum to set the options.printMode parameter.
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44626
     */
    PrintMode: {
        DEFAULT
        HTML
        PDF
    }
    /**
     * Holds the string values for supported data source types. Use this enum to set the options.format parameter.
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50560
     */
    DataSource: {
        JSON
        OBJECT
        XML_DOC
        XML_STRING
    }
}

declare namespace N_render {
    /**
     * Encapsulates an email merge result. Use render.mergeEmail(options) to create and return this object.
     * @Supported Server-side scripts
     * @Since Version 2015 Release 2
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44633
     */
    export interface EmailMergeResult {
        /** (read-only) The body of the email distribution in string format */
        body: string
        /** (read-only) The subject of the email distribution in string format */
        subject: string
    }

    /**
     * Encapsulates a template engine object that produces HTML and PDF printed forms utilizing advanced PDF/HTML template capabilities.
     * The template engine object includes methods that pass in a template as string to be interpreted by FreeMarker,
     * and render interpreted content in your choice of two different formats: as HTML output to an nlobjResponse object,
     * or as XML string that can be passed to render.xmlToPdf(options) to produce a PDF.
     * @Supported Server-side scripts
     * @Since Version 2015 Release 2
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44623
     */
     export interface TemplateRenderer {
         /** Content of template */
         templateContent: string

        /**
        * Adds XML or JSON as custom data source to an advanced PDF/HTML template
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49361
        */
        addCustomDataSource(options: {
            /** (required) Data source alias */
            alias: string
            /** (required) Data format */
            format: N_render.dataSource
            /** (required) Object, document, or string */
            data: object | document | string
        }) : Void
        /**
        * Binds a record to a template variable.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44650
        */
        addRecord(options: {
            /** (required) Name of the record object variable referred to in the template */
            templateName: string
            /** (required) The record to add */
            record: N_record.Record
        }) : Void
        /**
        * Binds a search result to a template variable.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44649
        */
        addSearchResults(options: {
            /** (required) Name of the template */
            templateName: string
            /** (required) The search result to add */
            searchResult: N_search.Result
        }) : Void
        /**
        * Uses the advanced template to produce a PDF printed form
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44641
        */
        renderAsPdf() : N_file.File
        /**
        * Renders a server response into a PDF file. For example, you can pass in a response to be rendered as a PDF in a browser, or downloaded by a user.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44647
        */
        renderPdfToResponse(options: {
            /** (required) Response that will be written to PDF. For example, the response passed from a Suitelet. */
            response: N_http.ServerResponse
        }) : Void
        /**
        * Return template content in string form
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44648
        */
        renderAsString() : string
        /**
        * Sets the template using the internal ID
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49362
        */
        setTemplateById(options: {
            /** (required) Internal ID of the template */
            id: number
        }) : Void
        /**
        * Writes template content to a server response.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44655
        */
        renderToResponse(options: {
            /** (required) Response to write to */
            response: N_http.ServerResponse
        }) : Void
     }
}
