// KBS_MODULE.js
// Version 1.0
// authors : Todd Grimm
// Includes: fixup, lookupThings, setHeaderVals, searchForEachResult, setSublistVals, CodeException

/* eslint-disable */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['N/runtime', 'N/search', 'N/util'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('N/runtime'), require('N/search'), require('N/util'));
    }
}(this, function (nsRuntime, nsSearch, nsUtil) {
    var env;
    // I still need to implement a way to break the function callback.
    function searchForEachResult(search, callback) {
        var pagedData;
        var page;

        pagedData = search.runPaged({
            pageSize: 1000
        });
        pagedData.pageRanges.forEach(function (pageRange) {
            log.debug('searchForEachResult batch: ' + pageRange.index);
            page = pagedData.fetch({
                index: pageRange.index
            });
            page.data.forEach(function (result) {
                callback(result);
            });
        });
        log.debug('searchForEachResult complete');
    }
    function setHeaderVals(rec, fieldChange, data) {
        Object.keys(data).forEach(function (field) {
            rec.setValue({
                fieldId: field,
                value: data[field],
                ignoreFieldChange: fieldChange
            });
        });
    }
    function setSublistVals(rec, list, index, data) {
        Object.keys(data).forEach(function (field) {
            log.debug('setSublistVals for list ' + list + ', at ' + index, 'field: ' + field + ', value: ' + data[field]);
            rec.setSublistValue({
                sublistId: list,
                fieldId: field,
                line: index,
                value: data[field]
            });
        });
    }
    function lookupThings(type, id, columns, text) {
        var lookup;
        var temp;
        var i;
        var cols = [];
        var res = {};

        cols = nsUtil.isArray(columns) ? columns : [columns];
        lookup = nsSearch.lookupFields({
            type: type,
            id: id,
            columns: cols
        });

        for (i = 0; cols && cols.length > i; i += 1) {
            temp = cols[i];
            if (!nsUtil.isArray(lookup[temp])) {
                res[temp] = lookup[temp];
            } else if (lookup[temp][0]) {
                res[temp] = text ? {
                    value: lookup[temp][0].value,
                    text: lookup[temp][0].text
                } : lookup[temp][0].value;
            } else {
                res[temp] = '';
            }
        }
        log.debug('lookupThings complete for ' + type, JSON.stringify(res, null, 4));
        return res;
    }
    function CodeException(name, message) {
        log.error('CODE_EXCEPTION', 'Name= ' + name + '. Message= ' + message);
        return {
            name: name,
            message: message
        };
    }
    function fixup (d, t, p) {
        var result;
        var dev = d;
        var test = (t === null || t === undefined) ? d : t;
        var prod = (p === null || p === undefined) ? d : p;
        var envirType;

        if (!nsRuntime) {
            result = dev;
        } else {
            envirType = nsRuntime.envType;
            if (!env) {
                if (envirType === 'SANDBOX') {
                    env = nsRuntime.accountId.indexOf('SB2') >= 0 ? 'TEST' : 'DEV';
                } else {
                    env = 'PROD';
                }
            }
            result = env === 'PROD' ? prod : env === 'TEST' ? test : dev;
        }
        return result;
    }
    return {
        fixup: fixup,
        searchForEachResult: searchForEachResult,
        setHeaderVals: setHeaderVals,
        setSublistVals: setSublistVals,
        lookupThings: lookupThings,
        CodeException: CodeException
    };
}));
