
/**
 * You can use the format module to parse formatted data into strings and to convert strings into a specified format.
 * @link https://netsuite.custhelp.com/app/answers/detail/a_id/44521
 */
declare interface N_format {

    /**Enumeration that holds the string values for the supported field types. 
     * This enum is used to set the value of the options.type parameter when
     *  calling format.format(options) or format.parse(options). */
    Type: {
        CCEXPDATE;
        CCNUMBER;
        CCVALIDFROM;
        CHECKBOX;
        COLOR;
        CURRENCY;
        CURRENCY2;
        DATE;
        DATETIME;
        DATETIMETZ;
        FLOAT;
        FULLPHONE;
        FUNCTION;
        IDENTIFIER;
        INTEGER;
        MMYYDATE;
        NONNEGCURRENCY;
        NONNEGFLOAT;
        PERCENT;
        PHONE;
        POSCURRENCY;
        POSFLOAT;
        POSINTEGER;
        RATE;
        RATEHIGHPRECISION;
        TIME;
        TIMEOFDAY;
        TIMETRACK;
        URL;
    }

    /**
    * Method used to format a value from the raw value to its appropriate preference format
    *@Supported Client and server-side scripts
    *@Governance None
    *@Since Version 2015 Release 2
    *@Throws 
    *@Link https://netsuite.custhelp.com/app/answers/detail/a_id/44524
    */
    format(options: {
        /**The input data to format. */
        value: Date | String | number;
        /**The field type (for example, DATE, CURRENCY, INTEGER). Set using the format.Type enum.*/
        type: N_format.Type;
        /**The time zone specified for the returned string. Set using the format.Timezone enum or key. 
         * If a time zone is not specified, the time zone is set based on user preference.
         * If the time zone is invalid, the time zone is set to GMT.
        */
        timezone: number;
    }): String | Date;

    /**
    * Method used to parse a value from the appropriate preference format to its raw value. For a datetime or datetimetz value,
    * use this method to convert a Date Object into a string based on the specified timezone.
    *@Supported Client and server-side scripts
    *@Governance None
    *@Since Version 2015 Release 2
    *@Throws 
    *@Link https://netsuite.custhelp.com/app/answers/detail/a_id/44523
    */
    parse(options: {
        /** The string that contains the date and time information in the specified timezone. */
        value: String;
        /**The field type (for example, DATE, CURRENCY, INTEGER).
         * The field type (either DATETIME or DATETIMETX).
         */
        type: String;
        /** The time zone represented by the options.value string. Set using the format.Timezone enum.
         * If a time zone is not specified, the time zone is based on user preference.
         * If the time zone is invalid, the time zone is set to GMT. */
        timezone: Enumerator;
    }): Date | String | number;

}