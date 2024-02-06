/**
 * Load the email module when you want to send email messages from within NetSuite. You can use the email module to send regular, bulk, and campaign email.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43736
 */
declare interface N_email {

    /** () | Promise Method used to send transactional email and receive bounceback notifications if the email is not successfully delivered. */
    send: {
        /**
        * Method used to send transactional email and receive bounceback notifications if the email is not successfully delivered.A maximum of 10 recipients (recipient + cc + bcc) is allowed.The total message size (including attachments) must be 15MB or less. The size of Individual attachments cannot exceed 10BM.
        * @Supported Client and server-side scripts
        * @Governance 20 usage units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43754
        */
        (options: {
            /** (required) Internal ID of the email sender.To find the internal ID of the sender in the UI, go to Lists > Employees. */
            author: number
            /** (required) The internal ID or email address of the recipient.For multiple recipients, use an array of internal IDs or email addresses. You can use an array that contains a combination of internal IDs and email addresses.A maximum of 10 recipients (recipient + cc + bcc) is allowed.Only the first recipient displays on the Communication tab (under the Recipient column). To view all recipients, click View to open the Message record. */
            recipients: number[] | string[]
            /** (optional) The email address that appears in the reply-to header when an email is sent out.You can use either a single external email address or a generic email address created by the Email Capture Plug-in. */
            replyTo: string
            /** (optional) The internal ID or email address of the secondary recipient to copy.For multiple recipients, use an array of internal IDs or email addresses. You can use an array that contains a combination of internal IDs and email addresses.A maximum of 10 recipients (recipient + cc + bcc) is allowed. */
            cc: number[] | string[]
            /** (optional) The internal ID or email address of the recipient to blind copy.For multiple recipients, use an array of internal IDs or email addresses. You can use an array that contains a combination of internal IDs and email addresses.A maximum of 10 recipients (recipient + cc + bcc) is allowed. */
            bcc: number[] | string[]
            /** (required) Subject of the outgoing message.  */
            subject: string
            /** (required) Contents of the emailSuiteScript formats the body of the email in either plain text or HTML.  If HTML tags are present, the message is formatted as HTML. Otherwise, the message is formatted in plain text.To display XML as plain text, use an HTML<pre> tag around XML content. */
            body: string
            /** (optional) The email file attachments.You can send multiple attachments of any media typeAn individual attachment must not exceed 10MB and the total message size must be 15MB or less.Supported for server-side scripts only. */
            attachments: file.file
            /** (optional) Object that contains key/value pairs to associate the Message record with related records (including custom records).See the relatedRecords table for more information */
            relatedRecords: object
            /** (required) If true, the Message record is not visible to an external Entity ( (for example, a customer or contact).The default value is false. */
            isInternalOnly: boolean
        }): void

        /**
        * Method used to send transactional email asynchronously and receive bounceback notifications if the email is not successfully delivered.For information about the parameters and errors thrown for this method, see email.send(options). For additional information about promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 20 usage units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45229
        */
        promise(options: {
            /** (required) Internal ID of the email sender.To find the internal ID of the sender in the UI, go to Lists > Employees. */
            author: number
            /** (required) The internal ID or email address of the recipient.For multiple recipients, use an array of internal IDs or email addresses. You can use an array that contains a combination of internal IDs and email addresses.A maximum of 10 recipients (recipient + cc + bcc) is allowed.Only the first recipient displays on the Communication tab (under the Recipient column). To view all recipients, click View to open the Message record. */
            recipients: number[] | string[]
            /** (optional) The email address that appears in the reply-to header when an email is sent out.You can use either a single external email address or a generic email address created by the Email Capture Plug-in. */
            replyTo: string
            /** (optional) The internal ID or email address of the secondary recipient to copy.For multiple recipients, use an array of internal IDs or email addresses. You can use an array that contains a combination of internal IDs and email addresses.A maximum of 10 recipients (recipient + cc + bcc) is allowed. */
            cc: number[] | string[]
            /** (optional) The internal ID or email address of the recipient to blind copy.For multiple recipients, use an array of internal IDs or email addresses. You can use an array that contains a combination of internal IDs and email addresses.A maximum of 10 recipients (recipient + cc + bcc) is allowed. */
            bcc: number[] | string[]
            /** (required) Subject of the outgoing message.  */
            subject: string
            /** (required) Contents of the emailSuiteScript formats the body of the email in either plain text or HTML.  If HTML tags are present, the message is formatted as HTML. Otherwise, the message is formatted in plain text.To display XML as plain text, use an HTML<pre> tag around XML content. */
            body: string
            /** (optional) The email file attachments.You can send multiple attachments of any media typeAn individual attachment must not exceed 10MB and the total message size must be 15MB or less.Supported for server-side scripts only. */
            attachments: file.file
            /** (optional) Object that contains key/value pairs to associate the Message record with related records (including custom records).See the relatedRecords table for more information */
            relatedRecords: object
            /** (required) If true, the Message record is not visible to an external Entity ( (for example, a customer or contact).The default value is false. */
            isInternalOnly: boolean
        }): Promise<void>
    }

