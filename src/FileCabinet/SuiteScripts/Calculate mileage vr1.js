/**
 * Copyright (c) 1998-2016 NetSuite, Inc. 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511 All Rights Reserved.
 * 
 * This software is the confidential and proprietary information of NetSuite, Inc. ("Confidential Information"). You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into with NetSuite.
 * 
 * @author Maria Ines Panizza	
 * @version 1.0
 */

/**
**		USER EVENT (Sales orders)
** 10/31/2016 - Only use the milage from the last segment
**/

function calculateMileage(mode) {

    var logError = 'No error';

    if (mode == 'create' || mode == 'edit') {
        var arrPickUpAddresses = [];
        var arrDropOffAddresses = [];
        var allPickupCities = [];
        var allDropOffCities = [];
        var record = nlapiLoadRecord('salesorder', nlapiGetRecordId());		//sales order
        var salesorderId = nlapiGetRecordId();
        var salesOrderType = record.getFieldValue('custbody_order_type');
        if (salesOrderType == '6') {
            return true;
        }
        var salesOrderStatus = record.getFieldValue('custbody_order_status');
        var salesTranId = record.getFieldValue('tranid');
        nlapiLogExecution('DEBUG', ' salesTranId', salesTranId);

        //Get script parameters
        var context = nlapiGetContext();
        var paramOrderStatus = context.getSetting('SCRIPT', 'custscript_status_parameter');
        var paramProduce = context.getSetting('SCRIPT', 'custscript_order_type');
        var paramGrocery = context.getSetting('SCRIPT', 'custscript_order_type_grocery');
        var paramMaroon = context.getSetting('SCRIPT', 'custscript_order_type_maroon');
        var paramYellow = context.getSetting('SCRIPT', 'custscript_order_type_yellow');

        var seqSetByUser = sequencesSetByUser(record);

        //if sequences in some line is empty the call to PC MILLER is needed, otherwise not
        if (!seqSetByUser) {

            //if sales order stauts is accepted (2)
            if (salesOrderStatus == paramOrderStatus) {
                //if the order type is produce (2) or grocery (1) Yellow (3) Maroon(5) Donation Order
                if (salesOrderType == paramProduce || salesOrderType == paramGrocery || salesOrderType == paramMaroon || salesOrderType == paramYellow) {

                    try {
                        var pickupsAndDropoffs = convertLinesToPickupDropOffObjects(record);
                        allPickupCities = pickupsAndDropoffs.pickups;
                        allDropOffCities = pickupsAndDropoffs.dropoffs;
                        var fstPickupLocation = pickupsAndDropoffs.firstPickup;
                        if (allPickupCities.length && allDropOffCities.length) {
                            var lastSeqNumber = updatePickupSequences(allPickupCities, fstPickupLocation);
                            updateDropoffSequences(allDropOffCities, lastSeqNumber);
                        }

                    }
                    catch (e) {
                        logError = 'PC Miller data missing – not data sent';
                        record.setFieldValue('custbody_calculate_mileague_error', logError);
                        nlapiLogExecution('error', "Calculate Mileague error", logError + '  ' + e);
                    }

                    if (logError == 'No error') {
                        //Array with cities not repeated
                        arrPickUpAddresses = getNotRepeatedCities(allPickupCities);
                        arrDropOffAddresses = getNotRepeatedCities(allDropOffCities);
                        createSOAPRequestCall(arrPickUpAddresses, arrDropOffAddresses, salesorderId, record, salesTranId, allPickupCities, allDropOffCities);
                    } else {
                        var id = nlapiSubmitRecord(record);
                    }

                }

            }
        } else {
            nlapiLogExecution('debug', 'Calculate Mileague', 'Sequences set by user, PC MILLER call not executed.');
        }

    }
}
/*
 * New convertLinesToPickupDropOffObjects function replaces 3 functions (convertLinesToPickupObjects,convertLinesToDropoffObjects,getFstPickupLocation)
 * significantly reducing the number of iterations around the itemList.  We can do the work of these 3 looping functions in 1 loop and only
 * perform work inside the loop if it is necessary.
 */
