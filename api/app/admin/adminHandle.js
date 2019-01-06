const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
const uuidv4 = require('uuid/v4');
const url = require('url')
const node_request = require('request')
const until = require(__baseDir+'/api/until/untilHandle')
exports.getCommodityList = async function(action, session, callback){
    let query = {}
    mongo.db(fields.DEFAULT_DB).collection(fields.COMMODITY).find(query).count(function(err, count){
       if (!err){
         mongo.db(fields.DEFAULT_DB).collection(fields.COMMODITY).find(query).limit(action.limit).skip(action.skip).toArray(function(err,data){
           if (!err) {
             callback({success:true, data:{list: data, count: count}, count: count})
           } else {
             console.log('adminError: getCommodityList:'+ err)
             callback({success: false, err: err})
           }
         })  
       } else {
         console.log('adminError: getCommodityList:'+ err) 
         callback({success: false, err: err})
       }
    })
}

exports.addCommodity = async function(action, session, callback) {
   let query = {}
   query.name = action.name;
   query.price = action.price;
   query.imgUrl = action.imgUrl;
   if (action.id) {
     mongo.db(fields.DEFAULT_DB).collection(fields.COMMODITY).update({id: action.id}, {$set: query},function(err){
       if (!err) {
         callback({success:true, message:'update commodity success!'}) 
       } else {
         console.log('adminError: updateCommodity:'+ err)
         callback({success: false, err: err})
       }
     })
   } else {
     query.id = uuidv4();
     mongo.db(fields.DEFAULT_DB).collection(fields.COMMODITY).insert(query, function(err,data){
       if (!err) {
         callback({success:true, message:'add commodity success!'})
       } else {
        console.log('adminError: addCommodity:'+ err)
        callback({success: false, err: err})
       }
     }) 
   }
}
exports.removeCommodity = async function(action, session, callback) {
   let query = {};
   query.id = action.id;
   // let fileId = url.parse(action.imgUrl, true).query.fileId;
   mongo.db(fields.DEFAULT_DB).collection(fields.COMMODITY).remove(query, function(err){
     if (!err) {
       // mongo.removeFileFromDb(fileId, function(err) {
       //    if (!err) {
       //      callback({success:true, message:'remove commodity success!'})
       //    } else {
       //      callback({success: false, err: err})
       //    }
       // })
       until.removeImage({url: action.imgUrl}).then((obj) => {
         callback(obj)
       })
     } else {
      console.log('adminError: removeCommodity:'+ err)
      callback({success: false, err: err})
     }
   })
}

exports.removeImage = async function(action, session, callback) {
  until.removeImage(action).then((obj) => {
    callback(obj)
  })
}

