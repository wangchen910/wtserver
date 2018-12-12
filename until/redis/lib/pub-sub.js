/**
 * Created by zengyx on 16/6/2.
 * redis 发布订阅模块封装
 */

var conn = require("./connect");

var out = {

    /**
     * 发布一条消息到一个频道
     * @param channel 频道名
     * @param message 消息体
     */
    publishMessage: function(channel, message){
        conn.getPubClient().publish(channel, message);
    },

    /**
     * 订阅一个频道
     * @param channel 频道名,可以是数组
     */
    subscribeChannel: function(channel){
        conn.getSubClient().subscribe(channel);
    },

    /**
     * 取消监听
     * @param channel,为空时则取消所有频道的监听
     */
    cancelSubscribe: function(channel){
        conn.getSubClient().unsubscribe(channel);
    }



}

module.exports = out;