function convertLinesToPickupDropOffObjects(record) {

    var allPickupCities = [];
    var allDropOffCities = []; 
    var firstPickup = null;

    var itemsCount = record.getLineItemCount('item');

    for (var i = 1; i <= itemsCount; i++) {
        //nlapiLogExecution('debug', 'convertLinesToPickupDropOffObjects', i);
        var pickupLocation = record.getLineItemValue('item', 'custcol_pickup_location', i);
        var dropoffLocation = record.getLineItemValue('item', 'custcol_drop_off_location', i);

        if (pickupLocation && dropoffLocation) {

            //Pickup VALUES 
            var pickUpAddress = {};
            var pickupAddress1 = record.getLineItemValue('item', 'custcol_pickup_address_1', i);
            var pickupCity = record.getLineItemValue('item', 'custcol_pickup_city', i);
            var pickupZip = record.getLineItemValue('item', 'custcol_pickup_zip', i);
            var pickupState = record.getLineItemValue('item', 'custcol_pickup_state', i);
            var firstPickupLocation = record.getLineItemValue('item', 'custcol_first_pickup', i);
            if (pickupState) {
                var pickupStaterecord = nlapiLoadRecord('state', pickupState);
                var pickupStateShortName = pickupStaterecord.getFieldValue('shortname');
            }
            //true when sequence was set after PC Miler response		
            pickUpAddress.IsSeqSet = false;
            pickUpAddress.IsFirstPickup = firstPickupLocation;
            pickUpAddress.Address = pickupAddress1;
            pickUpAddress.City = pickupCity;
            pickUpAddress.Location = pickupLocation;
            pickUpAddress.Zip = pickupZip;
            pickUpAddress.State = pickupStateShortName;
            pickUpAddress.Sequence = 0;

            allPickupCities.push(pickUpAddress);
            if (firstPickupLocation == 'T') {
                firstPickup = pickupLocation;
            }

            //Dropoff values
            var dropOffAddress = {};
            var dropOffAddress1 = record.getLineItemValue('item', 'custcol_dropoff_address_1', i);
            var dropOffCity = record.getLineItemValue('item', 'custcol_dropoff_city', i);
            var dropOffState = record.getLineItemValue('item', 'custcol_dropoff_state', i);
            var dropOffZip = record.getLineItemValue('item', 'custcol_dropoff_zip_code', i);
            if (dropOffState) {
                var dropoffStaterecordOff = nlapiLoadRecord('state', dropOffState);
                var dropoffStateShortName = dropoffStaterecordOff.getFieldValue('shortname');
            }
            dropOffAddress.IsSeqSet = false;
            dropOffAddress.Address = dropOffAddress1;
            dropOffAddress.City = dropOffCity;
            dropOffAddress.Location = dropoffLocation;
            dropOffAddress.Sequence = 0;
            dropOffAddress.State = dropoffStateShortName;
            dropOffAddress.Zip = dropOffZip;

            allDropOffCities.push(dropOffAddress);
        }

    }
    return { pickups: allPickupCities, dropoffs: allDropOffCities, firstPickup: firstPickup };
}

function convertLinesToPickupObjects(record) {

    var allPickupCities = [];
    var itemsCount = record.getLineItemCount('item');

    for (var i = 1; i <= itemsCount; i++) {
        nlapiLogExecution('debug', 'convertLinesToPickupObjects', i);
        //GET LINE VALUES 
        var pickUpAddress = {};
        var pickupAddress1 = record.getLineItemValue('item', 'custcol_pickup_address_1', i);
        var pickupCity = record.getLineItemValue('item', 'custcol_pickup_city', i);
        var pickupZip = record.getLineItemValue('item', 'custcol_pickup_zip', i);
        var pickupState = record.getLineItemValue('item', 'custcol_pickup_state', i);
        var pickupLocation = record.getLineItemValue('item', 'custcol_pickup_location', i);
        var firstPickupLocation = record.getLineItemValue('item', 'custcol_first_pickup', i);
        if (pickupState) {
            var staterecord = nlapiLoadRecord('state', pickupState);
            var stateShortName = staterecord.getFieldValue('shortname');
        }

        var dropoffLocation = record.getLineItemValue('item', 'custcol_drop_off_location', i);

        if (pickupLocation && dropoffLocation) {

            //true when sequence was set after PC Miler response		
            pickUpAddress.IsSeqSet = false;
            pickUpAddress.IsFirstPickup = firstPickupLocation;
            pickUpAddress.Address = pickupAddress1;
            pickUpAddress.City = pickupCity;
            pickUpAddress.Location = pickupLocation;
            pickUpAddress.Zip = pickupZip;
            pickUpAddress.State = stateShortName;
            pickUpAddress.Sequence = 0;

            allPickupCities.push(pickUpAddress);

            if (allPickupCities.length > 80) {
                //temporary measure to avoid script timeouts on large orders.  ultimately need to make this more efficient and not cut it off at 80
                return allPickupCities;
            }
        }

    }
    return allPickupCities;
}

