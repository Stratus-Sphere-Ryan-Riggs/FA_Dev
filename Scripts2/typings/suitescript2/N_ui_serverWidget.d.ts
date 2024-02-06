declare interface N_ui_serverWidget {

    /**Holds the string values for submit actions performed by the user. */
    AssistantSubmitAction: {
        BACK;
        CANCEL;
        FINISH;
        JUMP;
        NEXT;
    }

    /**Enumeration that holds the string values for supported field break types. */
    FieldBreakType: {
        NONE;
        STARTCOL;
        STARTROW;
    }

    /**Enumeration that holds the string values for supported field display types. */
    FieldDisplayType: {
        DISABLED;
        ENTRY;
        HIDDEN;
        INLINE;
        NORMAL;
        READONLY;
    }

    /**Enumeration that holds the string values for the supported types of field layouts.  */
    FieldLayoutType: {
        ENDROW;
        NORMAL;
        MIDROW;
        OUTSIDE;
        OUTSIDEBELOW;
        OUTSIDEABOVE;
        STARTROW;
    }

    /**Enumeration that holds the values for supported field types. */
    FieldType: {
        CHECKBOX;
        CURRENCY;
        DATE;
        DATETIMETZ;
        EMAIL;
        FILE;
        FLOAT;
        HELP;
        INLINEHTML;
        INTEGER;
        IMAGE;
        LABEL;
        LONGTEXT;
        MULTISELECT;
        PASSPORT;
        PERCENT;
        PHONE;
        SELECT;
        RADIO;
        RICHTEXT;
        TEXT;
        TEXTAREA;
        TIMEOFDAY;
        URL;
    }

    /**Enumeration that holds the string values for supported page link types on a form */
    FormPageLinkType: {
        BREADCRUMB;
        CROSSLINK;
    }

    /**Enumeration that holds the string values for supported justification layouts. */
    LayoutJustification: {
        CENTER;
        LEFT;
        RIGHT;
    }

    /**Enumeration that holds the string values for supported list styles. */
    ListStyle: {
        GRID;
        REPORT;
        PLAIN;
        NORMAL;
    }

    /**Enumeration that holds the string values for supported justification layouts. */
    LayoutJustification: {
        CENTER;
        LEFT;
        RIGHT;
    }

    /**Enumeration that holds the string values for valid sublist types. */
    SublistType: {
        EDITOR;
        INLINEEDITOR;
        LIST;
        STATICLIST;
    }
    /**Enumeration that holds the string values for supported sublist display types. */
    SublistDisplayType: {
        HIDDEN;
        NORMAL;
    }
    /**
    * Creates an assistant object.
    * @Supported Suitelets
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43587
    */
    createAssistant(options: {
        /** (required) The title of the assistant. This title appears at the top of all assistant pages. */
        title: string
        /** (optional) Indicates whether to hide the navigation bar menu.By default, set to false. The header appears in the top-right corner on the assistant.If set to true, the header on the assistant is hidden from view. */
        hideNavBar: boolean
    }): N_ui_serverWidget.Assistant

    /**
    * Creates a form object.
    * @Supported Suitelets
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43599
    */
    createForm(options: {
        /** (required) The title of the form. */
        title: string
        /** (optional) Indicates whether to hide the navigation bar menu.By default, set to false. The header appears in the top-right corner on the form.If set to true, the header on the assistant is hidden from view. */
        hideNavBar: boolean
    }): N_ui_serverWidget.Form

    /**
    * Instantiates a standalone list.
    * @Supported Suitelets
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49424
    */
    createList(options: {
        /** (required) The title of the list. */
        title: string
        /** (optional) Indicates whether to hide the navigation bar menu.By default, set to false. The header appears in the top-right corner on the form.If set to true, the header on the assistant is hidden from view. */
        hideNavBar: boolean
    }): N_ui_serverWidget.List

}

