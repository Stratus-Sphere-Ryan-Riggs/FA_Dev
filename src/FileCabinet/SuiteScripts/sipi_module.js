/**
 *sipi_module.js
 *@NApiVersion 2.x
 */
define(
    [
        'N/search'
    ],
    function (
        Search
    ) {

        function checkSO(id) {
            if (id.length > 0) {
                var today = new Date();
                var periodNotToInclude = getMonthNotToInclude(today);

                var rsltSearch = Search.load({
                    id: 'customsearch3146'
                });

                var filter = Search.createFilter({
                    name: 'internalid',
                    join: 'custbody_associated_salesorder',
                    operator: Search.Operator.ANYOF,
                    values: id
                });

                var filter2 = Search.createFilter({
                    name: 'formulatext',
                    operator: Search.Operator.IS,
                    values: [1],
                    formula: "CASE WHEN {postingperiod} LIKE '" + periodNotToInclude + "%' THEN 0 ELSE 1 END"
                });
                log.error('SO Id length', id.length);
                log.error('periodNotToInclude', periodNotToInclude);
                rsltSearch.filters.push(filter);
                rsltSearch.filters.push(filter2);

                var searchResults = rsltSearch.run();
                var currentRange = searchResults.getRange({
              	start: 0,
              	end: 1000
                });

                var i = 0;
                var j = 0;
                var final = [];

                while (j < currentRange.length) {
                    var obj = {};
                    obj.doc_id = currentRange[j].getValue(currentRange[j].columns[0]);
                    obj.id = currentRange[j].getValue(currentRange[j].columns[1]);
                    obj.link = currentRange[j].getValue(currentRange[j].columns[2]);
                    obj.so_disaster = currentRange[j].getValue(currentRange[j].columns[3]);
                    obj.so_type = currentRange[j].getValue(currentRange[j].columns[4]);
                    obj.status = currentRange[j].getValue(currentRange[j].columns[5]);
                    obj.freight_sub = currentRange[j].getValue(currentRange[j].columns[6]);
                    obj.diff = currentRange[j].getValue(currentRange[j].columns[7]);
                    if (currentRange[j].getValue(currentRange[j].columns[8])) {
                        obj.invs = currentRange[j].getValue(currentRange[j].columns[8]);
                    } else {
                        obj.invs = 0;
                    }
                    if (currentRange[j].getValue(currentRange[j].columns[9])) {
                        obj.prod_bills = currentRange[j].getValue(currentRange[j].columns[9]);
                    } else {
                        obj.prod_bills = 0;
                    }
                    if (currentRange[j].getValue(currentRange[j].columns[10])) {
                        obj.tran_bills = currentRange[j].getValue(currentRange[j].columns[10]);
                    } else {
                        obj.tran_bills = 0;
                    }
                    if (currentRange[j].getValue(currentRange[j].columns[11])) {
                        obj.so_pickupdate = currentRange[j].getValue(currentRange[j].columns[11]);
                    } else {
                        obj.so_pickupdate = '';
                    }

                    // log.debug('testScript', ' obj = ' + JSON.stringify(obj));
                    final.push(obj);

                    i++; j++;
                    if (j == 1000) {
                        j = 0;
                        currentRange = searchResults.getRange({
                            start: i,
                            end: i + 1000
                        });
                    }

                }

                return final;
            }
            return [];

        }

        function getMonthNotToInclude(today) {

            var monthText = new Array();
            monthText[0] = 'Jan';
            monthText[1] = 'Feb';
            monthText[2] = 'Mar';
            monthText[3] = 'Apr';
            monthText[4] = 'May';
            monthText[5] = 'Jun';
            monthText[6] = 'Jul';
            monthText[7] = 'Aug';
            monthText[8] = 'Sep';
            monthText[9] = 'Oct';
            monthText[10] = 'Nov';
            monthText[11] = 'Dec';
            var monthNotToInclude = monthText[today.getMonth()];
            var yearNotToInclude = today.getFullYear();
            var periodNotToInclude = (monthNotToInclude + ' ' + yearNotToInclude);

            return periodNotToInclude;
        }

        return {
            checkSO: checkSO
        };
    }
);