function convertLinesToDropoffObjects(record) {

    var allDropOffCities = [];
    var itemsCount = record.getLineItemCount('item');

    for (var i = 1; i <= itemsCount; i++) {
        //Dropoff values
        var dropOffAddress = {};
        var dropOffAddress1 = record.getLineItemValue('item', 'custcol_dropoff_address_1', i);
        var dropOffCity = record.getLineItemValue('item', 'custcol_dropoff_city', i);
        var dropOffState = record.getLineItemValue('item', 'custcol_dropoff_state', i);
        var dropOffZip = record.getLineItemValue('item', 'custcol_dropoff_zip_code', i);
        var dropoffLocation = record.getLineItemValue('item', 'custcol_drop_off_location', i);
        if (dropOffState) {
            var staterecordOff = nlapiLoadRecord('state', dropOffState);
            var stateShortNameOff = staterecordOff.getFieldValue('shortname');
        }
        var pickupLocation = record.getLineItemValue('item', 'custcol_pickup_location', i);

        if (pickupLocation && dropoffLocation) {

            dropOffAddress.IsSeqSet = false;
            dropOffAddress.Address = dropOffAddress1;
            dropOffAddress.City = dropOffCity;
            dropOffAddress.Location = dropoffLocation;
            dropOffAddress.Sequence = 0;
            dropOffAddress.State = stateShortNameOff;
            dropOffAddress.Zip = dropOffZip;

            allDropOffCities.push(dropOffAddress);
        }
    }
    return allDropOffCities;

}

function getFstPickupLocation(allPickupCities) {

    var location = '';
    for (var i = 0; i < allPickupCities.length; i++) {
        if (allPickupCities[i].IsFirstPickup == 'T') {
            location = allPickupCities[i].Location;
            return location;
        }
    }
    return location;
}

function updatePickupSequences(allPickupCities, fstPickupLocation) {

    var newSeq = 1;
    for (var i = 0; i < allPickupCities.length; i++) {

        if (allPickupCities[i].Location == fstPickupLocation) {
            allPickupCities[i].Sequence = 1;
        } else {
            var repeatedSeq = getSequenceforRepeatedLocation(allPickupCities[i].Location, allPickupCities);
            if (repeatedSeq > 0) {
                allPickupCities[i].Sequence = repeatedSeq;

            } else {
                newSeq++;
                allPickupCities[i].Sequence = newSeq;
            }

        }
    }

    return newSeq;
}

function updateDropoffSequences(allDropoffCities, startSeqNumber) {

    var seq = startSeqNumber;
    for (var i = 0; i < allDropoffCities.length; i++) {

        var repeatedSeq = getSequenceforRepeatedLocation(allDropoffCities[i].Location, allDropoffCities);

        if (repeatedSeq > 0) {
            allDropoffCities[i].Sequence = repeatedSeq;

        } else {
            seq++;
            allDropoffCities[i].Sequence = seq;
        }

    }
}

function getNotRepeatedCities(arrCities) {

    var arrNotRepeatedCities = [];
    for (var i = 0; i < arrCities.length; i++) {
        var existsLocation = existsLocationInArray(arrCities[i].Location, arrNotRepeatedCities);
        if (!existsLocation) {
            arrNotRepeatedCities.push(arrCities[i]);
        }
    }

    return arrNotRepeatedCities;
}

