/**
 * The sftp module provides a way to upload and download files from external SFTP servers.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51361
 */
declare interface N_sftp {
    /**
    * Establishes a connection to a remote FTP server.To generate the passwordguid, you can create a suitelet that uses Form.addCredentialField(options).
    * Use the N/https Module to fetch the GUID value returned from the Suitelet's credential field.
    * @Supported All server-side scripts
    * @Governance None
    * @Since 2016.2
    * @Throws FTP_UNKNOWN_HOST_ERROR > The host could not be found.
    * @Throws FTP_CONNECT_TIMEOUT_EXCEEDED > A connection could not be established within options.timeout seconds.
    * @Throws FTP_CANNOT_ESTABLISH_CONNECTION > The password/username was invalid or permission to access the directory was denied.
    * @Throws FTP_UNKNOWN_PASSWORD_GUID > The system could not find the password GUID.
    * @Throws FTP_INVALID_URL > The URL value is in an invalid format or contains an illegal character.
    * @Throws FTP_INVALID_PORT_NUMBER > The port number is invalid.
    * @Throws FTP_INVALID_CONNECTION_TIMEOUT > The options.timeout value is either a negative value, zero, or greater than 20 seconds.
    * @Throws FTP_INVALID_DIRECTORY > The directory does not exist on the remote FTP server.
    * @Throws FTP_INCORRECT_HOST_KEY > The host key does not match the presented host key on the remote FTP server.
    * @Throws FTP_INCORRECT_HOST_KEY_TYPE > The host key type and provided host key type do not match.
    * @Throws FTP_MALFORMED_HOST_KEY > The host key is not in the correct format. (e.g. base 64, 96+ bytes)
    * @Throws FTP_PERMISSION_DENIED > Access to the file or directory on the remote FTP server was denied.
    * @Throws FTP_UNSUPPORTED_ENCRYPTION_ALGORITHM > The remote FTP server does not support one of NetSuite’s approved algorithms. (e.g. aes256-ctr, es192-ctr, es128-ctr)
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51362
    */
    createConnection(options: {
        /** (Required) The host of the remote account. */
        url: string
        /** (Required) The password GUID for the remote account. */
        passwordGuid: string
        /** (Required) The host key for the trusted fingerprint on the server. */
        hostKey: string
        /** (Optional) The username of the remote account.By default, the login is anonymous. */
        username: string
        /** (Optional) The port used to connect to the remote account. By default, port 22 is used. */
        port: number
        /** (Optional) The remote directory of the connection. */
        directory: string
        /** (Optional) The number of seconds to allow for an established connection. By default, this value is set to 20 seconds. */
        timeout: number
        /** (Optional) The type of host key specified by options.hostKey.This value can be set to one of the following options:dsa ecdsa rsa */
        hostKeyType: string
    }) : N_sftp.Connection

}

declare namespace N_sftp {
    /**
     * Represents a connection to the account on the remote FTP server.
     * @Supported Server-side scripts
     * @Since Version 2016 Release 2
     * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51363
     */
    export interface Connection {
        /**
        * Downloads a file from the remote FTP server
        * @Supported Server-side scripts
        * @Governance 100
        * @Since 2016.2
        * @Throws FTP_MAXIMUM_​FILE_​SIZE_​EXCEEDED > The file size is greater than the maximum file size allowed by NetSuite.
        * @Throws FTP_INVALID_DIRECTORY > The directory does not exist on the remote FTP server.
        * @Throws FTP_TRANSFER_​TIMEOUT_​EXCEEDED > The transfer is taking longer than the specified options.timeout value.
        * @Throws FTP_INVALID_​TRANSFER_​TIMEOUT > The options.timeout value is either a negative value, zero or greater than 300 seconds.
        * @Throws FTP_FILE_DOES_NOT_EXIST > The options.filename does not exist in the options.directory location.
        * @Throws FTP_PERMISSION_DENIED > Access to the file or directory on the remote FTP server was denied.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51365
        */
        download(options: {
            /** (Required) The name of the file to download. */
            filename: string
            /** (Optional) The relative path to the directory that contains the file to download.By default, the path is set to the current directory. */
            directory: string
            /** (Optional) The number of seconds to allow for the file to download.By default, this value is set to 300 seconds. */
            timeout: number
        }) : N_file.File
        /**
        * Uploads a file to the remote FTP server.
        * @Supported Server-side scripts
        * @Governance 100
        * @Since 2016.2
        * @Throws FTP_INVALID_DIRECTORY > The directory does not exist on the remote FTP server.
        * @Throws FTP_TRANSFER_​TIMEOUT_​EXCEEDED > The transfer is taking longer than the specified options.timeout value.
        * @Throws FTP_INVALID_​TRANSFER_​TIMEOUT > The options.timeout value is either a negative value, zero or greater than 300 seconds.
        * @Throws FTP_FILE_ALREADY_EXISTS > The options.replaceExisting value is false and a file with the same name exists in the remote directory.
        * @Throws FTP_PERMISSION_DENIED > Access to the file or directory on the remote FTP server was denied.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/51364
        */
        upload(options: {
            /** (Required) The file to upload. */
            file: file.file
            /** (Optional) The name to give the uploaded file on server.By default, the filename is the same specified by options.file.Illegal characters are automatically escaped. */
            filename: string
            /** (Optional) The relative path to the directory where the file should be upload to.By default, the path is set to the current directory. */
            directory: string
            /** (Optional) The number of seconds to allow for the file to upload.By default, this value is set to 300 seconds. */
            timeout: number
            /** (Optional) Indicates whether the file being uploaded should overwrite any file with the name options.filename that already exists in options.directory.
             * If false, the FTP_FILE_ALREADY_EXISTS exception is thrown when a file with the same name already exists in the options.directory.By default, this value is false. */
            replaceExisting: boolean
        }) : void

    }
}