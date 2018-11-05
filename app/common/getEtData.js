var WXetData=require('../until/WXBizDataCrypt');
var config=require('../config/appConfig');
var redis=require('../until/redis');
var appid=config.appid;

exports.getEtData=function(etData,callback){
    var key=etData.sessionId;
    var iv=etData.iv;
    var etData=etData.encryptedData;
    redis.get(key,function(data){
        console.log(key);
        console.log(data);
        console.log('终极查看');
        if(data.session) {
            var pc = new WXetData(appid, data.session_key);
            var resultData = pc.decryptData(etData, iv);
            console.log(resultData);
            console.log('终极查看结果');
            callback(resultData);
        }else{
            callback('session is not found');
        }    
    })
}


exports.getOpenid=function(data,callback){
    var key=data.sessionId;
    redis.get(key,function(data){
        callback(data.openid);
    })    
}