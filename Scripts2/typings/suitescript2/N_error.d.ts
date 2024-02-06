/**
 * Load the error module when you want to create your own custom SuiteScript errors. Use these custom errors in try-catch statements to abort script execution.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43545
 */
declare interface N_error {
/**
* Method used to create a new error.SuiteScriptError or error.UserEventError object. Use this custom error in a try-catch statement to abort script execution.
* @Supported Server-side scripts
* @Governance None
* @Since Version 2015 Release 2
* @Throws MISS_MANDATORY_​PARAMETER > A required argument is missing
* @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43546
*/
create(options: {
	/** (required) A user-defined name (error code).Sets the value for the property file.load(options). */
	name: string
	/** (required) The error message displayed. This value displays on the Execution Log, in the Details column.The default value is null.Sets the value for the property File.description. */
	message: string
	/** (optional) Sets whether email notification is suppressed.The default value is false.If set to false, when this error is thrown, the system emails the users identified on the applicable script record’s Unhandled Errors subtab. For additional information on the Unhandled Errors subtab, see Creating a Script Record. */
	notifyOff: boolean
}) : N_error.UserEventError | N_error.SuiteScriptError

}

declare namespace N_error {
    interface SuiteScriptError {
        /**User-defined error code. */
        name: String;
        /**Text that displays on the SuiteScript Execution Log, in the Details column. */
        message: String;
        /**Error ID that is automatically generated when a new error is created. */
        id: String;
        /**A list of method calls that the script is executing when the error is thrown. */
        stack: String[];
    }

    interface UserEventError {
        /**User-defined error code. */
        name: String;
        /**Text that displays on the SuiteScript Execution Log, in the Details column. */
        message: String;
        /**User event type (beforeLoad, beforeSubmit, afterSubmit) */
        eventType: String;
        /**Error ID that is automatically generated when a new error is created. */
        id: String;
        /**Internal ID of the submitted record that triggered the script. This property only holds a value when the error is thrown by an afterSubmit user event script. */
        recordId: String;
        /**A list of method calls that the script is executing when the error is thrown. */
        stack: String[];
    }
}