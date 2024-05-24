/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for the N/record module.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/record'
    ],
    (
        record
    ) => {
        const MODULE = 'KBS.Record';

        class Record {
            me;

            constructor(recordObject) {
                this.me = recordObject;
            }

            get id() {
                return this.me.id;
            }

            get type() {
                return this.me.type;
            }

            findLine(options) {
                let { fieldId, sublistId, value } = options;
                return this.me.findSublistLineWithValue({
                    fieldId,
                    sublistId,
                    value
                });
            }

            getLineCount(options) {
                let { sublistId } = options;
                return this.me.getLineCount({ sublistId });
            }

            getSublist(options) {
                let { sublistId } = options;
                return this.me.getSublist({ sublistId });
            }

            getValue(options) {
                const TITLE = `${MODULE}.GetValue`;
                let { fieldId, line, sublistId, text } = options;
                let output = '';

                if (sublistId) {
                    if (line) {
                        if (text) {
                            output = this.me.getSublistText(options);
                        }
                        else {
                            output = this.me.getSublistValue(options);
                        }
                    }
                    else {
                        if (text) {
                            output = this.me.getCurrentSublistText(options);
                        }
                        else {
                            output = this.me.getCurrentSublistValue(options);
                        }
                    }
                }
                else {
                    output = (text === true) ? this.me.getText({ fieldId }) : this.me.getValue({ fieldId });
                }

                log.debug({ title: TITLE, details: JSON.stringify(options) });
                log.debug({ title: TITLE, details: `output = "${output}"` });
                return output;
            }

            getValues(options) {
                const TITLE = `${MODULE}.GetValues`;
                let { fields, sublistId, text } = options;
                let output = {};

                if (sublistId) {
                    output[sublistId] = [];

                    let lineCount = this.me.getLineCount({ sublistId });
                    for (let line = 0; line < lineCount; line++) {
                        if (this.me.isDynamic == true) {
                            this.me.selectLine({ sublistId, line });
                        }
                        
                        let lineObject = { line };
                        fields.forEach(fieldId => {
                            let params = { fieldId, sublistId, text };
                            if (this.me.isDynamic === false) {
                                params.line = line;
                            }

                            lineObject[fieldId] = text === this.getValue(params);
                            /* output[sublistId].push({
                                line,
                                fieldId,
                                value: text === this.getValue(params)
                            }); */
                        });
                        output[sublistId].push(lineObject);
                    }
                }
                else {
                    fields.forEach(fieldId => {
                        output[fieldId] = this.getValue({ fieldId })
                    });
                }

                log.debug({ title: TITLE, details: JSON.stringify(options) });
                log.debug({ title: TITLE, details: `value = "${output}"` });
                return output;
            }

            save(options) {
                const TITLE = `${MODULE}.Save`;
                log.debug({ title: TITLE, details: JSON.stringify(options) });

                return this.me.save(options);
            }
        }

        return {
            get Type() {
                return record.Type
            },
            cast: (options) => {
                return new Record(options);
            },
            create: (options) => {
                return this.cast(record.create(options));
            },
            load: (options) => {
                return this.cast(record.load(options));
            },
            transform: (options) => {
                return this.cast(record.transform(options));
            },
            update: (options) => {
                return record.submitFields(options);
            }
        }
    }
);