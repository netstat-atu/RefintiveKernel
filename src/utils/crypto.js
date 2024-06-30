const crypto = require('crypto');
const algorithm = 'aes-192-ofb';

// ** Encryption
export const encrypt = (data, key) => {
    var keySpec = new Buffer.from(key, 'base64');
    const ivParams = new Uint8Array(16);
    var messageArr = new TextEncoder().encode(data);
    let encoded = new Uint8Array(messageArr.length + 16);

    for (let i = 0; i < encoded.length; i++) {
        encoded[i + 16] = messageArr[i];
    }
    const cipher = crypto.createCipheriv(algorithm, keySpec, ivParams);
    var encryptedBytes = Buffer.concat([cipher.update(encoded), cipher.final()]);
    return encryptedBytes.toString('base64');
};


// ** Decryption
export const decrypt = (cipherText, key) => {
    var keySpec = new Buffer.from(key, 'base64');
    const ivParams = new Uint8Array(16);
    var encoded = new Buffer.from(cipherText, 'base64');
    for (let i = 0; i < 16; i++) {
        ivParams[i] = encoded[i];
    }
    var decodedEncrypted = new Uint8Array(encoded.length - 16);
    for (let i = 16, j = 0; i < encoded.length; i++, j++) {
        decodedEncrypted[j] = encoded[i];
    }
    const cipher = crypto.createDecipheriv(algorithm, keySpec, ivParams);
    var decryptedBytes = Buffer.concat([cipher.update(decodedEncrypted), cipher.final()]);
    return decryptedBytes.toString('utf8');

}


// const key = "cadb3530e0192609fd3f6c9aa40adacc";
// const data = "This is a test message. If you can read this your encryption program is working fine.";


// const cipher = encrypt(data, key);
// const decipher = decrypt(cipher, key);
// console.log(cipher);
// console.log(decipher);