    /** () | Promise This method is used to send bulk email when a bounceback notification is not required.*/
    sendBulk: {
        /**
        * This method is used to send bulk email when a bounceback notification is not required.This API normally uses a bulk email server to send messages. If you need to increase the successful delivery rate of an email, use email.send(options) so that a transactional email server is used.
        * @Supported Client and server-side scripts
        * @Governance 10 usage units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43751
        */
        (options: {
            /** (required) Internal ID of the email sender.To find the internal ID of the sender in the UI, go to Lists > Employees. */
            author: number
            /** (required) The internal ID or email address of the recipient.For multiple recipients, use an array of internal IDs or email addresses. You can use an array that contains a combination of internal IDs and email addresses.A maximum of 10 recipients (recipient + cc + bcc) is allowed.Only the first recipient displays on the Communication tab (under the Recipient column). To view all recipients, click View to open the Message record. */
            recipients: number[] | string[]
            /** (optional) The email address that appears in the reply-to header when an email is sent out.You can use either a single external email address or a generic email address created by the Email Capture Plug-in. */
            replyTo: string
            /** (optional) The internal ID or email address of the secondary recipient to copy.For multiple recipients, use an array of internal IDs or email addresses. You can use an array that contains a combination of internal IDs and email addresses.A maximum of 10 recipients (recipient + cc + bcc) is allowed. */
            cc: number[] | string[]
            /** (optional) The internal ID or email address of the recipient to blind copy.For multiple recipients, use an array of internal IDs or email addresses. You can use an array that contains a combination of internal IDs and email addresses.A maximum of 10 recipients (recipient + cc + bcc) is allowed. */
            bcc: number[] | string[]
            /** (required) Subject of the outgoing message.  */
            subject: string
            /** (required) Contents of the emailSuiteScript formats the body of the email in either plain text or HTML.  If HTML tags are present, the message is formatted as HTML. Otherwise, the message is formatted in plain text.To display XML as plain text, use an HTML<pre> tag around XML content. */
            body: string
            /** (optional) The email file attachments.You can send multiple attachments of any media typeAn individual attachment must not exceed 10MB and the total message size must be 15MB or less.Supported for server-side scripts only. */
            attachments: file.file
            /** (optional) Object that contains key/value pairs to associate the Message record with related records (including custom records).See the relatedRecords table for more information */
            relatedRecords: object
            /** (optional) If true, the Message record is not visible to an external Entity ( (for example, a customer or contact).The default value is false. */
            isInternalOnly: boolean
        }): void

        /**
        * This method is used to send bulk email asynchronously when a bounceback notification is not required.For information about the parameters and errors thrown for this method, see email.sendBulk(options). For additional information about promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 usage units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45230
        */
        promise(options: {
            /** (required) Internal ID of the email sender.To find the internal ID of the sender in the UI, go to Lists > Employees. */
            author: number
            /** (required) The internal ID or email address of the recipient.For multiple recipients, use an array of internal IDs or email addresses. You can use an array that contains a combination of internal IDs and email addresses.A maximum of 10 recipients (recipient + cc + bcc) is allowed.Only the first recipient displays on the Communication tab (under the Recipient column). To view all recipients, click View to open the Message record. */
            recipients: number[] | string[]
            /** (optional) The email address that appears in the reply-to header when an email is sent out.You can use either a single external email address or a generic email address created by the Email Capture Plug-in. */
            replyTo: string
            /** (optional) The internal ID or email address of the secondary recipient to copy.For multiple recipients, use an array of internal IDs or email addresses. You can use an array that contains a combination of internal IDs and email addresses.A maximum of 10 recipients (recipient + cc + bcc) is allowed. */
            cc: number[] | string[]
            /** (optional) The internal ID or email address of the recipient to blind copy.For multiple recipients, use an array of internal IDs or email addresses. You can use an array that contains a combination of internal IDs and email addresses.A maximum of 10 recipients (recipient + cc + bcc) is allowed. */
            bcc: number[] | string[]
            /** (required) Subject of the outgoing message.  */
            subject: string
            /** (required) Contents of the emailSuiteScript formats the body of the email in either plain text or HTML.  If HTML tags are present, the message is formatted as HTML. Otherwise, the message is formatted in plain text.To display XML as plain text, use an HTML<pre> tag around XML content. */
            body: string
            /** (optional) The email file attachments.You can send multiple attachments of any media typeAn individual attachment must not exceed 10MB and the total message size must be 15MB or less.Supported for server-side scripts only. */
            attachments: file.file
            /** (optional) Object that contains key/value pairs to associate the Message record with related records (including custom records).See the relatedRecords table for more information */
            relatedRecords: object
            /** (optional) If true, the Message record is not visible to an external Entity ( (for example, a customer or contact).The default value is false. */
            isInternalOnly: boolean
        }): Promise<void>

    }

    /**() | Promise Method used to send a single “on-demand” campaign email to a specified recipient and return a campaign response ID to track the email.*/
    sendCampaignEvent: {

        /**
        * Method used to send a single “on-demand” campaign email to a specified recipient and return a campaign response ID to track the email.Email (campaignemail) sublists are not supported. The campaign must use a Lead Nurturing (campaigndrip) sublist.This API normally uses a bulk email server to send messages. If you need to increase the successful delivery rate of an email, use email.send(options) so that a transactional email server is used.
        * @Supported Client and server-side scripts
        * @Governance 10 usage units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45064
        */
        (options: {
            /** (required) The internal ID of the campaign event.The campaign must use a Lead Nurturing (campaigndrip) sublist. */
            campaignEventId: number
            /** (required) The internal ID of the recipient.The recipient’s record must contain an email address. */
            recipientId: number
        }): number

        /**
        * Method used to send a single “on-demand” campaign email asynchronously to a specified recipient and return a campaign response ID to track the email.For information about the parameters and errors thrown for this method, see email.sendCampaignEvent(options). For additional information about promises, see Promise object.
        * @Supported All client-side scripts
        * @Governance 10 usage units
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45231
        */
        promise(options: {
            /** (required) The internal ID of the campaign event.The campaign must use a Lead Nurturing (campaigndrip) sublist. */
            campaignEventId: number
            /** (required) The internal ID of the recipient.The recipient’s record must contain an email address. */
            recipientId: number
        }): Promise<number>
        
    }

}