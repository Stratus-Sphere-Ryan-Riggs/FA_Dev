/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for the N/file module.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/file'
    ],
    (
        file
    ) => {
        const MODULE = `KBS.File`;

        class File {
            constructor(fileObject) {
                this.me = fileObject;
            }

            get details() {
                return {
                    contents: this.me.getContents(),
                    folder: this.me.folder,
                    id: this.me.id,
                    name: this.me.name
                };
            }

            save(options) {
                return this.me.save(options);
            }
        }

        return {
            cast: (options) => {
                return new File(options);
            },
            create: (options) => {
                return this.cast(file.create(options));
            },
            load: (options) => {
                return this.cast(file.load(options));
            }
        };
    }
);