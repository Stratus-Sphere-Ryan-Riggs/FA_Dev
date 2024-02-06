/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(
    [
        'N/url'
    ],
    /**
     * @param {N_url} nsUrl
     */
    function (
        nsUrl
    ) {

        /**
        * @param {ClientScriptContext.pageInit} context
        */
        function pageInit(context) {
            var rec = context.currentRecord;
            var internalId = rec.getValue({ fieldId: 'id' }) || '';
            var altName = 'VEN' + internalId;
            var mode = context.mode;

            console.log('mode' + mode);

            if (mode === 'edit') {
                rec.setValue({ fieldId: 'altname', value: altName });
            }
        }

        /**
        * @param {ClientScriptContext.saveRecord} context
        */
        function saveRecord(context) {
            var rec = context.currentRecord;
            var empRel = rec.getValue('custrecord_vendor_employeerelationship') || '';
            var ifYesVendor = rec.getValue('custrecord_kbs_ifyesvendor') || '';

            if (empRel === '1' && ifYesVendor.trim() === '') {
                alert('Please list relationship in Feeding America Affiliation Section.');
                return false;
            }
            return true;
        }

        /**
        * @param {ClientScriptContext.fieldChanged} context
        */
        function fieldChanged(context) {
            var currentRecord = context.currentRecord;
            var fieldId = context.fieldId;
            var vendorName;
            var vendorAddress;
            var vendorCity;
            var vendorState;
            var vendorZip;
            var isSameAsVendor = false;

            if (fieldId === 'custrecord_kbs_vendorsameasabove') {
                isSameAsVendor = currentRecord.getValue('custrecord_kbs_vendorsameasabove');
                if (isSameAsVendor) {
                    console.log('fieldId: ' + fieldId);
                    vendorName = currentRecord.getValue('custrecord_kbs_vendorname');
                    vendorAddress = currentRecord.getValue('custrecord_kbs_vendoraddress');
                    vendorCity = currentRecord.getValue('custrecord_kbs_vendorcity');
                    vendorState = currentRecord.getValue('custrecord_kbs_vendorstate');
                    vendorZip = currentRecord.getValue('custrecord_kbs_vendorzip');
                    currentRecord.setValue({
                        fieldId: 'custrecord_kbs_vendorpayee',
                        value: vendorName
                    });
                    currentRecord.setValue({
                        fieldId: 'custrecord_kbs_remittanceaddress',
                        value: vendorAddress
                    });
                    currentRecord.setValue({
                        fieldId: 'custrecord_kbs_remittancecity',
                        value: vendorCity
                    });
                    currentRecord.setValue({
                        fieldId: 'custrecord_kbs_remittancestate',
                        value: vendorState
                    });
                    currentRecord.setValue({
                        fieldId: 'custrecord_kbs_remittancezip',
                        value: vendorZip
                    });
                }
            }

            return true;
        }
        function createVendorClick() {
            var queryString = window.location.search;
            var urlParams = new URLSearchParams(queryString);
            var recId = urlParams.get('id');
            var slUrl;

            if (recId) {
                slUrl = nsUrl.resolveScript({
                    scriptId: 'customscript_kbs_onlinevendorform_sl',
                    deploymentId: 'customdeploy_kbs_onlinevendorform_sl',
                    params: {
                        custpage_cus_id: recId
                    }
                });
                window.open(slUrl, '_self');
            }

        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            fieldChanged: fieldChanged,
            createVendorClick: createVendorClick
        };
    }
);