declare namespace N_ui_serverWidget {
    interface Assistant {
        /**The file cabinet ID of client script file to be used in this assistant. */
        clientScriptFileId: number
        /**The relative path to the client script file to be used in this assistant. */
        clientScriptModulePath: string
        /**Identifies the current step. */
        currentStep: N_ui_serverWidget.AssistantStep
        /**The error message text. */
        errorHtml: string
        /**The text displayed after an assistant is finished. */
        finishedHtml: string
        /**Indicates whether the Add to Shortcuts Link is displayed in the UI. */
        hideAddToShortcutsLink: boolean
        /**Indicates whether the current and total step numbers are displayed in the UI. */
        hideStepNumber: boolean
        /**Indicates whether assistant steps are ordered or unordered. */
        isNotOrdered: boolean
        /**The title of an assistant. */
        title: string

        /**
        * Adds a field to an assistant.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43609
        */
        addField(options: {
            /** (required) The internal ID for this field. */
            id: string
            /** (required) The label for this field. */
            label: string
            /** (required) The field type. Use the serverWidget.FieldType enum to set this value.If you have set the type parameter to SELECT, and you want to add custom options to the select field, you must set source to NULL. Then, when a value is specified, the value will populate the options from the source. */
            type: string
            /** (optional) The internalId or scriptId of the source list for this field. Use the serverWidget.FieldType enum to set this value.If you want to add custom options on a select field, you must set the source parameter to NULL.After you create a select or multi-select field that is sourced from a record or list, you cannot add additional values with Field.addSelectOption(options). The select values are determined by the source record or list. */
            source: string
            /** (optional) The internal ID of the field group to place this field in. */
            container: string
        }): N_ui_serverWidget.Field

        /**
        * Adds a field group to the assistant.By default, the field group is collapsible and appears expanded on the assistant page. To change this behavior, set the FieldGroup.isCollapsed and FieldGroup.isCollapsible properties.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43610
        */
        addFieldGroup(options: {
            /** (required) The internal ID for the field group. */
            id: string
            /** (required) The label for the field group. */
            label: string
        }): N_ui_serverWidget.FieldGroup

        /**
        * Adds a step to an assistant.If you want to create help text for the step, you can use AssistantStep.helpText on the object returned.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43611
        */
        addStep(options: {
            /** (required) The internal ID for this step (for example, 'entercontacts'). */
            id: string
            /** (required) The label for this step (for example, 'Enter Contacts'). By default, the step appears vertically in the left panel of the assistant. */
            label: string
        }): N_ui_serverWidget.AssistantStep

        /**
        * Adds a sublist to an assistant.Only inline editor sublists are added. Other sublist types are not supported.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43613
        */
        addSublist(options: {
            /** (required) The internal ID for the sublist. */
            id: string
            /** (required) The label for the sublist. */
            label: string
            /** (required) The type of sublist to add. For more information about possible values, see serverWidget.SublistType. */
            type: string
        }): N_ui_serverWidget.Sublist

        /**
        * Returns a field object on an assistant page.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43763
        */
        getField(options: {
            /** (required) The internal ID of the field. */
            id: string
        }): N_ui_serverWidget.Field

        /**
        * Returns a field group on an assistant page.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43764
        */
        getFieldGroup(options: {
            /** (required) The internal ID of the field group. */
            id: string
        }): N_ui_serverWidget.FieldGroup

        /**
        * Retrieves all the internal IDs for field groups in an assistant.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43615
        */
        getFieldGroupIds(): string[]

        /**
        * Gets all the internal IDs for fields in an assistant.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43614
        */
        getFieldIds(): string[]

        /**
        * Gets all field IDs in the assistant field group.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49440
        */
        getFieldIdsByFieldGroup(fieldGroup: string): string[]

        /**
        * Gets the last action taken by the user.To identify the step that the last action came from, use Assistant.getLastStep().
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43619
        */
        getLastAction(): string

        /**
        * Gets the step associated with the last action submitted by the user.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43620
        */
        getLastStep(): N_ui_serverWidget.AssistantStep

        /**
        * Gets the next step corresponding to the user's last submitted action in the assistant.If you need information about the last step, use Assistant.getLastStep() before you use this method.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43621
        */
        getNextStep(): N_ui_serverWidget.AssistantStep

        /**
        * Returns a step in an assistant.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43622
        */
        getStep(options: {
            /** (required) The internal ID of the step. */
            id: string
        }): N_ui_serverWidget.AssistantStep

        /**
        * Gets the total number of steps in an assistant.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43623
        */
        getStepCount(): number

