var mongo=require('../until/mongo');
var uuidv4 = require('uuid/v4');
var async=require('async');

exports.addPrice=function(data,callback){
    var result={success:false};
    var _id=uuidv4();
    delete data.sessionId;
    data.classId=data.classId;
    mongo.collection('price').insert(data,function(err){
        if(!err){
            result.success=true;
            result.message='Price add  success!';
            callback(result);
        }else{
            result.message='mongoErr:'+err;
            callback(result);
        }
    })
}

exports.getPriceList=function(data,callback){
    var result={success:false}
    var classId = data.priceClassId;
    var getConfig = function(call){
        mongo.collection('config').find({name:'price'}).toArray(function(err,data){
            if(!err){
                if(data[0]){
                    call(null,data[0])
                }else{
                    call('no price config!')
                }
            }else{
                call(err)
            }
        })
    }
    var getClass = function(data,call){
        var time = data.time?data.time:getTime();
        mongo.collection('priceClass').find({}).toArray(function(err,resultData){
            if(data.priceClassId){
                var selectObj = {};
                for(var i=0;i<resultData.length;i++){
                    if(data.priceClassId===resultData[i]._id){
                        selectObj =  JSON.parse(JSON.stringify(resultData[i]))
                        resultData.splice(i,1);
                    }
                }
                resultData.unshift(selectObj);
            }
            if(!err){
                var calldata ={
                    time:time,
                    priceClass:resultData,
                    defaultId:data.priceClassId,
                    isDefault:true
                }
                call(null,calldata)
            }else{
                call(err)
            }
        })
    }
    var getList = function(data,call){
        if(!data.isDefault) {
          var query ={classId:classId,time:data.time}  
        }else{
          var query ={classId:data.defaultId,time:data.time}  
        }
        mongo.collection('price').find(query).toArray(function(err,resultData){
            if(!err){
                data.priceList=resultData;
                call(null,data);
            }else{
                result.message='mongoErr  :'+err;
                call(result);
            }
        })
    }
    if(!classId){
        var arr = [getConfig,getClass,getList];
    }else{
        var arr = [getConfig,getList];
    }
    async.waterfall(arr,function(err,result){
        if(err){
            callback({success:false,message:err})
        }else{
            callback({success:true,data:result,message:'getList Success'})
        }
    })
    
}

exports.addPriceClass=function(data,callback){
    var result={success:false};
    var _id=uuidv4();
    data._id=_id;
    delete data.sessionId;
    mongo.collection('priceClass').insert(data,function(err){
        if(!err){
            result.success=true;
            result.message='PriceClass add success!';
            callback(result);
        }else{
            result.message='mongoErr:'+err;
            callback(result);
        }
    })
}

exports.getPriceClass=function(data,callback){
    var result={success:false}
    mongo.collection('priceClass').find({}).toArray(function(err,resultData){
        if(!err){
            result.success=true;
            result.data=resultData;
            result.message='PriceClass find success!';
            callback(result)
        }else{
            result.message='mongoErr:'+err;
            callback(result);
        }
    })
}


function getTime(){
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDay();
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    return year+'-'+month+'-'+day;
}