//new
function sequencesSetByUser(record) {

    var setByUser = false;
    var itemsCount = record.getLineItemCount('item');
    for (var i = 1; i <= itemsCount; i++) {
        var pickupSeq = record.getLineItemValue('item', 'custcol_pickup_sequence', i);
        var dropoffSeq = record.getLineItemValue('item', 'custcol_drop_off_sequence', i);
        var pickupLocation = record.getLineItemValue('item', 'custcol_pickup_location', i);
        var dropoffLocation = record.getLineItemValue('item', 'custcol_drop_off_location', i);

        if (pickupLocation & dropoffLocation) {

            if (!isEmpty(pickupSeq) || !isEmpty(dropoffSeq)) {
                setByUser = true;
            }
        }


    }

    return setByUser;
}

function getSequenceforRepeatedLocation(location, arr) {
    var sequenceNum = '0';

    for (var i = 0; arr !== null && i < arr.length; i++) {
        if (location == arr[i].Location) {
            sequenceNum = arr[i].Sequence;
            break;
        }
    }
    sequenceNum = parseInt(sequenceNum);
    return sequenceNum;
}

function existsLocationInArray(location, arr) {

    //nlapiLogExecution('DEBUG', ' location ', 'location' +location );
    var bIsValueFound = false;

    for (var i = 0; arr !== null && i < arr.length; i++) {
        if (location == arr[i].Location) {
            bIsValueFound = true;
            break;
        }
    }

    return bIsValueFound;
}

function sortPickupAddressesByFirstLocation(arrPickUpAddresses) {

    var sortPickupAddresses = [];

    for (var i = 0; i < arrPickUpAddresses.length; i++) {
        if (arrPickUpAddresses[i].IsFirstPickup == 'T') {
            sortPickupAddresses.push(arrPickUpAddresses[i]);
        }
    }

    for (var i = 0; i < arrPickUpAddresses.length; i++) {
        if (arrPickUpAddresses[i].IsFirstPickup == 'F') {
            sortPickupAddresses.push(arrPickUpAddresses[i]);
        }
    }
    return sortPickupAddresses;
}

