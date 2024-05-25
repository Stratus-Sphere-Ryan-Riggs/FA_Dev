/**
 * Copyright 2024 Keystone Business Solutions
 * 
 * @NApiVersion         2.1
 * @NScriptType         MapReduceScript
 * @NModuleScope        SameAccount
 * 
 * @description         This script is called by the module KBS_Issues.
 *                      Replaces part of the logic in the UE sript "NS WF | Has Issues Setting" (Before Submit).
 * 
 * Date                 Author                      Notes
 * 2024-05-24           Marlon Villarama            Initial setup
 * 
 */

define(
    [
        '../common/KBS'
    ],
    (
        KBS
    ) => {
        const MODULE = `KBS.MR|HasIssues`;
        const CONSTANTS = KBS.Constants;
        const PARAMS = CONSTANTS.ScriptParameters;
        const ScriptParameters = [
            PARAMS.HAS_ISSUES_ASSOCIATED_SO,
            PARAMS.HAS_ISSUES_UPDATE_VALUES
        ];

        const getInputData = () => {
            const TITLE = `${MODULE}.GetInputData`;
            const parameters = KBS.Script.getParameters({ fields: ScriptParameters });
            log.debug({ title: `${TITLE} parameters`, details: JSON.stringify(parameters) });

            if (validate({ values: parameters }) === false) { return; }
            
            const salesOrderId = parameters[PARAMS.HAS_ISSUES_ASSOCIATED_SO];
            const updateValues = JSON.parse(parameters[PARAMS.HAS_ISSUES_UPDATE_VALUES]);

            let query = KBS.Constants.Queries.TRANSACTIONS_ASSOCIATED_TO_SALES_ORDER.replace('{ID}', salesOrderId);
            log.debug({ title: `${TITLE} query`, details: query });

            let queryResults = KBS.Query.run(query);
            log.debug({ title: `${TITLE} queryResults`, details: JSON.stringify(queryResults) });
            
            return queryResults.map(r => {
                return {
                    ...r,
                    updateValues
                };
            });
        };

        const map = (context) => {
            const TITLE = `${MODULE}.Map`;
            let { key, value } = context;
            log.debug({ title: TITLE, details: value });

            value = JSON.parse(value);
            let type = KBS.Constants.RecordTypes[value.type];

            KBS.Record.update({
                type,
                id: value.id,
                values: value.updateValues
            });
            log.debug({ title: TITLE, details: `Successfully updated ${type} ID = ${value.id}.` });

            context.write({
                key,
                value: value.id
            });
        };

        const summarize = (summary) => {
            const TITLE = `${MODULE}.Summarize`;
            let { mapSummary, output } = summary;

            let hasErrors = false;
            mapSummary.iterator().each((k, v) => {
                log.error({ title: `${TITLE} map error key = ${k}`, details: v });
                hasErrors = true;
                return true;
            });

            if (hasErrors === true) { return; }
        };

        const validate = (options) => {
            const TITLE = `${MODULE}.Validate`;
            let { values } = options;

            for (let i = 0, count = ScriptParameters.length; i < count; i++) {
                let param = ScriptParameters[i];
                if (!!values[param] === true) { continue; }

                log.error({ title: TITLE, details: CONSTANTS.Errors.MISSING_PARAMETER.replace('{name}', param) });
                return false;
            }

            return true;
        };

        return {
            getInputData,
            map,
            summarize
        };
    }
);