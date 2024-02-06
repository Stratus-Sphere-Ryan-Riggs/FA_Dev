/**
 * Use the sso module to generate outbound single sign-on (SuiteSignOn) tokens. For example, to create a reference to a SuiteSignOn record, or to integrate with an external application.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44833
 */
declare interface N_sso {
    /**
    * Method used to generate a new SuiteSignOn token for a user.
    * @Supported Portlet scripts, user event scripts, and Suitelets
    * @Governance 20 units
    * @Since Version 2015 Release 2
    * @Throws INVALID_SSO > The suiteSignOnId input parameter is invalid or does not exist.
    * @Throws SSO_CONFIG_REQD > The suiteSignOnId input parameter is missing.
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44842
    */
    generateSuiteSignOnToken(options: {
        /** (required) The scriptId specified on the SuiteSignOn record.To see a list of IDs for SuiteSignOn records, go to the SuiteSignOn list page (Setup > Integration > SuiteSignOn). */
        suiteSignOnId: string
    }) : string

}