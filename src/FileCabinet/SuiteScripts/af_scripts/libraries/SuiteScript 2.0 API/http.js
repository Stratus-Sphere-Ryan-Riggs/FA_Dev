/**
 * SuiteScript module
 *
 * @module N/http
 * @suiteScriptVersion 2.x
 *
 */
function http() {
        
    /**
     * Enum describing available HTTP methods.
     * @enum {string}
     * @readonly
     */    
    function httpMethod() {
        this.GET = 'GET';
        this.POST = 'POST';
        this.PUT = 'PUT';
        this.DELETE = 'DELETE';
        this.HEAD = 'HEAD';
    }    
    this.Method = httpMethod;    
    
    /**
     * Enum describing available Commerce API Cache Durations.
     * @enum {string}
     * @readonly
     */    
    function httpCacheDuration() {
        this.UNIQUE = 'UNIQUE';
        this.SHORT = 'SHORT';
        this.MEDIUM = 'MEDIUM';
        this.LONG = 'LONG';
    }    
    this.CacheDuration = httpCacheDuration;    
    
    /**
     * Send a HTTP GET request and return server response.
     *
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} config
     * @param {string} config.url the HTTP URL being requested
     * @param {Object} config.headers (optional) request HTTP headers
     * @return {ClientResponse}
     *
     * @throws {error.SuiteScriptError} REQUIRED_PARAM_MISSING if a required parameter is missing
     * @throws {error.SuiteScriptError} UNKNOWN_PARAM if an unknown parameter is present in config
     * @throws {error.SuiteScriptError} SSS_INVALID_URL if an incorrect protocol is used (ex: http in the HTTPS module)
     *
     * @since 2015.2
     */    
    this['get'] = function(options) {};    
    
    /**
     * Send a HTTP POST request and return server response.
     *
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} config
     * @param {string} config.url the HTTP URL being requested
     * @param {string|Object} config.body POST data
     * @param {Object} config.headers (optional) request HTTP headers
     * @return {ClientResponse}
     *
     * @throws {error.SuiteScriptError} REQUIRED_PARAM_MISSING if a required parameter is missing
     * @throws {error.SuiteScriptError} UNKNOWN_PARAM if an unknown parameter is present in config
     * @throws {error.SuiteScriptError} SSS_INVALID_URL if an incorrect protocol is used (ex: http in the HTTPS module)
     *
     * @since 2015.2
     */    
    this.post = function(options) {};    
    
    /**
     * Send a HTTP PUT request and return server response.
     *
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} config
     * @param {string} config.url the HTTP URL being requested
     * @param {string|Object} config.body PUT data
     * @param {Object} config.headers (optional) request HTTP headers
     * @return {ClientResponse}
     *
     * @throws {error.SuiteScriptError} REQUIRED_PARAM_MISSING if a required parameter is missing
     * @throws {error.SuiteScriptError} UNKNOWN_PARAM if an unknown parameter is present in config
     * @throws {error.SuiteScriptError} SSS_INVALID_URL if an incorrect protocol is used (ex: http in the HTTPS module)
     *
     * @since 2015.2
     */    
    this.put = function(options) {};    
    
    /**
     * Send a HTTP DELETE request and return server response.
     *
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} config
     * @param {string} config.url the HTTP URL being requested
     * @param {Object} config.headers (optional) request HTTP headers
     * @return {ClientResponse}
     *
     * @throws {error.SuiteScriptError} REQUIRED_PARAM_MISSING if a required parameter is missing
     * @throws {error.SuiteScriptError} UNKNOWN_PARAM if an unknown parameter is present in config
     * @throws {error.SuiteScriptError} SSS_INVALID_URL if an incorrect protocol is used (ex: http in the HTTPS module)
     *
     * @since 2015.2
     */    
    this['delete'] = function(options) {};    
    
    /**
     * Send a HTTP request and return server response.
     *
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} config
     * @param {http.Method} config.method HTTP method of the request
     * @param {string} config.url the HTTP URL being requested
     * @param {string|Object} config.body POST data; must be present if and only if method is POST
     * @param {Object} config.headers (optional) request HTTP headers
     * @return {ClientResponse}
     *
     * @throws {error.SuiteScriptError} REQUIRED_PARAM_MISSING if a required parameter is missing
     * @throws {error.SuiteScriptError} UNKNOWN_PARAM if an unknown parameter is present in config
     * @throws {error.SuiteScriptError} SSS_INVALID_URL if an incorrect protocol is used (ex: http in the HTTPS module)
     *
     * @since 2015.2
     */    
    this.request = function(options) {};    
        
    /**
     * Return a new instance of ClientResponse used to store the result of a HTTP request.
     *
     * @protected
     * @classDescription Encapsulation of nlobjServerResponse.
     * @return {http.ClientResponse}
     * @constructor
     *
     * @since 2015.2
     */    
    function ClientResponse() {        
        /**
         * Response code.
         * @name ClientResponse#code
         * @type number
         * @readonly
         * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
         */        
        this.code = undefined;        
        /**
         * Response headers.
         * @name ClientResponse#headers
         * @type Object
         * @readonly
         * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
         */        
        this.headers = undefined;        
        /**
         * Response body.
         * @name ClientResponse#body
         * @type string
         * @readonly
         * @throws {error.SuiteScriptError} READ_ONLY when setting the property is attempted
         */        
        this.body = undefined;        
        
        /**
         * Returns the object type name (http.ClientResponse)
         *
         * @returns {string}
         */        
        this.toString = function(options) {};        
        
        /**
         * JSON.stringify() implementation.
         *
         * @returns {{type: string, code: *, headers: *, body: *}}
         */        
        this.toJSON = function(options) {};    
    
    }    
    
}