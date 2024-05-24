/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for constants related to transactions.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [],
    () => {
        const Fields = {
            ACCOUNT:                    'account',
            ALT_NAME:                   'altname',
            AMOUNT_REMAINING:           'amountremaining',
            BALANCE:                    'balance',
            CLASS:                      'class',
            CLEARED:                    'cleared',
            CLEARED_DATE:               'cleareddate',
            CREATED_FROM:               'createdfrom',
            CURRENCY:                   'currency',
            CURRENCY_NAME:              'currencyname',
            CURRENCY_SYMBOL:            'currencysymbol',
            CUSTOM_FORM:                'customform',
            DAYS_OVERDUE:               'daysoverdue',
            DEPARTMENT:                 'department',
            ENTITY:                     'entity',
            EXCHANGE_RATE:              'exchangerate',
            EXTERNAL_ID:                'externalid',
            ID:                         'id',
            INTERNAL_ID:                'internalid',
            IS_BASE_CURRENCY:           'isbasecurrency',
            JOB:                        'job',
            LAST_MODIFIED_DATE:         'lastmodifieddate',
            LOCATION:                   'location',
            MEMO:                       'memo',
            NAME:                       'name',
            OTHER_REF_NUM:              'otherrefnum',
            PAYMENT:                    'payment',
            POSTING_PERIOD:             'postingperiod',
            PREPAYMENT_ACCOUNT:         'prepaymentaccount',
            PRINT_VOUCHER:              'printvoucher',
            PURCHASE_ORDER:             'purchaseorder',
            STATUS:                     'status',
            SUBSIDIARY:                 'subsidiary',
            SUPERVISOR_APPROVAL:        'supervisorapproval',
            TERMS:                      'terms',
            TO_BE_PRINTED:              'tobeprinted',
            TRAN_DATE:                  'trandate',
            TRAN_ID:                    'tranid',
            TRANSACTION_NUMBER:         'transactionnumber',
            VENDOR:                     'vendor'
        };
        Fields.Custom = {
            LAST_COMMUNICATION_DATE:    'custbody_ss_last_statement_comm_date',

            ACCESSORIAL_COMMENTS:           'custbody_accessorial_comments',
            ACCESSORIAL_COST_ACTUAL:        'custbody_accessorial_cost_actual',
            ACTUAL_DELIVERY_DATE:           'custbody_actual_carrier_delivery_date',
            ACTUAL_FREIGHT_COST:            'custbody_actual_freight_cost',
            ACTUAL_FUEL:                    'custbody_fuel_sur_cost_actual',
            ACTUAL_LINE_HAUL:               'custbody_linehaul_cost_actual',
            ACTUAL_PICKUP_DATE:             'custbodycustbody_actual_pickup_date',
            ACTUAL_RELEASE_DATE:            'custbodycustbody_actualreleasedate',
            ADDITIONAL_FREIGHT_COST: {
                FA:                 'custbody_addl_freight_fa',
                MEMBER:             'custbody_addl_freight_member',
                VENDOR:             'custbodycustbody_addlfreightcostvendor'
            },
            ADMIN_FEE: {
                BILL_1:             'custbody_admin_fee_bill_1',
                BILL_2:             'custbody_admin_fee_bill_2',
                BILL_3:             'custbody_admin_fee_bill_3',
                FLAT_RATE:          'custbody_adm_fee_flat_rate',
                PER_POUND_RATE_1:   'custbody_admin_fee_per_pound_rate',
                PER_POUND_RATE_2:   'custbody_admin_fee_per_lb_rate_2',
                PER_POUND_RATE_3:   'custbody_admin_fee_per_lb_rate_3',
                RECIPIENT_1:        'custbodycustbody_admin_fee_recipient',
                RECIPIENT_2:        'custbody_admin_fee_recp_2',
                RECIPIENT_3:        'custbody_admin_fee_recp_3',
                TOTAL_AMOUNT:       'custbody_admin_fees'
            },
            ALLOW_SUBSIDY_STATUS_OVERRIDE:  'custbody_kbs_allowstatusoverride',
            APPLY_ORIGINAL_SUBSIDY:         'custbody_apply_original_subsidy',
            APPROVE_PO:                     'custbody_approve_po',
            ASSOCIATED_BLUE_IMPORT:         'custbody_associated_blue_import',
            ASSOCIATED_MASTER_SO:           'custbody_associated_salesorder',
            ASSOCIATED_MASTER_SO_2:         'custbody_associated_salesorder_2',
            ASSOCIATED_TRANSACTION:         'custbody_associated_transaction',
            AUCTION_TIME:                   'custbody_auction_time_hours',
            AUTO_RENEWAL_DATE:              'custbody_fa_auto_renewal_date',
            BILL_TO_FREIGHT:                'custbody_bill_to_freight',
            CARRIER: {
                CODE:               'custbody_carrier_code',
                CONTACT:            'custbody_carrier_contact',
                EMAIL:              'custbody_carrier_email',
                FAX:                'custbody_carrier_fax',
                MESSAGE:            'custbody_carrier_msg',
                NAME:               'custbody_carrier_name',
                PHONE:              'custbody_carrier_phone',
                TYPE:               'custbody_carrier_type'
            },
            DELIVERY_INSTRUCTIONS:          'custbody_delivery_instructions',
            DISASTER:                       'custbody_disaster',
            DISASTER_CONSOLIDATION:         'custbody_disaster_consolidation',
            DONATION: {
                ACCEPT_EMAIL:               'custbody_accept_donation_emai',
                CATEGORY:                   'custbody_donation_category',
                CONTACT:                    'custbody_donation_contact',
                CONTACT_NAME:               'custbody_donation_contact_name',
                DATE:                       'custbody_donationdate',
                DECLINE_EMAIL:              'custbody_donation_decline_email',
                DONATION_EMAIL:             'custbody_donation_email',
                OFFER_EMAIL:                'custbody_offer_donation_email',
                OFFER_MOD_EMAIL:            'custbody_offer_mod_donation_email',
                OUT_BY_DATE:                'custbody_donation_out_date',
                REASON_CODE:                'custbody_donation_reason_code',
                RECEIPT_EMAIL:              'custbody_donation_receipt_email',
                REFERENCE_NUMBER:           'custbody_donation_reference_number',
                STATE:                      'custbody_donationstate',
                TYPE:                       'custbody_donation_type'
            },
            DONOR:                          'custbody_donor',
            DONOR_1:                        'custbody_donor_1',
            DONOR_2:                        'custbody_donor_2',
            DONOR_3:                        'custbody_donor_3',
            DROP_OFF_1: {
                CONTACT_IDENTIFIER:         'custbodydropofflocation1_contact_iden',
                CONTACT_ROLE:               'custbody_dropoff_contact1_role',
                LOCATION:                   'custbody_drop_off_location1',
                MASTER_WAREHOUSE:           'custbody_dropoff_master_warehouse1',
                MEMBER:                     'custbody_drop_off_member_1',
                SHIP_TO_CONTACT:            'custbody_drop_off_shipto_con1',
                SHIP_TO_EMAIL:              'custbody_dropoff_shipto_contact1_email',
                SHIP_TO_NAME:               'custbody_dropoff_shipto_contact1_name',
                SHIP_TO_PHONE:              'custbody_dropoff_shipto_contact1_phone',
                SHIP_TO_RECORD:             'custbody_dropoff_shipto_contact1_rec',
                WAREHOUSE: {
                    ADDRESS_1:              'custbody_drop_off_wh1_addr1',
                    ADDRESS_2:              'custbody_drop_off_wh1_addr2',
                    CITY:                   'custbody_drop_off_wh_1_city',
                    STATE:                  'custbody_drop_off_wh1_state',
                    ZIP:                    'custbody_drop_off_wh1_zip'
                },
            },
            DROP_OFF_2: {
                CONTACT_IDENTIFIER:         'custbodydropofflocation2_contact_iden',
                CONTACT_ROLE:               'custbody_dropoff_contact2_role',
                LOCATION:                   'custbody_drop_off_location_2',
                MASTER_WAREHOUSE:           'custbody_dropoff_master_warehouse2',
                MEMBER:                     'custbody_drop_off_member_2',
                SHIP_TO_CONTACT:            'custbody_drop_off_shipto_con2',
                SHIP_TO_EMAIL:              'custbody_dropoff_shipto_contact2_email',
                SHIP_TO_NAME:               'custbody_dropoff_shipto_contact2_name',
                SHIP_TO_PHONE:              'custbody_dropoff_shipto_contact2_phone',
                SHIP_TO_RECORD:             'custbody_dropoff_shipto_contact2_rec',
                WAREHOUSE: {
                    ADDRESS_1:              'custbody_drop_off_wh2_addr1',
                    ADDRESS_2:              'custbody_drop_off_wh_2_addr_2',
                    CITY:                   'custbody_drop_off_wh2_city',
                    STATE:                  'custbody_drop_off_wh2_state',
                    ZIP:                    'custbody_drop_off_wh2_zip'
                },
            },
            DROP_OFF_3: {
                CONTACT_IDENTIFIER:         'custbodydropofflocation3_contact_iden',
                CONTACT_ROLE:               'custbody_dropoff_contact3_role',
                LOCATION:                   'custbody_drop_off_location_3',
                MASTER_WAREHOUSE:           'custbody_dropoff_master_warehouse3',
                MEMBER:                     'custbody_drop_off_member_3',
                SHIP_TO_CONTACT:            'custbody_drop_off_shipto_con3',
                SHIP_TO_EMAIL:              'custbody_dropoff_shipto_contact3_email',
                SHIP_TO_NAME:               'custbody_dropoff_shipto_contact3_name',
                SHIP_TO_PHONE:              'custbody_dropoff_shipto_contact3_phone',
                SHIP_TO_RECORD:             'custbody_dropoff_shipto_contact3_rec',
                WAREHOUSE: {
                    ADDRESS_1:              'custbody_drop_off_wh3_addr1',
                    ADDRESS_2:              'custbody_drop_off_wh3_addr2',
                    CITY:                   'custbody_drop_off_wh3_city',
                    STATE:                  'custbody_drop_off_wh3_state',
                    ZIP:                    'custbody_drop_off_wh3_zip'
                },
            },
            DROP_OFF_4: {
                CONTACT_IDENTIFIER:         'custbodydropofflocation4_contact_iden',
                CONTACT_ROLE:               'custbody_dropoff_contact4_role',
                LOCATION:                   'custbody_drop_off_location_4',
                MASTER_WAREHOUSE:           'custbody_dropoff_master_warehouse4',
                MEMBER:                     'custbody_drop_off_member_4',
                SHIP_TO_CONTACT:            'custbody_drop_off_shipto_con4',
                SHIP_TO_EMAIL:              'custbody_dropoff_shipto_contact4_email',
                SHIP_TO_NAME:               'custbody_dropoff_shipto_contact4_name',
                SHIP_TO_PHONE:              'custbody_dropoff_shipto_contact4_phone',
                SHIP_TO_RECORD:             'custbody_dropoff_shipto_contact4_rec',
                WAREHOUSE: {
                    ADDRESS_1:              'custbody_drop_off_wh4_addr1',
                    ADDRESS_2:              'custbody_drop_off_wh4_addr2',
                    CITY:                   'custbody_drop_off_wh4_city',
                    STATE:                  'custbody_drop_off_wh4_state',
                    ZIP:                    'custbody_drop_off_wh4_zip'
                },
            },
            ESTIMATED_FREIGHT_COST:         'custbody_benchmark_freight_cost',
            ESTIMATED_FUEL_SURCHARGE:       'custbody_benchmark_fuel_sur',
            ESTIMATED_LINE_HAUL_COST:       'custbody_benchmark_line_hall_cost',
            FA_EMAILS_SENT:                 'custbody_fa_emails_sent',
            FA_FREIGHT_AMOUNT:              'custbodycustbody_fa_freight_amount',
            FOOD_TYPE:                      'custbody_food_type',
            FREIGHT_PO_RECEIPTED:           'custbody_freight_po_receipted',
            FREIGHT_TYPE:                   'custbody_freight_type',
            HAS_ISSUE_COMMENTS:             'custbody_has_issues_comments',
            LAST_MODIFIED_BY:               'custbody_last_modified_by',
            MAG_REF_NO:                     'custbody_mag_ref_no',
            MASTER_WAREHOUSE_1:             'custbody_master_warehouse1',
            MASTER_WAREHOUSE_2:             'custbody_master_warehouse2',
            MASTER_WAREHOUSE_3:             'custbody_master_warehouse3',
            MEMBER_ACCESSORIAL_BILL_TO:     'custbody_member_accessorial_bill_to',
            MEMBER_BILL_PAY_TO_NAME:        'custbody_member_bill__pay_to_name',
            ODYSSEY_OFFER_DATE:             'custbody_odyssey_offer_date',
            ODYSSEY_ORDER_NUMBER:           'custbody_odyssey_order_number',
            OFFER_DATE:                     'custbody_offer_date',
            OPPORTUNITY_DONOR:              'custbody_opportunity_donor',
            OPPORTUNITY_STATUS:             'custbody_opportunity_status',
            ORDER_HAS_ISSUES:               'custbody_order_has_issues',
            ORDER_HAS_ISSUES_REASON:        'custbody_order_has_issues_reason',
            ORDER_ISSUES_COMMENTS:          'custbody_order_issues',            
            ORDER_STATUS:                   'custbody_order_status',
            ORDER_TYPE:                     'custbody_order_type',
            ORIGINAL_RELEASE_DATE:          'custbody_custbody_original_release',
            OUT_BY_DATE:                    'custbody_outbydate',
            PRODUCE_PASSING:                'custbody_produce_passing',
            PROJECT_CSEG:                   'custbody_project_cseg',
            
        };

        const Sublists = {
            ACCOUNTING_BOOKS:           'accountingbookdetail',
            EXPENSE:                    'expense',
            ITEM:                       'item'
        };

        const SublistFields = {
            AMOUNT:                     'amount',
            CLASS:                      'class',
            DEPARTMENT:                 'department',
            DESCRIPTION:                'description',
            EXCHANGE_RATE:              'exchangerate',
            ITEM:                       'item',
            QUANTITY:                   'quantity',
            RATE:                       'rate'
        };
        SublistFields.Custom = {};

        return {
            Fields,
            Sublists,
            SublistFields
        }
    }
);