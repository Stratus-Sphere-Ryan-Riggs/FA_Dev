/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define([
    // "N/error",
    // "N/https",
    "N/record",
    "N/search",
    "N/url",
    // "N/runtime",
    "N/currentRecord",
], function (
    // error,
    // https,
    record,
    search,
    url,
    // runtime,
    currentRecord) {
    const SUBLIST_FIELDS = [
        'doc_id',
        'link',
        'so_type',
        'so_pickupdate',
        'freight_sub',
        'accr_amt',
        'acct',
        'accrue',
        'diff',
        'invs',
        'prod_bills',
        'tran_bills',
        'tran_notes'
    ];
    const CUSTOM_RECORD_NAME = "customrecordsipisnapshot";
    const CUSTOM_RECORD_DATA_FIELD = "custrecorddata";
    function SaveAgent() {
        this.previouslySaved = readSublist();
        this.loadLatestSnapshotId();
        this.originalOnbeforeunload = window.onbeforeunload;
        this.intervalId = setInterval(this.saveForm.bind(this), 5000);
    }
    SaveAgent.prototype.loadLatestSnapshotId = function () {
        const snapSearch = search.create({
            type: CUSTOM_RECORD_NAME,
            columns: [
                search.createColumn({ name: "internalid", sort: "DESC" }),
            ],
        });
        const res = snapSearch.run().getRange({ start: 0, end: 1 });
        this.latestSnapshotId = res[0]
            ? res[0].getValue({ name: "internalid" })
            : null;
    };
    SaveAgent.prototype.updateSavedData = function (data) {
        record.load({
                type: CUSTOM_RECORD_NAME,
                id: this.latestSnapshotId,
            }).setValue({
                fieldId: CUSTOM_RECORD_DATA_FIELD,
                value: JSON.stringify(data),
            }).save();
    };
    SaveAgent.prototype.saveForm = function () {
        try {
            const sublistData = readSublist();
            if (JSON.stringify(this.previouslySaved) !== JSON.stringify(sublistData)) {
                currentRecord.get().setValue({fieldId: 'custpage_status', value: 'Saving data...'});
                window.onbeforeunload = null;
                this.updateSavedData(sublistData);
                this.previouslySaved = sublistData;
                currentRecord.get().setValue({fieldId: 'custpage_status', value: 'Data last saved at ' + new Date().toLocaleString()});
            }
        } catch (e) {
            var details = '';
            if (e && e.message) {
                details = '. Details: ' + e.message;
            }
            console.error(e);
            currentRecord.get().setValue({fieldId: 'custpage_status', value: 'Data could not be saved' + details});
            window.onbeforeunload = this.originalOnbeforeunload;
        }
    };

    function initializeSaveAgent(context) {
        new SaveAgent(context);
    }

    function redirectToSIPISuitelet(params) {
        const scriptId = currentRecord.get().getValue({fieldId: 'custpage_scriptid'});
        const deploymentId = currentRecord.get().getValue({fieldId: 'custpage_deployid'});
        var suiteletUrl = url.resolveScript({
            scriptId: scriptId,
            deploymentId: deploymentId,
            params: params,
        });

        window.location.replace(suiteletUrl);
    }

    function redirectToSIPISuiteletLoadingLastSnapshot() {
        redirectToSIPISuitelet({ loadLastSnapshot: "true" });
    }

    function readSublist() {
        const rec = currentRecord.get();
        const sublistId = "sipiresults";
        const sublistLineCount = rec.getLineCount({ sublistId: sublistId });
        const data = [];
        for (var line = 0; line < sublistLineCount; line++) {
            const currentLine = {};
            SUBLIST_FIELDS.forEach(function (fieldId) {
                const sublistVal = rec.getSublistValue({
                    sublistId: sublistId,
                    fieldId: fieldId,
                    line: line,
                });
                currentLine[fieldId] =
                    sublistVal === true
                        ? "T"
                        : sublistVal === false
                        ? "F"
                        : sublistVal;
                return true;
            });
            data.push(currentLine);
        }
        return data;
    }

    function isLastSnapshotLoaded() {
        return window.location.href.indexOf("loadLastSnapshot") > -1;
        // if (!document.getElementById('div__alert')) {
    }

    function pageInit(context) {
        if (isLastSnapshotLoaded()) {
            initializeSaveAgent();
        }
    }

    function runNewReport() {
        redirectToSIPISuitelet();
    }

    function createNewSnapshot() {
        const data = readSublist();
        record.create({
            type: CUSTOM_RECORD_NAME,
            isDynamic: true,
        }).setValue({
            fieldId: CUSTOM_RECORD_DATA_FIELD,
            value: JSON.stringify(data),
        }).save();
        window.onbeforeunload = null;
        redirectToSIPISuiteletLoadingLastSnapshot();
    }

    function loadLastSnapshot() {
        redirectToSIPISuiteletLoadingLastSnapshot();
    }
    function fieldChanged(context) {
        var orderTypeId;

        if (context.fieldId === 'custpage_ordertype') {
            orderTypeId = context.currentRecord.getValue({
                fieldId: 'custpage_ordertype'
            });

            slUrl = url.resolveScript({
                scriptId: 'customscript_sipi_suitelet',
                deploymentId: 'customdeploy1',
                params: {
                    custscript_ordertype: orderTypeId
                }
            });
            window.onbeforeunload = null;
            window.open(slUrl, '_self');
        }
    }

    return {
        pageInit: pageInit,
        runNewReport: runNewReport,
        createNewSnapshot: createNewSnapshot,
        loadLastSnapshot: loadLastSnapshot,
        fieldChanged: fieldChanged
    };
});
