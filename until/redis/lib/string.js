/**
 * for redis string options
 * @type {out|exports|module.exports}
 */
var conn = require("./connect");
var out = {
    /**
     * set value for key
     * @param key
     * @param value
     * @param callback
     * @param db
     */
    set: function (key, value, callback, db) {
        conn.getClient(db).set(key, value, callback);
    },
    setObj: function (key, objValue, callback, db) {
        if (objValue && objValue instanceof Object) {
            out.set(key, JSON.stringify(objValue), callback, db);
        } else {
            callback(new Error("only obj value support!"));
        }
    },
    /**
     * set value for key if key is not exist
     * @param key
     * @param value
     * @param callback
     * @param db
     */
    setNX: function (key, value, callback, db) {
        conn.getClient(db).set(key, value, "NX", callback);
    },
    setNXObj: function (key, objValue, callback, db) {
        if (objValue && objValue instanceof Object) {
            out.setNX(key, JSON.stringify(objValue), callback, db);
        } else {
            callback(new Error("only obj value support!"));
        }
    },
    /**
     * set value for key if key is exist
     * @param key
     * @param value
     * @param callback
     * @param db
     */
    setXX: function (key, value, callback, db) {
        conn.getClient(db).set(key, value, "XX", callback);
    },
    setXXObj: function (key, objValue, callback, db) {
        if (objValue && objValue instanceof Object) {
            out.setXX(key, JSON.stringify(objValue), callback, db);
        } else {
            callback(new Error("only obj value support!"));
        }
    },
    /**
     * set value for key by TTL
     * time by seconds & number
     * @param key
     * @param value
     * @param time
     * @param callback
     * @param db
     */
    setEX: function (key, value, time, callback, db) {
        conn.getClient(db).set(key, value, "EX", time, callback);
    },
    setEXObj: function (key, objValue, time, callback, db) {
        if (objValue && objValue instanceof Object) {
            out.setEX(key, JSON.stringify(objValue), time, callback, db);
        } else {
            callback(new Error("only obj value support!"));
        }
    },
    /**
     * get value by key
     * @param key
     * @param callback
     * @param db
     */
    get: function (key, callback, db) {
        conn.getClient(db).get(key, callback);
    },
    getObj: function (key, callback, db) {
        out.get(key, function (err, value) {
            if (!err) {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    callback(e);
                    return;
                }
                callback(null, value);
            } else {
                callback(err);
            }
        }, db);
    },
    /**
     * delete key
     * key can  one  or  array
     * @param keys
     * @param callback
     * @param db
     */
    del: function (keys, callback, db) {
        conn.getClient(db).del(keys, callback);
    },
    /**
     * add 1 by atomic op
     * @param key
     * @param callback
     * @param db
     */
    incr: function (key, callback, db) {
        conn.getClient(db).incr(key, callback);
    },
    /**
     * add an int by atomic op
     * @param key
     * @param int
     * @param callback
     * @param db
     */
    incrBy: function (key, int, callback, db) {
        if (int && typeof int == 'number') {
            conn.getClient(db).incrby(key, int, callback);
        } else {
            callback(new Error("only int value support!"));
        }
    },
    /**
     * decrease 1 by atomic op
     * @param key
     * @param callback
     * @param db
     */
    decr: function (key, callback, db) {
        conn.getClient(db).decr(key, callback);
    },
    /**
     * decrease an int by atomic op
     * @param key
     * @param int
     * @param callback
     * @param db
     */
    decrBy: function (key, int, callback, db) {
        if (int && typeof int == 'number') {
            conn.getClient(db).decrby(key, int, callback);
        } else {
            callback(new Error("only int value support!"));
        }
    },
    /**
     * appent  str to key
     * @param key
     * @param value
     * @param callback
     * @param db
     */
    append: function (key, value, callback, db) {
        conn.getClient(db).append(key, value, callback);
    }
};

module.exports = out;
