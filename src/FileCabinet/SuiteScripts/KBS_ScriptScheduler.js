var KBS = {};

KBS.scriptScheduler = (function () {

    var schedule, getNextDeploymentId, getNumericScriptId;

    getNumericScriptId = function (scriptId, type) {
        var filters = [];
        var results;

        if (type === 'script') {
            filters.push(['scriptid', 'is', scriptId]);
        } else {
            filters.push(['script.scriptid', 'is', scriptId]);
        }

        results = nlapiSearchRecord(type, null, filters);

        if (!results) {
            throw 'Could not find script id'; // eslint-disable-line
        }

        return results[0].getId();
    };

    getNextDeploymentId = function (scriptId) {

        var deployments, nextId, id, lastId;

        deployments = nlapiSearchRecord('scriptdeployment', null,
            [
                ['script.scriptid', 'is', scriptId],
                'AND',
                [
                    ['status', 'is', 'NOTSCHEDULED'],
                    'OR',
                    ['status', 'is', 'COMPLETED']
                ]
            ],
            [
                new nlobjSearchColumn('scriptid').setSort(true)
            ]);

        if (deployments) {

            id = deployments[0].getValue('scriptid');
            lastId = id.substr(id.length - 2);

            if (isNaN(lastId) === true) { // eslint-disable-line
                throw 'Invalid Deployment Id.  Any deployments used by the On Demand Scheduler must end with a two-digit number.  Example: 01, 02, 03'; // eslint-disable-line
            }

            nextId = ((+lastId) + 101).toString().substr(1);

        } else {

            nextId = '01';
        }

        return scriptId.replace('customscript_', '_') + '_' + nextId;

    };

    schedule = function (scriptId, params, copy) {

        var result, depRec, scriptIdNumber;

        //
        // Verify the parameters that were passed.
        //
        if (!scriptId) {
            throw nlapiCreateError('KBS_MISSING_PARAMETERS', 'The proper parameters were not passed to the Script Scheduler library.');
        }

        result = nlapiScheduleScript(scriptId, null, params);

        if (result !== 'QUEUED' && result !== 'INQUEUE') {

            //
            // Create another deployment and recall nlapiScheduleScript
            //
            nlapiLogExecution('DEBUG', 'COULD NOT QUEUE, CREATE DEPLOYMENT');
            if (copy === true) {
                scriptIdNumber = getNumericScriptId(scriptId, 'scriptdeployment');
                depRec = nlapiCopyRecord('scriptdeployment', scriptIdNumber);
            } else {
                scriptIdNumber = getNumericScriptId(scriptId, 'script');
                depRec = nlapiCreateRecord('scriptdeployment', { script: scriptIdNumber });
            }
            depRec.setFieldValue('scriptid', getNextDeploymentId(scriptId));
            depRec.setFieldValue('status', 'NOTSCHEDULED');
            nlapiSubmitRecord(depRec, false, true);

            result = nlapiScheduleScript(scriptId, null, params);

        } else {

            nlapiLogExecution('DEBUG', 'Scheduled Script "' + scriptId + '"');
        }

        return result;
    };

    return {
        schedule: schedule
    };
}());