function createSOAPRequestCall(arrPickUpAddresses, arrDropOffAddresses, salesorderId, record, salesTranId, allPickupCities, allDropOffCities) {

    var sortPickupAddresses = sortPickupAddressesByFirstLocation(arrPickUpAddresses);

    var logTitle = 'createSOAPRequestCall';
    try {

        //get api token from script parameter
        var apiKey = nlapiGetContext().getSetting('SCRIPT', 'custscript_authorization_pcmiler_token');
        //nlapiLogExecution('DEBUG', 'apiKey', apiKey );
        var xmlheader = '';
        //HEADER
        xmlheader += '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"> ';
        xmlheader += '<s:Header>';
        xmlheader += '<s:Action mustUnderstand="1" xmlns="http://schemas.microsoft.com/ws/2005/05/addressing/none">http://pcmiler.alk.com/APIs/v1.0/IService/GetReports</s:Action>';
        xmlheader += '<h:AuthHeader xmlns="http://www.alk.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:h="http://www.alk.com">';
        xmlheader += '<Authorization>' + apiKey + '</Authorization> ';
        var dateNow = new Date();
        xmlheader += '<Date>' + dateNow + '</Date>';
        xmlheader += '</h:AuthHeader> ';
        xmlheader += '</s:Header>';
        //BODY
        xmlheader += '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">';
        xmlheader += '<GetReports xmlns="http://pcmiler.alk.com/APIs/v1.0"> ';
        xmlheader += '<Request>';
        xmlheader += '<Header>';
        xmlheader += '<DataVersion>current</DataVersion> ';
        xmlheader += '<RequestType>GetReports</RequestType> ';
        xmlheader += '</Header>';

        xmlheader += '<Body>';
        xmlheader += '<ReportRoutes>';
        xmlheader += '<ReportRoute>';
        xmlheader += '<RouteId>' + salesTranId + '</RouteId>';
        xmlheader += '<Stops>';

        var xmlSOAP = xmlheader;
        //first I check pickup

        nlapiLogExecution('debug', 'sortPickupAddresses.length', sortPickupAddresses.length);
        for (var i = 0; i < sortPickupAddresses.length; i++) {

            xmlSOAP += '<StopLocation>';
            //ADDRESS
            xmlSOAP += '<Address>';
            xmlSOAP += '<StreetAddress xsi:nil="true" />'; // esta no lleva address??
            xmlSOAP += '<City>' + sortPickupAddresses[i].City + '</City> '
            xmlSOAP += '<State>' + sortPickupAddresses[i].State + '</State>';
            xmlSOAP += '<Zip>' + sortPickupAddresses[i].Zip + '</Zip>';
            xmlSOAP += '<County xsi:nil="true" /> ';
            xmlSOAP += '<Country xsi:nil="true" /> ';
            xmlSOAP += '<SPLC xsi:nil="true" /> ';

            xmlSOAP += '</Address>';
            //ADDRESS
            xmlSOAP += '<Coords xsi:nil="true" /> ';
            xmlSOAP += '<Region>NA</Region> ';
            //xmlSOAP += '<Label>'+arrPickUpAddresses[i].City +','+arrPickUpAddresses[i].State+'</Label> ';
            xmlSOAP += '<Label> Pickup-' + i + '</Label> ';
            xmlSOAP += '<PlaceName xsi:nil="true" /> ';
            xmlSOAP += ' <Costs xsi:nil="true" /> ';
            xmlSOAP += '</StopLocation>';

        }

        //then dropp off
        nlapiLogExecution('debug', 'arrDropOffAddresses.length', arrDropOffAddresses.length);
        for (var j = 0; j < arrDropOffAddresses.length; j++) {

            //nlapiLogExecution('DEBUG', 'arrDropOffAddresses[j].City ', arrDropOffAddresses[j].City + "  j"+ j);
            xmlSOAP += '<StopLocation>';
            //ADDRESS
            xmlSOAP += '<Address>';
            xmlSOAP += '<StreetAddress xsi:nil="true" />'; // esta no lleva address??
            xmlSOAP += '<City>' + arrDropOffAddresses[j].City + '</City> '
            xmlSOAP += '<State>' + arrDropOffAddresses[j].State + '</State>';
            xmlSOAP += '<Zip>' + arrDropOffAddresses[j].Zip + '</Zip>';
            xmlSOAP += '<County xsi:nil="true" /> ';
            xmlSOAP += '<Country xsi:nil="true" /> ';
            xmlSOAP += '<SPLC xsi:nil="true" /> ';
            xmlSOAP += '</Address>';
            //ADDRESS
            xmlSOAP += '<Coords xsi:nil="true" /> ';
            xmlSOAP += '<Region>NA</Region> ';
            //xmlSOAP += '<Label>'+arrDropOffAddresses[j].City +','+ arrDropOffAddresses[j].State+'</Label> ';
            xmlSOAP += '<Label> Dropoff-' + j + '</Label> ';
            xmlSOAP += '<PlaceName xsi:nil="true" /> ';
            xmlSOAP += ' <Costs xsi:nil="true" /> ';

            xmlSOAP += '</StopLocation>';

        }
        xmlSOAP += '</Stops>';

        //OPTIONS	
        xmlSOAP += '<Options>';
        xmlSOAP += '<DistanceUnits>Miles</DistanceUnits>';
        xmlSOAP += '<HighwayOnly>true</HighwayOnly>';
        xmlSOAP += '<HoSOptions xsi:nil="true" />';
        xmlSOAP += '<HubRouting>false</HubRouting>';
        xmlSOAP += '<RouteOptimization>ThruAll</RouteOptimization>';
        xmlSOAP += '<VehicleType>LightTruck</VehicleType>';
        xmlSOAP += '</Options>';
        //OPTIONS

        //REPORT TYPES
        xmlSOAP += '<ReportTypes> <ReportType xsi:type="MileageReportType" /></ReportTypes>';
        //REPORT TYPES

        xmlSOAP += '</ReportRoute>';
        xmlSOAP += '</ReportRoutes>';
        xmlSOAP += '</Body>';
        xmlSOAP += '</Request>';
        xmlSOAP += '</GetReports> ';
        xmlSOAP += '</s:Body>';
        xmlSOAP += '</s:Envelope>';

        nlapiLogExecution('DEBUG', 'XML SOAP', xmlSOAP);
        try {
            var status = sendRequest(xmlSOAP, record, arrPickUpAddresses.length, allPickupCities, allDropOffCities);
        } catch (e) {

            record.setFieldValue('custbody_calculate_mileague_error', e);
            nlapiLogExecution('Error', logTitle, 'Exception - ' + e);
        }

    } catch (e) {
        nlapiLogExecution('error', xmlSOAP, e);
    }
}

