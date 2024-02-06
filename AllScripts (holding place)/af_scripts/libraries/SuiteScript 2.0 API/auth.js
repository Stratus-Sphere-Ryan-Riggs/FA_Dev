/**
 * SuiteScript auth module
 *
 * @module N/auth
 * @suiteScriptVersion 2.x
 */
function auth() {
        
    /**
     * Change current user's email
     *
     * @param {Object} options
     * @param {string} options.password
     * @param {string} options.newEmail
     * @param {boolean} [options.onlyThisAccount=true]
     *
     * @throws {error.SuiteScriptError} INVALID_PSWD INVALID_EMAIL
     */    
    this.changeEmail = function(options) {};    
    
    /**
     * Change current user's password
     *
     * @param {object} options
     * @param {string} options.currentPassword
     * @param {string} options.newPassword
     *
     * @throws {error.SuiteScriptError} INVALID_PSWD USER_ERROR
     */    
    this.changePassword = function(options) {};    
    
}