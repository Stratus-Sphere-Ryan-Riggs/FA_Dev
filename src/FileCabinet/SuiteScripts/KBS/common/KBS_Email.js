/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for the N/email module.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/email'
    ],
    (
        email
    ) => {
        const MODULE = 'KBS.Email';

        const send = (options) => {
            const TITLE = `${MODULE}.Send`;
            let { author, body, recipients, subject, attachments, bcc, cc, isInternalOnly, relatedRecords, replyTo } = options;

            try {
                email.send({
                    author,
                    recipients,
                    cc,
                    bcc,
                    body,
                    subject,
                    attachments,
                    relatedRecords
                });
                log.debug({ title: TITLE, detailLs: `Email successfully sent to ${JSON.stringifyrecipients}` });

                return true;
            }
            catch (ex) {
                log.error({ title: TITLE, details: ex.toString() });

                return false;
            }
        };

        return {
            send
        };
    }
);