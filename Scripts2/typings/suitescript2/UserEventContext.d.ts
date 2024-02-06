declare namespace UserEventContext {

    interface afterSubmit {

        newRecord: N_record.Record

        oldRecord: N_record.Record

        type: string

        UserEventType: {

            APPROVE;
            CANCEL;
            CHANGEPASSWORD;
            COPY;
            CREATE;
            DELETE;
            DROPSHIP;
            EDIT;
            EDITFORECAST;
            EMAIL;
            MARKCOMPLETE;
            ORDERITEMS;
            PACK;
            PAYBILLS;
            PRINT;
            QUICKVIEW;
            REASSIGN;
            REJECT;
            SHIP;
            SPECIALORDER;
            TRANSFORM;
            VIEW;
            XEDIT;
        }
    }

    interface beforeSubmit {

        newRecord: N_record.Record

        oldRecord: N_record.Record

        type: string

        UserEventType: {

            APPROVE;
            CANCEL;
            CHANGEPASSWORD;
            COPY;
            CREATE;
            DELETE;
            DROPSHIP;
            EDIT;
            EDITFORECAST;
            EMAIL;
            MARKCOMPLETE;
            ORDERITEMS;
            PACK;
            PAYBILLS;
            PRINT;
            QUICKVIEW;
            REASSIGN;
            REJECT;
            SHIP;
            SPECIALORDER;
            TRANSFORM;
            VIEW;
            XEDIT;
        }
    }

    interface beforeLoad {

        newRecord: N_record.Record

        type: string

        form: N_ui_serverWidget.Form

        request: N_http.ServerRequest

        UserEventType: {

            APPROVE;
            CANCEL;
            CHANGEPASSWORD;
            COPY;
            CREATE;
            DELETE;
            DROPSHIP;
            EDIT;
            EDITFORECAST;
            EMAIL;
            MARKCOMPLETE;
            ORDERITEMS;
            PACK;
            PAYBILLS;
            PRINT;
            QUICKVIEW;
            REASSIGN;
            REJECT;
            SHIP;
            SPECIALORDER;
            TRANSFORM;
            VIEW;
            XEDIT;
        }
    }
}