function printCities(allPickupCities) {

    for (var i = 0; i < allPickupCities.length; i++) {
        nlapiLogExecution('debug', 'printCities', 'Location ' + allPickupCities[i].Location + ' Sequence ' + allPickupCities[i].Sequence);
    }
}

function sendRequest(xmlSOAP, record, pickupLength, allPickupCities, allDropOffCities) {

    printCities(allPickupCities);
    var logTitle = 'sendRequest';
    try {

        var stUrl = 'http://pcmiler.alk.com/APIs/SOAP/v1.0/service.svc';
        var headers = {};
        headers.SOAPAction = 'http://pcmiler.alk.com/APIs/v1.0/IService/GetReports';
        headers.SkipSOAPAction = 'false';

        // Make the call
        for (var i = 0; i < 5; i++) {

            var response = nlapiRequestURL(stUrl, xmlSOAP, headers);
            var code = response.getCode();
            nlapiLogExecution('debug', logTitle, 'code ' + code);

            if (code == '200' || code == '201' || code == '202') {
                break;
            }
        }

        if (code == '200') {

            var body = response.getBody();
            nlapiLogExecution('debug', logTitle, 'Response body ' + body);
            var success = body.substring(body.lastIndexOf("<Success>") + 9, body.lastIndexOf("</Success>"));
            nlapiLogExecution('debug', 'success', success);
            if (success == 'true') {
                var stopReportLines = body.toString().split("<StopReportLine>");
                if (stopReportLines.length > 0) {
                    var totalMiles = 0;
                    var pickupSequence = "";
                    var dropoffSequence = "";
                    var dropPoss = 0;
                    for (var j = 1; j < stopReportLines.length; j++) {
                        //totalMiles += parseFloat(stopReportLines[j].substring(stopReportLines[j].lastIndexOf("<TMiles>")+8, stopReportLines[j].lastIndexOf("</TMiles>")));	
                        totalMiles = parseFloat(stopReportLines[j].substring(stopReportLines[j].lastIndexOf("<TMiles>") + 8, stopReportLines[j].lastIndexOf("</TMiles>")));
                        label = stopReportLines[j].substring(stopReportLines[j].lastIndexOf("<Label>") + 7, stopReportLines[j].lastIndexOf("</Label>"));
                        var city = stopReportLines[j].substring(stopReportLines[j].lastIndexOf("<City>") + 6, stopReportLines[j].lastIndexOf("</City>"));

                        //Set sequences depending on the label tag
                        var splitLabel = label.split('-');
                        var labelName = splitLabel[0];

                        if (splitLabel[0].trim() == 'Pickup') {
                            updateSequencesAfterResponse(j, city, allPickupCities);

                        } else {
                            updateSequencesAfterResponse(j, city, allDropOffCities);

                        }

                    }

                    checkAllSequencesWereSet(allPickupCities, allDropOffCities, record);
                    //sendEmail(xmlSOAP, body);


                    record.setFieldValue('custbody_miles', totalMiles);
                    var routeId = body.substring(body.lastIndexOf("<RouteID>") + 9, body.lastIndexOf("</RouteID>"));
                    record.setFieldValue('custbody_route_id', routeId);
                    record.setFieldValue('custbody_calculate_mileague_error', null);
                    var callLog = 'Request: ' + xmlSOAP + ' Response:  ' + body;
                    record.setFieldValue('custbody_pcmiller_call_log', callLog);

                    var id = nlapiSubmitRecord(record);
                }

            } else {
                var bodyError = body.substring(body.lastIndexOf("<Description>") + 13, body.lastIndexOf("</Description>"));
                record.setFieldValue('custbody_calculate_mileague_error', bodyError);
                record.setFieldValue('custbody_miles', null);
                record.setFieldValue('custbody_route_id', null);


                var itemsCount = record.getLineItemCount('item');
                for (var i = 1; i <= itemsCount; i++) {
                    record.setLineItemValue('item', 'custcol_pickup_sequence', i, null);
                    record.setLineItemValue('item', 'custcol_drop_off_sequence', i, null);
                }

                var id = nlapiSubmitRecord(record);
                nlapiLogExecution('error', logTitle, bodyError);
            }

        }

    } catch (e) {
        var bodyError = body.substring(body.lastIndexOf("<Description>") + 13, body.lastIndexOf("</Description>"));
        record.setFieldValue('custbody_calculate_mileague_error', bodyError);
        nlapiLogExecution('error', logTitle, e + '-----Error PC Miller-----' + bodyError);
    }
}

