declare interface N_test {

    /** () | Promise Makes the call */
    makeCall: {
        /** Makes a call doing something awesome */
        (options: {
            name: String

            phone: number
        }): void
        /** Makes a call doing something awesome */
        promise(options: {
            name: String

            phone: number;
        }): Promise<void>
    }
}