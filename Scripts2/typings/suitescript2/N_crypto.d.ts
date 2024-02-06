/**The N/crypto module encapsulates hashing, hash-based message authentication (hmac), and symmetrical encryption.
 * @link https://netsuite.custhelp.com/app/answers/detail/a_id/43734
 */
declare interface N_crypto {

    /**Holds the string values for supported encryption algorithms. Sets the options.algorithm parameter for crypto.createCipher(options). */
    EncryptionAlg: {
        AES;
    }

    /**Holds the string values for supported hashing algorithms. Sets the value of the options.algorithm parameter for crypto.createHash(options) and crypto.createHmac(options).  */
    HashAlg: {
        SHA1;
        SHA256;
        SHA512;
        MD5;
    }

    /**Holds the string values for supported cipher padding. Sets the options.padding parameter for crypto.createCipher(options) and crypto.createDecipher(options). */
    Padding: {
        NoPadding;
        PKCS5Padding;
    }

    /**
    * Method used to create and return a crypto.EncryptionAlg object.The blockCipherMode is automatically set to CBC.
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43745
    */
    createCipher(options: {
        /** (required) The hash algorithm. Set the value using the crypto.Hash enum. */
        algorithm: string
        /** (required) The crypto.SecretKey object. */
        key: object
        /** (optional) The padding for the cipher text.Set the value using the crypto.Padding enum. By default, the value is set to PKCS5Padding. */
        padding: string
    }): N_crypto.EncryptionAlg

    /**
    * Method used to create a crypto.Decipher object.The blockCipherMode is automatically set to CBC.
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43746
    */
    createDecipher(options: {
        /** (required) The hash algorithm. Set by the crypto.Hash enum. */
        algorithm: string
        /** (required) The crypto.SecretKey object used for encryption. */
        key: object
        /** (optional) The padding for the cipher. Set the value using the crypto.Padding enum. */
        padding: object
        /** (required) The initialization vector that was used for encryption. */
        iv: string
    }): N_crypto.Decipher

    /**
    * Method used to create a crypto.Hash object.
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43743
    */
    createHash(options: {
        /** (required) The hash algorithm. Set using the crypto.Hash enum. */
        algorithm: string
    }): N_crypto.Hash

    /**
    * Method used to create a crypto.Hmac object.
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43744
    */
    createHmac(options: {
        /** (required) The hash algorithm. Use the crypto.Hash enum to set this value. */
        algorithm: string
        /** (required) The crypto.SecretKey object. */
        key: N_crypto.SecretKey
    }): N_crypto.Hmac

    /**
    * Method used to create a new crypto.SecretKey object.This method can take a GUID. Use Form.addCredentialField(options) to generate a value.
    * @Supported Server-side scripts
    * @Governance None
    * @Since Version 2015 Release 2
    * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43747
    */
    createSecretKey(options: {
        /** (required) A GUID used to generate a secret key.The GUID can resolve to either data or metadata. */
        guid: string
        /** (optional) Specifies the encoding for the SecureKey.Set this value using the encode.Encoding enum.The default value is HEX. */
        encoding: N_encode.Encoding
    }): N_crypto.SecretKey

}

declare namespace N_crypto {
    interface Cipher {

        /**
        * Method used to update the clear data with the specified encoding.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43851
        */
        update(options: {
            /** (required) The clear data to be updated. */
            input: string
            /** (optional) The input encoding.Use the encode.Encoding enum to set the value.The default value is UTF_8. */
            inputEncoding: N_encode.Encoding
        }): Void

        /**
        * Method used to return the cipher data.Sets the output encoding for the crypto.CipherPayload object.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43848
        */
        final(options: {
            /** (optional) The output encoding for a crypto.CipherPayload object.The default value is HEX.Use the encode.Encoding enum to set the value. */
            outputEncoding: N_crypto.CipherPayload
        }): N_crypto.CipherPayload

    }

    interface CipherPayload {
        /**The result of the ciphering process. */
        ciphertext: String;
        /**An initialization vector */
        iv: void;
    }

    interface Decipher {
        /**
        * Method used to update cipher data with the specified encoding.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43841
        */
        update(options: {
            /** (required) The data to update */
            input: string
            /** (optional) Specifies the encoding of the input dataSet the value using the encode.Encoding enum.The default value is HEX. */
            inputEncoding: string
        }): Void

        /**
        * Method used to return the clear data.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43923
        */
        final(options: {
            /** (optional) Specifies the encoding for the outputSet the value using the encode.Encoding enum.The default value is UTF_8. */
            outputEncoding: string
        }): string

    }

    interface Hash {
        /**
        * Calculates the digest of the data to be hashed. 
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43879
        */
        digest(options: {
            /** (optional) The output encoding. Set using the encode.Encoding enum.The default value is HEX. */
            outputEncoding: string
        }): string

        /**
        * Method used to update clear data with the encoding specified.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43827
        */
        update(options: {
            /** (required) The data to be updated. */
            input: string
            /** (optional) The input encoding. Set using the encode.Encoding enum.The default value is UTF_8. */
            inputEncoding: string
        }): Void

    }

    interface Hmac {
        /**
        * Gets the computed digest.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43948
        */
        digest(options: {
            /** (optional) Specifies the encoding of the output string. Set using the encode.Encoding enum.The default value is HEX. */
            outputEncoding: string
        }): string

        /**
        * Method used to update the clear data with the encoding specified.
        * @Supported Server-side scripts
        * @Governance None
        * @Since Version 2015 Release 2
        * @Link https://netsuite.custhelp.com/app/answers/detail/a_id/43910
        */
        update(options: {
            /** (required) The hmac data to be updated. */
            input: string
            /** (optional) The input encoding. Set using the encode.Encoding enum. The default value is UTF_8. */
            inputEncoding: N_encode.Encoding
        }): Void
        
    }

    interface SecretKey {
        /**The GUID associated with the secret key. */
        guid: String;
        /**The encoding used for the clear text value of the secret key. */
        encoding: String;
    }

}


