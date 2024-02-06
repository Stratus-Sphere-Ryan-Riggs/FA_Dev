/**
 * @NApiVersion 2.0
 * KBS_ScriptScheduler_2.js
 */
define(
    [
        'N/record',
        'N/search',
        'N/task',
        './KBS_MODULE'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_search} nsSearch
     * @param {N_task} nsTask
     * @param {KBS_MODULE} kbsMod
     */
    function (
        nsRecord,
        nsSearch,
        nsTask,
        kbsMod
    ) {

        log.debug('inside script scheduler');

        function getScriptNumber(scriptId) {
            var search;
            var result;
            var id;

            search = nsSearch.create({
                type: 'script',
                filters: [
                    ['scriptid', 'is', scriptId]
                ]
            });
            result = search.run().getRange({ start: 0, end: 1 });

            if (result.length > 0) {
                id = result[0].id;
            } else {
                throw kbsMod.CodeException('scriptScheduler ERROR', 'Unable to locate script with id: ' + scriptId);
            }

            return id;
        }

        function getNextDeploymentId(scriptId) {
            var search;
            var results;
            var nextId;
            var id;
            var lastId;
            var newId;

            search = nsSearch.create({
                type: 'scriptdeployment',
                filters: [
                    ['script.scriptid', 'is', scriptId],
                    'AND',
                    ['status', 'noneof', 'TESTING', 'SCHEDULED']
                ],
                columns: [
                    {
                        name: 'scriptid',
                        sort: nsSearch.Sort.DESC
                    }
                ]
            });
            results = search.run().getRange({ start: 0, end: 1 });

            if (results.length > 0) {
                id = results[0].getValue({
                    name: 'scriptid',
                    sort: nsSearch.Sort.DESC
                });
                lastId = id.substr(id.length - 2);

                if (isNaN(lastId) === true) { // eslint-disable-line
                    throw kbsMod.CodeException('scriptScheduler ERROR', 'Any deployments used by the script scheduler must end with a two digit number');
                }

                nextId = (parseFloat(lastId) + 101).toString().substr(1); // Ensures number is 3 digits (i.e. wont drop leading 0)
            } else {
                nextId = '01';
            }

            newId = scriptId.replace('customscript_', '_') + '_' + nextId;

            return newId;
        }

        function schedule(param, scriptId, type) {
            var mrTaskId;
            var scriptNum;
            var deployId;
            var deployRec;

            try {
                mrTaskId = nsTask.create({
                    taskType: type,
                    scriptId: scriptId,
                    params: param
                }).submit();
                log.debug('mrTaskId', mrTaskId);
            } catch (e) {
                scriptNum = getScriptNumber(scriptId);
                deployId = getNextDeploymentId(scriptId);

                deployRec = nsRecord.create({
                    type: nsRecord.Type.SCRIPT_DEPLOYMENT,
                    isDynamic: false,
                    defaultValues: {
                        script: scriptNum
                    }
                });

                kbsMod.setHeaderVals(deployRec, false, {
                    scriptid: deployId,
                    status: 'NOTSCHEDULED'
                });
                deployRec.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

                mrTaskId = nsTask.create({
                    taskType: type,
                    scriptId: scriptId,
                    params: param
                }).submit();
            }

            return mrTaskId;
        }

        return {
            schedule: schedule
        };
    }
);
