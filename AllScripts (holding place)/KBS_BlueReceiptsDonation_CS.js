/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(
    [
        'N/search'
    ],
    /**
     * @param {N_search} nsSearch
     */
    function (nsSearch) {

        function isEmpty(stValue) {
            if ((stValue === '') || (stValue == null) || (stValue === undefined)) {
                return true;
            }
            return false;
        }
        /**
        * @param {ClientScriptContext.pageInit} context
        */
        // function pageInit(context) {
        //     var currentRecord = context.currentRecord;
        //     var type = context.mode;
        //     log.debug('mode', type);
        //     log.debug('date', new Date());
        //     if (type === 'create') {
        //         currentRecord.setValue({ fieldId: 'created', value: new Date() });
        //         currentRecord.setText({ fieldId: 'custrecord_donation_type', value: 'Blue' });
        //     }
        // }

        /**
        * @param {ClientScriptContext.fieldChanged} context
        */
        function fieldChanged(context) {
            var currentRecord = context.currentRecord;
            var sublistFieldId = context.fieldId;
            var x;
            var name;
            var fieldLookUp;
            var itemId;
            var fieldBeingSet;
            var handlingText;
            var nsWarehouse;

            log.debug('field changed', sublistFieldId);
            for (x = 1; x <= 8; x += 1) {
                name = 'custrecord_ns_item_' + x;
                if (sublistFieldId === name && !isEmpty(currentRecord.getText({ fieldId: name }))) {
                    fieldBeingSet = 'custrecord_donation_item_' + x;
                    itemId = currentRecord.getValue({ fieldId: name });
                    fieldLookUp = nsSearch.lookupFields({
                        type: nsSearch.Type.ITEM,
                        id: itemId,
                        columns: ['itemid']
                    });
                    currentRecord.setValue({ fieldId: fieldBeingSet, value: fieldLookUp.itemid });
                    break;
                }
            }

            for (x = 1; x <= 8; x += 1) {
                name = 'custrecord_ns_handling_' + x;
                handlingText = currentRecord.getText({ fieldId: name });
                if (sublistFieldId === name && !isEmpty(handlingText)) {
                    fieldBeingSet = 'custrecord_item_handling_' + x;

                    currentRecord.setText({ fieldId: fieldBeingSet, text: handlingText });
                    break;
                }
            }

            if (sublistFieldId === 'custrecord_ns_member' && (!isEmpty(currentRecord.getText({ fieldId: 'custrecord_ns_member' })))) {
                fieldLookUp = nsSearch.lookupFields({
                    type: nsSearch.Type.ENTITY,
                    id: currentRecord.getValue({ fieldId: 'custrecord_ns_member' }),
                    columns: ['entityid']
                });
                currentRecord.setValue({ fieldId: 'custrecord_donation_a2haffiliateid', value: fieldLookUp.entityid });

            }
            if (sublistFieldId === 'custrecord_ns_donor' && (!isEmpty(currentRecord.getText({ fieldId: 'custrecord_ns_donor' })))) {
                fieldLookUp = nsSearch.lookupFields({
                    type: nsSearch.Type.ENTITY,
                    id: currentRecord.getValue({ fieldId: 'custrecord_ns_donor' }),
                    columns: ['entityid']
                });
                currentRecord.setValue({ fieldId: 'custrecord_donation_donor_no', value: fieldLookUp.entityid });

            }
            if (sublistFieldId === 'custrecord_ns_warehouse' && (!isEmpty(currentRecord.getText({ fieldId: 'custrecord_ns_warehouse' })))) {
                nsWarehouse = currentRecord.getValue({ fieldId: 'custrecord_ns_warehouse' });
                fieldLookUp = nsSearch.lookupFields({
                    type: 'customrecord_address_contact_association',
                    id: nsWarehouse,
                    columns: ['custrecord_entity_warehouse_name', 'custrecord_address_city', 'custrecord_addr_line_1',
                        'custrecord_address_line_2', 'custrecord_zip_code', 'custrecord_address_state']
                });
                log.debug('state', fieldLookUp.custrecord_address_state);
                currentRecord.setValue({ fieldId: 'custrecord_warehouse_name', value: fieldLookUp.custrecord_entity_warehouse_name });
                currentRecord.setValue({ fieldId: 'custrecord_warehouse_city', value: fieldLookUp.custrecord_address_city });
                currentRecord.setValue({ fieldId: 'custrecord_warehouse_address', value: fieldLookUp.custrecord_addr_line_1 });
                currentRecord.setValue({ fieldId: 'custrecord_warehouse_address_2', value: fieldLookUp.custrecord_address_line_2 });
                currentRecord.setValue({ fieldId: 'custrecord_warehouse_zip', value: fieldLookUp.custrecord_zip_code });
                currentRecord.setValue({ fieldId: 'custrecord_warehouse_state', value: fieldLookUp.custrecord_address_state[0].text });
            }
        }
        /**
        * @param {ClientScriptContext.saveRecord} context
        */
        function saveRecord(context) {
            var currentRecord = context.currentRecord;
            currentRecord.setValue({ fieldId: 'custrecord_donation_exception', value: '' });
            currentRecord.setValue({ fieldId: 'custrecord_kbs_duplicate_bluereceipt', value: false });
            log.debug('in save record');

            return true;
        }
        return {
            fieldChanged: fieldChanged,
            saveRecord: saveRecord
            // pageInit: pageInit
        };
    }
);
