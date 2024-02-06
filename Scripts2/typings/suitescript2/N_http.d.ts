/**
 * Use the http module to make HTTP calls from server-side or client-side scripts. On the client-side,
 * this module also provides the ability to make cross-domain HTTP requests using NetSuite servers as a proxies.
 * All HTTP content types are supported.
 * @link https://netsuite.custhelp.com/app/answers/detail/a_id/44806
 */
declare interface N_http {

    /**Holds the string values for supported cache durations.
     * This enum is used to set the value of the ServerResponse.setCdnCacheable(options) property. */
    CacheDuration: {
        LONG;
        MEDIUM;
        SHORT;
        UNIQUE;
    }
    /**Holds the string values for supported HTTP requests.
     * This enum is used to set the value of http.request(options) and ServerRequest.method. */
    Method: {
        DELETE;
        GET;
        PUT;
        POST;
    }

    /**() | Promise  Method used to send an HTTP DELETE request and return the response.*/
    delete: {
        /**
        * Method used to send an HTTP DELETE request and return the response.If negotiating a connection to the destination server exceeds 5 seconds, a connection timeout occurs. If transferring a payload to the server exceeds 45 seconds, a request timeout occurs.This method does not include an options.body parameter. Postdata is not required when the HTTP method is a DELETE request.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44855
        */
        (options: {
            /** (required) The HTTP URL being requested */
            url: string
            /** (optional) The HTTP headers. */
            headers: object
        }): N_http.ClientResponse

        /**
        * Method used to send an HTTP DELETE request asynchronously and return the response.For information about the parameters and errors thrown for this method, see http.delete(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45235
        */
        promise(options: {
            /** (required) The HTTP URL being requested */
            url: string
            /** (optional) The HTTP headers. */
            headers: object
        }): Promise<N_http.ClientResponse>
    }

    /**() | Promise  Method used to send an HTTP GET request and return the response*/
    get: {
        /**
        * Method used to send an HTTP GET request and return the response
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44854
        */
        (options: {
            /** (required) The HTTP URL being requested */
            url: string
            /** (optional) The HTTP headers. */
            headers: object
        }): N_http.ClientResponse

        /**
        * Method used to send an HTTP GET request asynchronously and return the responseFor information about the parameters and errors thrown for this method, see http.get(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45234
        */
        promise(options: {
            /** (required) The HTTP URL being requested */
            url: string
            /** (optional) The HTTP headers. */
            headers: object
        }): Promise<N_http.ClientResponse>

    }

    /**() | Promise Method used to send an HTTP POST request and return the response.*/
    post: {
        /**
        * Method used to send an HTTP POST request and return the response.If negotiating a connection to the destination server exceeds 5 seconds, a connection timeout occurs. If transferring a payload to the server exceeds 45 seconds, a request timeout occurs.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44853
        */
        (options: {
            /** (required) The HTTP URL being requested */
            url: string
            /** (required) The POST data. */
            body: string | object
            /** (optional) The HTTP headers. */
            headers: object
        }): N_http.ClientResponse

        /**
        * Method used to send an HTTP POST request asynchronously and return the response.For information about the parameters and errors thrown for this method, see http.post(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45237
        */
        promise(options: {
            /** (required) The HTTP URL being requested */
            url: string
            /** (required) The POST data. */
            body: string | object
            /** (optional) The HTTP headers. */
            headers: object
        }): Promise<N_http.ClientResponse>





    }

    /**() | Promise  Method used to send an HTTP PUT request and return the response.*/
    put: {
        /**
        * Method used to send an HTTP PUT request and return the response.If negotiating a connection to the destination server exceeds 5 seconds, a connection timeout occurs. If transferring a payload to the server exceeds 45 seconds, a request timeout occurs.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44852
        */
        (options: {
            /** (required) The HTTP URL being requested */
            url: string
            /** (required) The PUT data. */
            body: string | object
            /** (optional) The HTTP headers. */
            headers: object
        }): N_http.ClientResponse
        /**
        * Method used to send an HTTP PUT request asynchronously and return the response.For information about the parameters and errors thrown for this method, see http.put(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45238
        */
        promise(options: {
            /** (required) The HTTP URL being requested */
            url: string
            /** (required) The PUT data. */
            body: string | object
            /** (optional) The HTTP headers. */
            headers: object
        }): Promise<N_http.ClientResponse>





    }

    /**() | Promise Method used to send an HTTP request and return the response. */
    request: {
        /**
        * Method used to send an HTTP request and return the response.If negotiating a connection to the destination server exceeds 5 seconds, a connection timeout occurs. If transferring a payload to the server exceeds 45 seconds, a request timeout occurs.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44851
        */
        (options: {
            /** (required) The HTTP request method. Set using the http.Method enum. */
            method: N_http.Method
            /** (required) The HTTP URL being requested */
            url: string
            /** (optional) The POST data if the method is POST.If the method is DELETE, this body data is ignored. */
            body: string | object
            /** (optional) An object containing request headers. */
            headers: object
        }): N_http.ClientResponse

        /**
        * Method used to send an HTTP request asynchronously and return the response.For information about the parameters and errors thrown for this method, see http.request(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45236
        */
        promise(options: {
            /** (required) The HTTP request method. Set using the http.Method enum. */
            method: N_http.Method
            /** (required) The HTTP URL being requested */
            url: string
            /** (optional) The POST data if the method is POST.If the method is DELETE, this body data is ignored. */
            body: string | object
            /** (optional) An object containing request headers. */
            headers: object
        }): Promise<N_http.ClientResponse>




    }

}

