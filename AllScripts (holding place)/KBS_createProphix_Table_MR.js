/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        'N/search',
        'N/runtime',
        'N/sftp',
        'N/file'
    ],
    /**
     * @param {N_search} nsSearch
     * @param {N_runtime}  nsRuntime
     * @param {N_sftp} nsSftp
     * @param {N_file}   nsFile
     */
    function (
        nsSearch,
        nsRuntime,
        nsSftp,
        nsFile
    ) {
        /**
         *
         * @param {Object.<string, fundObjDef} projData
         * @returns {Object.<string, classObjDef}
         */

        function sendtoFTPSite(fileId) {
            var SFTP_CREDS = {
                hr: {
                    archiveDir: '/ProphixSummaryReport',
                    name: 'SVC_EnterpriseDataWarehouse',
                    url: 'SecureFTP.feedingamerica.org',
                    g: '6e6630c14fb84e71aa124f93426e2ed1',

                    k: 'AAAAB3NzaC1kc3MAAACBAKS6np54cE26YZ/Hr2voNhAH3DBdUSNvwS/f3rxJB/i4qJJDSL499obSp3YTe3Z225hFXARbSecp7XrPQofKW9zG6o1P5f5gEa14ua/s16npOP2sFqHwL5uWO8cO'
                  	+ 'hvQJrPI+oVOp4b+YCemFEqxR/30GlD7i+g28Tl1ZEDWd/5+FAAAAFQCBnqqzxJQILqh/1uxdsyChMTD/wwAAAIBLUHFHgJKsNhhrzNiapF/zOa4UzN8Q1mCulJoiu1ULAz6vAs2WpsckzvVdPO'
                    + 'J/bkfY/L4IKGGUaFhVbQxS/+eVHPCPx4uLpEloFunsnEb6pqUIckpdGL1+RN2kLG8FH0rxEPF7OPELU/gXSp3+pZjbmbewGQLgueFBHVTy6U4vLwAAAIBNfOeoAmwpfatdJ8BCe2bJUufOgRC'
                    + 'wshkDOpWE2FWIPQIn6adU7u9RYGcKBbI7oZIQO+4JxTLx698n7GNuVsca74jOsEtWlTeuNUoSr7Rn47jXF8RZpKCsQ8RKwQbtGVhyLMd2FSf0HZTFrVjBJR1/GaE0igk9GQCDxa0NSCh5Dg=='
                }
            };

            var connection = nsSftp.createConnection({
                url: SFTP_CREDS.hr.url,
                passwordGuid: SFTP_CREDS.hr.g,
                hostKey: SFTP_CREDS.hr.k,
                hostKeyType: 'dsa',
                username: SFTP_CREDS.hr.name,
                port: 22
            });
            var file;

            file = nsFile.load({
                id: fileId
            });
            log.audit(' connection ', connection);
            log.audit('file is ', file.id);

            connection.upload({
                file: file,
                timeout: 60,

                directory: SFTP_CREDS.hr.archiveDir,
                replaceExisting: true
            });
        }


        function getInputData() {
            var mySearch = nsSearch.create({
                type: 'transaction',
                filters: [
                    ['posting', 'is', 'T'], 'and',
                    ['account.type', 'anyof', ['AcctPay']]
                ],
                columns: [

                    { name: 'postingperiod', summary: 'GROUP', sort: nsSearch.Sort.ASC },
                    { name: 'periodname', join: 'accountingPeriod', summary: 'GROUP' },
                    { name: 'internalid', join: 'accountingPeriod', summary: 'GROUP' },

                    {
                        name: 'account',
                        summary: 'GROUP'
                    },
                    {
                        name: 'internalid',
                        join: 'account',
                        summary: 'GROUP'
                    },
                    {
                        name: 'department',
                        summary: 'GROUP'
                    },
                    {
                        name: 'class',
                        summary: 'GROUP'
                    },
                    {
                        name: 'location',
                        summary: 'GROUP'
                    },

                    {
                        name: 'formulatext',
                        summary: 'GROUP',
                        formula: "NVL({custcol_cseg_projects_cseg}, '00000 No Project')"

                    },
                    {
                        name: 'formulanumeric',
                        summary: 'GROUP',
                        formula: "NVL({custcol_cseg_projects_cseg.id}, '1' )"

                    },

                    {
                        name: 'amount', summary: 'SUM'
                    }
                ]
            });

            //log.debug('entered MR script');
            return mySearch;

        }

        function map(context) {
            // Convert the JSON value returned by the system into a JS object
            var output = [];
            var searchResult = JSON.parse(context.value).values;

            // log.debug('SearchResult  ', searchResult);

            output.push({
                postingPeriod: searchResult['GROUP(postingperiod)'].value,
                periodName: searchResult['GROUP(postingperiod)'].text,

                account: searchResult['GROUP(account)'].text,
                accountId: searchResult['GROUP(account)'].value,

                departmentName: searchResult['GROUP(department)'].text,
                departmentId: searchResult['GROUP(department)'].value,

                class: searchResult['GROUP(class)'].text,
                classId: searchResult['GROUP(class)'].value,

                locationName: searchResult['GROUP(location)'].text,
                locationId: searchResult['GROUP(location)'].value,

                projectName: searchResult['GROUP(formulatext)'],
                projectId: searchResult['GROUP(formulanumeric)'],

                amount: searchResult['SUM(amount)']
            });
             //log.debug('what is the output ', output);

            context.write({
                key: 1,
                value: output

            });

        }
        function reduce(context) {
            var vals = context.values;
            var i;
            var currData;
            var inner;
            var outer = [];
            var fileHeader;
            var csvContents;
            var csvFile;
            var fileId;
            var fileName = nsRuntime.getCurrentScript().getParameter({ name: 'custscript_kbs_filename' });

            for (i = 0; i < vals.length; i += 1) {
                currData = JSON.parse(vals[i]);

                 //log.debug('currData ', currData);
                inner = [];
                inner.push('"' + currData[0].account + '"'); // Account
                inner.push('"' + currData[0].accountId + '"'); // Account Num
                inner.push('"' + currData[0].periodName + '"'); // Period
                inner.push('"' + currData[0].postingPeriod + '"'); // Period
                inner.push('"' + currData[0].class + '"'); // Class
                inner.push('"' + currData[0].classId + '"'); // Class ID
                inner.push('"' + currData[0].departmentName + '"'); // Department
                inner.push('"' + currData[0].departmentId + '"'); // Department
                inner.push('"' + currData[0].locationName + '"'); // Fund
                inner.push('"' + currData[0].locationId + '"'); // Fund
                inner.push('"' + currData[0].projectName + '"'); // Project
                inner.push('"' + currData[0].projectId + '"'); // Project
                inner.push('"' + currData[0].amount + '"'); // Amount
                outer.push(inner);
            }

            log.audit('this is the entire file ', outer);
            fileHeader = [
                'Account',
                'Act Number',
                'Period Name',
                'PeiodID',
                'Class',
                'Class ID',
                'Program',
                'Program  ID',
                'Fund',
                'Fund ID',
                'Project',
                'Project ID',
                'Amount'
            ];

             //log.debug('ourter var ', outer);
             
             log.audit('ourter var ', outer);
            csvContents = fileHeader + '\r\n' + outer.join('\r\n');

             log.audit('csvContents ', csvContents);
             log.audit('fileName ', fileName);
            //log.debug('fileId', fileId);
            try {
            csvFile = nsFile.create({
                fileType: nsFile.Type.CSV,
                name: fileName,
                contents: csvContents,
                description: 'This is a file for Upload to Prophix.',
                folder: 7732291,
                encoding: nsFile.Encoding.UTF8
            });

            fileId = csvFile.save();
            log.audit('fileId', fileId);
            }
          catch(e) {
            log.audit('error', e);
          }
            sendtoFTPSite(fileId);
        }

        function summarize(summary) {
            var mapArray = [];
            var arrCtr = 0;
            try {
                summary.mapSummary.keys.iterator().each(function (key) {
                    mapArray.push(key);
                    arrCtr += 1;
                    return true;
                });
                log.audit('mapSummary', 'Processed ' + arrCtr + ', transactions');

                log.debug('summary', JSON.stringify(summary));
                // This is the error iterator. It will trigger for each error that ocurred during the map stage (if any).
                // The below function will log out each of those errors for you.
                summary.mapSummary.errors.iterator().each(function (key, error, executionNo) {
                    log.error('map key = ' + key, 'Message is ' + JSON.stringify(error));
                    return true;
                });
            } catch (ex) {
                log.error(ex.name, JSON.stringify(ex));
            }

        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    }
);
