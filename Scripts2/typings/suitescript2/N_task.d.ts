/**
 * Load the task module to create tasks and place them in the internal NetSuite scheduling or task queue. 
 * Use the task module to schedule scripts, run Map/Reduce scripts, import CSV files, merge duplicate records, and execute asynchronous workflows.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43716
 */
declare interface N_task {
    /**
    * Creates an object for a specific task type and returns the task object. Use with the N/task Module to create a task to schedule scripts, 
    * run map/reduce scripts, import CSV files, merge duplicate records, or execute asynchronous workflows.
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/44132
    */
    create(options: {
        /** (Required) The type of task object to create.Use the task.TaskType enum to set the value. */
        taskType: task.tasktype
        /** (Optional) The internal ID (as a number) or script ID (as a string) for the script record.This parameter sets the value for the ScheduledScriptTask.scriptId or 
         * MapReduceScriptTask.scriptId property.Only applicable when taskType is set to SCHEDULED_SCRIPT or MAP_REDUCE. */
        scriptId: number | string
        /** (Optional) The internal ID (as a number) or script ID (as a string) of the script deployment record.This parameter sets the value for the ScheduledScriptTask.deploymentId 
         * or MapReduceScriptTask.deploymentId property.Only applicable when taskType is set to SCHEDULED_SCRIPT or MAP_REDUCE. */
        deploymentId: number | string
        /** (Optional) An object that represents key/value pairs that override static script parameter field values on the script deployment record.Use these parameters 
         * for the task object to programmatically pass values to the script deployment. For more information about script parameters, see Creating Script Parameters Overview.
         * For Workflow tasks, keys can include fields on the Workflow Definition Page or workflow and state Workflow Custom Fields.This parameter sets the value for the 
         * ScheduledScriptTask.params, MapReduceScriptTask.params or WorkflowTriggerTask.params property.Only applicable when taskType is set to SCHEDULED_SCRIPT, MAP_REDUCE or WORKFLOW_TRIGGER. */
        params: object
        /** (Optional) A CSV file to import. Use a file.File object or a string that represents the CSV text to be imported.This parameter sets the value for the CsvImportTask.importFile 
         * property.Only applicable when taskType is set to CSV_IMPORT. */
        importFile: file.file
        /** (Optional) The internal ID (as a number) or script ID (as a string) of a saved import map that you created when you ran the Import Assistant. See task.CsvImportTask.
         * This parameter sets the value for the CsvImportTask.mappingId property.Only applicable when taskType is set to CSV_IMPORT. */
        mappingId: number | string
        /** (Optional) Overrides the Queue Number property under Advanced Options on the Import Options page of the Import Assistant. Use this property to programmatically select an import queue 
         * and improve performance during the import. This parameter sets the value for the CsvImportTask.queueId property.Only applicable when taskType is set to CSV_IMPORT. */
        queueId: number
        /** (Optional) The name for the CSV import task.You can optionally set a different name for a scripted import task. In the UI, this name appears on the CSV Import Job Status page.
         * This parameter sets the value for the CsvImportTask.name property.Only applicable when taskType is set to CSV_IMPORT. */
        name: string
        /** (Optional) A map of key/value pairs that sets the data to be imported in a linked file for a multi-file import job, by referencing a file in the file cabinet or
         *  the raw CSV data to import.The key is the internal ID of the record sublist for which data is being imported and the value is either a file.File object or the raw 
         * CSV data to import.You can assign multiple types of values to the linkedFiles property.This parameter sets the value for the CsvImportTask.linkedFiles property.
         * Only applicable when taskType is set to CSV_IMPORT. */
        linkedFiles: object
        /** (Optional) Sets the type of entity on which you want to merge duplicate records.This parameter sets the value for the EntityDeduplicationTask.entityType property.
         * Only applicable when taskType is set to ENTITY_DEDUPLICATION.Use the task.DedupeEntityType enum to set the value.If you set entityType to CUSTOMER, 
         * the system will automatically include prospects and leads in the task request. */
        entityType: string
        /** (Optional) When you merge duplicate records, you can delete all duplicates for a record or merge information from the duplicate records into the master record.
         * Use this property to set the ID of the master record that you want to use as the master record in the merge.You must also select SELECT_BY_ID for the 
         * EntityDeduplicationTask.masterSelectionMode property, or NetSuite ignores this setting.This parameter sets the value for the EntityDeduplicationTask.masterRecordId property.
         * Only applicable when taskType is set to ENTITY_DEDUPLICATION. */
        masterRecordId: number
        /** (Optional) When you merge duplicate records, you can delete all duplicates for a record or merge information from the duplicate records into the master record.
         * Set this property to determine which of the duplicate records to keep or select the master record to use by ID.This parameter sets the value for the 
         * EntityDeduplicationTask.masterSelectionMode property.Only applicable when taskType is set to ENTITY_DEDUPLICATION.Use the task.MasterSelectionMode enum to set the value. */
        masterSelectionMode: string
        /** (Optional) Sets the mode in which to merge or delete duplicate records.This parameter sets the value for the EntityDeduplicationTask.dedupeMode property.
         * Only applicable when taskType is set to ENTITY_DEDUPLICATION.Use the task.DedupeMode enum to set the value. */
        dedupeMode: string
        /** (Optional) The number array of record internal IDs to perform the merge or delete operation on.You can use the search.duplicates(options) method to identify duplicate records
         *  or create an array with record internal IDs.This parameter sets the value for the EntityDeduplicationTask.recordIds property.
         * Only applicable when taskType is set to ENTITY_DEDUPLICATION. */
        recordIds: number[]
        /** (Optional) The record type of the workflow definition base record, such as customer, salesorder, or lead.In the Workflow Manager, this is the record type that is specified 
         * in the Record Type field.This parameter sets the value for the WorkflowTriggerTask.recordType property.Only applicable when taskType is set to WORKFLOW_TRIGGER. */
        recordType: string
        /** (Optional) The internal ID of the base record.This parameter sets the value for the WorkflowTriggerTask.recordId property.Only applicable when taskType is set to WORKFLOW_TRIGGER. */
        recordId: number
        /** (Optional) The internal ID (as a number) or script ID (as a string) for the workflow definition.This is the ID that appears in the ID field on the Workflow Definition Page.
         * This parameter sets the value for the WorkflowTriggerTask.workflowId property.Only applicable when taskType is set to WORKFLOW_TRIGGER. */
        workflowId: number | string
    }) : N_task.ScheduledScriptTask | N_task.MapReduceScriptTask | N_task.CsvImportTask | N_task.EntityDeduplicationTask | N_task.WorkflowTriggerTask
    /**
    * Returns a task status object associated with a specific task ID.
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43726
    */
    checkStatus(options: {
        /** (Required) Unique ID for the task that was generated by task.create(options). */
        taskId: N_task.ScheduledScriptTask | N_task.MapReduceScriptTask | N_task.CsvImportTask | N_task.EntityDeduplicationTask | N_task.WorkflowTriggerTask
    }) : N_task.ScheduledScriptTaskStatus | N_task.MapReduceScriptTaskStatus | N_task.CsvImportTaskStatus | N_task.EntityDeduplicationTaskStatus | N_task.WorkflowTriggerTaskStatus
  
