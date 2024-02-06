/**
 * Load the runtime module when you want to access the runtime settings for company, script, session, system, user, or version.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45162
 */
declare interface N_runtime {
    /**Enumeration that holds the context information about what triggered the current script. */
    ContextType: {
        CSV_IMPORT;
        CUSTOM_MASSUPDATE;
        SCHEDULED;
        SUITELET;
        USEREVENT;
        USER_INTERFACE;
        WEBSERVICES;
        WEBSTORE;
        WORKFLOW;
    }
    /**Enumeration that holds all possible environment types that the current script can execute in. */
    EnvType: {
        SANDBOX;
        PRODUCTION;
        BETA;
        INTERNAL;
    }

    /**Enumeration that holds the user permission level for a specific permission ID. */
    Permission: {
        FULL;
        EDIT;
        CREATE;
        VIEW;
        NONE;
    }

    /**	Returns the account ID for the currently logged-in user. */
    accountId: String
    /**Returns the current environment in which the script is executing. */
    envType: N_runtime.EnvType
    /**Returns a runtime.ContextType enumeration that represents what triggered the current script. */
    executionContext: N_runtime.ContextType
    /**Returns the number of scheduled script queues in a given account. */
    queueCount: number
    /**Returns the version of NetSuite that the method is called in.  */
    version: string

    /**
    * Returns a runtime.Script that represents the currently executing script.Use this method to get properties and parameters of the currently executing script and script deployment. If you want to get properties for the session or user, use runtime.getCurrentSession() or runtime.getCurrentUser() instead.
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45167
    */
    getCurrentScript(): N_runtime.Script

    /**
    * Returns a runtime.Session that represents the user session for the currently executing script.Use this method to get session objects for the current user session. If you want to get properties for the script or user, use runtime.getCurrentScript() or runtime.getCurrentUser() instead.
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45168
    */
    getCurrentSession(): N_runtime.Session

    /**
    * Returns a runtime.User that represents the properties and preferences for the user of the currently executing script.Use this method to get session objects for the current user session. If you want to get properties for the script or session, use runtime.getCurrentScript() or runtime.getCurrentSession() instead.
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45166
    */
    getCurrentUser(): N_runtime.User

    /**
    * Use this method to determine if a particular feature is enabled in a NetSuite account. These are the features that appear on the Enable Features page at  .
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45169
    */
    isFeatureInEffect(options: {
        /** (Required) The internal ID of the feature to check. For a list of feature internal IDs, see Feature Names and IDs. */
        feature: string
    }): boolean

}

declare namespace N_runtime {
    interface Script {
        /**Returns the deployment ID for the script deployment on the currently executing script. */
        deploymentId: string
        /**Returns the script ID for the currently executing script. */
        id: string
        /**Returns the script logging level for the current script execution. This method is not supported on client scripts. */
        logLevel: string
        /**Return the percent complete specified for the current scheduled script execution. */
        percentComplete: number
        /**Returns an Array of bundle IDs for the bundles that include the currently executing script. */
        bundleIds: []

        /**
        * Returns the value of a script parameter for the currently executing script.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45179
        */
        getParameter(options: {
            /** (Required) The name of the script parameter. */
            name: string
        }): number | Date | string | Array

        /**
        * Returns a number value for the usage units remaining for the currently executing script.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45178
        */
        getRemainingUsage(): number

    }

    interface Session {
        /**
        * Returns the user-defined session object value associated with the session object key.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45183
        */
        get(options: {
            /** (Required) String used as a key to store the runtime.Session. */
            name: N_runtime.Session
        }): string

        /**
        * Sets a key and value for a user-defined runtime.Session.Use Session.get(options) to retrieve the object value after you set it.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45184
        */
        set(options: {
            /** (Required) Key used to store the runtime.Session. */
            name: N_runtime.Session
            /** (Required) Value to associate with the key in the user session. */
            value: string
        }): void
    }

    interface User {
        /**Returns the internal ID of the department for the currently logged-in user. */
        department: number
        /**Returns the email address of the currently logged-in user. */
        email: string
        /**Returns the internal ID of the currently logged-in user. */
        id: number
        /**Returns the internal ID of the location of the currently logged-in user. */
        location: number
        /**Returns the name of the currently logged-in user. */
        name: string
        /**Return the internal ID of the role for the currently logged-in user. */
        role: number
        /**Returns the internal ID of the center type, or role center, for the currently logged-in user. */
        roleCenter: string
        /**Returns the custom scriptId of the role for the currently logged-in user. */
        roleId: string
        /**Returns the internal ID of the subsidiary for the currently logged-in user. */
        subsidiary: number

        /**
        * Returns the value of a NetSuite preference.Currently only General Preferences and Accounting Preferences are exposed in SuiteScript. For more information about these preferences names and IDs, see General Preferences and Accounting Preferences.You can also view General Preferences by going to  . View Accounting Preferences by going to  .If you want to change the value of a General or Accounting preference using SuiteScript 2.0, you must load each preference page using config.load(options), where options.name is COMPANY_PREFERENCES or ACCOUNTING_PREFERENCES. The config.load(options) method returns a record.Record. You can use the Record.setValue(options) method to set the preference.The permission level will be Permission.FULL if the script is configured to execute as admin. You can configure a script to execute as admin by selecting “administrator” from the Execute as Role field on Script Deployment page.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45186
        */
        getPreference(options: {
            /** (Required) Internal ID of the preference. For a list of preference IDs, see Preference Names and IDs.  */
            name: string
        }): string

        /**
        * Returns a user permission level for the specified permission as a runtime.Permission enumeration.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45185
        */
        getPermission(options: {
            /** (Required) Internal ID of a permission. For a list of permission IDs, see Permission Names and IDs. */
            name: string
        }): string

    }
}