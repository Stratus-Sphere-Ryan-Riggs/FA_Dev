/**
 * Load the dialog module to create a modal dialog that persists until a button on the dialog is pressed.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49314
 */
declare interface N_ui_dialog {
    /**
    * Creates an Alert dialog with an OK button.
    * @Supported Client scripts
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49317
    */
    alert(options: {
        /** (optional) The alert dialog title. This value defaults to an empty string. */
        title: string
        /** (optional) The content of the alert dialog. This value defaults to an empty string. */
        message: string
    }): Promise<object>

    /**
    * Creates a Confirm dialog with OK and Cancel buttons.
    * @Supported Client scripts
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49318
    */
    confirm(options: {
        /** (optional) The confirmation dialog title. This value defaults to an empty string. */
        title: string
        /** (optional) The content of the confirmation dialog. This value defaults to an empty string. */
        message: string
    }): Promise<object>

    /**
    * Creates a dialog with specified buttons.
    * @Supported Client scripts
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49319
    */
    create(options: {
        /** (optional) A list of buttons to include in the dialog. Each item in the button list must be a Javascript Object that contains a label and a value property.By default, a single button with the label OK and the value true is used. */
        buttons: string[]
        /** (optional) The dialog title. This value defaults to an empty string. */
        title: string
        /** (optional) The content of the dialog. This value defaults to an empty string. */
        message: string
    }): Promise<object>
}

