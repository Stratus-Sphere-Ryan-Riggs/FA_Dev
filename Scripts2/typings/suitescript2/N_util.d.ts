/**
 * This module exposes the util Object and its members, made up primarily of methods that verify type on objects and primitives in a SuiteScript 2.0 script.
 * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49619
 */
declare interface N_util {
    /**
    * Returns true if the obj parameter is a JavaScript Array object and false otherwise.
    * @Supported All script types
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45067
    */
    isArray(obj: Object): boolean

    /**
    * Returns true if the obj parameter is a boolean and false otherwise.
    * @Supported All script types
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45068
    */
    isBoolean(obj: Object): boolean

    /**
    * Returns true if the obj parameter is a JavaScript Date object and false otherwise.
    * @Supported All script types
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45069
    */
    isDate(obj: Object): boolean

    /**
    * Iterates over each member in an Object or Array.This method calls the callback function on each member of the iterable.
    * @Supported All script types
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49372
    */
    each(iterable: Object | Array, callback: Function): Object | Array

    /**
    * Method used to copy the properties in a source object to a destination object. Returns the destination object.You can use this method to merge two objects.
    * @Supported All script types
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/49373
    */
    extend(receiver: Object, contributor: Object): Object

    /**
    * Returns true if the obj parameter is a JavaScript Function object and false otherwise.
    * @Supported All script types
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45070
    */
    isFunction(obj: object | primitive): boolean

    /**
    * Returns true if the obj parameter is a JavaScript Number object or primitive, and false otherwise.
    * @Supported All script types
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45071
    */
    isNumber(obj: object | primitive): boolean

    /**
    * Returns true if the obj parameter is a plain JavaScript object(new Object() or {} for example), and false otherwise.Use this method, for example, to verify that a variable is a JavaScript object and not a JavaScript Function.
    * @Supported All script types
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45072
    */
    isObject(obj: object | primitive): boolean

    /**
    * Returns true if the obj parameter is a JavaScript RegExp object, and false otherwise.
    * @Supported All script types
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45073
    */
    isRegExp(obj: object | primitive): boolean

    /**
    * Returns true if the obj parameter is a JavaScript String object or primitive, and false otherwise
    * @Supported All script types
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45074
    */
    isString(obj: object | primitive): boolean

    /**
    * Returns the current time (epoch) in nanoseconds.You can use this method to measure elapsed time between two events.
    * @Supported All script types
    * @Governance None
    * @Since Version 2016 Release 1
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/45075
    */
    nanoTime(): string

}