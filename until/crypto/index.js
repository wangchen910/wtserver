const crypto = require('crypto');
const config = require(__baseDir+'/serverConfig.js');
//加密
exports.cipher = function(key) {
    return crypto.createHash('md5').update(key).digest('hex')
};

// AES加密
exports.aesEncrypt = function(data, key) {
    const cipher = crypto.createCipher('aes192', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}
// AES解密
exports.aesDecryptInfo = function(encryptedData) {
    let key = exports.cipher(config.pay.pay_key)
    try {
        // 解密
        encryptedData = Buffer.from(encryptedData, 'base64')
        var iv = "";
        let decipher = crypto.createDecipheriv('aes-256-ecb', key, iv);
        decipher.setAutoPadding(true);
        let decoded = decipher.update(encryptedData, 'base64', 'utf8');
        decoded += decipher.final('utf8');
        return decoded;
     } catch (err) {
       throw new Error('Illegal Buffer')
     }
}
// base64解码
exports.base64 = function(encrypted) {
  let base64 = Buffer.from(encrypted, 'base64').toString('hex')
  console.log(base64)
  console.log('64解码')
  return base64.toString('base64')
}

