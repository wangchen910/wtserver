
const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
const uuidv4 = require('uuid/v1')
const until = require(__baseDir+'/api/until/untilHandle')
exports.getMerchantsList = async function(action, session, callback){
	let query = {}
    mongo.db(fields.DEFAULT_DB).collection(fields.MERCHANTS).find(query).count(function(err, count){
       if (!err){
         mongo.db(fields.DEFAULT_DB).collection(fields.MERCHANTS).find(query).limit(action.limit).skip(action.skip).toArray(function(err,data){
           if (!err) {
             callback({success:true, data:{list: data, count: count}, count: count})
           } else {
             console.log('adminError: getMerchantsList:'+ err)
             callback({success: false, err: err})
           }
         })
       } else {
         console.log('adminError: getMerchantsList:'+ err)
         callback({success: false, err: err})
       }
    })
}


exports.addMerchants = async function(action, session, callback) {
  let query = {}
  query.name = action.name;
  query.phone = action.phone;
  query.address = action.address;
  query.password = action.password;
   if (action.id) {
     mongo.db(fields.DEFAULT_DB).collection(fields.MERCHANTS).update({id: action.id}, {$set: query},function(err){
       if (!err) {
         callback({success:true, message:'update Merchants success!'}) 
       } else {
         console.log('adminError: updateMerchants:'+ err)
         callback({success: false, err: err})
       }
     })
   } else {
     query.id = uuidv4();
     mongo.db(fields.DEFAULT_DB).collection(fields.MERCHANTS).insert(query, function(err,data){
       if (!err) {
         callback({success:true, message:'add Merchants success!'})
       } else {
        console.log('adminError: addMerchants:'+ err)
        callback({success: false, err: err})
       }
     }) 
   }
}

exports.removeMerchants = async function(action, session, callback) {
   let query = {};
   query.id = action.id;
   mongo.db(fields.DEFAULT_DB).collection(fields.MERCHANTS).remove(query, function(err){
     if (!err) {
       callback({success: true, message: 'remove Merchants success!'})
     } else {
       console.log('adminError: removeMerchants:'+ err)
     }
   })
}

