function aftersubmit_ordervalues(stType) {
    if (stType == 'edit' || stType == 'xedit') {
        var oldRecord = nlapiGetOldRecord();
        var newRecord = nlapiGetNewRecord();
        var recModForSync = false;
        var fieldsModified = {
            isReleaseDateMod: false,
            isRequestedPickDateMod: false,
            isPoVenCommentsMod: false,
            isShippingMethodMod: false,
            isPOMemberNumMod: false,
            isProjectCodeMod: false,
            isFundMod: false
        };

        if (
            newRecord.getFieldValue('custbody_release_date') != null &&
            newRecord.getFieldValue('custbody_release_date') != oldRecord.getFieldValue('custbody_release_date')
        ) {
            recModForSync = true;
            fieldsModified.isReleaseDateMod = true;
        }
        //Added by thilaga for ticket #5038 starts
        if (
            newRecord.getFieldValue('custbodycustbody_requested_pickup_date') != null &&
            newRecord.getFieldValue('custbodycustbody_requested_pickup_date') != oldRecord.getFieldValue('custbodycustbody_requested_pickup_date')
        ) {
            recModForSync = true;
            fieldsModified.isRequestedPickDateMod = true;
        }
        if (
            newRecord.getFieldValue('custbodycustbody_po_vendor_comments') != null &&
            newRecord.getFieldValue('custbodycustbody_po_vendor_comments') != oldRecord.getFieldValue('custbodycustbody_po_vendor_comments')
        ) {
            recModForSync = true;
            fieldsModified.isPoVenCommentsMod = true;
        }
        if (
            newRecord.getFieldValue('custbody_shipping_method_code') != null &&
            newRecord.getFieldValue('custbody_shipping_method_code') != oldRecord.getFieldValue('custbody_shipping_method_code')
        ) {
            recModForSync = true;
            fieldsModified.isShippingMethodMod = true;
        }
        if (newRecord.getFieldValue('otherrefnum') != null && newRecord.getFieldValue('otherrefnum') != oldRecord.getFieldValue('otherrefnum')) {
            recModForSync = true;
            fieldsModified.isPOMemberNumMod = true;
        }
        if (
            newRecord.getFieldValue('custbody_cseg_projects_cseg') != null &&
            newRecord.getFieldValue('custbody_cseg_projects_cseg') != oldRecord.getFieldValue('custbody_cseg_projects_cseg')
        ) {
            recModForSync = true;
            fieldsModified.isProjectCodeMod = true;
        }
        if (newRecord.getFieldValue('location') != null && newRecord.getFieldValue('location') != oldRecord.getFieldValue('location')) {
            recModForSync = true;
            fieldsModified.isFundMod = true;
        }
        var lineChangedlist = [];
        var lineQtyChangeDetails = '';
        var linePickUpLocChangeDetails = '';
        var linePickUpSequenceChangeDetails = '';
        var lineDropOffLocChangeDetails = '';
        var lineDropOffSequenceChangeDetails = '';
        var lineRateChangeDetails = '';
        var linePoAdmFeeChangeDetails = '';
        var newLineItemAddedList = [];
        if (
            stType == 'edit' &&
            (newRecord.getFieldValue('status') == 'Pending Fulfillment' ||
                newRecord.getFieldValue('status') == 'Partially Fulfilled' ||
                newRecord.getFieldValue('status') == 'Pending Billing' ||
                newRecord.getFieldValue('status') == 'Pending Billing/Partially Fulfilled' ||
                newRecord.getFieldValue('status') == 'Billed') &&
            (newRecord.getFieldValue('custbody_order_type') == '1' || newRecord.getFieldValue('custbody_order_type') == '2')
        ) {
            var lineCount = newRecord.getLineItemCount('item');
            var magRefList = [];
            for (var i = 0; i < lineCount; i++) {
                var magRef = '';

                magRef = newRecord.getLineItemValue('item', 'custcol_mag_ref_no', i + 1);

                if (magRef != null && magRef != '') {
                    magRefList[i] = magRef;
                } else {
                    var prodChannel = newRecord.getLineItemValue('item', 'custcol_product_channel', i + 1);
                    var item = newRecord.getLineItemValue('item', 'item', i + 1);
                    if (prodChannel == '1' || prodChannel == '2' || item == '4148') {
                        recModForSync = true;
                        var newLineItemAdded = {
                            item: item,
                            lineNum: parseInt(i + 1) + '',
                            vendor: newRecord.getLineItemValue('item', 'povendor', i + 1),
                            customer: newRecord.getLineItemValue('item', 'custcol_member_bank', i + 1),
                            pickupLoc: newRecord.getLineItemValue('item', 'custcol_pickup_location', i + 1),
                            dropoffLoc: newRecord.getLineItemValue('item', 'custcol_drop_off_location', i + 1),
                            quantity: newRecord.getLineItemValue('item', 'quantity', i + 1),
                            units: newRecord.getLineItemValue('item', 'units', i + 1),
                            porate: newRecord.getLineItemValue('item', 'porate', i + 1),
                            noPallets: newRecord.getLineItemValue('item', 'custcol_nbr_pallets', i + 1),
                            qtyPerPallet: newRecord.getLineItemValue('item', 'custcol_cases_per_pallet', i + 1),
                            itemGrossWt: newRecord.getLineItemValue('item', 'custcol_item_gross_weight', i + 1),
                            adminFeeVendor: newRecord.getLineItemValue('item', 'custcol_admin_fee_vendor', i + 1),
                            totalPounds: newRecord.getLineItemValue('item', 'custcol_total_pounds', i + 1),
                            totalGrossWt: newRecord.getLineItemValue('item', 'custcol_total_weight', i + 1),
                            magRefNum: ((i + 1) * 1001),
                            dropoffSequence: newRecord.getLineItemValue('item', 'custcol_drop_off_sequence', i + 1),
                            pickupSequence: newRecord.getLineItemValue('item', 'custcol_pickup_sequence', i + 1),
                            vendorItemName: newRecord.getLineItemValue('item', 'custcolfa_vendor_item_name', i + 1),
                            vendorItemNumber: newRecord.getLineItemValue('item', 'custcol_vendor_item_no', i + 1)
                        };
                        newLineItemAddedList.push(newLineItemAdded);
                    }
                }
            }
            nlapiLogExecution('DEBUG', 'mag ref list ', magRefList);
            nlapiLogExecution('DEBUG', 'newLineItemAddedList: ', JSON.stringify(newLineItemAddedList));

            for (var i = 0; i < magRefList.length; i++) {
                if (magRefList[i] != null) {
                    var oldLineNum = oldRecord.findLineItemValue('item', 'custcol_mag_ref_no', magRefList[i]);
                    var newLineNum = newRecord.findLineItemValue('item', 'custcol_mag_ref_no', magRefList[i]);
                    var changedObj = {
                        magRef: magRefList[i],
                        qtyChange: 'no',
                        rateChange: 'no',
                        poAdmFeeChange: 'no'
                    };

                    if (
                        newRecord.getFieldValue('status') == 'Pending Fulfillment' ||
                        newRecord.getFieldValue('status') == 'Partially Fulfilled' ||
                        newRecord.getFieldValue('status') == 'Pending Billing' ||
                        newRecord.getFieldValue('status') == 'Pending Billing/Partially Fulfilled'
                    ) {
                        if (newRecord.getLineItemValue('item', 'quantityfulfilled', i + 1) == 0) {
                            //Modified for Bug 7297 by Thilaga
                            if (
                                parseFloat(oldRecord.getLineItemValue('item', 'quantity', oldLineNum)) !=
                                parseFloat(newRecord.getLineItemValue('item', 'quantity', newLineNum))
                            ) {
                                changedObj.qtyChange = 'yes';
                                lineQtyChangeDetails =
                                    lineQtyChangeDetails +
                                    magRefList[i] +
                                    ':' +
                                    oldRecord.getLineItemValue('item', 'quantity', oldLineNum) +
                                    ':' +
                                    newRecord.getLineItemValue('item', 'quantity', newLineNum) +
                                    ':' +
                                    newRecord.getLineItemValue('item', 'custcol_vendor_item_no', newLineNum) +
                                    ',';
                                recModForSync = true;
                            }
                            if (
                                oldRecord.getLineItemValue('item', 'custcol_pickup_location', oldLineNum) !=
                                newRecord.getLineItemValue('item', 'custcol_pickup_location', newLineNum)
                            ) {
                                changedObj.qtyChange = 'yes';
                                linePickUpLocChangeDetails =
                                    linePickUpLocChangeDetails +
                                    magRefList[i] +
                                    ':' +
                                    oldRecord.getLineItemValue('item', 'custcol_pickup_location', oldLineNum) +
                                    ':' +
                                    newRecord.getLineItemValue('item', 'custcol_pickup_location', newLineNum) +
                                    ':' +
                                    newRecord.getLineItemValue('item', 'custcol_vendor_item_no', newLineNum) +
                                    ',';
                                recModForSync = true;
                            }
                            if (oldRecord.getLineItemValue('item', 'custcol_pickup_sequence', oldLineNum) != newRecord.getLineItemValue('item', 'custcol_pickup_sequence', newLineNum)) {
                                changedObj.qtyChange = 'yes';
                                linePickUpSequenceChangeDetails = linePickUpSequenceChangeDetails + magRefList[i] + ':' + oldRecord.getLineItemValue('item', 'custcol_pickup_sequence', oldLineNum) + ':' + newRecord.getLineItemValue('item', 'custcol_pickup_sequence', newLineNum) + ':' + newRecord.getLineItemValue('item', 'custcol_vendor_item_no', newLineNum) +
                                    ',';
                                recModForSync = true;
                            }
                            //Modified for Task 7302 by Elizabeth
                            if (
                                oldRecord.getLineItemValue('item', 'custcol_drop_off_location', oldLineNum) !=
                                newRecord.getLineItemValue('item', 'custcol_drop_off_location', newLineNum)
                            ) {
                                changedObj.qtyChange = 'yes';
                                lineDropOffLocChangeDetails =
                                    lineDropOffLocChangeDetails +
                                    magRefList[i] +
                                    ':' +
                                    oldRecord.getLineItemValue('item', 'custcol_drop_off_location', oldLineNum) +
                                    ':' +
                                    newRecord.getLineItemValue('item', 'custcol_drop_off_location', newLineNum) +
                                    ':' +
                                    newRecord.getLineItemValue('item', 'custcol_vendor_item_no', newLineNum) +
                                    ':' +
                                    newRecord.getLineItemValue('item', 'custcol_member_bank', newLineNum) +
                                    ',';
                                recModForSync = true;
                            }
                            if (oldRecord.getLineItemValue('item', 'custcol_drop_off_sequence', oldLineNum) != newRecord.getLineItemValue('item', 'custcol_drop_off_sequence', newLineNum)) {
                                changedObj.qtyChange = 'yes';
                                lineDropOffSequenceChangeDetails = lineDropOffSequenceChangeDetails + magRefList[i] + ':' + oldRecord.getLineItemValue('item', 'custcol_drop_off_sequence', oldLineNum) + ':' + newRecord.getLineItemValue('item', 'custcol_drop_off_sequence', newLineNum) + ':' + newRecord.getLineItemValue('item', 'custcol_vendor_item_no', newLineNum) + ':' + newRecord.getLineItemValue('item', 'custcol_member_bank', newLineNum) +
                                    ',';
                                recModForSync = true;
                            }
                        } else {
                            if (
                                oldRecord.getLineItemValue('item', 'custcol_drop_off_location', oldLineNum) !=
                                newRecord.getLineItemValue('item', 'custcol_drop_off_location', newLineNum)
                            ) {
                                changedObj.qtyChange = 'yes';
                                lineDropOffLocChangeDetails =
                                    lineDropOffLocChangeDetails +
                                    magRefList[i] +
                                    ':' +
                                    oldRecord.getLineItemValue('item', 'custcol_drop_off_location', oldLineNum) +
                                    ':' +
                                    newRecord.getLineItemValue('item', 'custcol_drop_off_location', newLineNum) +
                                    ':' +
                                    newRecord.getLineItemValue('item', 'custcol_vendor_item_no', newLineNum) +
                                    ':' +
                                    newRecord.getLineItemValue('item', 'custcol_member_bank', newLineNum) +
                                    ',';
                                recModForSync = true;
                            }
                        }
                    }
                    if (newRecord.getFieldValue('status') == 'Billed' || newRecord.getFieldValue('status') == 'Partially Fulfilled' || newRecord.getLineItemValue('item', 'item', newLineNum) == '4148') {
                        if (oldRecord.getLineItemValue('item', 'rate', oldLineNum) != newRecord.getLineItemValue('item', 'rate', newLineNum)) {
                            changedObj.qtyChange = 'yes';
                            lineRateChangeDetails =
                                lineRateChangeDetails +
                                magRefList[i] +
                                ':' +
                                oldRecord.getLineItemValue('item', 'rate', oldLineNum) +
                                ':' +
                                newRecord.getLineItemValue('item', 'rate', newLineNum) +
                                ':' +
                                newRecord.getLineItemValue('item', 'rate', newLineNum) +
                                ',';
                            recModForSync = true;
                        }
                    }
                    if (newRecord.getFieldValue('custbody_order_type') == '2' && newRecord.getFieldValue('custbody_admin_fees') != 0.0) {
                        if (
                            oldRecord.getLineItemValue('item', 'rate', oldLineNum) != newRecord.getLineItemValue('item', 'rate', newLineNum) ||
                            oldRecord.getLineItemValue('item', 'porate', oldLineNum) != newRecord.getLineItemValue('item', 'porate', newLineNum)
                        ) {
                            var rate = newRecord.getLineItemValue('item', 'rate', newLineNum);
                            var poRate = newRecord.getLineItemValue('item', 'porate', newLineNum);
                            var adminFeePerQty = parseFloat(rate) - parseFloat(poRate);
                            changedObj.poAdmFeeChange = 'yes';
                            linePoAdmFeeChangeDetails = linePoAdmFeeChangeDetails + magRefList[i] + ':' + adminFeePerQty + ',';
                            recModForSync = true;
                        }
                    }
                    nlapiLogExecution('DEBUG', 'changedObj list ', changedObj.magRef + ' ' + changedObj.qtyChange + ' ' + changedObj.rateChange);
                    lineChangedlist[i] = changedObj;
                }
            }
            nlapiLogExecution('DEBUG', 'lineChangedlist list ', lineChangedlist);
            nlapiLogExecution('DEBUG', 'lineQtyChangeDetails ', lineQtyChangeDetails);
            nlapiLogExecution('DEBUG', 'lineRateChangeDetails ', lineRateChangeDetails);
        }
        //Added by thilaga for ticket #5038 ends
        if (recModForSync) {
            var param = {
                custscript_idsalesorder: nlapiGetRecordId(),
                custscript_isreleasedatechanged: fieldsModified.isReleaseDateMod,
                custscript_isreqpickupdatechanged: fieldsModified.isRequestedPickDateMod,
                custscript_ispovencommentschanged: fieldsModified.isPoVenCommentsMod,
                custscript_isshipmethodchanged: fieldsModified.isShippingMethodMod,
                custscript_ismemberponumchanged: fieldsModified.isPOMemberNumMod,
                custscript_isprojectcodechanged: fieldsModified.isProjectCodeMod,
                custscript_isfundchanged: fieldsModified.isFundMod,
                custscript_is_cancelled: false,
                custscript_is_line_qty_changed: lineQtyChangeDetails,
                custscript_is_line_pickup_changed: linePickUpLocChangeDetails,
                custscript_is_line_dropoff_changed: lineDropOffLocChangeDetails,
                custscript_is_line_pickup_num_changed: linePickUpSequenceChangeDetails,
                custscript_is_line_dropoff_num_changed: lineDropOffSequenceChangeDetails,
                custscript_is_line_rate_changed: lineRateChangeDetails,
                custscript_is_line_poadminfee_changed: linePoAdmFeeChangeDetails,
                custscript_is_line_item_added: JSON.stringify(newLineItemAddedList)
            };

            //Updated below for ticket #8070
            KBS.scriptScheduler.schedule('customscript_ss_related_rec', param, true);
            //nlapiScheduleScript('customscript_fa_ss_update_so_related_rec', 'customdeploy_sch_update_relatedrecords', param);
        }
    }
}