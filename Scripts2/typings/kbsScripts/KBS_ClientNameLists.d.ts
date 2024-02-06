declare interface KBS_ClientNameLists {

    lists: {
        class: {
        },
        department: {
        },
        files: {
        },
        folders: {
        },
        location: {
        },
        scripts: {
            suitelet: {
            },
            mapReduce: {
            },
            scheduled: {
            }
        },
        searches: {
            transaction: {

            },
            customRecordType: {
            }
        },
        transactionStatuses: {
            purchaseOrder: {
                pendingApproval: 'A',
                pendingReceipt: 'B',
                rejected: 'C',
                partiallyReceived: 'D',
                pendingBillPartiallyReceived: 'E',
                pendingBilling: 'F',
                fullyBilled: 'G',
                closed: 'H',
                planned: 'P'
            },
            salesOrder: {
                pendingApproval: 'A',
                pendingFulfillment: 'B',
                cancelled: 'C',
                partiallyFulfilled: 'D',
                pendingBillPartiallyFulfill: 'E',
                pendingBilling: 'F',
                billed: 'G',
                closed: 'H'
            }
        }
    },
    rec: {
        custcol: {
        },
        custbody: {
        },
        custentity: {
        },
        custitem: {
        }
    }
}
