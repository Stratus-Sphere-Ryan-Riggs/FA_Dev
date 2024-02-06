declare namespace ScheduledScriptContext {

    export interface execute {

        type: String

        InvocationType: {
            SCHEDULED;
            ON_DEMAND;
            USER_INTERFACE;
            ABORTED;
            SKIPPED
        }
    }

}
