/**
 * Load the portlet module to resize or refresh a form portlet. See Portlet Script Type.
 * @link https://netsuite.custhelp.com/app/answers/detail/a_id/49770
 */
declare interface N_portlet {
    /**Resizes a form portlet immediately. */
    resize(): void;
    /**Refreshes a form portlet immediately. */
    refresh():void;
}