/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(
    [
        'N/runtime',
        'N/record',
        'N/url',
        'N/ui/serverWidget',
        'N/search'
    ],
    /**
     * @param {N_runtime} nsRuntime
     * @param {N_record} nsRecord
     * @param {N_url} nsUrl
     * @param {N_ui_serverWidget} nsServerWidget
     * @param {N_search} nsSearch
     */
    function (
        nsRuntime,
        nsRecord,
        nsUrl,
        nsServerWidget,
        nsSearch
    ) {
        function lockGrossWeighRecievedField(form, recId) {
            var hasResult = false;
            var itemSublist;
            var itemfulfillmentSearchObj = nsSearch.create({
                type: 'itemfulfillment',
                filters:
                [
                    ['createdfrom.custbody_order_type', 'anyof', '2', '3', '5', '8', '9'],
                    'AND',
                    ['createdfrom.trandate', 'before', 'startofthisfiscalyear'],
                    'AND',
                    ['mainline', 'is', 'T'],
                    'AND',
                    ["formulatext: CASE WHEN TO_CHAR({today}, 'MM') != 07 THEN 'LOCK' ELSE 'UNLOCK' END", 'is', 'LOCK'],
                    'AND',
                    ['internalid', 'anyof', recId]
                ],
                columns: []
            });
            var searchResultCount = itemfulfillmentSearchObj.runPaged().count;
            log.debug('itemfulfillmentSearchObj result count', searchResultCount);
            itemfulfillmentSearchObj.run().each(function (result) {
                // .run().each has a limit of 4,000 results
                hasResult = true;
                itemSublist = form.getSublist({
                    id: 'item'
                });
                itemSublist.getField({
                    id: 'custcol_gross_wt_received'
                }).updateDisplayType({ displayType: nsServerWidget.FieldDisplayType.DISABLED });
                return false;
            });

            /*
             itemfulfillmentSearchObj.id="customsearch1698087682912";
             itemfulfillmentSearchObj.title="KBS - Lock Item Fulfillment Gross Weight Received (copy)";
             var newSearchId = itemfulfillmentSearchObj.save();
             */
            return hasResult;
        }
        /**
        * @param {UserEventContext.beforeLoad} context
        */
        function beforeLoad(context) {
            var form = context.form;
            var rec = context.newRecord;
            var status;
            var userObj = nsRuntime.getCurrentUser();
            var totalPounds;
            // FA Customer Service Rep, FA Grocery Program Manager, FA Customer Service Rep Manager, FA Customer Service Rep Admin
            var validRolesForButton = [1019, 1056, 1061, 1089];
            var slUrl;
            var hasResult;

            totalPounds = rec.getValue('custbody_total_pounds') || 0;

            log.debug('status', status);
            hasResult = lockGrossWeighRecievedField(form, rec.id);
            if ((validRolesForButton.indexOf(userObj.role) > -1 && totalPounds > 0 && !hasResult) || (userObj.role === 3 && totalPounds > 0)) {
                slUrl = nsUrl.resolveScript({
                    scriptId: 'customscript_kbs_clearifquantities_sl',
                    deploymentId: 'customdeploy_kbs_clearifquantities_sl',
                    params: {
                        custparam_recid: rec.id
                    }
                });
                form.addButton({ id: 'custpage_clearifquantities', label: 'Clear IF Quantities', functionName: 'window.open("' + slUrl + '", "_self");' });
                // form.clientScriptModulePath = 'SuiteScripts/KBS_ClearIFQuantities_CS.js';
            }
        }

        /**
        * @param {UserEventContext.beforeSubmit} context
        */
        function beforeSubmit(context) {
            var executionContext = nsRuntime.executionContext;
            var rec = context.newRecord;
            var type = context.type;
            var currentUserName = nsRuntime.getCurrentUser().name;
            var soId;

            if (executionContext === 'USERINTERFACE' && type === context.UserEventType.CREATE) {
                soId = rec.getValue('createdfrom');
                if (soId && currentUserName) {
                    nsRecord.submitFields({
                        type: nsRecord.Type.SALES_ORDER,
                        id: soId,
                        values: {
                            custbody_receipted_by: currentUserName
                        },
                        options: {
                            enablesourcing: true,
                            ignoreMandatoryFields: true
                        }
                    });
                }
            }
        }

        // /**
        // * @param {UserEventContext.afterSubmit} context
        // */
        // function afterSubmit(context) {
        //
        // }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit
            // afterSubmit: afterSubmit
        };
    }
);
