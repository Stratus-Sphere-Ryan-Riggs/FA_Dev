/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for the N/search module.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/search',
        './KBS_String'
    ],
    (
        search,
        KBS_String
    ) => {
        const MODULE = 'KBS.Search';

        class Search {
            me;

            constructor(searchObject) {
                this.me = searchObject;
            }

            get id() {
                return this.me.id;
            }

            get columns() {
                return this.me.columns;
            }

            get filters() {
                return this.me.filters;
            }

            addColumn(options) {
                let { join, name, sort } = options;
                this.me.columns.push(search.createColumn({ name, join, sort }));
            }

            addColumns(options) {
                let { columns } = options;
                for (let i = 0, count = columns.length; i < count; i++) {
                    this.addColumn(columns[i]);
                }
            }

            addFilter(options) {
                let { join, name, operator, summary } = options;
                this.me.filters.push(search.createFilter({ join, name, operator, summary }));
            }

            addFilterExpression(expression) {
                this.me.filterExpression = [
                    ...this.me.filterExpression,
                    'AND',
                    expression
                ];
            }

            addFilters(options) {
                let { filters } = options;
                for (let i = 0, count = filters.length; i < count; i++) {
                    this.me.addFilter(filters[i]);
                }
            }

            getCSV() {
                const TITLE = `${MODULE}.GetCSV`;
                let output = [];
                let columns = this.me.columns;

                let csvRow = [];
                columns.forEach(col => {
                    let label = KBS_String.normalize(col.label || col.name);
                    csvRow.push(label);
                });
                log.debug({ title: `${TITLE} headerRow`, details: JSON.stringify(csvRow) });
                output.push(csvRow.join(','));

                this.getRaw().forEach(row => {
                    csvRow = [];
                    columns.forEach(col => {
                        csvRow.push(row.getValue(col));
                    });
                    log.debug({ title: `${TITLE} headerRow`, details: JSON.stringify(csvRow) });
                    output.push(csvRow.join(','));
                });

                log.debug({ title: TITLE, details: `output length = ${output.length}` });
                return output;
            }

            getIds() {
                const TITLE = `${MODULE}.GetIds`;
                let output = this.getRaw().map(row => row.id);

                log.debug({ title: TITLE, details: `output length = ${output.length}` });
                return output;
            }

            getJSON() {
                const TITLE = `${MODULE}.GetJSON`;
                let output = [];
                let columns = this.me.columns;

                this.getRaw().forEach(row => {
                    let jsonRow = {};
                    columns.forEach(col => {
                        let label = KBS_String.normalize(col.label || col.name);
                        jsonRow[label] = row.getValue(col);
                    });

                    log.debug({ title: `${TITLE} jsonRow`, details: JSON.stringify(jsonRow) });
                    output.push(jsonRow);
                });

                log.debug({ title: `${TITLE} output`, details: JSON.stringify(output) });
                return output;
            }

            getRaw() {
                const TITLE = `${MODULE}.GetAll`;
                let allResults = [];
                let results = [];
                let size = 1000;
                let start = 0;
                let end = size;

                do {
                    results = this.me.run().getRange({ start, end });
                    allResults = allResults.concat(results);
                    start += 1000;
                    end += 1000;
                } while (results.length >= size);

                return allResults;
            }
        }

        return {
            get Type() {
                return search.Type
            },
            cast: (options) => {
                return new Search(options);
            },
            create: (options) => {
                return this.cast(search.create(options));
            },
            load: (options) => {
                return this.cast(search.load(options));
            },
            lookup: (options) => {
                return search.lookupFields(options);
            }
        }
    }
);