        /**
        * Gets all the steps in an assistant.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43616
        */
        getSteps(): N_ui_serverWidget.AssistantStep[]

        /**
        * Returns a sublist in an assistant.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43765
        */
        getSublist(options: {
            /** (required) The internal ID of the sublist. */
            id: string
        }): N_ui_serverWidget.Sublist

        /**
        * Gets the IDs for all the sublists in an assistant.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43617
        */
        getSublistIds(): string[]

        /**
        * Determine whether an assistant has an error message to display for the current step.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43624
        */
        hasErrorHtml(): boolean

        /**
        * Indicates whether all steps in an assistant are completed.If set to true, the assistant is finished and a completion message displays. To set the text for the completion message, use the Assistant.finishedHtml property.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43625
        */
        isFinished(): boolean

        /**
        * Manages redirects in an assistant.This method also addresses the case in which one assistant redirects to another assistant. In this scenario, the second assistant must return to the first assistant if the user Cancels or Finishes. This method, when used in the second assistant, ensures that users are redirected back to the first assistant.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43626
        */
        sendRedirect(options: {
            /** (required) The response that redirects the user. */
            response: response
        }): void

        /**
        * Defines a splash message.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43633
        */
        setSplash(options: {
            /** (required) The title of the splash screen. */
            title: string
            /** (required) Text for the splash screen */
            text1: string
            /** (optional) Text for a second column on the splash screen, if desired. */
            text2: string
        }): void

        /**
        * Sets the default values of an array of fields that are specific to the assistant.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43628
        */
        updateDefaultValues(values: object[]): void

    }

    interface AssistantStep {
        /**The help text for a step. */
        helpText: string
        /**The internal ID of the step. */
        id: string
        /**The label for a step. */
        label: string
        /**Indicates where this step appears sequentially in an assistant. */
        stepNumber: number

        /**
        * Gets the IDs for all the fields in a step.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/61150
        */
        getFieldIds(): string[]

        /**
        * Gets the number of lines on a sublist in a step.The first line number on a sublist is 0 (not 1).
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43638
        */
        getLineCount(options: {
            /** (required) The sublist internal ID. */
            group: string
        }): number

        /**
        * Gets the number of lines on a sublist in a step.The first line number on a sublist is 0 (not 1).
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43638
        */
        getLineCount(options: {
            /** (required) The sublist internal ID. */
            group: string
        }): number

        /**
        * Gets the IDs for all the sublists submitted in a step.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43637
        */
        getSubmittedSublistIds(): string[]

        /**
        * Gets the current value of a sublist field (line item) in a step.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43641
        */
        getSublistValue(options: {
            /** (required) The internal ID of the sublist. */
            group: string
            /** (required) The internal ID of the sublist field. */
            id: string
            /** (required) The line number for the sublist field.The first line number on a sublist is 0 (not 1). */
            line: number
        }): string

        /**
        * Gets the current value(s) of a field or mult-select field.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43639
        */
        getValue(options: {
            /** (required) The internal ID of a field. */
            id: string
        }): string[]
    }

    interface Button {
        /**Indicates whether a button is grayed-out and disabled. */
        isDisabled: boolean
        /**Indicates whether the button is hidden in the UI. */
        isHidden: boolean
        /**The label for the button */
        label: string
    }

    interface Field {
        /**The alias used to set the field value. */
        alias: string
        /**The default value for the field. */
        defaultValue: string
        /**The internal ID for the field. */
        id: string
        /**Indicates whether the field is mandatory. */
        isMandatory: boolean
        /**Gets or sets the label for the field. */
        label: string
        /**The text displayed for a link in place of the URL. */
        linkText: string
        /**The maximum length, in characters, for the field. */
        maxLength: number
        /**The number of empty vertical character spaces above the field. */
        padding: number
        /**The height of a rich text field, in pixels. */
        richTextHeight: number
        /**The width of a rich text field, in pixels. */
        richTextWidth: number
        /**The type of field. */
        type: string

        /**
        * Adds the select options that appears in the dropdown of a field.After you create a select or multi-select field that is sourced from a record or list, you cannot add additional values with Field.addSelectOption(options). The select values are determined by the source record or list.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/48790
        */
        addSelectOption(options: {
            /** (required) The internal ID of this select option. */
            value: string
            /** (required) The label for this select option. */
            text: string
            /** (optional) If set to true, this option is selected by default in the UI. The default value for this parameter is false. */
            isSelected: boolean
        }): void

