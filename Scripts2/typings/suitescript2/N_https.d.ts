/**
 * Load the https module to make https calls. You can also use this module to encode binary content or securely access a handle to the value in a NetSuite credential field.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44733
 */
declare interface N_https {

    /**Holds the string values for supported cache durations.  */
    CacheDuration: {
        LONG;
        MEDIUM;
        SHORT;
        UNIQUE;
    }

    /**Holds the string values for supported HTTPS requests.  */
    Method: {
        DELETE;
        GET;
        PUT;
        POST;
    }

    /**Holds the string values for supported encoding values. */
    Encoding: {
        UTF_8;
        BASE_16;
        BASE_32;
        BASE_64;
        BASE_64_URL_SAFE;
        HEX;
    }

    /** () | Promise Creates and returns a crypto.SecretKey object */
    createSecureKey: {
        /**
        * Creates and returns a crypto.SecretKey object. This method can take a GUID. Use Form.addCredentialField(options) to generate a value.You can put the key in your secure string. SuiteScript decrypts the value (key) and sends it to the server
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44735
        */
        (options: {
            /** (optional) Specifies the encoding for the SecureKey. */
            encoding: https.encoding
            /** (required) A GUID used to generate a secret key.The GUID can resolve to either data or metadata. */
            guid: string
        }): N_crypto.SecretKey

        /**
        * Creates and returns a crypto.SecretKey object asynchronously.For information about the parameters and errors thrown for this method, see https.createSecureKey(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45233
        */
        promise(options: {
            /** (optional) Specifies the encoding for the SecureKey. */
            encoding: https.encoding
            /** (required) A GUID used to generate a secret key.The GUID can resolve to either data or metadata. */
            guid: string
        }): Promise<N_crypto.SecretKey>

    }

    /**() | Promise Creates and returns an https.SecureString. */
    createSecureString: {
        /**
        * Creates and returns an https.SecureString.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44734
        */
        (options: {
            /** (required) The string to convert to a securestring. */
            input: string
            /** (optional) Identifies the encoding that the input string uses.The default value is UTF_8 */
            inputEncoding: https.encoding
        }): N_https.SecureString

        /**
        * Creates and returns an https.SecureString asynchronously.For information about the parameters and errors thrown for this method, see https.createSecureString(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45232
        */
        promise(options: {
            /** (required) The string to convert to a securestring. */
            input: string
            /** (optional) Identifies the encoding that the input string uses.The default value is UTF_8 */
            inputEncoding: https.encoding
        }): Promise<N_https.SecureString>





    }

    /**() | Promise Method used to send an HTTPS DELETE request and returns the response. */
    delete: {
        /**
        * Method used to send an HTTPS DELETE request and returns the response.If negotiating a connection to the destination server exceeds 5 seconds, a connection timeout occurs. If transferring a payload to the server exceeds 45 seconds, a request timeout occurs.This method does not include an options.body parameter. Postdata is not required when the HTTPS method is a DELETE request.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49519
        */
        (options: {
            /** (required) The HTTPS URL being requested */
            url: string
            /** (optional) The HTTPS headers. */
            headers: object
        }): N_https.ClientResponse

        /**
        * Method used to send an HTTP DELETE request asynchronously and return the response.For information about the parameters and errors thrown for this method, see https.delete(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50556
        */
        promise(options: {
            /** (required) The HTTPS URL being requested */
            url: string
            /** (optional) The HTTPS headers. */
            headers: object
        }): Promise<N_https.ClientResponse>
    }

    /** () | Promise Method used to send an HTTPS GET request and return the response */
    get: {
        /**
        * Method used to send an HTTPS GET request and return the response
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49520
        */
        (options: {
            /** (required) The HTTPS URL being requested */
            url: string
            /** (optional) The HTTPS headers. */
            headers: object
        }): N_https.ClientResponse

        /**
        * Method used to send an HTTPS GET request asynchronously and return the responseFor information about the parameters and errors thrown for this method, see https.get(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50555
        */
        promise(options: {
            /** (required) The HTTPS URL being requested */
            url: string
            /** (optional) The HTTPS headers. */
            headers: object
        }): Promise<N_https.ClientResponse>
    }

