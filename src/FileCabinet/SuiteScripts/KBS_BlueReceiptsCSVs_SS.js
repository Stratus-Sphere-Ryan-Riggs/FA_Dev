/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */
define(
    [
        'N/file',
        'N/search',
        'N/record',
        'N/task',
        'N/email'
    ],
    /**
     * @param {N_file} nsFile
     * @param {N_search} nsSearch
     * @param {N_record} nsRecord
     * @param {N_task} nsTask
     * @param {N_email} nsEmail
     */
    function (
        nsFile,
        nsSearch,
        nsRecord,
        nsTask,
        nsEmail
    ) {

        function getProcessedArray() {
            var returnArray = [];
            var fileSearchObj = nsSearch.create({
                type: 'file',
                filters:
                [
                    ['folder', 'anyof', '17820715', '17820818', '17820819']
                ],
                columns:
                [
                    nsSearch.createColumn({
                        name: 'name',
                        sort: nsSearch.Sort.ASC
                    })
                ]
            });
            var searchResultCount = fileSearchObj.runPaged().count;
            log.debug('fileSearchObj result count', searchResultCount);
            fileSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                returnArray.push(result.getValue('name'));
                return true;
            });

            /*
             fileSearchObj.id="customsearch1677604264098";
             fileSearchObj.title="DB Temp 2 months ago Custom Document Search (copy)";
             var newSearchId = fileSearchObj.save();
             */
            return returnArray;
        }
        function wait(ms) {
            var start = new Date().getTime();
            var end = start;
            while (end < start + ms) {
                end = new Date().getTime();
            }
        }
        function sendEmail(errorDetailsArray) {
            var author = 19352; // NS Admin
            var recipients = ['localreceipts@feedingamerica.org', 'talee@feedingamerica.org', 'ctheus@feedingamerica.org'];
            var subject = errorDetailsArray.length + ' files moved to Errored folder';
            var x;
            var body;

            body = 'Processing Date: ' + new Date();
            for (x = 0; x < errorDetailsArray.length; x += 1) {
                body += '<br><br><b>File ' + errorDetailsArray[x].fileName + ' moved to Errored folder</b><br>';
                body += 'Error message: ' + errorDetailsArray[x].error;
            }
            nsEmail.send({
                author: author,
                recipients: recipients,
                subject: subject,
                body: body
            });
        }
        function sendEmailForDuplicates(duplicateFileNamesArray) {
            var author = 19352; // NS Admin
            var recipients = ['localreceipts@feedingamerica.org', 'talee@feedingamerica.org', 'ctheus@feedingamerica.org'];
            var subject = 'Files have been moved to Duplicates folder';
            var body;
            var x;

            body = 'Date: ' + new Date() + '\n'
                + 'The following files were moved to the Duplicates folder because files with the same names already exist in the Processed folder:\n\n';
            for (x = 0; x < duplicateFileNamesArray.length; x += 1) {
                body += duplicateFileNamesArray[x] + '\n';
            }
            nsEmail.send({
                author: author,
                recipients: recipients,
                subject: subject,
                body: body
            });
        }
        function getErrorFiles() {
            var errorFilesObj = {};
            var fileSearchObj = nsSearch.create({
                type: 'file',
                filters:
                [
                    ['folder', 'anyof', '17820716']
                ],
                columns:
                [
                    nsSearch.createColumn({
                        name: 'name',
                        sort: nsSearch.Sort.ASC
                    })
                ]
            });
            var searchResultCount = fileSearchObj.runPaged().count;
            log.debug('fileSearchObj result count', searchResultCount);
            fileSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                errorFilesObj[result.getValue('name')] = {
                    id: result.id
                };
                return true;
            });

            /*
             fileSearchObj.id="customsearch1678483870107";
             fileSearchObj.title="DB Temp 2 months ago Custom Document Search (copy)";
             var newSearchId = fileSearchObj.save();
             */
            return errorFilesObj;
        }
        /**
        * @param {ScheduledScriptContext.execute} context
        */
        function execute(context) {
            var fileId;
            var fileObj;
            var task;
            var status;
            var scriptTaskId;
            var importMap = 1289;
            var fileName;
            var processedFilesNameArray;
            var fileSearchObj;
            var searchResultCount;
            var duplicateFileNamesArray = [];
            var errorDetailsArray = [];
            var errorFilesObj = {};
            var x = 1;

            processedFilesNameArray = getProcessedArray();
            errorFilesObj = getErrorFiles();
            log.debug('errorFilesObj', errorFilesObj);
            fileSearchObj = nsSearch.create({
                type: 'file',
                filters:
                    [
                        ['folder', 'anyof', '17820714']
                    ],
                columns:
                    [
                        'name'
                    ]
            });
            searchResultCount = fileSearchObj.runPaged().count;
            log.debug('fileSearchObj result count', searchResultCount);
            fileSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                fileName = result.getValue('name');
                fileId = result.id;
                fileObj = nsFile.load({ id: fileId });
                try {
                    if (fileName in errorFilesObj) {
                        log.debug('found same file name in error folder', 'file: ' + errorFilesObj[fileName].id);
                        nsFile.delete({ id: errorFilesObj[fileName].id });
                    }
                    log.debug('fileId', fileId + typeof fileId);
                    if (processedFilesNameArray.indexOf(fileName) !== -1) {
                        log.debug('Found duplicate file', 'File name: ' + fileName);
                        // move to duplicate folder
                        nsFile.copy({
                            id: parseFloat(fileId),
                            folder: 17820817,
                            conflictResolution: nsFile.NameConflictResolution.OVERWRITE
                        });
                        nsFile.delete({ id: fileId });
                        duplicateFileNamesArray.push(fileName);
                    } else {
                        task = nsTask.create({
                            taskType: nsTask.TaskType.CSV_IMPORT,
                            importFile: fileObj,
                            mappingId: importMap,
                            queueId: x,
                            name: fileName
                        });
                        scriptTaskId = task.submit();
                        log.debug('scriptTaskId', scriptTaskId);
                        if (x % 5 === 0) {
                            x = 1;
                        } else {
                            x += 1;
                            // we want to skip queue 2
                            if (x === 2) {
                                x = 3;
                            }
                        }
                        // do {
                        status = nsTask.checkStatus({
                            taskId: scriptTaskId
                        }).status;
                        log.debug('status', status);
                        wait(3000);
                        // } while (status === 'PENDING' || status === 'PROCESSING');
                        log.debug('Final status for file ID: ' + fileId, status);
                        if (status !== 'FAILED') {
                            // move to processed folder
                            fileObj.folder = 17820715;
                        }
                        if (status === 'FAILED') {
                            // move to error folder
                            fileObj.folder = 17820716;
                            log.error('Failed importing CSV File', 'File Id: ' + fileId);
                            errorDetailsArray.push({
                                error: 'unexpected error',
                                fileName: fileName
                            });
                        }
                        fileId = fileObj.save();
                        log.debug('File moved', 'File Id: ' + fileId);
                    }

                } catch (e) {
                    if (e.message) {
                        log.error('Error', 'Error for file Id: ' + fileId + ' Error: ' + e);
                        errorDetailsArray.push({
                            error: e.message,
                            fileName: fileName
                        });
                    } else {
                        log.error('Error', 'Error for file Id: ' + fileId + ' Error: ' + e);
                        errorDetailsArray.push({
                            error: e,
                            fileName: fileName
                        });
                    }
                    fileObj.folder = 17820716;
                    fileId = fileObj.save();
                }
                return true;
            });
            if (errorDetailsArray.length > 0) {
                sendEmail(errorDetailsArray);
            }
            if (duplicateFileNamesArray.length > 0) {
                sendEmailForDuplicates(duplicateFileNamesArray);
            }
            /*
             fileSearchObj.id="customsearch1675894427292";
             fileSearchObj.title="DB Temp sftp Custom Document Search (copy)";
             var newSearchId = fileSearchObj.save();
             */
            log.debug('Scheduled script finished');
        }
        return {
            execute: execute
        };
    }
);