        /**
        * Obtains a list of available options on a select field.The internal ID and label of the options for a select field as name/value pairs is returned.The first 1,000 available options are returned.If you attempt to get select options on a field that is not a select field, or if you reference a field that does not exist on the form, null is returned.A call to this method may return different results for the same field for different roles.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43648
        */
        getSelectOptions(options: {
            /** (optional) A search string to filter the select options that are returned. For example, if there are 50 select options available, and 10 of the options contains 'John', e.g. “John Smith” or “Shauna Johnson”, only those 10 options will be returned.Filter values are case insensitive. The filters 'John' and 'john' will return the same select options. */
            filter: string
            /** (optional) Supported operators are contains | is | startswith.If not specified, defaults to the contains operator. */
            filteroperator: string
        }): Object[]

        /**
        * Sets the help text for the field.When the field label is clicked, a popup displays the help text defined using this method.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43651
        */
        setHelpText(options: {
            /** (required) The text in the field help popup. */
            help: string
            /** (optional) If set to true, the field help will display inline below the field on the assistant, and in a field help popup.The default value is false — the field help appears in a popup when the field label is clicked and does not appear inline.The inline parameter is available only toN_ui_serverWidget.Field objects that have been added to serverWidget.createAssistant(options) objects. */
            showInlineForAssistant: boolean
        }): N_ui_serverWidget.Field

        /**
        * Updates the break type used to add a break in flow layout for the field.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/48721
        */
        updateBreakType(options: {
            /** (required) The break type of the field. */
            breakType: N_ui_serverWidget.fieldbreaktype
        }): N_ui_serverWidget.Field

        /**
        * Updates the width and height of the field.Only supported on multi-selects, long text, rich text, and fields that get rendered as INPUT (type=text) fields. This function is not supported on list/record fields.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43653
        */
        updateDisplaySize(options: {
            /** (required) The new height of the field. */
            height: number
            /** (required) The new width of the field. */
            width: number
        }): N_ui_serverWidget.Field

        /**
        * Updates the display type for the field.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43654
        */
        updateDisplayType(options: {
            /** (required) The new display type of the field. For more information about possible values, see serverWidget.FieldDisplayType. */
            displayType: string
        }): N_ui_serverWidget.Field

        /**
        * Updates the layout type for the field.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43655
        */
        updateLayoutType(options: {
            /** (required) The new layout type of the field. */
            layoutType: N_ui_serverWidget.fieldlayouttype
        }): N_ui_serverWidget.Field

    }

    interface FieldGroup {
        /**Indicates whether a border appears around the field group. */
        isBorderHidden: boolean
        /**Indicates whether the field group is collapsible. */
        isCollapsible: boolean
        /**Indicates whether the field group is initially collapsed or expanded in the default view. */
        isCollapsed: boolean
        /**Indicates whether the field group is aligned. */
        isSingleColumn: boolean
        /**The label for the field group. */
        label: string
    }

    interface Form {
        /**The file cabinet ID of client script file to be used in this form. */
        clientScriptFileId: number
        /**The relative path to the client script file to be used in this form. */
        clientScriptModulePath: string
        /**The title used for the form. */
        title: string
        /**
        * Adds a button to a form.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43667
        */
        addButton(options: {
            /** (optional) The internal ID of the button.If you are adding the button to an existing page, the internal ID must be in lowercase, contain no spaces, and include the prefix custpage. For example, if you add a button that appears as Update Order, the button internal ID should be something similar to custpage_updateorder. */
            id: string
            /** (required) The label for this button. */
            label: string
            /** (optional) The function name to be triggered on a click event. */
            functionName: string
        }): N_ui_serverWidget.Button