    /** () | Promise Method used to send an HTTPS POST request and return the response.*/
    post: {
        /**
        * Method used to send an HTTPS POST request and return the response.If negotiating a connection to the destination server exceeds 5 seconds, a connection timeout occurs. If transferring a payload to the server exceeds 45 seconds, a request timeout occurs.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49517
        */
        (options: {
            /** (required) The HTTPS URL being requested */
            url: string
            /** (required) The POST data. */
            body: string | object
            /** (optional) The HTTPS headers. */
            headers: object
        }): N_https.ClientResponse

        /**
        * Method used to send an HTTPS POST request asynchronously and return the response.For information about the parameters and errors thrown for this method, see https.post(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50558
        */
        promise(options: {
            /** (required) The HTTPS URL being requested */
            url: string
            /** (required) The POST data. */
            body: string | object
            /** (optional) The HTTPS headers. */
            headers: object
        }): Promise<https.ClientResponse>
    }

    /** () | Promise Method used to send an HTTPS PUT request and return server response. */
    put: {
        /**
        * Method used to send an HTTPS PUT request and return server response.If negotiating a connection to the destination server exceeds 5 seconds, a connection timeout occurs. If transferring a payload to the server exceeds 45 seconds, a request timeout occurs.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49516
        */
        (options: {
            /** (required) The HTTPS URL being requested */
            url: string
            /** (required) The PUT data. */
            body: string | object
            /** (optional) The HTTPS headers. */
            headers: object
        }): N_https.ClientResponse

        /**
        * Method used to send an HTTPS PUT request asynchronously and return the response.For information about the parameters and errors thrown for this method, see https.put(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50559
        */
        promise(options: {
            /** (required) The HTTPS URL being requested */
            url: string
            /** (required) The PUT data. */
            body: string | object
            /** (optional) The HTTPS headers. */
            headers: object
        }): Promise<N_https.ClientResponse>

    }

    /** () | Promise Method used to send an HTTPS request and return the response. */
    request: {
        /**
        * Method used to send an HTTPS request and return the response.If negotiating a connection to the destination server exceeds 5 seconds, a connection timeout occurs. If transferring a payload to the server exceeds 45 seconds, a request timeout occurs.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49518
        */
        (options: {
            /** (required) The HTTPS request method. Set using the https.Method enum. */
            method: N_https.Method
            /** (required) The HTTPS URL being requested */
            url: string
            /** (optional) The POST data if the method is POST.If the method is DELETE, this body data is ignored. */
            body: string | object
            /** (optional) An object containing request headers. */
            headers: object
        }): N_https.ClientResponse

        /**
        * Method used to send an HTTP request asynchronously and return the response.For information about the parameters and errors thrown for this method, see https.request(options). For additional information on promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50557
        */
        promise(options: {
            /** (required) The HTTPS request method. Set using the https.Method enum. */
            method: N_https.Method
            /** (required) The HTTPS URL being requested */
            url: string
            /** (optional) The POST data if the method is POST.If the method is DELETE, this body data is ignored. */
            body: string | object
            /** (optional) An object containing request headers. */
            headers: object
        }): Promise<https.ClientResponse>
    }
}

declare namespace N_https {
    /**
     * Encapsulates a request string, such as a fragment of sensitive data that is going to be sent to a third party.
     * @link https://netsuite.custhelp.com/app/answers/detail/a_id/44736
     */
    interface SecureString {
        /**
        * Method used to append a passed in https.SecureString to another https.SecureString.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44741
        */
        appendSecureString(options: {
            /** (required) The https.SecureString to append. */
            secureString: N_https.securestring
        }): N_https.SecureString

