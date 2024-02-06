
/**
 * Use the log module to access methods for logging script execution details.
 * The log methods can be accessed globally or by loading this module. Load the N/log module
 *  when you want to manually access the its members, such as for testing purposes. 
 * For more information about global objects, see SuiteScript 2.0 Global Objects and Methods.
 * @link https://netsuite.custhelp.com/app/answers/detail/a_id/49630
 */
declare interface N_log {

    /**
    * Logs an entry of type AUDIT to the Execution Log tab of the script deployment for the current script.This entry will not appear on the Execution Log tab if the Log Level field for the script deployment is set to ERROR or above.Use this method for scripts in production.
    * @Supported All script types
    * @Governance Amount of logging in any 60 minute period is limited. See N/log Module Guidelines.
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45055
    */
    audit(options: {
        /** (Optional) String to appear in the Title column on the Execution Log tab of the script deployment.Maximum length is 99 characters. If you set this value to null, an empty string (''), or omit it, the word “Untitled” appears for the log entry. */
        title: string
        /** (Required) You can pass any value for this parameter.If the value is a JavaScript Object type, JSON.stringify(obj) is called on the object before displaying the value.NetSuite truncates any resulting string over 3999 characters. */
        details: any
    }): void

    /**
    * Logs an entry of type DEBUG to the Execution Log tab of the script deployment for the current script.This entry will not appear on the Execution Log tab if the Log Level field for the script deployment is set to AUDIT or above.Use this method for scripts in development.
    * @Supported All script types
    * @Governance Amount of logging in any 60 minute period is limited. See N/log Module Guidelines.
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45056
    */
    debug(options: {
        /** (Optional) String to appear in the Title column on the Execution Log tab of the script deployment.Maximum length is 99 characters.If you set this value to null, an empty string (''), or omit it, the word “Untitled” appears for the log entry. */
        title: string
        /** (Required) You can pass any value for this parameter.If the value is a JavaScript object type, JSON.stringify(obj) is called on the object before displaying the value.NetSuite truncates any resulting string over 3999 characters. */
        details: any
    }): void

    /**
    * Logs an entry of type EMERGENCY to the Execution Log tab of the script deployment for the current script.Use this method for scripts in production.
    * @Supported All script types
    * @Governance Amount of logging in any 60 minute period is limited. See N/log Module Guidelines.
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45057
    */
    emergency(options: {
        /** (Optional) String to appear in the Title column on the Execution Log tab of the script deployment.Maximum length is 99 characters. If you set this value to null, an empty string (''), or omit it, the word “Untitled” appears for the log entry. */
        title: string
        /** (Required) You can pass any value for this parameter.If the value is a JavaScript Object type, JSON.stringify(obj) is called on the object before displaying the value.NetSuite truncates any resulting string over 3999 characters. */
        details: any
    }): void

    /**
    * Logs an entry of type ERROR to the Execution Log tab of the script deployment for the current script.This entry will not appear on the Execution Log tab if the Log Level field for the script deployment is set to EMERGENCY or above.Use this method for scripts in production.
    * @Supported All script types
    * @Governance Amount of logging in any 60 minute period is limited. See N/log Module Guidelines.
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45058
    */
    error(options: {
        /** (Optional) String to appear in the Title column on the Execution Log tab of the script deployment.Maximum length is 99 characters. If you set this value to null, an empty string (''), or omit it, the word “Untitled” appears for the log entry. */
        title: string
        /** (Required) You can pass any value for this parameter.If the value is a JavaScript object type, JSON.stringify(obj) is called on the object before displaying the value.NetSuite truncates any resulting string over 3999 characters. */
        details: any
    }): void

}