var conn = require("./connect");
var out = {
    /**
     * set value to hash
     * for normal value  number string etc.
     * @param key
     * @param field
     * @param value
     * @param callback
     * @param db
     */
    set: function (key, field, value, callback, db) {
        conn.getClient(db).hset(key, field, value, callback);
    },
    /**
     * is key and  field not exist then set
     * else nothing
     * @param key
     * @param field
     * @param value
     * @param callback
     * @param db
     */
    setNX: function (key, field, value, callback, db) {
        conn.getClient(db).hsetnx(key, field, value, callback);
    },
    /**
     * set value to hash
     * for obj value
     * @param key
     * @param field
     * @param objValue
     * @param callback
     * @param db
     */
    setObj: function (key, field, objValue, callback, db) {
        if (objValue && objValue instanceof Object) {
            out.set(key, field, JSON.stringify(objValue), callback, db);
        } else {
            callback(new Error("only obj value support!"));
        }
    },
    /**
     * for obj value
     * @param key
     * @param field
     * @param objValue
     * @param callback
     * @param db
     */
    setObjNX: function (key, field, objValue, callback, db) {
        if (objValue && objValue instanceof Object) {
            out.setNX(key, field, JSON.stringify(objValue), callback, db);
        } else {
            callback(new Error("only obj value support!"));
        }
    },
    /**
     * get normal value from hash
     * @param key
     * @param field
     * @param callback
     * @param db
     */
    get: function (key, field, callback, db) {
        conn.getClient(db).hget(key, field, callback);
    },
    /**
     * get obj value from hash
     * @param key
     * @param field
     * @param callback
     * @param db
     */
    getObj: function (key, field, callback, db) {
        conn.getClient(db).hget(key, field, function (err, value) {
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
        });
    },
    /**
     * delete specified fields from hash
     * fields can one  or array
     * @param key
     * @param fields
     * @param callback
     * @param db
     */
    del: function (key, fields, callback, db) {
        conn.getClient(db).hdel(key, field, callback);
    },
    /**
     * get key all fields length
     * @param key
     * @param callback
     * @param db
     */
    len: function (key, callback, db) {
        conn.getClient(db).hlen(key, callback);
    },
    /**
     * isexists for key field
     * @param key
     * @param field
     * @param callback
     * @param db
     */
    exists: function (key, field, callback, db) {
        conn.getClient(db).hexists(key, field, callback);
    }
};

module.exports = out;