        /**
        * Method used to append a passed string to an https.SecureString.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44746
        */
        appendString(options: {
            /** (required) The string to append. */
            input: string
            /** (required) The encoding of the string that is being appended. */
            inputEncoding: N_https.encoding
        }): N_https.SecureString

        /**
        * Changes the encoding of a https.SecureString
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44743
        */
        convertEncoding(options: {
            /** (required) The encoding to apply to the returned string. */
            toEncoding: N_https.encoding
        }): N_https.SecureString

        /**
        * Hashes an https.SecureString object
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44744
        */
        hash(options: {
            /** (required) The hash algorithm. Set the value using the crypto.Hash enum. */
            algorithm: N_crypto.hash
        }): N_https.SecureString

        /**
        * Produces the securestring as an hmac.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44745
        */
        hmac(options: {
            /** (required) The hash algorithm. Set by the crypto.Hash enum. */
            algorithm: N_crypto.hash
            /** (required) A key returned from https.createSecureKey(options). */
            key: N_crypto.secretkey
        }): N_https.SecureString

    }

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
        method: N_https.Method;
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
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49540
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
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49539
        */
        getSublistValue(options: {
            /** (required) The sublist internal ID. */
            group: string
            /** (required) The name of the field. */
            name: string
            /** (required) The sublist line number.Sublist index starts at 0. */
            line: string
        }): string

    }

    /**
     * Encapsulates the response to an incoming http request from an HTTPS server. For example, a response from a Suitelet or RESTlet.
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
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49531
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
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49530
        */
        getHeader(options: {
            /** (required) The name of the header. */
            name: string
        }): string | string[]

        /**
        * Method used to generates and renders a PDF directly to the response.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49527
        */
        renderPdf(options: {
            /** (required) Content of the pdf. */
            xmlString: string
        }): Void

        /**
        * Method used to set the redirect URL by resolving to a NetSuite resource.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Throws SSS_INVALID_URL_CATEGORY > The URL category must be one of RECORD, TASKLINK or SUITELET.
        * @Throws SSS_INVALID_TASK_ID > The task ID: {id} is not valid. Please refer to the documentation for a list of supported task IDs.
        * @Throws SSS_INVALID_RECORD_TYPE > Type argument {type} is not a valid record or is not available in your account. Please see the documentation for a list of supported record types.
        * @Throws SSS_INVALID_SCRIPT_ID_1 > You have provided an invalid script id or internal id: {id}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49529
        */
        sendRedirect(options: {
            /** (required) The base type for this resource. Use one of the following values:RECORD | TASKLINK | SUITELET */
            type: string
            /** (required) The primary ID for this resource.If the base type is RECORD, input the record type as listed on the Records Browser.If the base type is TASKLINK, input the task ID.If the base type is SUITLET, input the script ID. */
            identifier: string
            /** (optional) The secondary ID for this resource. If the base type is SUITLET, input the deployment ID. */
            id: string
            /** (optional) If the base type is RECORD, this value determines whether to return a URL for the record in edit mode or view mode. */
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
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49526
        */
        setCdnCacheable(options: {
            /** (required) The value of the caching duration. Set using the https.CacheDuration. */
            type: N_https.CacheDuration
        }): Void

        /**
        * Method used to set the value of a response header.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Throws SSS_INVALID_HEADER > One or more headers are not valid.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49528
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
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49525
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
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49524
        */
        writeFile(options: {
            /** (required) A file.File Object that encapsulates the file to be written. */
            file: N_file.file
            /** (optional) Determines whether the field is inline. If true, the file is inline. */
            isInline: boolean
        }): Void

        /**
        * Method used to write line information to the response.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Missing a required argument: {param name}
        * @Throws WRONG_PARAMETER_TYPE > {param name}
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49523
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
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49522
        */
        writePage(options: {
            /** (required) A standalone page object in the form of an assistant, form or list. */
            pageObject: N_serverwidget.assistant | N_serverwidget.form | N_serverwidget.list
        }): Void














    }


}