        /**
        * Adds a field that lets you store credentials in NetSuite to be used when invoking services provided by third parties. The GUID generated by this field can be reused multiple times until the script executes again.For example, when executing credit card transactions, merchants need to store credentials in NetSuite that are used to communicate with Payment Gateway providers.Note the following about this method:Credentials associated with this field are stored in encrypted form.No piece of SuiteScript holds a credential in clear text mode.NetSuite reports or forms will never provide to the end user the clear text form of a credential.Any exchange of the clear text version of a credential with a third party must occur over SSL.For no reason will NetSuite ever log the clear text value of a credential (for example, errors, debug message, alerts, system notes, and so on).
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43668
        */
        addCredentialField(options: {
            /** (required) The internal ID of the credential field.The internal ID must be in lowercase, contain no spaces, and include the prefix custpage if you are adding the field to an existing page. */
            id: string
            /** (required) The label for the credential field. */
            label: string
            /** (required) The domains that the credentials can be sent to, such as 'www.mysite.com'. Credentials cannot be sent to a domain that is not specified here.This value can be a domain or a list of domains to which the credentials can be sent. */
            restrictToDomains: string | string[]
            /** (required) The IDs of the scripts that are allowed to use this credential field. For example, 'customscript_my_script'. */
            restrictToScriptIds: string | string[]
            /** (optional) Controls whether use of this credential is restricted to the same user that originally entered the credential.By default, the value is false – multiple users can use the credential. For example, multiple clerks at a store making secure calls to a credit processor using a credential that represents the company they work for.If set to true, the credentials apply to a single user. */
            restrictToCurrentUser: boolean
            /** (optional) The internal ID of the tab or field group to add the credential field to. By default, the field is added to the main section of the form. */
            container: string
        }): N_ui_serverWidget.Field

        /**
        * Adds a field to a form.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43669
        */
        addField(options: {
            /** (required) The internal ID of the field.The internal ID must be in lowercase, contain no spaces, and include the prefix custpage if you are adding the field to an existing page. For example, if you add a field that appears as Purchase Details, the field internal ID should be something similar to custpage_purchasedetails or custpage_purchase_details. */
            id: string
            /** (required) The label for this field. */
            label: string
            /** (required) The field type for the field. Use the serverWidget.FieldType enum to define the field type. */
            type: string
            /** (optional) The internalId or scriptId of the source list for this field if it is a select (List/Record) or multi-select field.After you create a select or multi-select field that is sourced from a record or list, you cannot add additional values with Field.addSelectOption(options). The select values are determined by the source record or list.For radio fields only, the source parameter must contain the internal ID for the field.For more information about working with radio buttons, see Working with Radio Buttons. */
            source: string
            /** (optional) The internal ID of the tab or field group to add the field to.By default, the field is added to the main section of the form. */
            container: string
        }): N_ui_serverWidget.Field

        /**
        * Adds a group of fields to a form.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43670
        */
        addFieldGroup(options: {
            /** (required) An internal ID for the field group. */
            id: string
            /** (required) The label for this field group. */
            label: string
            /** (optional) The internal ID of the tab to add the field group to. By default, the field group is added to the main section of the form. */
            tab: string
        }): N_ui_serverWidget.FieldGroup

        /**
        * Adds a link to a form.You cannot choose where the page link appears.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43671
        */
        addPageLink(options: {
            /** (required) The text label for the link. */
            title: string
            /** (required) The type of page link to add.Use the serverWidget.FormPageLinkType enum to set the value. */
            type: string
            /** (required) The URL for the link. */
            url: string
        }): void

        /**
        * Adds a reset button to a form. The reset buttons allows a user to clear the entries.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43672
        */
        addResetButton(options: {
            /** (optional) The label used for this button. If no label is provided, the label defaults to Reset. */
            label: string
        }): N_ui_serverWidget.Button

        /**
        * Adds a secret key field to the form.This key can be used in crypto modules to perform encryption or hashing.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49441
        */
        addSecretKeyField(options: {
            /** (required) The internal ID of the secret key field.The internal ID must be in lowercase, contain no spaces, and include the prefix custpage if you are adding the field to an existing page. */
            id: string
            /** (optional) Controls whether use of this secret key is restricted to the same user that originally entered the key.By default, the value is false – multiple users can use the key.If set to true, the secret key applies to a single user. */
            restrictToCurrentUser: boolean
            /** (optional) The script ID of the script that is allowed to use this field. */
            restrictToScriptIds: string | string[]
            /** (optional) The internal ID of the tab or field group to add the field to. By default, the field is added to the main section of the form. */
            container: string
        }): N_ui_serverWidget.Field

