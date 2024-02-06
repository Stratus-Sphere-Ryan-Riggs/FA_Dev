/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(
    [
        // 'N/record',
        // 'N/task',
        'N/search',
        'N/ui/serverWidget',
        'SuiteScripts/sipi_module.js',
        'N/encode',
        // 'N/xml',
        'N/file'
        // 'N/currentRecord'
    ],
    function (
        // Record,
        // Task,
        Search,
        Ui,
        Sipi,
        Encode,
        // xml,
        file
        // currentRecord
    ) {

        function createForm(options) {
            //const periodNotToInclude = options.periodNotToInclude;
            const context = options.context;
            var orderTypeId = options.orderType || 1;
            var objForm = Ui.createForm({ title: 'SIPI Report' });
            var orderType;

            log.debug('orderTypeId', orderTypeId);
            //objForm.clientScriptFileId = 9895428;
            objForm.clientScriptModulePath = 'SuiteScripts/sipi_client_script.js';
            objForm.addSubmitButton({
                label: 'Export'
            });
            objForm.addButton({
                id: 'runNewReport',
                label: 'Run New Report',
                functionName: 'runNewReport'
            });
            if('true'!==context.request.parameters['loadLastSnapshot']) {
                objForm.addButton({
                    id: 'createNewSnapshot',
                    label: 'Save Report',
                    functionName: 'createNewSnapshot'
                });
                objForm.addButton({
                    id: 'loadLastSnapshot',
                    label: 'Load Saved Report',
                    functionName: 'loadLastSnapshot'
                });
                objForm.addPageInitMessage({
                    type: 'WARNING',
                    message: 'Data is not being saved'
                });
            }
            orderType = objForm.addField({
                id: 'custpage_ordertype',
                type: Ui.FieldType.SELECT,
                label: 'Order Type',
                source: 'customlist_order_type'
            });
            orderType.isMandatory = true;
            orderType.defaultValue = orderTypeId;
            /*var period = objForm.addField({
                id: 'custpage_donotinclude',
                type: Ui.FieldType.TEXT,
                label: 'Do Not Include Posting Period:'
            }).updateDisplayType({displayType: Ui.FieldDisplayType.INLINE});
            period.defaultValue = periodNotToInclude;*/

            var status = objForm.addField({
                id: 'custpage_status',
                type: Ui.FieldType.TEXT,
                label: ' '
            }).updateDisplayType({displayType: Ui.FieldDisplayType.INLINE});
            status.updateLayoutType({layoutType: Ui.FieldLayoutType.OUTSIDEBELOW});
            status.updateBreakType({breakType: Ui.FieldBreakType.STARTROW});

            var scriptId = objForm.addField({
                id: 'custpage_scriptid',
                type: Ui.FieldType.TEXT,
                label: ' '
            }).updateDisplayType({displayType: Ui.FieldDisplayType.HIDDEN});
            scriptId.defaultValue = context.request.parameters.script;

            var deployId = objForm.addField({
                id: 'custpage_deployid',
                type: Ui.FieldType.TEXT,
                label: ' '
            }).updateDisplayType({displayType: Ui.FieldDisplayType.HIDDEN});
            deployId.defaultValue = context.request.parameters.deploy;

          	var sublist = objForm.addSublist({
    			id : 'sipiresults',
   				type : Ui.SublistType.LIST,
    			label : 'SIPI Results'
			});
            var docId = sublist.addField({
         		id : 'doc_id',
         		label : 'Document ID',
     			type : Ui.FieldType.TEXT
			});
            var link = sublist.addField({
         		id : 'link',
         		label : 'Link',
     			type : Ui.FieldType.TEXT
			});
            var orderType = sublist.addField({
                id : 'so_type',
                label : 'Order Type',
                type : Ui.FieldType.TEXT
            });
            var pickupDate = sublist.addField({
                id : 'so_pickupdate',
                label : 'Pickup Date',
                type : Ui.FieldType.TEXT
            });
            var freightSub = sublist.addField({
                id : 'freight_sub',
                label : 'Freight Subsidy?',
                type : Ui.FieldType.TEXT
            });
            var accrue = sublist.addField({
                id : 'accrue',
                label : 'Accrue?',
                type : Ui.FieldType.CHECKBOX
            });
            accrue.updateDisplayType({displayType : Ui.FieldDisplayType.ENTRY});

            var accrueAmount = sublist.addField({
                id : 'accr_amt',
                label : 'Amount to Accrue',
                type : Ui.FieldType.CURRENCY
            });
            accrueAmount.updateDisplayType({displayType : Ui.FieldDisplayType.ENTRY});
            var account = sublist.addField({
                id : 'acct',
                label : 'Acct',
                type : Ui.FieldType.TEXT
            });
            account.updateDisplayType({displayType : Ui.FieldDisplayType.ENTRY});
            var difference = sublist.addField({
                id : 'diff',
                label : 'Difference',
                type : Ui.FieldType.TEXT
            });
            var invoiceTotal = sublist.addField({
                id : 'invs',
                label : 'Invoices - Credit Memos',
                type : Ui.FieldType.TEXT
            });
            var prodBills = sublist.addField({
                id : 'prod_bills',
                label : 'Product Bills - Product Bill Credits',
                type : Ui.FieldType.TEXT
            });
            var tranBills = sublist.addField({
                id : 'tran_bills',
                label : 'Transport Bills - Transport Bill Credits',
                type : Ui.FieldType.TEXT
            });
            var tranNotes = sublist.addField({
                id : 'tran_notes',
                label : 'Notes',
                type : Ui.FieldType.TEXT
            });
            tranNotes.updateDisplayType({displayType : Ui.FieldDisplayType.ENTRY});
            return objForm;
        }
        function loadDataFromSearch(options) {
            //const periodNotToInclude = options.periodNotToInclude;
            var orderType = options.orderType;
            var rsltSearch = Search.load({
                id: 'customsearch3705'
            });
            /*var filter = Search.createFilter({
                name : 'formulatext',
                operator : Search.Operator.IS,
                values : [1],
                formula : "CASE WHEN {postingperiod} LIKE '"+periodNotToInclude+"%' THEN 0 ELSE 1 END",
            });*/
            var filter2 = Search.createFilter({
                name: 'custbody_order_type',
                join: 'custbody_associated_salesorder',
                operator : Search.Operator.ANYOF,
                values : orderType
            });
            //rsltSearch.filters.push(filter);
            rsltSearch.filters.push(filter2);
            //log.debug('rsltSearch', 'rsltSearch = ' + JSON.stringify(rsltSearch));
            var searchResults = rsltSearch.run();
            var currentRange = searchResults.getRange({
                start : 0,
                end : 1000
            });

            var i = 0;
            var j = 0;
            var final = [];
            
            while ( j < currentRange.length ) {
                    //log.debug('currentRange', ' currentRange.length = ' + currentRange.length);
                    var obj = {};
                    obj.id = currentRange[j].getValue(currentRange[j].columns[1]);
                    //log.debug('testScript', ' obj = ' + JSON.stringify(obj));
                    final.push(obj.id);
                    //var finalBal = Sipi.checkSO(obj.id);
                    //log.debug('testScript', ' finalBal= ' + JSON.stringify(finalBal));
                    /*if(finalBal){
                        final.push(finalBal);
                    }*/
                
                i++; j++;
                if( j==1000 ) {
                    j=0;
                    currentRange = searchResults.getRange({
                        start : i,
                        end : i+1000
                    });
                }
            }
            log.debug('testScript', 'final=' + JSON.stringify(final));
            var finalBal = Sipi.checkSO(final);
            log.debug('testScript', 'fullSO=' + JSON.stringify(finalBal));
            return finalBal;
        }
        function populateForm(options) {
            const sublist = options.sublist;
            const finalBal = options.finalBal;
            finalBal.forEach(function(rec,index) {
                sublist.setSublistValue({
                    id: 'doc_id',
                    line: index,
                    value: rec.doc_id
                });
                sublist.setSublistValue({
                    id: 'link',
                    line: index,
                    value: rec.link
                });
                sublist.setSublistValue({
                    id: 'so_type',
                    line: index,
                    value: rec.so_type
                });
                if (rec.so_pickupdate) {
                    sublist.setSublistValue({
                        id: 'so_pickupdate',
                        line: index,
                        value: rec.so_pickupdate
                    });
                }
                if(rec.freight_sub) {
                    sublist.setSublistValue({
                        id: 'freight_sub',
                        line: index,
                        value: rec.freight_sub
                    });
                }
                if(rec.accr_amt) {
                    sublist.setSublistValue({
                        id: 'accr_amt',
                        line: index,
                        value: rec.accr_amt
                    });
                }
                if(rec.acct) {
                    sublist.setSublistValue({
                        id: 'acct',
                        line: index,
                        value: rec.acct
                    });
                }
                if(rec.accrue) {
                    sublist.setSublistValue({
                        id: 'accrue',
                        line: index,
                        value: rec.accrue
                    });
                }
                sublist.setSublistValue({
                    id: 'diff',
                    line: index,
                    value: rec.diff
                });
                sublist.setSublistValue({
                    id: 'invs',
                    line: index,
                    value: rec.invs
                });
                sublist.setSublistValue({
                    id: 'prod_bills',
                    line: index,
                    value: rec.prod_bills
                });
                sublist.setSublistValue({
                    id: 'tran_bills',
                    line: index,
                    value: rec.tran_bills
                });
                if(rec.tran_notes) {
                    sublist.setSublistValue({
                        id: 'tran_notes',
                        line: index,
                        value: rec.tran_notes
                    });
                }
            });
        }

        function loadLatestSnapshot() {
            const snapSearch = Search.create({
                type: 'customrecordsipisnapshot',
                columns: [
                    Search.createColumn({ name: 'internalid', sort: 'DESC' }),
                    Search.createColumn({ name: 'custrecorddata' }),
                ],
            });
            const res = snapSearch.run().getRange({ start: 0, end: 1 });
            return res[0] ? res[0].getValue({ name: 'custrecorddata' }) : [];
        }

        function loadDataFromCustomRecord() {
            const recordDataAsStr = loadLatestSnapshot();
            return JSON.parse(recordDataAsStr);
        }

        function extractDataFromForm(context) {
            var lineCount = context.request.getLineCount({group: 'sipiresults'});
            log.debug('lineCount', 'lineCount=' + lineCount);
            var final = [];
            for (i = 0; i < lineCount; i += 1) {
                var obj = {};
                obj.doc_id = context.request.getSublistValue({
                    group: 'sipiresults',
                    name: 'doc_id',
                    line: i
                });
                obj.link = context.request.getSublistValue({
                    group: 'sipiresults',
                    name: 'link',
                    line: i
                });
                obj.so_type = context.request.getSublistValue({
                    group: 'sipiresults',
                    name: 'so_type',
                    line: i
                });
                obj.so_pickupdate = context.request.getSublistValue({
                    group: 'sipiresults',
                    name: 'so_pickupdate',
                    line: i
                });
                obj.freight_sub = context.request.getSublistValue({
                    group: 'sipiresults',
                    name: 'freight_sub',
                    line: i
                });
                obj.accrue = context.request.getSublistValue({
                    group: 'sipiresults',
                    name: 'accrue',
                    line: i
                });
                if (context.request.getSublistValue({group: 'sipiresults',name: 'accr_amt',line: i})) {
                    obj.accr_amt = context.request.getSublistValue({
                        group: 'sipiresults',
                        name: 'accr_amt',
                        line: i
                    });
                } else {
                  obj.accr_amt = 0;
                }
                obj.acct = context.request.getSublistValue({
                    group: 'sipiresults',
                    name: 'acct',
                    line: i
                });
                obj.diff = context.request.getSublistValue({
                    group: 'sipiresults',
                    name: 'diff',
                    line: i
                });
                obj.invs = context.request.getSublistValue({
                    group: 'sipiresults',
                    name: 'invs',
                    line: i
                });
                obj.prod_bills = context.request.getSublistValue({
                    group: 'sipiresults',
                    name: 'prod_bills',
                    line: i
                });
                obj.tran_bills = context.request.getSublistValue({
                    group: 'sipiresults',
                    name: 'tran_bills',
                    line: i
                });
                obj.tran_notes = context.request.getSublistValue({
                    group: 'sipiresults',
                    name: 'tran_notes',
                    line: i
                });
                final.push(obj);
            }
            log.debug('final1', 'final1=' + JSON.stringify(final));
            return final;
        }

        function getMonthNotToInclude(today) {
			var monthText = new Array();
			monthText[0] = "Jan";
			monthText[1] = "Feb";
			monthText[2] = "Mar";
			monthText[3] = "Apr";
			monthText[4] = "May";
			monthText[5] = "Jun";
			monthText[6] = "Jul";
			monthText[7] = "Aug";
			monthText[8] = "Sep";
			monthText[9] = "Oct";
			monthText[10] = "Nov";
			monthText[11] = "Dec";
            var monthNotToInclude = monthText[today.getMonth()];
            var yearNotToInclude = today.getFullYear();
            var periodNotToInclude = (monthNotToInclude + ' ' + yearNotToInclude);
          
            return periodNotToInclude;
        }
          
        function exportAsCSV(final) {

            var csvText;
            var fieldDelimiter = '"';
            var columnDelimiter = ',';
            var lineDelimiter = '\n';

            csvText = 'SO Number,Order Type,Pickup Date,Freight Subsidy?,Accrue?,Accrue Amt,Acct,Difference,Invoices - Credit Memos,Product Bills - Product Bill Credits,Transport Bills - Transport Bill Credits,Notes\n';

              final.forEach(function(rec,index) {

                    csvText += fieldDelimiter + 'Sales Order #' + rec.doc_id + fieldDelimiter + columnDelimiter;
                  csvText += fieldDelimiter + rec.so_type + fieldDelimiter + columnDelimiter;
                  csvText += fieldDelimiter + rec.so_pickupdate + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + rec.freight_sub + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + rec.accrue + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + rec.accr_amt + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + rec.acct + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + rec.diff + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + rec.invs + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + rec.prod_bills + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + rec.tran_bills + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + rec.tran_notes + fieldDelimiter + lineDelimiter;

            });
           
          			var acct1Total = [];
          			final.forEach(function(rec,index) {
                      var obj = {};
                      if(rec.accrue == 'T' && rec.acct == '5110'){
                        obj.accr_amt = rec.accr_amt;
                        acct1Total.push(obj);
                      }
          			});
          			var acct2Total = [];
          			final.forEach(function(rec,index) {
                      var obj = {};
                      if(rec.accrue == 'T' && rec.acct == '5113'){
                        obj.accr_amt = rec.accr_amt;
                        acct2Total.push(obj);
                      }
          			});
          			var acct3Total = [];
          			final.forEach(function(rec,index) {
                      var obj = {};
                      if(rec.accrue == 'T' && rec.acct == '7111'){
                        obj.accr_amt = rec.accr_amt;
                        acct3Total.push(obj);
                      }
          			});
          			var acct4Total = [];
          			final.forEach(function(rec,index) {
                      var obj = {};
                      if(rec.accrue == 'T' && rec.acct == '7121'){
                        obj.accr_amt = rec.accr_amt;
                        acct4Total.push(obj);
                      }
          			});
          			csvText+= fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + '5110 Total' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + acct1Total.reduce(function(prev, cur) {return parseFloat(prev) + parseFloat(cur.accr_amt);}, 0); + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + lineDelimiter;
           
          			csvText+= fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + '5113 Total' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + acct2Total.reduce(function(prev, cur) {return parseFloat(prev) + parseFloat(cur.accr_amt);}, 0); + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + lineDelimiter;
           
          			csvText+= fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + '7111 Total' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + acct3Total.reduce(function(prev, cur) {return parseFloat(prev) + parseFloat(cur.accr_amt);}, 0); + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + lineDelimiter;
           
          			csvText+= fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + '7121 Total' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + acct4Total.reduce(function(prev, cur) {return parseFloat(prev) + parseFloat(cur.accr_amt);}, 0); + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + columnDelimiter;
                    csvText += fieldDelimiter + ' ' + fieldDelimiter + lineDelimiter;
          
            log.debug('csvTextmod', ' csvText = ' + csvText);

            var csvData = Encode.convert({
                    string: csvText,
                    inputEncoding: Encode.Encoding.UTF_8,
                    outputEncoding: Encode.Encoding.BASE_64
                });
            var objCsvFile = file.create({
                         name : 'sipi_export.csv',
                         fileType : file.Type.EXCEL,
                         contents : csvData,
                         folder: 9865678
                      });
             var fileId = objCsvFile.save();
             
        }
        
        function get(context) {
            var periodNotToInclude = getMonthNotToInclude(new Date);
            var orderType = context.request.parameters.custscript_ordertype || 1;
            var objForm = createForm({
                periodNotToInclude: periodNotToInclude,
                context: context,
                orderType: orderType
            });
            var finalBal;
            if('true'===context.request.parameters['loadLastSnapshot']) {
                finalBal = loadDataFromCustomRecord();
            } else {
                finalBal = loadDataFromSearch({periodNotToInclude:periodNotToInclude, orderType: orderType});
            }
            populateForm({
                sublist: objForm.getSublist({id: 'sipiresults'}),
                finalBal: finalBal
            });
            context.response.writePage(objForm);
        }

        function post(context) {
            var final = extractDataFromForm(context);
            var objForm = createForm({
                periodNotToInclude:context.request.parameters.custpage_donotinclude,
                context: context,
                orderType: context.request.parameters.custscript_ordertype
            });
            populateForm({
                sublist: objForm.getSublist({id: 'sipiresults'}),
                finalBal: final
            });

            exportAsCSV(final);
            context.response.writePage(objForm);
        }

        function onRequest(context) {
            const method = context.request.method;

            if (method === 'GET') {
                get(context);
            }
            if (method === 'POST') {
                post(context);
            }
        }

        return {
            onRequest: onRequest
        };
    }
);
