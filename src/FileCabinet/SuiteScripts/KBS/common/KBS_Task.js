/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for the N/task module.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/task'
    ],
    (
        task
    ) => {
        const MODULE = `KBS.Task`;

        return {
            createMapReduceTask: (options) => {
                const TITLE = `${MODULE}.CreateMapReduceTask`;
                let { deploymentId, params, scriptId } = options;
                let output = {};

                try {
                    let taskObject = task.create({
                        taskType: task.Type.MAP_REDUCE,
                        scriptId,
                        deploymentId,
                        params
                    });
                    let taskId = taskObject.submit();
                    log.debug({ title: TITLE, details: `M/R Task ID: ${taskId}` });

                    output = {
                        success: true,
                        result: taskId
                    };
                }
                catch (ex) {
                    log.error({ title: TITLE, details: ex.toString() });
                    output = {
                        success: false,
                        result: ex.message || ex.toString()
                    }
                }

                return output;
            }
        }
    }
);