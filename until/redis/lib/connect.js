var redis = require("redis");
// var logger = require("appLog");
var _client;
var _defaultDb = "0";
var _pubClient;
var _subClient;

var out = {
    /**
     * init redis client
     * create client and auth  if  require
     */
    init: function (rIp, rPort, pwd, initPubClient, initSubClient) {
        _client = redis.createClient(rPort, rIp);
        _client.on("error", function (error) {
            console.log(error);
        });
        if (pwd) {
            _client.auth(pwd);
        }

        if(initPubClient){
            _pubClient = redis.createClient(rPort, rIp);
            _pubClient.on("error", function (error) {
                console.log(error);
            });
            if (pwd) {
                _pubClient.auth(pwd);
            }
        }

        if(initSubClient){
            _subClient = redis.createClient(rPort, rIp);
            _subClient.on("error", function (error) {
                console.log(error);
            });
            if (pwd) {
                _subClient.auth(pwd);
            }
        }

    },
    getClient : function(db){
        if(db){
            _client.select(db);
        } else {
            _client.select(_defaultDb);
        }
        return _client;
    },

    getPubClient: function(){


        return _pubClient;

    },

    getSubClient: function(){
        return _subClient;
    }
};

module.exports = out;
