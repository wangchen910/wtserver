var conn = require("./connect");
var out = {
    /**
     * push values from left
     * values can one or array
     * @param key
     * @param values
     * @param callback
     * @param db
     */
    lpush: function (key, values, callback, db) {
        conn.getClient(db).lpush(key, values, callback);
    },
    /**
     * lpush for objects
     * if valueObjs is array ,array item  can mix normal value and object
     * @param key
     * @param valueObjs
     * @param callback
     * @param db
     */
    lpushObj: function (key, valueObjs, callback, db) {
        if (valueObjs && valueObjs instanceof Array) {
            var pushArray = [];
            for (var i = 0; i < valueObjs.length; i++) {
                var value = valueObjs[i];
                if (value && value instanceof Object) {
                    pushArray.push(JSON.stringify(value))
                } else {
                    pushArray.push(value)
                }
            }
            out.lpush(key, pushArray, callback, db);
        } else if (valueObjs && valueObjs instanceof Object) {
            out.lpush(key, JSON.stringify(valueObjs), callback, db);
        } else {
            callback(new Error("only obj value or array support!"));
        }
    },
    /**
     * push values from right
     * values can one or array
     * @param key
     * @param values
     * @param callback
     * @param db
     */
    rpush: function (key, values, callback, db) {
        conn.getClient(db).rpush(key, values, callback);
    },
    /**
     * rpush for objects
     * if valueObjs is array ,array item  can mix normal value and object
     * @param key
     * @param valueObjs
     * @param callback
     * @param db
     */
    rpushObj: function (key, valueObjs, callback, db) {
        if (valueObjs && valueObjs instanceof Array) {
            var pushArray = [];
            for (var i = 0; i < valueObjs.length; i++) {
                var value = valueObjs[i];
                if (value && value instanceof Object) {
                    pushArray.push(JSON.stringify(value))
                } else {
                    pushArray.push(value)
                }
            }
            out.rpush(key, pushArray, callback, db);
        } else if (valueObjs && valueObjs instanceof Object) {
            out.rpush(key, JSON.stringify(valueObjs), callback, db);
        } else {
            callback(new Error("only obj value or array support!"));
        }
    },
    /**
     * pop a value from left
     * @param key
     * @param callback
     * @param db
     */
    lpop: function (key, callback, db) {
        conn.getClient(db).lpop(key, callback);
    },
    /**
     * lpop for object
     * @param key
     * @param callback
     * @param db
     */
    lpopObj: function (key, callback, db) {
        out.lpop(key, function (err, value) {
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
     * pop a value from right
     * @param key
     * @param callback
     * @param db
     */
    rpop: function (key, callback, db) {
        conn.getClient(db).rpop(key, callback);
    },
    /**
     * rpop for object
     * @param key
     * @param callback
     * @param db
     */
    rpopObj: function (key, callback, db) {
        out.rpop(key, function (err, value) {
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
     * get the length for key list
     * @param key
     * @param callback
     * @param db
     */
    len: function (key, callback, db) {
        conn.getClient(db).llen(key, callback);
    },
    /**
     * delete count item equal value from list
     * @param key
     * @param count
     * count > 0 from header scan
     * count < 0  from rear scan
     * count = 0 delete all
     * @param value
     * @param callback
     * @param db
     */
    del: function (key, count, value, callback, db) {
        conn.getClient(db).lrem(key, count, value, callback);
    },
    /**
     * del for object
     * @param key
     * @param count
     * @param valueObj
     * @param callback
     * @param db
     */
    delObj : function (key , count , valueObj , callback , db){
        if (valueObj && valueObj instanceof Object) {
            out.del(key, count, JSON.stringify(valueObj), callback, db);
        } else {
            callback(new Error("only obj value support!"));
        }
    },
    range : function (key , start , stop , callback , db){
        conn.getClient(db).lrange(key , start , stop , callback);
    }
};

module.exports = out;