        /**
        * Add a sublist to a form.If the row count exceeds 25, sorting is not supported on static sublists created using this method.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43674
        */
        addSublist(options: {
            /** (required) The internal ID name of the sublist.The internal ID must be in lowercase, contain no spaces, and include the prefix custpage if you are adding the sublist to an existing page. For example, if you add a sublist that appears as Purchase Details, the sublist internal ID should be something equivalent to custpage_purchasedetails or custpage_purchase_details. */
            id: string
            /** (required) The label for this sublist. */
            label: string
            /** (optional) The tab under which to display this sublist. If empty, the sublist is added to the main tab. */
            tab: string
            /** (required) The sublist type.Use the serverWidget.SublistType enum to set the value. */
            type: string
        }): N_ui_serverWidget.Sublist

        /**
        * Adds a submit button to a form.If the row count exceeds 25, sorting is not supported on static sublists created using this method.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49439
        */
        addSubmitButton(options: {
            /** (optional) The label for this button. If no label is provided, the label defaults to “Save”. */
            label: string
        }): N_ui_serverWidget.Button

        /**
        * Adds a subtab to a form.If you add only one subtab, the label you define for the subtab will not appear in the UI. You must define two subtabs for subtab labels to appear.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43673
        */
        addSubtab(options: {
            /** (required) The internal ID name of the subtab.The internal ID must be in lowercase, contain no spaces. If you are adding the subtab to an existing page, include the prefix custpage. For example, if you add a subtab that appears as Purchase Details, the subtab internal ID should be something similar to custpage_purchasedetails or custpage_purchase_details. */
            id: string
            /** (required) The label for this subtab. */
            label: string
            /** (optional) The tab under which to display this sublist. If empty, the sublist is added to the main tab. */
            tab: string
        }): N_ui_serverWidget.Tab

        /**
        * Adds a tab to a form.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43675
        */
        addTab(options: {
            /** (required) The internal ID name of the tab.The internal ID must be in lowercase and contain no spaces. If you are adding the tab to an existing page, include the prefix custpage. For example, if you add a subtab that appears as Purchase Details, the subtab internal ID should be something similar to custpage_purchasedetails or custpage_purchase_details. */
            id: string
            /** (required) The label for this tab. */
            label: string
        }): N_ui_serverWidget.Tab

        /**
        * Returns a Button object by internal ID.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43676
        */
        getButton(options: {
            /** (required) The internal ID name of the button.Internal IDs must be in lowercase and contain no spaces. */
            id: string
        }): N_ui_serverWidget.Button

        /**
        * Returns a Field object by internal ID.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43677
        */
        getField(options: {
            /** (required) The internal ID name of the field.Internal IDs must be in lowercase and contain no spaces. */
            id: string
        }): N_ui_serverWidget.Field

        /**
        * Returns a Sublist object by internal ID.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43678
        */
        getSublist(options: {
            /** (required) The internal ID name of the sublist.Internal IDs must be in lowercase and contain no spaces. */
            id: string
        }): N_ui_serverWidget.Sublist

        /**
        * Returns a subtab by internal ID.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43679
        */
        getSubtab(options: {
            /** (required) The internal ID name of the subtab.Internal IDs must be in lowercase and contain no spaces. */
            id: string
        }): N_ui_serverWidget.Tab

        /**
        * Returns a tab object from its internal ID.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49442
        */
        getTab(options: {
            /** (required) The internal ID name of the tab to retrieve. */
            id: string
        }): N_ui_serverWidget.Tab

        /**
        * Returns an array that contains all the tabs in a form.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43680
        */
        getTabs(): N_ui_serverWidget.Tab[]

        /**
        * Inserts a field in front of another field.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43681
        */
        insertField(options: {
            /** (required) The Field object to insert. */
            field: N_ui_serverWidget.field
            /** (required) The internal ID name of the field you are inserting a field in front of. */
            nextfield: string
        }): void

        /**
        * Inserts a sublist in front of another sublist.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43683
        */
        insertSublist(options: {
            /** (required) The Sublist object to insert. */
            sublist: N_ui_serverWidget.sublist
            /** (required) The internal ID name of the sublist you are inserting a sublist in front of. */
            nextsublist: string
        }): void

