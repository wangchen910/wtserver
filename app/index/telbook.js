var mongo=require('../until/mongo');
var uuidv4 = require('uuid/v4');
var async=require('async');


exports.getTelData=function(data,callback){
  mongo.collection('telBookList').find({superId:{$exists:false}}).toArray(function(err,data){
   var resultData=[];
   var result={success:false};
      async.each(data,function(data,callback){
            var superId=data._id;
            mongo.collection('telBookList').find({superId:superId}).toArray(function(err,result){
                if(err){
                    console.log('Error:'+err);
                    callback('Error'+err);
                }else{
                    data.data=result;
                    data.toggle=true;
                    resultData.push(data);
                    callback();
                }
            })
      },function(err){
          if(!err){
              result.success=true;
              result.data=resultData;
              result.message='数据获取成功！';
              callback(result);
          }else{
              result.message='Error:'+err;
          }
      })
  })
}
exports.getTelList=function(data,callback){
    var page = data.page || 1;
    var limit = data.limit || 10;
    var skip = (page - 1)*limit;
    mongo.collection('telBookList').find({superId:{$exists:true}},{limit:limit,skip:skip}).toArray(function(err,data){
        var result={success:false};
        if(!err){
            result.success=true;
            result.data=data;
            result.message='数据获取成功！';
            callback(result);
        }else{
            result.message='Error:'+err;
            callback(result)
        }
    })
}
exports.addTelList=function(data,callback){
    var _id=uuidv4();
    var title=data.title;
    var superId=data._id;
    if(!superId){
        mongo.collection('telBookList').insert({_id:_id,title:title},function(err){
            if(!err){
                callback({success:true,message:'添加成功'});
            }else{
                var message
                callback({success:false,message:'mongoErr:'+err});
            }
        })
    }else{
        mongo.collection('telBookList').insert({_id:_id,title:title,superId:superId},function(err){
            if(!err){
                callback({success:true,message:'添加成功'});
            }else{
                callback({success:false,message:'mongoErr:'+err});
            }
        })
    }
}

exports.getDetails = function(data,callback) {
    var id = data.id;
    mongo.collection('telBookList').find({_id:id}).toArray(function(err,result){
        if(!err){
            callback({success:true,message:'获取详情成功',data:result[0]});
        }else{
            callback({success:false,message:'mongoErr:'+err});
        }
    })
}

exports.changeDetails = function(data,callback){
    var id = data.id;
    var setData = data.setData;
    mongo.collection('telBookList').update({_id:id},{$set:setData},function(err){
        if(!err){
            callback({success:true,message:'更新商家成功  !'});
        }else{
            callback({success:false,message:'mongoErr:'+err});
        }
    })
}

exports.searchTelList = function(data,callback){
    var content = data.content;
    mongo.collection('telBookList').find({title:{$regex:content,$options:'i'}}).toArray(function(err,result){
        if(!err){
            callback({success:true,data:result,message:'searchSuccess'})
        }else{
            callback({success:false,message:'mongoErr:'+err})
        }
    })
}
