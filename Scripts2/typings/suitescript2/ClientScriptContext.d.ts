declare namespace ClientScriptContext {

    export interface fieldChanged {
        /**
         * The current form record.
         */
        currentRecord: N_currentRecord.CurrentRecord
        /**
         * The sublist ID name.
         */
        sublistId: string
        /**
         * The field ID name.
         */
        fieldId: string
        /**
         * The line number (zero-based index) if the field is in a sublist or a matrix.
         */
        line: string
        /**
         * The column number (zero-based index) if the field is in a matrix.
         */
        column: string
    }

    export interface lineInit {
        /**
         * The current form record.
         */
        currentRecord: N_currentRecord.CurrentRecord
        /**
         * The sublist ID name.
         */
        sublistId: string
    }

    export interface pageInit {
        /**
         * The current form record.
         */
        currentRecord: N_currentRecord.CurrentRecord
        /**
         * The mode in which the record is being accessed. The mode can be set to one of the following values: copy, create, edit
         */
        mode: string
    }

    export interface postSourcing {
        /**
         * The current form record.
         */
        currentRecord: N_currentRecord.CurrentRecord
        /**
         * The sublist ID name.
         */
        sublistId: string
        /**
         * The field ID name.
         */
        fieldId: sting
    }

    export interface saveRecord {
        /**
         * The current form record.
         */
        currentRecord: N_currentRecord.CurrentRecord
    }

    export interface sublistChanged {
        /**
         * The current form record.
         */
        currentRecord: N_currentRecord.CurrentRecord
        /**
         * The sublist ID name.
         */
        sublistId: string
    }

    export interface validateDelete {
        /**
         * The current form record.
         */
        currentRecord: N_currentRecord.CurrentRecord
        /**
         * The sublist ID name.
         */
        sublistId: string
    }

    export interface validateField {
        /**
         * The current form record.
         */
        currentRecord: N_currentRecord.CurrentRecord
        /**
         * The sublist ID name.
         */
        sublistId: string
        /**
         * The field ID name.
         */
        fieldId: string
        /**
         * The line number (zero-based index) if the field is in a sublist or a matrix.
         */
        line: string
        /**
         * The column number (zero-based index) if the field is in a matrix.
         */
        column: string
    }

    export interface validateInsert {
        /**
         * The current form record.
         */
        currentRecord: N_currentRecord.CurrentRecord
        /**
         * The sublist ID name.
         */
        sublistId: string
    }

    export interface validateLine {
        /**
         * The current form record.
         */
        currentRecord: N_currentRecord.CurrentRecord
        /**
         * The sublist ID name.
         */
        sublistId: string
    }

}
