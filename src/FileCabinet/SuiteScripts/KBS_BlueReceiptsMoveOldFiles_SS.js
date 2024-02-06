/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(
    [
        'N/file',
        'N/search',
        './moment-v2.24.0'
    ],
    /**
     * @param {N_file} nsFile
     * @param {N_search} nsSearch
     * @param {moment} moment
     */
    function (
        nsFile,
        nsSearch,
        moment
    ) {
        /**
        * @param {ScheduledScriptContext.execute} context
        */
        function execute(context) {
            var fileSearchObj;
            var searchResultCount;
            var tenMonthsAgo = new Date();
            // var fileObj;
            // var twoDaysAgo = new Date();
            // var sevenDaysAgo = new Date();

            tenMonthsAgo.setMonth(tenMonthsAgo.getMonth() - 10);
            tenMonthsAgo = moment.utc(tenMonthsAgo).format('MM/DD/YYYY');
            // log.debug('tenMonthsAgo', tenMonthsAgo);
            // twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            // twoDaysAgo = moment.utc(twoDaysAgo).format('MM/DD/YYYY');
            // log.debug('twoDaysAgo', twoDaysAgo);
            // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            // sevenDaysAgo = moment.utc(sevenDaysAgo).format('MM/DD/YYYY');
            // log.debug('tenDaysAgo', sevenDaysAgo);
            fileSearchObj = nsSearch.create({
                type: 'file',
                filters:
                [
                    ['modified', 'onorbefore', 'sixtydaysago'],
                    // ['modified', 'onorbefore', twoDaysAgo],
                    'AND',
                    ['folder', 'anyof', '17820715']
                ],
                columns: []
            });
            searchResultCount = fileSearchObj.runPaged().count;
            log.debug('fileSearchObj result count', searchResultCount);
            fileSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                // fileObj = nsFile.load({ id: result.id });
                // move to Processed Over 2 Months Ago folder
                nsFile.copy({
                    id: parseFloat(result.id),
                    folder: 17820818,
                    conflictResolution: nsFile.NameConflictResolution.OVERWRITE
                });
                nsFile.delete({ id: result.id });
                log.debug('File moved to Processed Over 2 Months Ago folder', 'File Id: ' + result.id);
                return true;
            });

            /*
             fileSearchObj.id="customsearch1677555542384";
             fileSearchObj.title="DB Temp 2 months ago Custom Document Search (copy)";
             var newSearchId = fileSearchObj.save();
             */
            fileSearchObj = nsSearch.create({
                type: 'file',
                filters:
                    [
                        ['modified', 'onorbefore', tenMonthsAgo],
                        // ['modified', 'onorbefore', sevenDaysAgo],
                        'AND',
                        ['folder', 'anyof', '17820818']
                    ],
                columns: []
            });
            searchResultCount = fileSearchObj.runPaged().count;
            log.debug('fileSearchObj result count', searchResultCount);
            fileSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                nsFile.copy({
                    id: parseFloat(result.id),
                    folder: 17820819,
                    conflictResolution: nsFile.NameConflictResolution.OVERWRITE
                });
                nsFile.delete({ id: result.id });
                log.debug('File moved to Processed Over A Year Ago folder', 'File Id: ' + result.id);
                return true;
            });
            log.debug('Script finished');
        }
        return {
            execute: execute
        };
    }
);