        /**
        * Inserts a subtab in front of another subtab.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43682
        */
        insertSubtab(options: {
            /** (required) The Subtab object to insert. */
            subtab: N_ui_serverWidget.tab
            /** (required) The internal ID name of the subtab you are inserting a subtab in front of. */
            nextsubtab: string
        }): void

        /**
        * Inserts a tab in front of another tab.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43684
        */
        insertTab(options: {
            /** (required) The Tab object to insert. */
            tab: N_ui_serverWidget.tab
            /** (required) The internal ID name of the tab you are inserting a tab in front of. */
            nexttab: string
        }): void

        /**
        * Removes a button.This method can be used on custom buttons and certain built-in NetSuite buttons. For more information about built-in NetSuite buttons, see Button IDs.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43685
        */
        removeButton(options: {
            /** (required) The internal ID name of the button to remove.The internal ID must be in lowercase and contain no spaces. */
            id: string
        }): void

        /**
        * Updates the default values of multiple fields on the form.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43686
        */
        updateDefaultValues(options: {
            /** (required) An object containing an array of name/value pairs that map field names to field values. */
            values: object[]
        }): void

    }

    interface List {
        /**The file cabinet ID of client script file to be used in this list. */
        clientScriptFileId: number
        /**The relative path to the client script file to be used in this list. */
        clientScriptModulePath: string
        /**Sets the display style for this list. */
        style: string
        /**Sets the List title. */
        title: string

        /**
        * Adds a button to a list.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49426
        */
        addButton(options: {
            /** (required) The internal ID of the button.The internal ID must be in lowercase, contain no spaces, and include the prefix custpage if you are adding the button to an existing page. For example, if you add a button that appears as Update Order, the button internal ID should be something similar to custpage_updateorder. */
            id: string
            /** (required) The label for this button. */
            label: string
            /** (optional) The function name to call when clicking on this button. */
            functionName: string
        }): N_ui_serverWidget.Button

        /**
        * Adds a column to a list.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49427
        */
        addColumn(options: {
            /** (required) The internal ID of this column.The internal ID must be in lowercase, contain no spaces. */
            id: string
            /** (required) The label for this column. */
            label: string
            /** (required) The field type for this column.CHECKBOX field types are not supported.For more information about possible values, see serverWidget.FieldType. */
            type: string
            /** (optional) The default value is left.The layout justification for this column. Possible values include center, right, left */
            align: string
        }): N_ui_serverWidget.ListColumn

        /**
        * Adds a column containing Edit or Edit/View links to a Suitelet or Portlet list.These Edit or Edit/View links appear to the left of a previously existing column.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49428
        */
        addEditColumn(options: {
            /** (required) The internal ID of the column to the left of which the Edit/View Column will be added. */
            column: string
            /** (optional) If set to true, the URL for the link is clickable. */
            showHrefCol: boolean
            /** (optional) If true then an Edit/View column will be added. Otherwise only an Edit column will be added. */
            showView: boolean
        }): N_ui_serverWidget.ListColumn

        /**
        * Adds a link to a list.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49429
        */
        addPageLink(options: {
            /** (required) The text label for the link. */
            title: string
            /** (required) The type of page link to add.For more information about possible values, see serverWidget.FormPageLinkType. */
            type: string
            /** (required) The URL for the link. */
            url: string
        }): void

        /**
        * Adds a single row to a list.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49430
        */
        addRow(options: {
            /** (required) A row that consists of either a search.Result, or name/value pairs. Each pair should contain the value for the corresponding Column object in the list. */
            row: object
        }): N_ui_serverWidget.List

        /**
        * Adds multiple rows to a list.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49431
        */
        addRows(options: {
            /** (required) An array of rows that consist of either a search.Result array, or an array of name/value pairs. Each pair should contain the value for the corresponding Column object in the list. */
            rows: object[]
        }): N_ui_serverWidget.ListColumn









    }

    interface ListColumn {
        /**The label of this list column. */
        label: string

        /**
       * Adds a URL parameter (optionally defined per row) to the list column's URL.
       * @Supported Suitelets
       * @Governance None
       * @Since Version 2016 Release 1
       * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49436
       */
        addParamToURL(options: {
            /** (required) The name for the parameter. */
            param: string
            /** (required) The value for the parameter. */
            value: string
            /** (optional) If true, then the parameter value is actually an alias that is calculated per row. */
            dynamic: boolean
        }): N_ui_serverWidget.ListColumn

