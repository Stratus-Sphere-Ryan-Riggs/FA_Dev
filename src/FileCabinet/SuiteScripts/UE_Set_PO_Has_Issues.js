/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
/*
*  Purpose: Button is made available on vendor bill record edit to set associated purchase order record Has Issues field = T, add Has Issue Comments and Reason, as well as attach the pdf.
*/

define(
    [
        'N/runtime',
        'N/record',
        'N/ui/serverWidget',
        'N/log',
        'N/url',
        'N/currentRecord'
    ],
    function (
        nsRuntime,
        nsRecord,
        nsServerWidget,
        log,
        nsUrl,
        nsCurrentRecord
    ) {
        function beforeLoad(context) {
            var form = context.form;
            var type = context.type;
            if (type == context.UserEventType.CREATE) {
                var rec = context.newRecord;
                var issuesSL;
                var attachpdfSL;
                issuesSL = nsUrl.resolveScript({
                        scriptId: 'customscript_set_po_has_issues_sl',
                        deploymentId: 'customdeploy_set_po_has_issues_sl',
                        params: {
                            custparam_recid: rec.getValue({
                            fieldId: 'custpage_sw_abm_po'
                            }),
                            custparam_inv_id: rec.getValue({
                            fieldId: 'custbody_sw_abm_vendor_invoice_doc'
                            }),
                            custparam_vendor_id: rec.getValue({
                            fieldId: 'entity'
                            })
                        }
                    });
                attachpdfSL = nsUrl.resolveScript({
                        scriptId: 'customscript_attach_pdf_to_po_sl',
                        deploymentId: 'customdeploy_attach_pdf_to_po_sl',
                        params: {
                            custparam_recid: rec.getValue({
                            fieldId: 'custpage_sw_abm_po'
                            }),
                            custparam_inv_id: rec.getValue({
                            fieldId: 'custbody_sw_abm_vendor_invoice_doc'
                            }),
                            custparam_vendor_id: rec.getValue({
                            fieldId: 'entity'
                            })
                        }
                    });
              if(rec.getValue({fieldId: 'custbody_sw_abm_vendor_invoice_doc'})) {
                form.addButton({ id: 'custpage_set_po_has_issues', label: 'PO Has Issues', functionName: 'window.open("' + issuesSL + '", "_self");' });
                form.addButton({ id: 'custpage_attach_pdf_to_po', label: 'Attach PDF to PO', functionName: 'window.open("' + attachpdfSL + '", "_self");' });
              }
            }

        }
        return {
            beforeLoad: beforeLoad
        };
    }
);


