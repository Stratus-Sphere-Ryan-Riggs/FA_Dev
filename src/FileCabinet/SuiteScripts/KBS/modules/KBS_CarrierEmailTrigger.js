/**
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 * 
 * @description         Before Load module
 * 
 * Date                 Author                      Notes
 * 2024-05-22           Marlon Villarama            Initial setup
 * 
 */

define(
    [
        '../../common/KBS'
    ],
    (
        KBS
    ) => {
        const MODULE = `KBS.CarrierEmailTrigger`;
        const CUSTOM_LISTS = KBS.Constants.Lists;
        const FIELDS = KBS.Constants.Transaction.Fields;

        const run = (options) => {
            const TITLE = `${MODULE}.Run`;
            let { newRecord, oldRecord } = options;

            let newCast = KBS.Record.cast(newRecord);
            let newValues = newCast.getValues({ fields: FIELDS });
            if (validate({ values: newValues }) === false) { return; }

            let oldCast = KBS.Record.cast(oldRecord);
            let oldValues = oldCast.getValues({ fields: FIELDS });
            if (validateEmail({ values: oldValues }) === false) { return; }

            return KBS.Email.send({ })
        };

        const validate = (options) => {
            const TITLE = `${MODULE}.Validate`;
            let { values } = options;

            let orderType = values.ORDER_TYPE;
            let faTransportArranged = values.FA_TRANSPORT_ARRANGED;
            let carrierCode = values.CARRIER_CODE;
            log.debug({ title: TITLE, details: `orderType = ${orderType}; faTransportArranged = ${faTransportArranged}; carrierCode = ${carrierCode}` });
 
            return (
                orderType !== CUSTOM_LISTS.ORDER_TYPE.Values.DONATION_BLUE &&
                faTransportArranged === true &&
                !!carrierCode === true
            );
        };

        const validateEmail = (options) => {
            const TITLE = `${MODULE}.ValidateEmail`;
            let { values } = options;

            // TODO: Lookup Carrier Code: Send email order on updates
            let carrierCodeLookup = KBS.Search.lookupFields({
                type: '',
                id: '',
                columns: []
            });
        };

        return {
            run
        };
    }
);