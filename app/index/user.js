var et=require('../common/getEtData');
var mongo=require('../until/mongo');


exports.validateUser=function(data,callback){
    et.getOpenid(data,function(result){
        //验证用户是否存在
        delete data.sessionId;
        var userInfo=data;
        var query={"_id":result};
        var success=false;
        mongo.collection('user').findOne(query,function(err,userdata){
            if(err){
                callback({success:false,message:'mongoError:'+err});
            }
            if(userdata){
                success=true;
                callback({success:true,message:'用户已注册过',data:userdata});
            }else{
                //插入新用户
                mongo.collection('user').insert({_id:result,userInfo:userInfo},function(err){
                    if(!err){
                        callback({success:true,message:'新用户已注册'});
                    }else{
                        callback({success:false,message:'mongoError:'+err});
                    }
                })
            }
        })
    })

}

exports.remove=function(data,callback){
    var _id=data._id;
    mongo.collection('user').remove({_id:_id},function(err){
        if(!err){
            callback({message:'删除成功'});
        }
    })
}