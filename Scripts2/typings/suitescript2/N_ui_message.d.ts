declare interface N_ui_message {

    /**Indicates the type of message to display, which specifies the background color of the message and other message indicators. */
    Type: {
        /**A green background with a checkmark icon. */
        CONFIRMATION;
        /**A blue background with an Information icon. */
        INFORMATION;
        /**A yellow background with a Warning icon. */
        WARNING;
        /**A red background with an X icon. */
        ERROR;
    }

    /**
    * Creates a message that can be displayed or hidden near the top of the page.
    * @Supported Client scripts
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49322
    */
    create(options: {
        /** (required) The message type. */
        type: N_ui_message.type
        /** (optional) The message title. This value defaults to an empty string. */
        title: string
        /** (optional) The content of the message. This value defaults to an empty string. */
        message: string
    }): N_ui_message.Message
}

declare namespace N_ui_message {
    interface Message {
        /**
        * Hides the message.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/50318
        */
        hide(): void

        /**
        * Shows the message.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49321
        */
        show(options: {
            /** (optional) The amount of time, in milliseconds, to show the message. The default is 0, which shows the message until Message.hide() is called. */
            duration: int
        }): void
    }
}