function updateSequencesAfterResponse(j, city, arrCities) {

    for (var i = 0; i < arrCities.length; i++) {

        if (arrCities[i].City.trim() == city) {
            arrCities[i].Sequence = j;
        }
    }

}

/*function sendEmail(xmlSOAP, body){

	try{
		nlapiLogExecution('debug', 'Sending email...');
		var userId = nlapiGetUser();
		nlapiLogExecution('debug', 'userId', userId);
		var bodyEmail = 'Request:   '+ xmlSOAP +   '-------------------------------------------------------'+ 'Response : '+ body;


		var records = new Object();
		records['entity'] = userId;
		nlapiSendEmail(userId, 'paugust@netsuite.com', 'PC Miller call', bodyEmail, null, null, records);


		//nlapiSendEmail(userId, 'mpanizza@netsuite.com', 'PC Miller call' , bodyEmail);
		nlapiLogExecution('debug', 'Finish Sending email...');

	}catch(e){
		nlapiLogExecution('debug', 'Error sending email', e);
	}
}*/


function checkAllSequencesWereSet(allPickupCities, allDropOffCities, record) {

    for (var i = 0; i < allPickupCities.length; i++) {
        record.setLineItemValue('item', 'custcol_pickup_sequence', i + 1, allPickupCities[i].Sequence);
    }

    for (var i = 0; i < allDropOffCities.length; i++) {
        record.setLineItemValue('item', 'custcol_drop_off_sequence', i + 1, allDropOffCities[i].Sequence);
    }
}

