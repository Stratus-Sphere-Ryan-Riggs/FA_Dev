/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/record', 'N/runtime'], function(search, record, runtime) {

    function beforeSubmit(context) {
        var customRecord, poId, purchaseorderSearchObj, searchResults;

        if (context.type !== context.UserEventType.CREATE) return;

        customRecord = context.newRecord;
        poId = customRecord.getValue({ fieldId: 'custrecord_purchreq_parentrequest' });

        purchaseorderSearchObj = search.create({
            type: "purchaseorder",
            filters: [
                ["type", "anyof", "PurchOrd"],
                "AND",
                ["mainline", "is", "F"],
                "AND",
                ["internalidnumber", "equalto", poId]
            ],
            columns: [
                search.createColumn({ name: "number", join: "account", label: "Account Number" }),
                search.createColumn({ name: "account", label: "Account" }),
                search.createColumn({ name: "amount", label: "Amount" }),
                search.createColumn({ name: "memo", label: "Description" }),
                search.createColumn({ name: "departmentnohierarchy", label: "Program" }),
                search.createColumn({ name: "custcol_cseg_projects_cseg", label: "FA Projects (CSEG)" }),
                search.createColumn({ name: "locationnohierarchy", label: "Fund" }),
                search.createColumn({ name: "custcolfa_campaign_number", label: "Campaign Number" })  // New column
            ]
        });

        searchResults = '<style>table {width: 100%;} td, th {text-align: left; padding: 0 20px;} th {font-weight: bold; text-decoration: underline;}</style>';
        searchResults += '<table><tr><th>Account Number</th><th>Account Name</th><th>Amount</th><th>Campaign Number</th><th>Fund</th><th>Program</th><th>FA Projects</th><th>Description</th></tr>';  // Added Campaign Number header

        purchaseorderSearchObj.run().each(function(result) {
            var accountNumber, accountName, amount, memo, program, project, fund, campaignNumber;

            accountNumber = result.getValue({ name: 'number', join: 'account' });
            accountName = result.getText({ name: 'account' });
            accountName = accountName.split(':').pop().trim();
            amount = Math.abs(result.getValue({ name: 'amount' }));
            memo = result.getValue({ name: 'memo' });
            program = result.getText({ name: 'departmentnohierarchy' });
            project = result.getText({ name: 'custcol_cseg_projects_cseg' });
            fund = result.getText({ name: 'locationnohierarchy' });
            campaignNumber = result.getValue({ name: 'custcolfa_campaign_number' });  // Get the Campaign Number

            searchResults += '<tr><td>' + accountNumber + '</td><td>' + accountName + '</td><td>' + amount + '</td><td>' + campaignNumber + '</td><td>' + fund + '</td><td>' + program + '</td><td>' + project + '</td><td>' + memo + '</td></tr>';  // Added Campaign Number to the row

            return true;
        });

        searchResults += '</table>';
        customRecord.setValue('custrecord_purchreq_linedetail', searchResults);
    }

    return {
        beforeSubmit: beforeSubmit
    };
});