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
        const MODULE = `KBS.AddInvoiceHeaderButton`;

        const run = (options) => {
            const TITLE = `${MODULE}.Run`;

            if (validate(options) === false) { return; }

            log.debug({ title: TITLE, details: `Adding invoice header button...` });
            let form = KBS.Form.cast(options.form);
            form.addButton({
                ...KBS.Constants.Buttons.INVOICE_HEADER_MEMBER,
                handler: KBS.ClientHandlers.invoiceHeaderButton()
            });

            // addButton(options);
        };

        /* const addButton = (options) => {
            const TITLE = `${MODULE}.AddButton`;
            let { form, newRecord } = options;

            let url = KBS.Url.resolveScript({
                scriptId: KBS.Constants.Scripts.SL_SUIT_MEMBERS_ON_SO,
                deploymentId: KBS.Constants.Deployments.SL_SUIT_MEMBERS_ON_SO,
                params: {
                    custparam_IdRecord: newRecord.id
                }
            });

            // TODO: Add Inline HTML field for button event handler
            form.addButton(KBS.Constants.Buttons.INVOICE_HEADER_MEMBER);
        }; */

        const validate = (options) => {
            const TITLE = `${MODULE}.Validate`;
            let { type } = options;

            if (
                [
                    options.UserEventType.CREATE,
                    options.UserEventType.EDIT,
                    options.UserEventType.VIEW
                ].indexOf(type) < 0
            ) {
                log.debug({ title: TITLE, details: `Invalid type = ${type}. Skipping...` });
                return false;
            }

            log.debug({ title: TITLE, details: 'Valid' });
            return true;
        };

        return {
            run
        };
    }
);