function main() {

    var logTitle = 'main';

    try {

        var stUrl = 'http://pcmiler.alk.com/APIs/SOAP/v1.0/Service.svc';

        var xmlSOAP = '<?xml version="1.0" encoding="utf-8"?>'
        xmlSOAP += ' <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">';
        xmlSOAP += ' <s:Header>';
        xmlSOAP += ' <s:Action mustUnderstand="1" xmlns="http://schemas.microsoft.com/ws/2005/05/addressing/none">http://pcmiler.alk.com/APIs/v1.0/IService/GetReports</s:Action>';
        xmlSOAP += ' <h:AuthHeader xmlns="http://www.alk.com" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:h="http://www.alk.com">';
        xmlSOAP += '      <Authorization>BB887C51467A5D43AD7EB2383CE2DC05</Authorization>';
        xmlSOAP += '      <Date>Wed, 27 Jul 2016 17:02:39 GMT</Date>';
        xmlSOAP += '    </h:AuthHeader>';
        xmlSOAP += '  </s:Header>';
        xmlSOAP += '  <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">';
        xmlSOAP += '    <GetReports xmlns="http://pcmiler.alk.com/APIs/v1.0">';
        xmlSOAP += '      <Request>';
        xmlSOAP += '        <Header>';
        xmlSOAP += '          <DataVersion>current</DataVersion>';
        xmlSOAP += '          <RequestType>GetReports</RequestType>';
        xmlSOAP += '        </Header>';
        xmlSOAP += '       <Body>';
        xmlSOAP += '          <ReportRoutes>';
        xmlSOAP += '            <ReportRoute>';
        xmlSOAP += '              <RouteId>Test Route</RouteId>';
        xmlSOAP += '             <Stops>';
        xmlSOAP += '                <StopLocation>';
        xmlSOAP += '                  <Address>';
        xmlSOAP += '                    <StreetAddress xsi:nil="true" />';
        xmlSOAP += '                    <City>Princeton</City>';
        xmlSOAP += '                    <State>NJ</State>';
        xmlSOAP += '                    <Zip>08540</Zip>';
        xmlSOAP += '                    <County xsi:nil="true" />';
        xmlSOAP += '                    <Country xsi:nil="true" />';
        xmlSOAP += '                   <SPLC xsi:nil="true" />';
        xmlSOAP += '                    <CountryPostalFilter>US</CountryPostalFilter>';
        xmlSOAP += '                  </Address>';
        xmlSOAP += '                  <Coords xsi:nil="true" />';
        xmlSOAP += '                  <Region>NA</Region>';
        xmlSOAP += '                  <Label>Princeton, NJ</Label>';
        xmlSOAP += '                  <PlaceName xsi:nil="true" />';
        xmlSOAP += '                  <Costs xsi:nil="true" />';
        xmlSOAP += '                </StopLocation>';
        xmlSOAP += '                <StopLocation>';
        xmlSOAP += '                 <Address>';
        xmlSOAP += '                    <StreetAddress xsi:nil="true" />';
        xmlSOAP += '                    <City>Beverly Hills</City>';
        xmlSOAP += '                    <State>CA</State>';
        xmlSOAP += '                    <Zip>90210</Zip>';
        xmlSOAP += '                    <County xsi:nil="true" />';
        xmlSOAP += '                    <Country xsi:nil="true" />';
        xmlSOAP += '                    <SPLC xsi:nil="true" />';
        xmlSOAP += '                  </Address>';
        xmlSOAP += '                  <Coords xsi:nil="true" />';
        xmlSOAP += '                  <Region>NA</Region>';
        xmlSOAP += '                  <Label>Beverly Hills, CA</Label>';
        xmlSOAP += '                  <PlaceName xsi:nil="true" />';
        xmlSOAP += '                  <Costs xsi:nil="true" />';
        xmlSOAP += '                </StopLocation>';
        xmlSOAP += '              </Stops>';
        xmlSOAP += '              <Options>';
        xmlSOAP += '               <DistanceUnits>Miles</DistanceUnits>';
        xmlSOAP += '                <HighwayOnly>true</HighwayOnly>';
        xmlSOAP += '                <HoSOptions xsi:nil="true" />';
        xmlSOAP += '                <HubRouting>false</HubRouting>';
        xmlSOAP += '<TruckCfg><Axles>2</Axles> ';
        xmlSOAP += '<Height>13' + "'" + '6"' + '</Height>';
        xmlSOAP += '<Length>53' + "'" + '</Length>';
        xmlSOAP += '                                                                           <Units>English</Units>';
        xmlSOAP += '                                                                            <Weight>132000</Weight>  ';
        xmlSOAP += '                                                                            <Width>102"</Width>     ';
        xmlSOAP += '  </TruckCfg>                <VehicleType>LightTruck</VehicleType>              </Options>   <FuelOptions xsi:nil="true" />       <ReportingOptions>                <EstimatedTimeOptions xsi:nil="true" />                <RouteCosts xsi:nil="true" />                <TimeCosts xsi:nil="true" />                <TollDiscount>ALL</TollDiscount>                <UseTollData>true</UseTollData>              </ReportingOptions>              <ReportTypes>';
        xmlSOAP += '               <ReportType xsi:type="MileageReportType" />              </ReportTypes>';
        xmlSOAP += '           </ReportRoute>     </ReportRoutes>        </Body>      </Request>    </GetReports>  </s:Body></s:Envelope>';



        nlapiLogExecution('debug', logTitle, 'xmlSOAP 1 ' + xmlSOAP);
        var headers = {};
        headers.SOAPAction = 'http://pcmiler.alk.com/APIs/v1.0/IService/GetReports';
        headers.SkipSOAPAction = 'false';

        // Make the call
        for (var i = 0; i < 5; i++) {

            var response = nlapiRequestURL(stUrl, xmlSOAP, headers);
            var code = response.getCode();
            nlapiLogExecution('debug', logTitle, 'code ' + code);

            if (code == '200' || code == '201' || code == '202') {
                break;
            }

        }

        var body = response.getBody();
        nlapiLogExecution('debug', logTitle, 'body ' + body);
        var totalMiles = body.substring(body.lastIndexOf("<TMiles>") + 8, body.lastIndexOf("</TMiles>"));
        nlapiLogExecution('debug', logTitle, 'totalMiles  ' + totalMiles);
        var routeId = body.substring(body.lastIndexOf("<RouteID>") + 9, body.lastIndexOf("</RouteID>"));
        nlapiLogExecution('debug', logTitle, 'routeId  ' + routeId);

    } catch (e) {
        nlapiLogExecution('error', logTitle, e);
    }
}

function isEmpty(value) {
    if (value === null)
        return true;
    if (value == undefined)
        return true;
    if (value == '')
        return true;
    return false;
}