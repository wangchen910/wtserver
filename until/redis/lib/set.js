/**
 * Created by zengyx on 16/6/2.
 * set操作
 * set是无序的,和List类型不同的是，Set集合中不允许出现重复的元素,
 * 如果多次添加相同元素，Set中将仅保留该元素的一份拷贝
 *
 */

var conn = require("./connect");

var out={
    /**
     * 添加一个元素到集合里
     * @param key 集合名
     * @param values 值 字符串或者字符串数组
     * @param callback
     * @param db
     */
    add: function(key, values, callback, db){
        conn.getClient(db).sadd(key, values, callback);
    },

    /**
     * 统计集合里的数量
     * @param key 集合名
     * @param callback
     * @param db
     */
    count: function(key, callback, db){
        conn.getClient(db).scard(key, callback);
    },

    /**
     * 获取多个集合的差集
     * keys 集合名数组
     */
    diffCollection: function(keys, callback, db){
        conn.getClient(db).sdiff(keys, callback);
    },

    /**
     * 获取集合keys的差集并存储在key中
     * @param key结果存储
     * @param keys被操作的集合
     *
     */
    diffCollectionAndStore:function(key, keys, callback, db){
        conn.getClient(db).sdiffstore(key, keys, callback)
    },

    /**
     * 获取集合的交集
     * @param keys 要操作的集合数组
     * @param callback
     * @param db
     */
    interCollection: function(keys, callback, db){
        conn.getClient(db).sinter(keys, callback);
    },

    /**
     * 获取集合的交集并存储到一个新的key中
     * @param key 用来存储keys交集后的结果
     * @param keys
     * @param callback
     * @param db
     */
    interCollectionAndStore: function(key, keys, callback ,db){
        conn.getClient(db).sinterstore(key, keys, callback);
    },

    /**
     * 返回集合key中是否存在value值
     * @param value
     * @param key
     * @param callback
     * @param db
     */
    isExists: function(value, key, callback, db){
        conn.getClient(db).sismember(key,value, callback);
    },

    /**
     * 获取集合key中所有的值
     * @param key
     * @param callback
     * @param db
     */
    getAllValues: function(key, callback, db){
        conn.getClient(db).smembers(key, callback);
    },

    /**
     * 从集合key中移除元素
     * @param key
     * @param values
     * @param callback
     * @param db
     */
    remove: function(key, values, callback, db){
        conn.getClient(db).srem(key,values, callback);
    },

    /**
     * 迭代获取集合key中的元素
     * @param key
     * @param cursorIndex 游标值, 从上次调用后得到的游标结果,默认每次取10条
     * @param callback
     * @param db
     *
     * callback:[cursorIndex, [values]]
     */
    getLimitValues: function(key, cursorIndex,callback, db){
        conn.getClient(db).sscan(key,cursorIndex ,callback);
    },

    /**
     * 获取集合的并集
     * @param keys
     * @param callback
     * @param db
     */
    getUnionCollection: function(keys, callback ,db){
        conn.getClient(db).sunion(keys, callback);
    }


}

module.exports = out;