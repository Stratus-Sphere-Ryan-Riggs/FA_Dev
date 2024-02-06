/**
 * You use the currentRecord module to access the record that is active in the current client-side context.
 * You can use this module in Entry Point Client Scripts and Client-side custom modules.
 * Like the N/record Module, the currentRecord module provides access to body and sublist fields. However, the record module is recommended for server scripts and for cases where a client-side script needs to interact with a record other than the currently active record.
 * By contrast, the currentRecord module is recommended for client-side scripts that need to interact with the currently active record.
 * Additionally, the functionality of the two modules varies slightly.
 * For example, the currentRecord module does not permit the editing of subrecords, although subrecords can be retrieved in view mode.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51496
 */
declare interface N_currentRecord {
    /**
    * Retrieves a currentRecord object that represents the record active on the current page.
    * @Supported Client scripts
    * @Governance None
    * @Since Version 2016 Release 2
    * @Throws CANNOT_CREATE_​RECORD_​INSTANCE > The current record page is not scriptable or an error occurred while creating the record object.
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51539
    */
    get: {
        (): N_currentRecord.CurrentRecord,
        /**
        * Retrieves promise for a currentRecord object that represents the record active on the current page.
        * @Supported Client Scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws CANNOT_CREATE_​RECORD_​INSTANCE > The current record page is not scriptable or an error occurred while creating the record object.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51540
        */
        promise(): Promise<void>
    }
}

declare namespace N_currentRecord {
    /**
     * Encapsulates the record active on the current page.
     * @Supported: Client Scripts
     * @Since Version 2016 Release 2
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51541
     */
    export interface CurrentRecord {
        /**
         * The internal ID of a specific record.
         * @Since Version 2016 Release 2
         * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51501/related/1
         */
        id: number
        /**
        * Indicates whether the record is in dynamic mode.
        * This value is set when the record is created or accessed.
        * @Since Version 2016 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51500/related/1
        */
        isDynamic: boolean
        /**
         * The record type.
         * This value is set with the record.Type enum during record creation.
         * @Since Version 2016 Release 2
         * https://netsuite.custhelp.com/app/answers/detail/a_id/51499/related/1
         */
        type: string

