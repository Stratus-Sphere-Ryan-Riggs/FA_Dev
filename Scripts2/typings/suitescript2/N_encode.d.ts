/**This module exposes string encoding and decoding functionality. Load the N/encode module when you want to convert a string to another type of encoding.
 * @link https://netsuite.custhelp.com/app/answers/detail/a_id/43758
 */
declare interface N_encode {
    /**Holds the string values for the supported character set encoding. 
     * This enum is used to set the value of inputEncoding and outputEncoding parameters that are members of the N/crypto Module or N/encode Module.
     */
    Encoding: {
        UTF_8;
        BASE_16;
        BASE_32;
        BASE_64;
        BASE_64_URL_SAFE;
        HEX;
    }

    /**
    * Converts a string to another type of encoding.
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43759
    */
    convert(options: {
        /** (required) The string to encode. */
        string: string
        /** (required) The encoding used on the input string. The default value is UTF_8.Use the encode.Encoding to set the value. */
        inputEncoding: string
        /** (required) The encoding to apply to the output string. The default value is UTF_8.Use the encode.Encoding to set the value. */
        outputEncoding: string
    }): string



}