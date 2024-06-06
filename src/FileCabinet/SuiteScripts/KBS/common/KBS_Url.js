/**
 * Copyright 2024 Keystone Business Solutions
 * @author              Marlon Villarama
 * @version             1.0
 * @description         Wrapper module for the N/url module.
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/url'
    ],
    (
        url
    ) => {
        const MODULE = `KBS.Url`;

        return {
            get HostType() {
                return url.HostType;
            },
            resolveDomain: (options) => {
                let { hostType, accountId } = options;

                return url.resolveDomain({ hostType, accountId });
            },
            resolveRecord: (options) => {
                let { isEditMode, recordId, recordType, params } = options;
                
                return url.resolveRecord({ isEditMode, recordId, recordType, params });
            },
            resolveScript: (options) => {
                let { deploymentId, scriptId, params, returnExternalUrl } = options;

                return url.resolveScript({ deploymentId, scriptId, params, returnExternalUrl });
            },
            resolveTaskLink: (options) => {
                let { id, params } = options;

                return url.resolveTaskLink({ id, params });
            }
        };
    }
);