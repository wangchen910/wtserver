const crypto = require('crypto');

//加密
exports.cipher = function(key) {
    return crypto.createHash('md5').update(key).digest('hex')
};