    /**
     * Enumeration that holds the string values for the types of task objects supported by the N/task Module, that you can create with task.create(options).
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43727
     */
    TaskType: {
        SCHEDULED_SCRIPT
        MAP_REDUCE
        CSV_IMPORT
        ENTITY_DEDUPLICATION
        WORKFLOW_TRIGGER
    }
    /**
     * Enumeration that holds the string values for the possible status of tasks created and submitted with the N/task Module.
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43728
     */
    TaskStatus: {
        PENDING
        PROCESSING
        COMPLETE
        FAILED
    }
    /**
     * Enumeration that holds the string values for supported master selection modes when merging duplicate records with task.EntityDeduplicationTask.
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43729
     */
    MasterSelectionMode: {
        CREATED_EARLIEST
        MOST_RECENT_ACTIVITY
        MOST_POPULATED_FIELDS
        SELECT_BY_ID
    }
    /**
     * Enumeration that holds the string values for the available deduplication modes when merging duplicate records with task.EntityDeduplicationTask.
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43730
     */
    DedupeMode: {        
        MERGE
        DELETE
        MAKE_MASTER_PARENT
        MARK_AS_NOT_DUPES
    }
    /**
     * Enumeration that holds the string values for entity types for which you can merge duplicate records with task.EntityDeduplicationTask
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43731
     */
    DedupeEntityType: {
        CUSTOMER
        CONTACT
        VENDOR
        PARTNER
        LEAD
        PROSPECT
    }
    /**
     * Enumeration that holds the string values for possible stages in task.MapReduceScriptTask for a map/reduce script.
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43732
     */
    MapReduceStage: {        
        GET_INPUT
        MAP
        SHUFFLE
        REDUCE
        SUMMARIZE
    }
}

