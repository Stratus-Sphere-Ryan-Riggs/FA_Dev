/**
 * This module loads the workflow module to initiate new workflow instances or trigger existing workflow instances.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43689
 */
declare interface N_workflow {
    /**
    * Initiates a workflow on-demand. This method is the programmatic equivalent of the Initiate Workflow Action action in SuiteFlow.Returns the internal ID of the workflow instance used to track the workflow against the record.
    * @Supported All server-side scripts
    * @Governance 20 usage units
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43690
    */
    initiate(options: {
        /** (required) The record type ID of the workflow base record. For example, use 'customer', 'salesorder', or 'lead'. This is the Record Type field on the Workflow Definition Page. */
        recordType: number
        /** (required) The internal ID of the base record */
        recordId: string | number
        /** (required) The internal ID (number) or script ID (string) for the workflow definition. This is the ID field on the Workflow Definition Page. */
        workflowId: string | number
        /** (optional) The object that contains key/value pairs to set default values on fields specific to the workflow.These can include fields on the Workflow Definition Page or workflow and state Workflow Custom Fields. */
        defaultValues: object
    }): number

    /**
    * Triggers a workflow on a record. The actions and transitions of the workflow are evaluated for the record in the workflow instance, based on the current state for the workflow instance.Returns the internal ID of the workflow instance used to track the workflow against the record.
    * @Supported All server-side scripts
    * @Governance 20 usage units
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43691
    */
    trigger(options: {
        /** (required) The record type ID of the workflow base record. For example, use 'customer', 'salesorder', or 'lead'. This is the Record Type field on the Workflow Definition Page. */
        recordType: number
        /** (required) The internal ID of the base record */
        recordId: string | number
        /** (required) The internal ID (number) or script ID (string) for the workflow definition. This is the ID field on the Workflow Definition Page. */
        workflowId: string | number
        /** (optional) The internal ID of the workflow instance. */
        workflowInstanceId: string | number
        /** (optional) The internal ID of a button that appears on the record in the workflow.Use this parameter to trigger the workflow as if the specified button were clicked. */
        actionId: string | number
        /** (optional) The internal ID (number) or script ID (string) of the workflow instance. */
        stateId: string | number
    }) : number
}