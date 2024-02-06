/**Load the file module when you want to work with files within NetSuite.
 *  You can use this module to upload files to the NetSuite file cabinet. You can 
 * also use this module to send files as attachments without uploading them to the file cabinet.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43524
 */
declare interface N_file {

    /**Enumeration that holds the string values for supported character encoding. */
    Encoding: {
        /**Unicode */
        UTF8;
        /**Western */
        WINDOWS_1252;
        /**Western */
        ISO_8859_1;
        /**Chinese Simplified */
        GB18030;
        /**Japanese */
        SHIFT_JIS;
        /**Western */
        MAC_ROMAN;
        /**Chinese Simplified */
        GB2312;
        /**Chinese Traditional */
        BIG5;
    }
    /**Enumeration that holds the string values for supported file types. This enum is used to set the value of the File.fileType property. */
    Type: {
        AUTOCAD;
        BMPIMAGE;
        CSV;
        EXCEL;
        FLASH;
        FREEMARKER;
        GIFIMAGE;
        GZIP;
        HTMLDOC;
        ICON;
        JAVASCRIPT;
        JPGIMAGE;
        JSON;
        MESSAGERFC;
        MP3;
        MPEGMOVIE;
        MSPROJECT;
        PDF;
        PJPGIMAGE;
        PLAINTEXT;
        PNGIMAGE;
        POSTSCRIPT;
        POWERPOINT;
        QUICKTIME;
        RTF;
        SMS;
        STYLESHEET;
        TAR;
        TIFFIMAGE;
        VISIO;
        WEBAPPPAGE;
        WEBAPPSCRIPT;
        WORD;
        XMLDOC;
        XSD;
        ZIP;
    }

    /**
* Method used to create a new file in the NetSuite file cabinet.File content must be less than 10MB in size to access with this method.
* @Supported Server-side scripts
* @Governance None
* @Since Version 2015 Release 2
* @Throws SSS_MISSING_REQD_ARGUMENT > <name of missing parameter>
* @Throws SSS_INVALID_TYPE_ARG > You have entered an invalid type argument: <passed type argument>
* @Throws SSS_FILE_CONTENT_SIZE_EXCEEDED > The file you are trying to create exceeds the maximum allowed file size of 10.0 MB.
* @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43525
*/
    create(options: {
        /** (required) The file name and extension.Sets the value for the File.name property. */
        name: string
        /** (required) The file type.Sets the value for the File.fileType property. This property is read-only and cannot be changed after the file is created.Use the file.Type enum to set the value. */
        fileType: N_file.fileType
        /** (required) The file content.File content is lazy loaded; there is no property for it.If the file type is binary (for example, PDF), the file content must be base64 encoded. */
        contents: string
        /** (optional) The file description. In the UI, the value of description displays the Description field on the file record.Sets the value for the File.description property. */
        description: string
        /** (optional) The internal ID of the folder within the NetSuite file cabinet. You must set the file cabinet folder before you upload a file to the NetSuite file cabinet with File.save().Sets the value for the File.folder property. */
        folder: number
        /** (optional) The character encoding on a file.Sets the value for the File.encoding property.Use the file.Encoding enum to set the value. */
        encoding: string
        /** (optional) The inactive status of a file. If set to true, the file is inactive. The default value is false. When a file is inactive, it does not display in the UI unless you select Show Inactives on the File Cabinet page.Sets the value for the File.isInactive property. */
        isInactive: boolean
        /** (optional) The Available without Login status of a file. If set to true, users can download the file outside of a current netSuite login session. The default value is false.Sets the value for the File.isOnline property. */
        isOnline: boolean
    }): N_file.File

    /**
    * Method used to delete an existing file from the NetSuite file cabinet.
    * @Supported Server-side scripts
    * @Governance 20 usage units
    * @Since Version 2015 Release 2
    * @Throws SSS_MISSING_​REQD_​ARGUMENT > <name of missing parameter>
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43527
    */
    delete(options: {
        /** (required) Internal ID of the file.To find the internal ID of the file in the UI, click Documents > Files > File Cabinet. */
        id: number | string
    }): number

    /**
    * Method used to load an existing file from the NetSuite file cabinet.
    * @Supported Server-side scripts
    * @Governance 10 usage units
    * @Since Version 2015 Release 2
    * @Throws INSUFFICIENT_PERMISSION > You do not have access to the media item you selected.
    * @Throws RCRD_DSNT_EXIST > That record does not exist. path: {path}
    * @Throws SSS_MISSING_​REQD_​ARGUMENT > <name of missing parameter>
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43528
    */
    load(options: {
        /** (required) Pass one of the following:Internal ID of the file as a number or a string.The relative file path to the file in the file cabinet. For example, ‘Images/myImageFile.jpg’.To find the internal ID of the file in the UI, select Documents > Files > File Cabinet. */
        id: number | string
    }): N_file.File

}

declare namespace N_file {
    interface File {

        /**The file type of a file. */
        fileType: {
            /**You attempt to edit this property after it is set with file.create(options). */
            READ_ONLY_PROPERTY;
        }
        /**Description of a file. */
        description: String;
        /**Character encoding on a file. */
        encoding: String;
        /**Internal ID of the folder that houses a file within the NetSuite file cabinet. */
        folder: number;
        /**Internal ID of a file in the NetSuite file cabinet. */
        id: number;
        /**Inactive status of a file. If set to true, the file is inactive. */
        isInactive: boolean;
        /**“Available without Login” status of a file. If set to true, users can download the file outside of a current NetSuite login session. */
        isOnline: boolean;
        /**Indicates whether a file type is text-based. */
        isText: boolean;
        /**Name of a file. */
        name: String;
        /**Relative path to a file in the NetSuite file cabinet. */
        path: String;
        /**Size of a file in bytes. */
        size: String;
        /**URL of a file. */
        url: String;

        /**
        * Method used to return the content of the file.File content must be less than 10MB in size to access with this method.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Throws SSS_FILE_CONTENT_SIZE_EXCEEDED > The file content you are attempting to access exceeds the maximum allowed size of 10 MB.
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43539
        */
        getContents(): string

        /**
        * Method used to:Upload a new file to the NetSuite file cabinet.Save an updated file to the NetSuite file cabinet.The File.save() method can upload or save files of any size, as long as the file size is permitted by the file cabinet.If you want to save the file to the NetSuite file cabinet, you must set a NetSuite file cabinet folder with the File.folder property. You must do this before you call File.save().
        * @Supported Server-side scripts
        * @Governance 20 usage units
        * @Since Version 2015 Release 2
        * @Throws INVALID_KEY_OR_REF > Invalid folder reference key <passed folder ID>.
        * @Throws SSS_MISSING_​REQD_​ARGUMENT > Please enter value(s) for: Folder
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43543
        */
        save(): number




    }

}