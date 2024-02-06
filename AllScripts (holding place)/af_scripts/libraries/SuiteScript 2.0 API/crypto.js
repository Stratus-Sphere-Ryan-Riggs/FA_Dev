/**
 * SuiteScript crypto module
 *
 * @module N/crypto
 * @suiteScriptVersion 2.x
 *
 */
function crypto() {
        
    /**
     *
     * @param options
     * @string options.guid
     * @string options.encoding
     * @return {SecretKey}
     */    
    this.createSecretKey = function(options) {};    
    
    /**
     *
     * @param {Object} options
     * @param {string} options.algorithm
     * @return {Hash}
     */    
    this.createHash = function(options) {};    
    
    /**
     *
     * @param {Object} options
     * @param {string} options.algorithm
     * @param {SecretKey} options.key
     * @return {Hmac}
     */    
    this.createHmac = function(options) {};    
    
    /**
     *
     * @param {object} options
     * @param {string} options.algorithm
     * @param {crypto.SecretKey} options.key
     * @param {string} options.blockCipherMode
     * @param {string} options.padding
     * @return {Cipher}
     */    
    this.createCipher = function(options) {};    
    
    /**
     *
     * @param {object} options
     * @param {string} options.algorithm
     * @param {string} options.key
     * @param {string} options.blockCipherMode
     * @param {string} options.padding
     * @param {string} options.iv
     * @return {Decipher}
     */    
    this.createDecipher = function(options) {};    
    
    /**
     * @enum
     */    
    function cryptoHashAlg() {
        this.SHA1 = 'SHA1';
        this.SHA256 = 'SHA256';
        this.SHA512 = 'SHA512';
        this.MD5 = 'MD5';
    }    
    this.HashAlg = cryptoHashAlg;    
    
    /**
     * @enum
     */    
    function cryptoEncryptionAlg() {
        this.AES = 'AES';
    }    
    this.EncryptionAlg = cryptoEncryptionAlg;    
    
    /**
     * @enum
     */    
    function cryptoEncoding() {
        this.UTF_8 = 'UTF_8';
        this.BASE_16 = 'BASE_16';
        this.BASE_32 = 'BASE_32';
        this.BASE_64 = 'BASE_64';
        this.BASE_64_URL_SAFE = 'BASE_64_URL_SAFE';
        this.HEX = 'HEX';
    }    
    this.Encoding = cryptoEncoding;    
    
    /**
     * @enum
     */    
    function cryptoPadding() {
        this.NoPadding = 'NoPadding';
        this.PKCS5Padding = 'PKCS5Padding';
    }    
    this.Padding = cryptoPadding;    
        
    /**
     * Returns a new instance of SecretKey used for hmac, cipher and decipher
     *
     * @protected
     * @class
     * @classdesc
     * @param guid
     * @param encoding
     * @return {crypto.SecretKey}
     *
     * @constructor
     */    
    function SecretKey() {        
        /**
         * @type string
         */        
        this.guid = undefined;        
        /**
         * @type string
         */        
        this.encoding = undefined;    
    
    }    
        
    /**
     *
     * @protected
     * @constructor
     */    
    function CipherPayload() {        
        /**
         * @type string
         */        
        this.iv = undefined;        
        /**
         * @type string
         */        
        this.ciphertext = undefined;    
    
    }    
        
    /**
     * @class
     * @classdesc Encapsulation of a Hash
     * @return {crypto.Hash}
     * @protected
     * @constructor
     *
     * @since 2015.2
     */    
    function Hash() {        
        
        /**
         *
         * @param {Object} options
         * @param {string} options.input
         * @param {string} options.inputEncoding
         *
         */        
        this.update = function(options) {};        
        
        /**
         * @param {Object} options
         * @param {string} options.outputEncoding
         * @return {string}
         */        
        this.digest = function(options) {};        
        
        /**
         * Returns the object type name (crypto.Hash)
         * @returns {string}
         */        
        this.toString = function(options) {};    
    
    }    
        
    /**
     * @class
     * @classdesc Encapsulation of a Hash
     * @return {crypto.Hmac}
     * @protected
     * @constructor
     *
     * @since 2015.2
     */    
    function Hmac() {        
        
        /**
         *
         * @param {Object} options
         * @param {string} options.input
         * @param {string} options.inputEncoding
         *
         */        
        this.update = function(options) {};        
        
        /**
         * @param {Object} options
         * @param {string} options.outputEncoding
         * @return {string}
         */        
        this.digest = function(options) {};        
        
        /**
         * Returns the object type name (crypto.Hash)
         * @returns {string}
         */        
        this.toString = function(options) {};    
    
    }    
        
    /**
     * @protected
     * @constructor
     */    
    function Cipher() {        
        
        /**
         *
         * @param {Object} options
         * @param {string} options.input
         * @param {string} options.inputEncoding
         *
         */        
        this.update = function(options) {};        
        
        /**
         * @param {Object} options
         * @param {string} options.outputEncoding
         * @return {CipherPayload}
         */        
        this['final'] = function(options) {};    
    
    }    
        
    /**
     * @protected
     * @constructor
     */    
    function Decipher() {        
        
        /**
         *
         * @param {Object} options
         * @param {string} options.input
         * @param {string} options.inputEncoding
         *
         */        
        this.update = function(options) {};        
        
        /**
         * @param {Object} options
         * @param {string} options.outputEncoding
         * @return {string}
         */        
        this['final'] = function(options) {};    
    
    }    
    
}