        /**
        * Sets the base URL for the list column.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2016 Release 1
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49437
        */
        setURL(options: {
            /** (required) The base URL or a column in the data source that returns the base URL for each row */
            url: string
            /** (optional) If true, then the URL is actually an alias that is calculated per row. */
            dynamic: boolean
        }): N_ui_serverWidget.ListColumn




    }

    interface Sublist {
        /**The display style for a sublist. */
        displayType: string
        /**The inline help text for a sublist. */
        helpText: string
        /**The label for a sublist. */
        label: string
        /**The number of line items in a sublist. */
        lineCount: number

        /**
        * Adds a button to a sublist.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43835
        */
        addButton(options: {
            /** (required) The internal ID name of the button.The internal ID must be in lowercase and without spaces. */
            id: string
            /** (required) The label for the button. */
            label: string
            /** (optional) The function name to be triggered on a button click. */
            functionName: string
        }): N_ui_serverWidget.Button

        /**
        * Adds a field to a sublist.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43881
        */
        addField(options: {
            /** (required) The internal ID for this field.The internal ID must be in lowercase and without spaces. */
            id: string
            /** (required) The label for this field. */
            label: string
            /** (required) The field type.Use the serverWidget.FieldType enum to set this value. Note that the INLINEHTML value is not supported with this method.If you have set the type parameter to SELECT, and you want to add custom options to the select field, you must set source to NULL. */
            type: string
            /** (optional) The internalId or scriptId of the source list for this field.Use this parameter if you are adding a select (List/Record) type of field.If you want to add custom options on a select field, you must set the source parameter to NULL.After you create a select or multi-select field that is sourced from a record or list, you cannot add additional values with Field.addSelectOption(options). The select values are determined by the source record or list. */
            source: string
        }): N_ui_serverWidget.Field

        /**
        * Adds a Mark All and an Unmark All button to a LIST type of sublist.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43892
        */
        addMarkAllButtons(): N_ui_serverWidget.Button[]

        /**
        * Adds a Refresh button to a LIST type of sublist.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43912
        */
        addRefreshButton(): N_ui_serverWidget.Button

        /**
        * Gets a field value on a sublist.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43821
        */
        getSublistValue(options: {
            /** (required) The sublist internal ID (for example, use addressbook as the ID for the Address sublist). For more information about supported sublists, internal IDs, and field IDs, see Scriptable Sublists. */
            id: string
            /** (required) The line number for this field.The first line number on a sublist is 0  (not 1). */
            line: number
        }): void

        /**
        * Sets the value of a sublist field.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43875
        */
        setSublistValue(options: {
            /** (required) The internal ID name of the line item field being set. */
            id: string
            /** (required) The line number for this field.The first line number on a sublist is 0 (not 1). */
            line: number
            /** (required) The value for the field being set. */
            value: string
        }): void

        /**
        * Updates the ID of a field designated as a totalling column, which is used to calculate and display a running total for the sublist.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43897
        */
        updateTotallingFieldId(options: {
            /** (required) The internal ID name of the field to use as a total field. */
            id: string
        }): N_ui_serverWidget.Sublist

        /**
        * Updates a field ID that is to have unique values across the rows in the sublist.This method is available on inlineeditor and editor sublists only.
        * @Supported Suitelets
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43977
        */
        updateUniqueFieldId(options: {
            /** (required) The internal ID name of the field to use as a unique field. */
            id: string
        }): N_ui_serverWidget.Sublist

        /**
         * Returns a Field object on a sublist.
         * @Supported Suitelets
         * @Governance None
         * @Since Version 2016 Release 2
         * @Link
         */
        getField(options: {
            /** (required) The field internal ID (for example, use item as the ID for the Item field). For more information about supported sublists, internal IDs, and field IDs, see Scriptable Sublists. */
            id: string
        }): N_ui_serverWidget.Field












    }

    interface Tab {
        /**The inline help text for a tab or subtab. */
        helpText: string
        /**The label for a tab or subtab. */
        label: string
    }

}
