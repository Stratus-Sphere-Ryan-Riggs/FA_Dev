/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for the runtime.Script object.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/runtime'
    ],
    (
        runtime
    ) => {
        const MODULE = `KBS.Script`;

        class Script {
            me;

            constructor(scriptObject) {
                this.me = scriptObject;
            }

            get deploymentId() {
                return this.me.deploymentId;
            }

            get scriptId() {
                return this.me.scriptId;
            }

            get remainingUsage() {
                return this.me.getRemainingUsage();
            }
        }

        return {
            get: () => {
                return new Script(runtime.getCurrentScript());
            },
            getParameter: (name) => {
                if (!name) { return ''; }
                
                return runtime.getCurrentScript().getParameter({ name });
            }
        };
    }
);