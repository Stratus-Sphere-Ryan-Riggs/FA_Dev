/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for all KBS modules.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        './KBS_Constants',
        './KBS_Dialog',
        './KBS_Entity',
        './KBS_File',
        './KBS_Form',
        './KBS_Format',
        './KBS_Query',
        './KBS_Record',
        './KBS_Script',
        './KBS_Search',
        './KBS_String',
        './KBS_Task',
        './KBS_Transaction',
        './KBS_User'
    ],
    (
        KBS_Constants,
        KBS_Dialog,
        KBS_Entity,
        KBS_File,
        KBS_Form,
        KBS_Format,
        KBS_Query,
        KBS_Record,
        KBS_Script,
        KBS_Search,
        KBS_String,
        KBS_Task,
        KBS_Transaction,
        KBS_User
) => {
        return {
            Constants: KBS_Constants,
            Dialog: KBS_Dialog,
            Entity: KBS_Entity,
            File: KBS_File,
            Form: KBS_Form,
            Format: KBS_Format,
            Query: KBS_Query,
            Record: KBS_Record,
            Script: KBS_Script,
            Search: KBS_Search,
            String: KBS_String,
            Task: KBS_Task,
            Transaction: KBS_Transaction,
            User: KBS_User
        };
    }
);