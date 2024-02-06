/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(
    [
        'N/search',
        'N/record'
    ],
    /**
     * @param {N_search} nsSearch
     * @param {N_record} nsRecord
     */
    function (
        nsSearch,
        nsRecord
    ) {
        function setValuesFromOnlineForm(addressSubrecord, vendOnlineFormId) {
            var addSubRec = addressSubrecord;
            var vendFormId;

            var vendorformSearchObj = nsSearch.create({
                type: 'customrecord_kbs_vendorform',
                filters:
                [
                    ['internalid', 'is', vendOnlineFormId]
                ],
                columns:
                    [
                        nsSearch.createColumn({ name: 'custrecord_kbs_vendorpayee' }),
                        nsSearch.createColumn({ name: 'custrecord_kbs_remittanceaddress' }),
                        nsSearch.createColumn({ name: 'custrecord_kbs_remittancecity' }),
                        nsSearch.createColumn({ name: 'custrecord_kbs_remittancestate' }),
                        nsSearch.createColumn({ name: 'custrecord_kbs_remittancezip' })
                    ]
            });
            var searchResultCount = vendorformSearchObj.runPaged().count;
            log.debug('vendorformSearchObj result count', searchResultCount);
            vendorformSearchObj.run().each(function (result) {
                addSubRec.setValue({
                    fieldId: 'addressee',
                    value: result.getValue('custrecord_kbs_vendorpayee') || ''
                });
                addSubRec.setValue({
                    fieldId: 'addr1',
                    value: result.getValue('custrecord_kbs_remittanceaddress') || ''
                });
                addSubRec.setValue({
                    fieldId: 'city',
                    value: result.getValue('custrecord_kbs_remittancecity') || ''
                });
                addSubRec.setValue({
                    fieldId: 'state',
                    value: result.getValue('custrecord_kbs_remittancestate') || ''
                });
                addSubRec.setValue({
                    fieldId: 'zip',
                    value: result.getValue('custrecord_kbs_remittancezip') || ''
                });
                vendFormId = result.id;
                log.debug('internalId1', vendFormId);
                // .run().each has a limit of 4,000 results
                return false;
            });
            return vendFormId;
        }
        function setAddress(rec, vendOnlineFormId) {
            var addressSubrecord;
            var venFormId;

            rec.selectLine({
                sublistId: 'addressbook',
                line: 0
            });
            rec.setCurrentSublistValue({
                sublistId: 'addressbook',
                fieldId: 'label',
                value: rec.getValue('companyname') || ''
            });
            rec.setCurrentSublistValue({
                sublistId: 'addressbook',
                fieldId: 'country',
                value: 'US'
            });
            addressSubrecord = rec.getCurrentSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress'
            });
            addressSubrecord.setValue({
                fieldId: 'addressee',
                value: rec.getValue('companyname') || ''
            });
            addressSubrecord.setValue({
                fieldId: 'addrphone',
                value: rec.getValue('phone') || ''
            });

            venFormId = setValuesFromOnlineForm(addressSubrecord, vendOnlineFormId);

            log.debug('addressSubrecord', addressSubrecord);

            rec.commitLine({
                sublistId: 'addressbook'
            });
            return venFormId;
        }

        /**
        * @param {UserEventContext.beforeLoad} context
        */
        function beforeLoad(context) {
            var params = context.request.parameters;
            var newVendFormId = params.custparam_id;
            var vendorformSearchObj;
            var searchResultCount;
            var rec = context.newRecord;
            var value;
            // var form = context.form;
            // var userRole = nsRuntime.getCurrentUser().role;
            // var rolesToDisplay = [3, 1023, 1024, 1076, 1022]; // Administrator,FA Controller,FA Transaction Manager, FA CFO, FA VP Financial Reporting & Budgeting

            // if (rolesToDisplay.indexOf(userRole) === -1) {
            //     form.getField({
            //         id: 'custentity4'
            //     }).updateDisplayType({
            //         displayType: 'hidden'
            //     });
            //     form.getField({
            //         id: 'taxidnum'
            //     }).updateDisplayType({
            //         displayType: 'hidden'
            //     });
            // }
            if (newVendFormId) {
                vendorformSearchObj = nsSearch.create({
                    type: 'customrecord_kbs_vendorform',
                    filters:
                    [
                        ['internalid', 'anyof', newVendFormId]
                    ],
                    columns:
                    [
                        nsSearch.createColumn({ name: 'custrecord_kbs_contactemail', label: 'Email' }),
                        nsSearch.createColumn({ name: 'custrecord_kbs_vendorphonenum', label: 'Phone #' }),
                        nsSearch.createColumn({ name: 'custrecord_kbs_contactname', label: 'Contact Name' }),
                        nsSearch.createColumn({ name: 'custrecord_kbs_vendorterms', label: 'Payment Terms' }),
                        nsSearch.createColumn({ name: 'custrecord_kbs_w9attachment', label: 'W-9 Attachment' }),
                        nsSearch.createColumn({ name: 'custrecord_kbs_vendorname', label: 'Vendor Name' }),
                        nsSearch.createColumn({ name: 'custrecord_kbs_verified1099vendor' }),
                        nsSearch.createColumn({ name: 'custrecord_kbs_vendorwebsite' }),
                        nsSearch.createColumn({ name: 'custrecord_kbs_fein_ssn' })
                    ]
                });
                searchResultCount = vendorformSearchObj.runPaged().count;
                log.debug('vendorformSearchObj result count', searchResultCount);
                vendorformSearchObj.run().each(function (result) {
                    rec.setValue({
                        fieldId: 'custentity_kbs_vendorrequestform',
                        value: newVendFormId
                    });
                    value = result.getValue('custrecord_kbs_contactemail') || '';
                    if (value) {
                        rec.setValue({
                            fieldId: 'email',
                            value: value
                        });
                    }
                    value = result.getValue('custrecord_kbs_vendorphonenum') || '';
                    if (value) {
                        rec.setValue({
                            fieldId: 'phone',
                            value: value
                        });
                    }
                    value = result.getValue('custrecord_kbs_fein_ssn') || '';
                    if (value) {
                        rec.setValue({
                            fieldId: 'taxidnum',
                            value: value
                        });
                    }
                    value = result.getValue('custrecord_kbs_contactname') || '';
                    if (value) {
                        rec.setValue({
                            fieldId: 'custentityfa_fin_contact_name',
                            value: value
                        });
                    }
                    value = result.getValue('custrecord_kbs_vendorterms') || '';
                    if (value) {
                        rec.setValue({
                            fieldId: 'terms',
                            value: value
                        });
                    }
                    value = result.getValue('custrecord_kbs_vendorname') || '';
                    if (value) {
                        rec.setValue({
                            fieldId: 'companyname',
                            value: value
                        });
                    }
                    value = result.getValue('custrecord_kbs_w9attachment') || '';
                    if (value) {
                        rec.setValue({
                            fieldId: 'custentity4',
                            value: value
                        });
                    }
                    value = result.getValue('custrecord_kbs_vendorwebsite') || '';
                    if (value) {
                        rec.setValue({
                            fieldId: 'url',
                            value: value
                        });
                    }
                    rec.setValue({
                        fieldId: 'is1099eligible',
                        value: result.getValue('custrecord_kbs_verified1099vendor')
                    });
                    rec.setValue({
                        fieldId: 'custentity_fa_credit_status',
                        value: '1'
                    });
                    rec.setValue({
                        fieldId: 'custentity_w9',
                        value: true
                    });


                    // .run().each has a limit of 4,000 results
                    return false;
                });
            }

        }

        // /**
        // * @param {UserEventContext.beforeSubmit} context
        // */
        // function beforeSubmit(context) {
        //
        // }

        /**
        * @param {UserEventContext.afterSubmit} context
        */
        function afterSubmit(context) {
            var rec = context.newRecord;
            var recId = rec.id;
            var vendOnlineFormId;
            var type = context.type;
            var vendFormId;
            var savedRecId;

            vendOnlineFormId = rec.getValue('custentity_kbs_vendorrequestform');
            if (type === 'create' && vendOnlineFormId) {
                rec = nsRecord.load({
                    type: nsRecord.Type.VENDOR,
                    id: recId,
                    isDynamic: true
                });
                vendFormId = setAddress(rec, vendOnlineFormId);
                savedRecId = rec.save();
                log.debug('vendFormId', vendFormId);
                if (vendFormId && savedRecId) {
                    nsRecord.submitFields({
                        type: 'customrecord_kbs_vendorform',
                        id: vendFormId,
                        values: {
                            custrecord_kbs_vendorrequeststatus: '6', // Vendor Created
                            custrecord_kbs_newvendor: recId
                        }
                    });
                }
            }

        }

        return {
            beforeLoad: beforeLoad,
            // beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    }
);
