/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for the N/ui/serverWidget module form objects.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/ui/serverWidget'
    ],
    (
        sw
    ) => {
        const MODULE = `KBS.Form`;

        class Form {
            constructor () {
            }

            get Fields() {
                return this.fields;
            }

            addButton (options) {
                let { disabled, id, label, submit } = options;

                if (submit) {
                    let button = this.me.addSubmitButton(options);
                    this.buttons.push(button);
                }
                else {
                    this.me.addButton(options);

                    let button = this.me.getButton({ id });
                    this.buttons.push(button);
                    if (disabled === true) {
                        button.isDisabled = true;
                    }
                }
            }

            addField (options) {
                let {
                    breakType,
                    defaultValue,
                    displayType,
                    id,
                    items,
                    label,
                    layoutType,
                    type
                } = options;

                if (!type) {
                    type = NS_ServerWidget.FieldType.TEXT;
                }
    
                let field = this.me.addField(options);
                this.fields.push(field);

                if (items) {
                    let selectItems = items.map(item => {
                        return {
                            text: item.text,
                            value: item.value
                        };
                    });
                    for (let i = 0, length = selectItems.length; i < length; i++) {
                        field.addSelectOption({ ...selectItems[i] });
                    }
                }
    
                if (defaultValue) {
                    let fieldValue = type == 'multiselect' ?
                        defaultValue.split(',') : (defaultValue || '');
                    field.defaultValue = fieldValue;
                }
    
                if (displayType) {
                    field.updateDisplayType({ displayType });
                }
    
                if (breakType) {
                    field.updateBreakType({ breakType });
                }
    
                if (layoutType) {
                    field.updateLayoutType({ layoutType });
                }
    
                return options.parent;
            }
            
            addFieldGroup (options) {
                let { fields, id, label } = options;

                let fieldGroup = this.me.addFieldGroup(options);
                this.groups.push(fieldGroup);

                if (fields) {
                    for (let i = 0, length = fields.length; i < length; i++) {
                        this.addField({
                            ...fields[i],
                            container: id
                        });
                    }
                }
            }

            addSublist (options) {
                let { fields, id, label, selectItems, type } = options;
                let sublist = this.me.addSublist({ id, label, type });
                this.sublists.push(sublist);
    
                if (selectItems) {
                    sublist.addMarkAllButtons();
                    sublist.addField({
                        id: 'custpage_data_select',
                        label: 'select',
                        type: NS_ServerWidget.FieldType.CHECKBOX
                    });
                }
    
                for (let i = 0, fieldCount = fields.length; i < fieldCount; i++) {
                    sublist.addField(fields[i]);
                }
            }

            create (options) {
                let { buttons, fieldGroups, fields, sublists } = options;

                this.me = sw.createForm({ title: options.title });
                this.buttons = [];
                this.groups = [];
                this.fields = [];
                this.sublists = [];

                for (let i = 0, count = buttons.length; i < count; i++) {
                    this.addButton(buttons[i]);
                }

                for (let i = 0, count = fieldGroups.length; i < count; i++) {
                    this.addFieldGroup(fieldGroups[i]);
                }

                for (let i = 0, count = fields.length; i < count; i++) {
                    this.addField(fields[i]);
                }

                for (let i = 0, count = sublists.length; i < count; i++) {
                    this.addSublist(sublists[i]);
                }

                return this.me;
            }
        }

        return {
            create: (options) => {
                return (new Form()).create(options);
            }
        }
    }
);