declare namespace N_http {

    /**Encapsulates the response to an HTTP client request. This object is read-only.
     * @link https://netsuite.custhelp.com/app/answers/detail/a_id/44807
     */
    interface ClientResponse {
        /**The client response body. */
        body: String;
        /**The client response code. */
        code: number;
        /**The client response headers. */
        headers: Object;
    }

    /**
     * Encapsulates the HTTP request information to an HTTP server. For example, a request received by a Suitelet or RESTlet.
     * This object is read-only.
     * @link https://netsuite.custhelp.com/app/answers/detail/a_id/44808
     */
    interface ServerRequest {
        /**The server request body. */
        body: String;
        /**The server request files. */
        files: Object;
        /**The server request headers. */
        headers: Object;
        /**The HTTP method for the server request. */
        method: N_http.Method;
        /**The server request parameters. */
        parameters: Object;
        /**The server request URL. */
        url: String;

        /**
        * Method used to return the number of lines in a sublist.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44820
        */
        getLineCount(options: {
            /** (required) The sublist internal ID. */
            group: string
        }): number

        /**
        * Method used to return the value of a sublist line item.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44821
        */
        getSublistValue(options: {
            /** (required) The sublist internal ID. */
            group: string
            /** (required) The sublist line item ID (name of the field). */
            name: string
            /** (required) The sublist line number.Sublist index starts at 0. */
            line: string
        }): string

    }

    /**
     * Encapsulates the response to an incoming http request from an HTTP server. For example, a response from a Suitelet or RESTlet.
     * @link https://netsuite.custhelp.com/app/answers/detail/a_id/44809
     */
    interface ServerResponse {
        /**The server response headers. */
        headers: Object;

        /**
        * Method used to add a header to the response.If the same header has already been set, this method adds another line for that header. For example:
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Throws SSS_INVALID_HEADER > One or more headers are not valid.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44825
        */
        addHeader(options: {
            /** (required) The name of the header. */
            name: string
            /** (required) The value used to set the header. */
            value: string
        }): Void

        /**
        * Method used to return the value or values of a response header. If multiple values are assigned to the header name, the values are returned as an Array.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44829
        */
        getHeader(options: {
            /** (required) The name of the header. */
            name: string
        }): string | string[]

        /**
        * Method used to generate and render a PDF directly to the response.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44848
        */
        renderPdf(options: {
            /** (required) Content of the pdf. */
            xmlString: string
        }): Void

        /**
        * Method used to set the redirect URL by resolving to a NetSuite resource.For example, you could use this method and your own parameters to make a redirect to a url for associated records, such as a redirect to a new sales order page for a particular entity.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Throws SSS_INVALID_URL_CATEGORY > The URL category must be one of RECORD, TASKLINK or SUITELET.
        * @Throws SSS_INVALID_TASK_ID > The task ID: {id} is not valid. Please refer to the documentation for a list of supported task IDs.
        * @Throws SSS_INVALID_RECORD_TYPE > Type argument {type} is not a valid record or is not available in your account. Please see the documentation for a list of supported record types.
        * @Throws SSS_INVALID_SCRIPT_ID_1 > You have provided an invalid script id or internal id: {id}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44826
        */
        sendRedirect(options: {
            /** (required) The base type for this resource. Use one of the following values:RECORDTASKLINKSUITELET */
            type: string
            /** (required) The primary ID for this resource.If the base type is RECORD, pass in the record type as listed on the Records Browser.If the base type is TASKLINK, pass in the task ID. For a list of supported task IDs, see Supported Tasklinks.If the base type is SUITELET, input the script ID. */
            identifier: string
            /** (optional) The secondary ID for this resource. If the base type is SUITLET, pass in the deployment ID. */
            id: string
            /** (optional) If the base type is RECORD, this value determines whether to return a URL for the record in edit mode or view mode.The default value is false. */
            editMode: boolean
            /** (optional) Additional URL parameters as name/value pairs. */
            parameters: object
        }): Void

        /**
        * Method used to set CDN caching for a period of time.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44849
        */
        setCdnCacheable(options: {
            /** (required) The value of the caching duration. Set using the http.CacheDuration enum. */
            type: N_http.CacheDurationF
        }): Void

        /**
        * Method used to set the value of a response header.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Throws SSS_INVALID_HEADER > One or more headers are not valid.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44824
        */
        setHeader(options: {
            /** (required) The name of the header. */
            name: string
            /** (required) The value used to set the header. */
            value: string
        }): Void

        /**
        * Method used to write information to the response.This method accepts only strings. To pass in a file, you can use ServerResponse.writeFile(options).
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Throws WRONG_PARAMETER_TYPE > {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44827
        */
        write(options: {
            /** (required) The output string being written. */
            output: string
        }): Void

        /**
        * Method used to write a file to the response.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Throws WRONG_PARAMETER_TYPE > {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44850
        */
        writeFile(options: {
            /** (required) A file.File Object that encapsulates the file to be written. */
            file: file.file
            /** (optional) Determines whether the file is inline. If true, the file is inline.The default value is false. */
            isInline: boolean
        }): Void

        /**
        * Method used to write line information to the response.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Throws WRONG_PARAMETER_TYPE > {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44828
        */
        writeLine(options: {
            /** (required) The output string being written. */
            output: string
        }): Void

        /**
        * Method used to generate a page.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44847
        */
        writePage(options: {
            /** (required) A standalone page object in the form of an assistant, form or list. */
            pageObject: N_serverwidget.assistant | N_serverwidget.form | N_serverwidget.list
        }): Void

    }

}