declare namespace N_task {
    /**
    * Encapsulates all the properties of scheduled script task in SuiteScript. Use this object to place a scheduled script deployment into the NetSuite scheduling queue.
    * @Supported Client scripts
    * @Since Version 2015 Release 2
    * @link https://netsuite.custhelp.com/app/answers/detail/a_id/44131
    */
    export interface ScheduledScriptTask {
        /** Internal ID (as a number), or script ID (as a string), for the script record associated with a task.ScheduledScriptTask object. */
        scriptId: number | string
        /** Internal ID (as a number), or script ID (as a string), for the script deployment record associated with a task.ScheduledScriptTask Object. */
        deploymentId: number | string
        /** Object with key/value pairs that override static script parameter field values on the script deployment. */
        params: object

        /**
        * Directs NetSuite to place a scheduled script deployment into the NetSuite scheduling queue and returns a unique ID for the task. Scheduled scripts must meet the following requirements:
        * The scheduled script must have a status of Not Scheduled on the Script Deployment page. If the script status is set to Testing on the Script Deployment page, 
        * this method will not place the script into the scheduling queue.If the deployment status on the Script Deployment page is set to Scheduled, 
        * the script will be placed into the queue according to the time(s) specified on the Script Deployment page.
        * @Supported Server-side scripts
        * @Governance 20 units
        * @Since Version 2015 Release 2
        * @Throws FAILED_TO_​SUBMIT_​JOB_​REQUEST_​1 > Failed to submit job request: [reason]
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43965/related/1
        */
        submit(): string
    }
    /**
     * Encapsulates the properties and status of a scheduled script placed into the NetSuite scheduling queue.
     * @Supported Server-side scripts
     * @Since Version 2015 Release 2
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43717
     */
    export interface ScheduledScriptTaskStatus {
        /** (read-only) Internal ID for a script record associated with a specific task.ScheduledScriptTask Object.
         * Use this ID to get more details about the script record for the scheduled task. */
        scriptId: number
        /** (read-only) Internal ID for a script deployment record associated with a specific task.ScheduledScriptTask Object. */
        deploymentId: number
        /** (read-only) Status for a scheduled script task. Returns a task.TaskStatus enum value. */
        status: N_task.TaskStatus
    }
    /**
    * Encapsulates the properties required to run a map/reduce script in NetSuite. Use this object to place a map/reduce script deployment into the NetSuite task queue.
    * @Supported Server-side scripts
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43718
    */
    export interface MapReduceScriptTask {
        /** Internal ID (as a number), or script ID (as a string), for the map/reduce script record */
        scriptId: number | string
        /** Internal ID (as a number) or script ID (as a string), for the script deployment record for a map/reduce script. */
        deploymentId: number | string
        /** Object that represents key/value pairs that override static script parameter field values on the script deployment record. */
        params: object
        /**
        * Directs NetSuite to place a map/reduce script deployment into the NetSuite task queue and returns a unique ID for the task.For more information, see task.MapReduceScriptTask.
        * @Supported Server-side scripts
        * @Governance 20 units
        * @Since Version 2015 Release 2
        * @Throws FAILED_TO_​SUBMIT_​JOB_​REQUEST_​1 > Failed to submit job request: 
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43837/related/1
        */
        submit() : string
    }
    /**
    * Encapsulates the properties and status of a map/reduce script deployment placed into the NetSuite task queue.
    * Use task.checkStatus(options) with the unique ID for the map/reduce script task to get the MapReduceScriptTaskStatus object.
    * @Supported Server-side scripts
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43719
    */
    export interface MapReduceScriptTaskStatus {
        /** (read-only) Internal ID for a map/reduce script record associated with a specific task.MapReduceScriptTask. */
        scriptId: number
        /** (read-only) Internal ID for a script deployment record associated with a specific task.MapReduceScriptTask. */
        deploymentId: number
        /** (read-only) Status for a Map/Reduce script task. Returns a task.TaskStatus enum value. */
        status: N_task.TaskStatus
        /** Current stage of processing for a Map/Reduce script task. See task.MapReduceStage for supported values. */
        stage: N_task.MapReduceStage
        /**
        * Returns the current percentage complete for the current stage of a task.MapReduceScriptTask.Use the MapReduceScriptTaskStatus.stage property to get the current stage.
        * The input and summarize stages are either 0% or 100% complete at any time.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43890/kw/MapReduceScriptTaskStatus.getPercentageCompleted()
        */
        getPercentageCompleted() : number
        /**
        * Returns the total number of records or rows not yet processed by the map stage of a task.MapReduceScriptTask.Use the MapReduceScriptTaskStatus.stage property to get the current stage.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43844/kw/MapReduceScriptTaskStatus.getPendingMapCount()
        */
        getPendingMapCount() : number
        /**
        * Returns the total number of records or rows passed as input to the map stage of a task.MapReduceScriptTask.Use the MapReduceScriptTaskStatus.stage property to get the current stage.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43941/kw/MapReduceScriptTaskStatus.getTotalMapCount()
        */
        getTotalMapCount() : number
        /**
        * Returns the total number of bytes not yet processed by the map stage, as a component of total size, of a task.MapReduceScriptTask.
        * Use the MapReduceScriptTaskStatus.stage property to get the current stage.
        * @Supported Server-side scripts
        * @Governance 25 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43873/kw/MapReduceScriptTaskStatus.getPendingMapSize()
        */
        getPendingMapSize() : number
        /**
        * Returns the total number of records or rows not yet processed by the reduce stage of a task.MapReduceScriptTask.
        * Use the MapReduceScriptTaskStatus.stage property to get the current stage.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43824/kw/MapReduceScriptTaskStatus.getPendingReduceCount()
        */
        getPendingReduceCount() : number
        /**
        * Returns the total number of record or row inputs to the REDUCE phase of a task.MapReduceScriptTask.
        * Use the MapReduceScriptTaskStatus.stage property to get the current stage.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43919/kw/MapReduceScriptTaskStatus.getTotalReduceCount()
        */
        getTotalReduceCount() : number
        /**
        * Returns the total number of bytes not yet processed by the reduce stage, as a component of total size, of a task.MapReduceScriptTask.
        * Use the MapReduceScriptTaskStatus.stage property to get the current stage.
        * @Supported Server-side scripts
        * @Governance 25 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43845/kw/MapReduceScriptTaskStatus.getPendingReduceSize()
        */
        getPendingReduceSize() : number
        /**
        * Returns the total number of records or rows not yet processed by a task.MapReduceScriptTask.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43825/kw/MapReduceScriptTaskStatus.getPendingOutputCount()
        */
        getPendingOutputCount() : number
        /**
        * Returns the total size in bytes of all key/value pairs written as output, as a component of total size, by a task.MapReduceScriptTask.
        * @Supported Server-side scripts
        * @Governance 25 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43929/kw/MapReduceScriptTaskStatus.getPendingOutputSize()
        */
        getPendingOutputSize() : number
        /**
        * Returns the total number of records or rows passed as inputs to the output phase of a task.MapReduceScriptTask.
        * Use the MapReduceScriptTaskStatus.stage property to get the current stage.
        * @Supported Server-side scripts
        * @Governance 10 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43815/kw/MapReduceScriptTaskStatus.getTotalOutputCount()
        */
        getTotalOutputCount() : number
        /**
        * Returns the total size in bytes of all stored work in progress by a task.MapReduceScriptTask.
        * @Supported Server-side scripts
        * @Governance 25 units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43866/kw/MapReduceScriptTaskStatus.getCurrentTotalSize()
        */
        getCurrentTotalSize() : number
    }
    /**
    * Encapsulates the properties of a CSV import task. Use the methods and properties for this object to submit a CSV import 
    * task into the task queue and asynchronously import record data into NetSuite.
    * @Supported Server-side scripts
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43720/kw/task.CsvImportTask
    */
    export interface CsvImportTask {
        /** CSV file to import. Use a file.File object or a string that represents the CSV text to be imported. */
        importFile: N_file.File | string
        /** Script ID or internal ID of the saved import map that you created when you ran the Import Assistant. See task.CsvImportTask. */
        mappingId: number | string
        /** Overrides the Queue Number property under Advanced Options on the Import Options page of the Import Assistant. 
         * Use this property to programmatically select an import queue and improve performance during the import. */
        queueId: number
        /** Name for the CSV import task.
            You can optionally set a different name for a scripted import task. In the UI, this name appears on the CSV Import Job Status page */
        name: string 
        /** A map of key/value pairs that sets the data to be imported in a linked file for a multi-file import job, by referencing a file in the file cabinet or the raw CSV data to import. 
         * The key is the internal ID of the record sublist for which data is being imported and the value is either a file.File object or the raw CSV data to import.  */
        linkedFiles: object
        /**
        * Directs NetSuite to place a CSV import task into the NetSuite task queue and returns a unique ID for the task. Use CsvImportTaskStatus.status to view the status of a submitted task.This method throws errors resulting from inline validation of CSV file data before the import of data begins (the same validation that is performed between the mapping step and the save step in the Import Assistant). Any errors that occur during the import job are recorded in the CSV response file, as they are for imports initiated through the Import Assistant.
        * @Supported Server-side scripts
        * @Governance 100 units
        * @Since Version 2015 Release 2
        * @Throws FAILED_TO_​SUBMIT_​JOB_​REQUEST_​1 > Failed to submit job request: [reason]
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43991/kw/task.CsvImportTask/related/1
        */
        submit() : string
    }
    /**
    * Encapsulates the status of a CSV import task placed into the NetSuite scheduling queue.
    * @Supported Server-side scripts
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43721/kw/task.CsvImportTaskStatus
    */
    export interface CsvImportTaskStatus {
        /** Status for a CSV import task. Returns a task.TaskStatus enum value. */
        //status: N_task.TaskStatus 
        status: TaskStatus 
    }
    /**
    * Encapsulates all the properties of a merge duplicate records task request.
    * @Supported Server-side scripts
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43722/kw/task.EntityDeduplicationTask
    */
    export interface EntityDeduplicationTask {
        /** Sets the type of entity on which you want to merge duplicate records. Use a task.DedupeEntityType enum value to set the value. */
        entityType: N_task.DedupeEntityType
        /** Use this property to set the ID of the master record that you want to use as the master record in the merge. */
        masterRecordId: number 
        /** Set this property to determine which of the duplicate records to keep or select the master record to use by ID. */
        masterSelectionMode: N_task.MasterSelectionMode
        /** Sets the mode in which to merge or delete duplicate records. Use a EntityDeduplicationTask.dedupeMode enum value to set the value. */
        dedupeMode: N_task.DedupeMode
        /** Number array of record internal IDs to perform the merge or delete operation on.
        You can use the search.duplicates(options) method to identify duplicate records or create an array with record internal IDs. */
        recordIds: number[] 
        /**
        * Directs NetSuite to place the merge duplicate records task into the NetSuite task queue and returns a unique ID for the task.
        * Use EntityDeduplicationTaskStatus.status to view the status of a submitted task.
        * @Supported Server-side scripts
        * @Governance 100 units
        * @Since Version 2015 Release 2
        * @Throws FAILED_TO_​SUBMIT_​JOB_​REQUEST_​1 > Failed to submit job request: [reason]
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43934/kw/task.EntityDeduplicationTask/related/1
        */
        submit() : string
    }
    /**
    * Encapsulates the status of a merge duplicate record task placed into the NetSuite task queue by EntityDeduplicationTask.submit().
    * Use task.checkStatus(options) with the unique ID for the merge duplicate records task to get this Object.
    * @Supported Server-side scripts
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43723/kw/EntityDeduplicationTaskStatus
    */
    export interface EntityDeduplicationTaskStatus {
        /** (read-only) Status for a merge duplicate record task. Returns a task.TaskStatus enum value. */
        status: N_task.TaskStatus
    }
    /**
    * Encapsulates all the properties required to asynchronously initiate a workflow. Use the WorkflowTriggerTask Object to create a task that initiates an instance of the specified workflow.
    * @Supported Server-side scripts
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43724
    */
    export interface WorkflowTriggerTask {
        /** Record type of the workflow definition base record. For example, customer, salesorder, or lead.
        In the Workflow Manager, this is the record type that is specified in the Record Type field. */
        recordType: string 
        /** Internal ID of the base record */
        recordId: number
        /** Internal ID (as a number), or script ID (as a string), for the workflow definition.
        This is the ID that appears in the ID field on the Workflow Definition Page. */
        workflowId: number | string
        /** Object that contains key/value pairs to set default values on fields specific to the workflow.
        These can include fields on the Workflow Definition Page or workflow and state Workflow Custom Fields. */
        params: object
        /**
        * Directs NetSuite to place the asynchronous workflow initiation task into the NetSuite scheduling queue and returns a unique ID for the task.
        * Use WorkflowTriggerTaskStatus.status to view the status of a submitted task.
        * @Supported Server-side scripts
        * @Governance 20 units
        * @Since Version 2015 Release 2
        * @Throws FAILED_TO_​SUBMIT_​JOB_​REQUEST_​1 > Failed to submit job request: [reason]
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43943/related/1
        */
        submit() : string
    }
    /**
    * Encapsulates the status of an asynchronous workflow initiation task placed into the NetSuite task queue by WorkflowTriggerTask.submit().
    * Use task.checkStatus(options) with the unique ID for the asynchronous workflow initiation task to get the WorkflowTriggerTaskStatus object.
    * @Supported Server-side scripts
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43725
    */
    export interface WorkflowTriggerTaskStatus {
        /** Status for an asynchronous workflow placed in the NetSuite task queue by WorkflowTriggerTask.submit(). Returns a task.TaskStatus enum value. */
        status: N_task.TaskStatus
    }
}