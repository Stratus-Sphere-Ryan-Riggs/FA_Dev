/**
 * Load the N/auth module when you want to change your NetSuite login credentials.
 * @link https://netsuite.custhelp.com/app/answers/detail/a_id/43575
 */
    declare interface N_auth {
    /**
    * Method used to change the current user’s NetSuite email address (user name).
    *@Supported Script Types: Server-side scripts
    *@Governance 10 usage units
    *@Since Version 2015 Release 2
    *@Throws INVALID_PS​W​D > The argument for options.password is invalid.
    *@Throws INVALID_EM​A​I​L > The argument for options.newEmail is invalid.
    *@link https://netsuite.custhelp.com/app/answers/detail/a_id/43576
    */
    changeEmail(options: {
        /**The logged in user’s NetSuite password. */
        password: string;

        /**The logged in user’s NetSuite email address.*/
        newEmail: string;

        /**[Optional] If set to true, the email address change is applied only to roles within the current account. If set to false, the email address change is applied to all accounts and roles.* The default value is true.*/
        onlyThisAccount?: boolean;
    }): void;

    /**
    * Method used to change the current user’s NetSuite password.
    *@Supported Script Types Server-side scripts
    *@Governance 10 usage units
    *@Since Version 2015 Release 2
    *@Throws INVALID_PS​W​d > The argument for options.currentPassword is invalid.
    *@Throws USER_ERROR
    *@link https://netsuite.custhelp.com/app/answers/detail/a_id/43577
    */
    changePassword(options: {
        currentPassword: string;
        newPassword: string;
    }): void;
}
