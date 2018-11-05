var mongo=require('../until/mongo');
var uuidv4 = require('uuid/v4');
var async=require('async');

exports.addConfig=function(data,callback){
    var result={success:false};
    var _id=uuidv4();
    delete data.sessionId;
    mongo.collection('config').update({name:data.name},{$set:data},{upsert:true},function(err){
        if(!err){
            result.success=true;
            result.message='config add  success!';
            callback(result);
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