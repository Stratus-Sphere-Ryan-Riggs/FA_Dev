/**
 * Load the cache module to enable the caching of data and improve performance. You can create a cache that is accessible to the current script only, 
 * to all scripts in the current bundle, or to all scripts in your NetSuite account. 
 * Using a cache improves performance by eliminating the need for scripts in your account to retrieve the same piece of data more than one time.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51379/kw/cache
 */
declare interface N_cache {
    /**
    * Method used to create a new cache.Cache object.
    * @Supported: Server-side scripts
    * @Governance None
    * @Since Version 2016 Release 2
    * @Throws
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51380
    */
    getCache(options: {
        /**
         * (required)A label that will identify the cache you are creating. 
         * The maximum size of the cache name is 1 kilobyte. 
         */
        name: string;

        /**[Optional] The scope of the cache. This value determines the availability of the cache. 
         * A cache can be made available to the current script only, to all scripts in the current bundle, 
         * or to all scripts in your NetSuite account.
         */
        scope?: N_cache.Scope;
    }): N_cache.Cache;

    /**
     * Enumeration that holds string values that describe the availability of the cache. 
     * This enum is used to set the value of the Cache.scope property.
     * @Since Version 2016 Release 2
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51394
     */
    Scope : {
        /**
         * The cache is available only to the current script. This value is the default.
         */
        PRIVATE,
        /**
         * The cache is available only to some scripts, as follows:
         * If the script is part of a bundle, the cache is available to all scripts in the same bundle.
         * If the script is not in a bundle, then the cache is available to all scripts not in a bundle
         */
        PROTECTED,
        /**
         * The cache is available to any script in the NetSuite account.
         */
        PUBLIC
    }

}

declare namespace N_cache {
    /**
    * A segment of memory that can be used to temporarily store data needed by one script, 
    * by all scripts in a bundle, or by all scripts in the NetSuite account.
    * @Supported: Server-side scripts
    * @Since Version 2016 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51381
    */
    export interface Cache {
        /**
         * A label that identifies a cache.
         * @Since Version 2016 Release 2
         * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51385
         */
        name: string;
        /**
         * A label that describes the availability of the cache to other scripts.
         * @Since Version 2016 Release 2
         * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51386
         */
        scope: N_cache.Scope

        /**
        * This method retrieves a string value from the cache. The value retrieved is identified by a key that you pass by using the options.key parameter. 
        * If a requested value is not present in the cache, the system calls the function identified by the options.loader parameter. 
        * This user-defined function should provide some logic for retrieving a value that is not in the cache.
        * @Supported Server-side scripts
        * @Governance 1 unit if the value is present in the cache; 2 units if the loader function is used
        * @Since Version 2016 Release 2
        * @Throws
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51384
        */
        get(options: {
	        /** (required) A string that identifies the value to be retrieved from the cache. This value cannot be null. */
            key: string,
            /**
             * (optional) A user-defined function that returns the requested value if it is not already present in the cache. Addtionally, when the loader retrieves a value, 
             * the system automatically places that value in the cache. For this reason, NetSuite recommends using the loader function as the primary means of populating the cache.
             * Note also that if the value returned by the loader is not a string, the system uses JSON.stringify() to convert the value before it is placed in the cache and returned. 
             * The maximum size of a value that can be placed in the cache is 500KB.
             * When no loader is specified and a value is missing from the cache, the system returns null.
             */
            loader?: Function,
            /**
             * (optional) The duration, in seconds, that a value retrieved by the loader should remain in the cache. 
             * The default time to live, or TTL, is no limit. The minimum value is 300 (five minutes).
             */
            ttl?: number
        }): String | number;

        /**
        * Use this method to place a value into a cache.
        * @Supported Server=side scripts
        * @Governance 1 unit
        * @Since Version 2016 Release 2
        * @Throws
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51383/related/1
        */
        put(options: {
	        /** (required) An identifier of the value that is being cached. The maximum size of the cache key is 4 kilobytes. */
            key: string,
            /**
             * (required) The value to place in the cache. If the value submitted is not a string, the system uses JSON.stringify() to convert the value before it is placed in the cache. 
             * The maximum size of the value is 500KB.
             */
            value: string,
            /**
             * (optional) The duration, in seconds, that a value retrieved by the loader should remain in the cache. The default time to live, or TTL, is no limit. 
             * The minimum value is 300 (five minutes).
             */
            ttl?: number
        }): void;
        /**
        * Removes a value from the cache.
        * @Supported Server-side scripts
        * @Governance 1 unit
        * @Since Version 2016 Release 2
        * @Throws
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51382/related/1
        */
        remove(options: {
	        /** (required) An identifier of the value that is being removed. */
            key: string
        }): void;
    }
}

