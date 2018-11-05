var et=require('../common/getEtData');
var mongo=require('../until/mongo');
exports.getRunData=function(data,callback){
  et.getEtData(data,function(result){
    callback(result); 
  })
}


