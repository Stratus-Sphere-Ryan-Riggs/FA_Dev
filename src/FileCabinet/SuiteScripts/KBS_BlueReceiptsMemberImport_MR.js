/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(
    [
        'N/record',
        'N/search',
        './moment-v2.24.0'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_search} nsSearch
     */
    function (
        nsRecord,
        nsSearch,
        moment
    ) {
        function setNSImportRecToProcessed(recId, importId) {
            nsRecord.submitFields({
                type: 'customrecord_kbs_nsmember_import',
                id: importId,
                values: {
                    custrecord_kbs_processed: true,
                    custrecord_kbs_parent_consolidated_br: recId
                },
                options: {
                    enablesourcing: true,
                    ignoreMandatoryFields: true
                }
            });
        }

        function getInputData() {
            var searchResultCount;
            var search;

            search = nsSearch.create({
                type: 'customrecord_kbs_nsmember_import',
                filters: [
                    ['custrecord_kbs_processed', 'is', 'F'],
                    'AND',
                    ['created', 'onorbefore', 'hoursago1'],
                    'AND',
                    ['isinactive','is','F']
                    // ['custrecord_donation_shipment_no_ns', 'contains', 'PO290601']
                ],
                columns:
                [
                    { name: 'internalid', label: 'id' },
                    { name: 'custrecord_donation_a2haffiliateid_ns', label: 'A2HAffiliateID' },
                    { name: 'custrecord_donation_donor_no_ns', label: 'Donor No' },
                    { name: 'custrecord_warehouse_name_ns', label: 'Warehouse Name' },
                    { name: 'custrecord_warehouse_city_ns', label: 'Warehouse City' },
                    { name: 'custrecord_warehouse_address_ns', label: 'Warehouse Address' },
                    { name: 'custrecord_warehouse_city_ns', label: 'Warehouse City' },
                    { name: 'custrecord_warehouse_state_ns', label: 'Warehouse State' },
                    { name: 'custrecord_warehouse_zip_ns', label: 'Warehouse Zip' },
                    { name: 'custrecord_donation_warehouse_contactns', label: 'Warehouse Contact' },
                    { name: 'custrecord_donation_shipment_no_ns', label: 'Shipment Number' },
                    { name: 'custrecord_donation_sent_receipt_ns', label: 'Sent Receipt' },
                    { name: 'custrecord_full_date_ns', label: 'Full Date' },
                    { name: 'custrecord_donation_item_ns', label: 'Item' },
                    { name: 'custrecord_donation_item_description_ns', label: 'Item Description' },
                    { name: 'custrecord_donation_units_ns', label: 'Donation Units' },
                    { name: 'custrecord_donation_pounds_ns', label: 'Donation Pounds' },
                    { name: 'custrecord_item_handling_ns', label: 'Handling' },
                    { name: 'custrecord_item_date_ns', label: 'Item Date' }
                ]
            });
            searchResultCount = search.runPaged().count;
            log.debug('search result count', searchResultCount);
            return search;
        }

        function map(context) {
            var mYKey;
            var searchResult = JSON.parse(context.value).values;
            // log.debug('SearchResult  ', searchResult);
            mYKey = searchResult.custrecord_donation_shipment_no_ns;

            context.write({
                key: mYKey,
                value: searchResult
            });

        }

        function reduce(context) {
            // Create old record
            var vals = context.values;
            var currData;
            var rec;
            var i;
            var x;
            var recId;
            var nsMemberImportIds = [];
            var y;

            log.debug('creating new rec ', context);
            for (i = 0, x = 1; i < vals.length; i += 1, x += 1) {
                currData = JSON.parse(vals[i]);
                nsMemberImportIds.push(parseInt(currData.internalid.value, 0));
                if (i % 8 === 0) { // Create new record for every 8 values in the vals array
                    // Need to reset the x variable to 1
                    x = 1;

                    // Save the current rec object before creating new one
                    if (i > 0) {
                        recId = rec.save({
                            enablesourcing: true,
                            ignoreMandatoryFields: true
                        });
                        for (y = 0; y < nsMemberImportIds.length; y += 1) {
                            // according to above logic it'll pick the first 9 instead of 8
                            if (y !== 8) {
                                log.debug('nsMemberImportId', nsMemberImportIds[y] + ' position: ' + y + ' recid: ' + recId);
                                setNSImportRecToProcessed(recId, nsMemberImportIds[y]);
                            } else {
                                nsMemberImportIds = [];
                                nsMemberImportIds.push(parseInt(currData.internalid.value, 0));
                            }
                        }
                    }
                    rec = nsRecord.create({
                        type: 'customrecord_donation_import'
                    });

                    // Set the header values
                    rec.setValue({ fieldId: 'custrecord_donation_type', value: 1 });
                    rec.setValue({ fieldId: 'custrecord_donation_a2haffiliateid', value: currData.custrecord_donation_a2haffiliateid_ns });
                    rec.setValue({ fieldId: 'custrecord_donation_shipment_no', value: currData.custrecord_donation_shipment_no_ns });
                    rec.setValue({ fieldId: 'custrecord_donation_donor_no', value: currData.custrecord_donation_donor_no_ns });
                    rec.setValue({ fieldId: 'custrecord_donation_on_truck', value: 'TBD' });
                    rec.setValue({ fieldId: 'custrecord_donation_sent_receipt', value: currData.custrecord_donation_sent_receipt_ns });
                    rec.setValue({ fieldId: 'custrecord_full_date', value: moment(currData.custrecord_full_date_ns, 'M/D/YYYY').toDate() });
                    rec.setValue({ fieldId: 'custrecord_donation_warehouse_contact', value: currData.custrecord_donation_warehouse_contactns });
                    rec.setValue({ fieldId: 'custrecord_warehouse_zip', value: currData.custrecord_warehouse_zip_ns });
                    rec.setValue({ fieldId: 'custrecord_warehouse_state', value: currData.custrecord_warehouse_state_ns });
                    rec.setValue({ fieldId: 'custrecord_warehouse_city', value: currData.custrecord_warehouse_city_ns });
                    rec.setValue({ fieldId: 'custrecord_warehouse_address', value: currData.custrecord_warehouse_address_ns });
                    rec.setValue({ fieldId: 'custrecord_warehouse_name', value: currData.custrecord_warehouse_name_ns });
                }
                // Set the "line" values using the 'x' variable to impact which field gets set
                rec.setValue({ fieldId: 'custrecord_donation_item_' + x, value: currData.custrecord_donation_item_ns });
                rec.setValue({ fieldId: 'custrecord_donation_item_description_' + x, value: currData.custrecord_donation_item_description_ns });
                rec.setValue({ fieldId: 'custrecord_item_handling_' + x, value: currData.custrecord_item_handling_ns });
                rec.setValue({ fieldId: 'custrecord_donation_units_' + x, value: currData.custrecord_donation_units_ns });
                rec.setValue({ fieldId: 'custrecord_donation_pounds_' + x, value: currData.custrecord_donation_pounds_ns });
                rec.setValue({ fieldId: 'custrecord_item_date_' + x, value: moment(currData.custrecord_item_date_ns).toDate() });
            }

            if (rec) {
                recId = rec.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                for (y = 0; y < nsMemberImportIds.length; y += 1) {
                    log.debug('Final nsMemberImportId', nsMemberImportIds[y] + ' position: ' + y + ' recid: ' + recId);
                    setNSImportRecToProcessed(recId, nsMemberImportIds[y]);
                }
            }
        }

        function summarize(summary) {
            var mapArray = [];
            var arrCtr = 0;
            try {
                summary.reduceSummary.keys.iterator().each(function (key) {
                    mapArray.push(key);
                    arrCtr += 1;
                    return true;
                });
                log.audit('reduceSummary', 'Processed ' + arrCtr + ', transactions');

                log.debug('summary', JSON.stringify(summary));
                // This is the error iterator. It will trigger for each error that ocurred during the map stage (if any).
                // The below function will log out each of those errors for you.
                summary.reduceSummary.errors.iterator().each(function (key, error, executionNo) {
                    log.error('reduce key = ' + key, 'Message is ' + JSON.stringify(error));
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
