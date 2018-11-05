var https=require('https');
var config=require('../config/appConfig');
var redis=require('../until/redis');
var uuid=require('uuid');
var appId=config.appid;
var secret=config.secret;
exports.login=function(data,callback){
    console.log('LOGIN---')
    var url='https://api.weixin.qq.com/sns/jscode2session?appid='+appId+'&secret='+secret+'&js_code='+data.code+'&grant_type=authorization_code';
    if(data.sessionId){
        redis.expire(data.sessionId);
        console.log('过期sessionId',data.sessionId);
    }
    https.get(url,function(res){
            res.on('data',function(d){
                var key=uuid();
                d=JSON.parse(d);
                if(d.session_key&&d.openid){
                    var value=d.session_key+'-'+d.openid;
                    redis.set(key,value,function(key){
                        callback({sessionId:key});
                    });
                }else{
                    callback(d.errmsg);
                }
            })
        }).on('error',function(e){
            console.log(e);
        })

}




exports.checkSession=function(data,callback){
    var key=data.key;
    redis.get(key,function(result){
        if(!result.session){
            callback({checkSession:false,message:'session is not fond',session:result});
        }else{
            callback({checkSession:true,message:'session is fond',session:result});
        }
    })
}