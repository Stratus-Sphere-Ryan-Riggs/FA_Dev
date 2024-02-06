/**
 * Load the N/plugin module to load custom plug-in implementations.
 * @link https://netsuite.custhelp.com/app/answers/detail/a_id/49446
 */
declare interface N_plugin {

    /**
    * Returns the script IDs of custom plug-in type implementations.Returns an empty list when there is no custom plug-in type with the script ID available for the executing script.
    * @Supported Server-side scripts
    * @Governance 
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49447
    */
    findImplementations(options: {
        /** (required) The script ID of the custom plug-in type. */
        type: string
        /** (optional) The default value is true, indicating that the default implementation should be included in the list. */
        includeDefault: boolean
    }): string[]

    /**
    * Instantiates an implementation of the custom plugin type.Returns the implementation which is currently selected in the UI (Manage Plug-ins page) when no implementation ID is explicitly provided.
    * @Supported Server-side scripts
    * @Governance 
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49448
    */
    loadImplementation(options: {
        /** (required) The script ID of the custom plug-in type. */
        type: string
        /** (optional) The script ID of the custom plug-in implementation. */
        implementation: string
    }): object





}