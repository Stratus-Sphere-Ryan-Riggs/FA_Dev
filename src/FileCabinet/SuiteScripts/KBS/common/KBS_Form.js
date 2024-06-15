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

        class Field {
            constructor (field) {
                this.field = field;
            }


        }

        class Form {
            constructor (form) {
                this.form = form;
            }

            get Fields() {
                return this.form.getFields();
            }

            addButton (options) {
                let { disabled, id, label, submit } = options;

                if (submit) {
                    let button = this.form.addSubmitButton(options);
                }
                else {
                    let functionName = `${id}_handler`;
                    this.form.addButton({ id, label, functionName });

                    let button = this.form.getButton({ id });
                    button.isDisabled = !!disabled;

                    if (handler) {
                        let handlerField = this.form.addField({
                            id: `${id}_handler`,
                            label: `${label} Handler`,
                            type: sw.FieldType.INLINEHTML
                        });
                        handlerField.defaultValue = handler.replace('{NAME}', functionName);
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
                    type = sw.FieldType.TEXT;
                }
    
                let field = this.form.addField(options);
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

            addFields (fields) {
                fields.forEach(field => this.addField(field));
            }
            
            addFieldGroup (options) {
                let { fields, id, label } = options;

                this.form.addFieldGroup(options);
                if (fields) {
                    this.addFields(
                        fields.map(fld => {
                            return {
                                ...fld,
                                container: id
                            };
                        })
                    );
                }
            }

            addSublist (options) {
                let { fields, id, label, selectItems, type } = options;
                let sublist = this.form.addSublist({ id, label, type });
    
                if (selectItems) {
                    sublist.addMarkAllButtons();
                    sublist.addField({
                        id: `${id}_select`,
                        label: 'select',
                        type: sw.FieldType.CHECKBOX
                    });
                }

                fields.forEach(field => sublist.addField(field));
            }

            /* create (options) {
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
            } */
        }

        return {
            cast: (form) => {
                return new Form(form);
            },
            create: (options) => {
                let { title } = options;
                return this.cast(
                    new Form( sw.createForm({ title }) )
                );
            }
        }
    }
);