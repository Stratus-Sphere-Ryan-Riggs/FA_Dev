/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(
    [
        'N/record',
        'N/redirect',
        'N/ui/serverWidget'
    ],
    /**
     * @param {N_record} nsRecord
     * @param {N_redirect} nsRedirect
     * @param {N_ui_serverWidget} nsUi
     */
    function (
        nsRecord,
        nsRedirect,
        nsUi
    ) {
        function onGet(context) {
            var url = context.request.parameters;
            var ifId = url.custparam_recid;
            var ifRec;
            var lineCount;
            var x;
            var objForm;
            var ifList;
            var ifField;
            var item;
            var description;
            var quantity;
            var palletsReceived;
            var grossWtReceived;
            var itemField;

            objForm = nsUi.createForm({ title: 'Clear Item Fulfillment Quantities' });
            objForm.clientScriptModulePath = 'SuiteScripts/KBS_ClearIFQuantities_CS.js';
            objForm.addSubmitButton({
                label: 'Submit'
            });
            objForm.addField({ id: 'custpage_selectall', type: nsUi.FieldType.CHECKBOX, label: 'Select All' }).defaultValue = 'T';
            ifField = objForm.addField({
                id: 'custpage_if',
                type: nsUi.FieldType.SELECT,
                label: 'Item Fulfillment',
                source: 'itemfulfillment'
            });
            ifField.updateDisplayType({ displayType: 'INLINE' });

            ifField.defaultValue = ifId;

            // Create the sub form here
            ifList = objForm.addSublist({
                id: 'custpage_iflist',
                type: nsUi.SublistType.LIST,
                label: 'Item Fulfillment Lines',
                tab: null
            });
            ifList.addField({
                id: 'custpage_number',
                label: 'Line #',
                type: nsUi.FieldType.TEXT
            });
            ifList.addField({
                id: 'custpage_select',
                label: 'Select to Clear',
                type: nsUi.FieldType.CHECKBOX
            });
            itemField = ifList.addField({
                id: 'custpage_item',
                label: 'Item',
                type: nsUi.FieldType.SELECT,
                source: 'item'
            });
            itemField.updateDisplayType({ displayType: 'INLINE' });
            ifList.addField({
                id: 'custpage_description',
                label: 'Description',
                type: nsUi.FieldType.TEXT
            });
            ifList.addField({
                id: 'custpage_quantity',
                label: 'Quantity',
                type: nsUi.FieldType.TEXT
            });
            ifList.addField({
                id: 'custpage_palletsreceived',
                label: 'Pallets Received',
                type: nsUi.FieldType.TEXT
            });
            ifList.addField({
                id: 'custpage_grosswtreceived',
                label: 'Gross Weight Received',
                type: nsUi.FieldType.TEXT
            });

            ifRec = nsRecord.load({ type: nsRecord.Type.ITEM_FULFILLMENT, id: ifId });
            lineCount = ifRec.getLineCount({ sublistId: 'item' });

            for (x = 0; x < lineCount; x += 1) {
                ifList.setSublistValue({
                    id: 'custpage_number',
                    line: x,
                    value: (x + 1).toFixed(0)
                });
                ifList.setSublistValue({
                    id: 'custpage_select',
                    line: x,
                    value: 'T'
                });
                item = ifRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: x
                });
                ifList.setSublistValue({
                    id: 'custpage_item',
                    line: x,
                    value: item
                });
                description = ifRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'description',
                    line: x
                });
                if (description) {
                    ifList.setSublistValue({
                        id: 'custpage_description',
                        line: x,
                        value: description
                    });
                }
                quantity = ifRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: x
                });
                ifList.setSublistValue({
                    id: 'custpage_quantity',
                    line: x,
                    value: quantity
                });
                quantity = ifRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: x
                });
                ifList.setSublistValue({
                    id: 'custpage_quantity',
                    line: x,
                    value: quantity
                });
                palletsReceived = ifRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_pallets_received',
                    line: x
                });
                ifList.setSublistValue({
                    id: 'custpage_palletsreceived',
                    line: x,
                    value: palletsReceived
                });
                grossWtReceived = ifRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_gross_wt_received',
                    line: x
                });
                ifList.setSublistValue({
                    id: 'custpage_grosswtreceived',
                    line: x,
                    value: grossWtReceived
                });
            }
            context.response.writePage(objForm);
        }

        function onPost(context) {
            var request = context.request;
            var ifId = request.parameters.custpage_if;
            var ifRec;
            var x;
            var lineCount = request.getLineCount({ group: 'custpage_iflist' });

            ifRec = nsRecord.load({ type: nsRecord.Type.ITEM_FULFILLMENT, id: ifId });

            for (x = 0; x < lineCount; x += 1) {
                if (request.getSublistValue({
                    group: 'custpage_iflist',
                    name: 'custpage_select',
                    line: x
                }) === 'T') {
                    ifRec.setSublistValue({
                        sublistId: 'item', fieldId: 'quantity', line: x, value: 0.00001
                    });
                    ifRec.setSublistValue({
                        sublistId: 'item', fieldId: 'custcol_pallets_received', line: x, value: 0
                    });
                    ifRec.setSublistValue({
                        sublistId: 'item', fieldId: 'custcol_gross_wt_received', line: x, value: 0
                    });
                }
            }
            ifRec.save();

            nsRedirect.toRecord({
                type: nsRecord.Type.ITEM_FULFILLMENT,
                id: ifId,
                isEditMode: false
            });
        }

        /**
        * @param {SuiteletContext.onRequest} context
        */
        function onRequest(context) {
            if (context.request.method === 'GET') {
                onGet(context);
            } else {
                onPost(context);
            }

        }
        return {
            onRequest: onRequest
        };
    }
);