        /**
        * Cancels the currently selected line on a sublist.
        * @Supported Client Scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51497 
        */
        cancelLine(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
        }): N_currentRecord.CurrentRecord;
        /**
        * Commits the currently selected line on a sublist.
        * @Supported Client Scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51498
        */
        commitLine(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
        }): N_currentRecord.CurrentRecord;
        /**
        * Returns the line number of the first instance where a specified value is found in a specified column of the matrix.
        * @Supported Client Scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51538
        */
        findMatrixSublistLineWithValue(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
            /** (required) The ID of the matrix field. */
            fieldId: string
            /** (required) The value to search for. */
            value: number
            /** (required) The column number of the field. */
            column: number
        }): number;
        /**
        * Returns the line number for the first occurrence of a field value in a sublist.
        * @Supported Client Scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51537
        */
        findSublistLineWithValue(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (optional) The value to search for. */
            value: number | Date | string | array | boolean
        }): number;
        /**
        * Gets the value for the currently selected line in the matrix.
        * @Supported Client Scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51536
        */
        getCurrentMatrixSublistValue(options: {
            /** (required) The internal ID of the sublist that contains the matrix. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the matrix field. */
            column: number
        }): number | Date | string | array | boolean;
        /**
        *Returns the line number of the currently selected line.
        * @Supported Client Scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51535
        */
        getCurrentSublistIndex(options: {
	        /** (required) The internal ID of the sublist. */
            sublistId: string
        }): number;
        /**
        * Gets the subrecord for the associated sublist field on the current line.
        * The subrecord object is retrieved in view mode.
        * @Supported Client Scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws 
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51534
        */
        getCurrentSublistSubrecord(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
        }): N_currentRecord.CurrentRecord;
        /**
        * Returns a text representation of the field value in the currently selected line.
        * @Supported Client Scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51533
        */
        getCurrentSublistText(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
        }): string;
        /**
        * Returns the value of a sublist field on the currently selected sublist line.
        * @Supported Client Scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51532
        */
        getCurrentSublistValue(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
        }): number | Date | string | array | boolean;
        /**
        * Returns a field object from a record.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51531
        */
        getField(options: {
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
        }): N_currentRecord.Field;
        /**
        * Returns the number of lines in a sublist.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51530
        */
        getLineCount(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
        }): number;
        /**
        * Returns the number of columns for the specified matrix.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51529
        */
        getMatrixHeaderCount(options: {
            /** (required) The internal ID of the sublist that contains the matrix. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
        }): number;
        /**
        * Gets the field for the specified header in the matrix.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51528
        */
        getMatrixHeaderField(options: {
            /** (required) The internal ID of the sublist that contains the matrix. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. */
            column: number
        }): N_record.Field;
        /**
        * Gets the value for the associated header in the matrix.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51527
        */
        getMatrixHeaderValue(options: {
            /** (required) The internal ID of the sublist that contains the matrix. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. */
            column: number
        }): number | Date | string | array | boolean;
        /**
        * Gets the field for the specified sublist in the matrix.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51526
        */
        getMatrixSublistField(options: {
            /** (required) The internal ID of the sublist that contains the matrix. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. */
            column: number
            /** (required) The line number for the field. */
            line: number
        }): N_record.Field;
        /**
        * Gets the value for the associated field in the matrix.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51525
        */
        getMatrixSublistValue(options: {
            /** (required) The internal ID of the sublist that contains the matrix. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. */
            column: number
            /** (required) The line number for the field. */
            line: number
        }): N_record.Field;
        /**
        * Returns the specified sublist.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51524
        */
        getSublist(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
        }): N_record.Sublist;
        /**
        * Returns a field object from a sublist.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51523
        */
        getSublistField(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The line number for the field. */
            line: number
        }): N_currentRecord.Field;
        /**
        * Returns the value of a sublist field in a text representation.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51522
        */
        getSublistText(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The line number for the field. */
            line: number
        }): string;
        /**
        * Returns the value of a sublist field.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51521
        */
        getSublistValue(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The line number for the field. */
            line: number
        }): number | Date | string | array | boolean;
        /**
        * Gets the subrecord associated with the field. The subrecord object is available in view mode.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_REQD_ARGUMENT > A required argument is missing or undefined.
        * @Throws FIELD_1_IS_NOT_A_SUBRECORD_FIELD > The specified field is not a subrecord field.
        * @Throws FIELD_1_IS_​DISABLED_​YOU_​CANNOT_​APPLY_​SUBRECORD_​OPERATION_​ON_​THIS_​FIELD > The specified field is disabled.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51520
        */
        getSubrecord({
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
        }): N_currentRecord.CurrentRecord;
        /**
        * Returns the text representation of a field value.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51519
        */
        getText(options: {
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
        }) : string
        /**
        * Returns the value of a field.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51518
        */
        getValue(options: {
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
        }) : number | Date | string | array | boolean
        /**
        * Returns a value indicating whether the associated sublist field has a subrecord on the current line.
        * This method can only be used on dynamic records.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51517
        */
        hasCurrentSublistSubrecord(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
            /** (required) The internal ID of a subrecord. */
            fieldId: string
        }) : boolean
        /**
        * Returns a value indicating whether the associated sublist field contains a subrecord.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51516
        */
        hasSublistSubrecord(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
            /** (required) The internal ID of a subrecord. */
            fieldId: string
            /** (required) The line number for the field. */
            line: number
        }) : boolean
        /**
        * Returns a value indicating whether the field contains a subrecord.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51515
        */
        hasSubrecord(options: {
            /** (required) The internal ID of the field that may contain a subrecord. */
            fieldId: string
        }) : boolean
        /**
        * Inserts a sublist line.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51514
        */
        insertLine(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
            /** (required) The line number to insert. */
            line: number
            /** (optional) If set to true, scripting recalculation is ignored.The default value is false. */
            ignoreRecalc: boolean
        }) : currentRecord.CurrentRecord
        /**
        * Removes the subrecord for the associated sublist field.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51513
        */
        removeCurrentSublistSubrecord(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
        }) : currentRecord.CurrentRecord
        /**
        * Removes a sublist line.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51512
        */
        removeLine(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The line number of the sublist to remove. */
            line: number
            /** (optional) If set to true, scripting recalculation is ignored.The default value is false. */
            ignoreRecalc: boolean
        }) : currentRecord.CurrentRecord
        /**
        * Removes the subrecord for the associated field.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51511
        */
        removeSubrecord(options: {
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
        }) : currentRecord.CurrentRecord
        /**
        * Selects an existing line in a sublist.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51510
        */
        selectLine(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
            /** (required) The line number to select in the sublist. */
            line: number
        }) : currentRecord.CurrentRecord
        /**
        * Selects a new line at the end of a sublist.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Throws SSS_INVALID_​SUBLIST_​OPERATION > A required argument is invalid or the sublist is not editable.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51509
        */
        selectNewLine(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
        }) : currentRecord.CurrentRecord
        /**
        * Sets the value for the line currently selected in the matrix.This method is not available for standard records.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws INVALID_FLD_VALUE > The options.value type does not match the field type.
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51508
        */
        setCurrentMatrixSublistValue(options: {
            /** (required) The internal ID of the sublist that contains the matrix. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. */
            column: number
            /** (required) The value to set the field to.The value type must correspond to the field type being set. 
             * For example:Text, Radio and Select fields accept string values.
             * Checkbox fields accept Boolean values.
             * Date and DateTime fields accept Date values.
             * Integer, Float, Currency and Percent fields accept number values.
             */
            value: number | Date | string | array | boolean
            /** (optional) If set to true, the field change and slaving event is ignored.By default, this value is false. */
            ignoreFieldChange: boolean
            /** (optional) Indicates whether to perform slaving synchronously.By default, this value is false. */
            fireSlavingSync: boolean
        }) : currentRecord.CurrentRecord
        /**
        * Sets the value for the field in the currently selected line by a text representation.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_REQD_ARGUMENT > A required argument is missing or undefined.
        * @Throws A_SCRIPT_IS_​ATTEMPTING_​TO_​EDIT_​THE_​1_​SUBLIST_​THIS_​SUBLIST_​IS_​CURRENTLY_​IN_​READONLY_​MODE_​AND_​CANNOT_​BE_​EDITED_​CALL_​YOUR_​NETSUITE_​ADMINISTRATOR_​TO_​DISABLE_​THIS_​SCRIPT_​IF_​YOU_​NEED_​TO_​SUBMIT_​THIS_​RECORD > A user tries to edit a read-only sublist field.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51507
        */
        setCurrentSublistText(options: {
            /** (required) The internal ID of the sublist. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The text to set the value to. */
            text: string
            /** (optional) If set to true, the field change and slaving event is ignored.By default, this value is false. */
            ignoreFieldChange: boolean
            /** (optional) Indicates whether to perform slaving synchronously.By default, this value is false. */
            fireSlavingSync: boolean
        }) : currentRecord.CurrentRecord
        /**
        * Sets the value for the field in the currently selected line.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws INVALID_FLD_VALUE > The options.value type does not match the field type.
        * @Throws SSS_MISSING_REQD_ARGUMENT > A required argument is missing or undefined.
        * @Throws A_SCRIPT_IS_​ATTEMPTING_​TO_​EDIT_​THE_​1_​SUBLIST_​THIS_​SUBLIST_​IS_​CURRENTLY_​IN_​READONLY_​MODE_​AND_​CANNOT_​BE_​EDITED_​CALL_​YOUR_​NETSUITE_​ADMINISTRATOR_​TO_​DISABLE_​THIS_​SCRIPT_​IF_​YOU_​NEED_​TO_​SUBMIT_​THIS_​RECORD > A user tries to edit a read-only sublist field.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51506
        */
        setCurrentSublistValue(options: {
            /** (required) The internal ID of the sublist.This value is displayed in the Records Browser. For more information, see Working with the SuiteScript Records Browser. */
            sublistId: string
            /** (required) The internal ID of a standard or custom sublist field. */
            fieldId: string
            /** (required) The value to set the field to.The value type must correspond to the field type being set. 
             * For example:Text, Radio and Select fields accept string values.
             * Checkbox fields accept Boolean values.
             * Date and DateTime fields accept Date values.
             * Integer, Float, Currency and Percent fields accept number values.
             */
            value: boolean
            /** (optional) If set to true, the field change and slaving event is ignored.By default, this value is false. */
            ignoreFieldChange: boolean
            /** (optional) Indicates whether to perform slaving synchronously.By default, this value is false. */
            fireSlavingSync: boolean
        }) : currentRecord.CurrentRecord
        /**
        * Sets the value for the associated header in the matrix.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws INVALID_FLD_VALUE > The options.value type does not match the field type.
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51505
        */
        setMatrixHeaderValue(options: {
            /** (required) The internal ID of the sublist that contains the matrix. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. */
            column: number
            /** (required) The value to set the field to.The value type must correspond to the field type being set. 
             * For example:Text, Radio and Select fields accept string values.
             * Checkbox fields accept Boolean values.
             * Date and DateTime fields accept Date values.
             * Integer, Float, Currency and Percent fields accept number values.
             */
            value: number | date | string | array | boolean
            /** (optional) If set to true, the field change and slaving event is ignored.By default, this value is false. */
            ignoreFieldChange: boolean
            /** (optional) Indicates whether to perform slaving synchronously.By default, this value is false. */
            fireSlavingSync: boolean
        }) : currentRecord.CurrentRecord
        /**
        * Sets the value for the associated field in the matrix.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws INVALID_FLD_VALUE > The options.value type does not match the field type.
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51504
        */
        setMatrixSublistValue(options: {
            /** (required) The internal ID of the sublist that contains the matrix. */
            sublistId: string
            /** (required) The internal ID of the matrix field. */
            fieldId: string
            /** (required) The column number for the field. */
            column: number
            /** (required) The line number for the field. */
            line: number
            /** (required) The value to set the field to.The value type must correspond to the field type being set. For example:Text, Radio and Select fields accept string values.Checkbox fields accept Boolean values.Date and DateTime fields accept Date values.Integer, Float, Currency and Percent fields accept number values. */
            value: number | date | string | array | boolean
        }) : currentRecord.CurrentRecord
        /**
        * Sets the value of the field by a text representation.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51503
        */
        setText(options: {
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
            /** (required) The text to change the field value to. */
            text: string
            /** (optional) If set to true, the field change and slaving event is ignored.By default, this value is false. */
            ignoreFieldChange: boolean
            /** (optional) Indicates whether to perform slaving synchronously.By default, this value is false. */
            fireSlavingSync: boolean
        }) : currentRecord.CurrentRecord
        /**
        * Sets the value of a field.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws INVALID_FLD_VALUE > The options.value type does not match the field type.
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > A required argument is missing or undefined.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51502
        */
        setValue(options: {
            /** (required) The internal ID of a standard or custom body field. */
            fieldId: string
            /** (required) The value to set the field to.The value type must correspond to the field type being set. 
             * For example:Text, Radio, Select and Multi-Select fields accept string values.
             * Checkbox fields accept Boolean values.
             * Date and DateTime fields accept Date values.
             * Integer, Float, Currency and Percent fields accept number values.
             */
            value: number | date | string | array | boolean
            /** (optional) If set to true, the field change and slaving event is ignored.By default, this value is false. */
            ignoreFieldChange: boolean
            /** (optional) Indicates whether to perform slaving synchronously.By default, this value is false. */
            fireSlavingSync: boolean
        }) : currentRecord.CurrentRecord
    }

    /**
     * Encapsulates a body or sublist field on the current record.
     * Use the following methods to access the Field object:
     *   -CurrentRecord.getField(options)
     *   -CurrentRecord.getSublistField(options)
     * @Supported Client Scripts
     * @Since Version 2016 Release 2
     */
    export interface Field {
        /** (read-only) Returns the internal ID of a standard or custom body or sublist field. */
        id: string
        /** Returns true if the standard or custom field is disabled on the record form, or false otherwise. */
        isDisabled: boolean
        /**
        * Returns true if the field is set to display on the record form, or false otherwise.
        * Fields can be a part of a record even if they are not displayed on the record form.
        * This property is read-only for sublist fields. */
        isDisplay: boolean
        /** Returns true if the standard or custom field is mandatory on the record form, or false otherwise. */
        isMandatory: boolean
        /** (read-only) Returns true if the field is a popup list field, or false otherwise. */
        isPopup: boolean
        /**
        * Returns true if the field on the record form cannot be edited, or false otherwise.
        * For textarea fields, this property can be read or written to. For all other fields, this property is read-only. */
        isReadOnly: boolean
        /** (read-only) Returns true if the field is visible on the record form, or false otherwise. */
        isVisible: boolean
        /** (read-only) Returns the UI label for a standard or custom field body or sublist field. */
        label: string
        /** (read-only) Returns the sublist ID for the specified sublist field. */
        sublistId: string
        /** (read-only)  Returns the type of a body or sublist field.
         * For example, the value can return text, date, currency, select, checkbox, and other similar values.*/
        type: string

        /**
        * Returns an array of available options on a standard or custom select, multiselect, or radio field as key-value pairs.
        * Only the first 1,000 available options are returned.
        * This method can only be used in dynamic mode.
        * @Supported Client scripts
        * @Governance None
        * @Since Version 2016 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/62167
        */
        getSelectOptions(options: {
            /** (Required) The search string to filter the select options that are returned.Filter values are case insensitive. */
            filter: string
            /** (Required) The following operators are supported: contains (default), is, startswith */
            operator: string
        }) : array
        /**
        * Inserts an option into certain types of select and multiselect fields.
        * This method is usable only in select and multiselect fields that were added by a front-end Suitelet or beforeLoad user event script.
        * The IDs for these fields always have a prefix of custpage.
        * @Supported Client
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_INVALID_UI_OBJECT_TYPE > A script attempts to use this method on the wrong type of field. This method can be used only on select and multiselect fields whose IDs begin with the prefix custpage.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/61314
        */
        insertSelectOption(options: {
            /** (Required) A string, not visible in the UI, that identifies the option. */
            value: string
            /** (Required) The label that represents the option in the UI. */
            text: string
            /** (Optional) Determines whether the option is selected by default. If not specified, this value defaults to false. */
            isSelected: boolean
        }) : Void
        /**
        * Removes a select option from certain types of select and multiselect fields.
        * This method is usable only in select fields that were added by a front-end Suitelet or beforeLoad user event script.
        * The IDs for these fields always have a prefix of custpage.
        * @Supported Client
        * @Governance None
        * @Since Version 2016 Release 2
        * @Throws SSS_INVALID_UI_OBJECT_TYPE > A script attempts to use this method on the wrong type of field. This method can be used only on select and multiselect fields whose IDs begin with the prefix custpage.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/61315
        */
        removeSelectOption(options: {
            /** (Required) A string, not shown in the UI, that identifies the option.To remove all options from the list, set this field to null */
            value: string
        }) : Void
    }
}
