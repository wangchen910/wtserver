
const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
const uuidv4 = require('uuid/v4')



exports.getActivityList = async function(action, session, callback){
	let query = {}
    mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).find(query).count(function(err, count){
       if (!err){
         mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).find(query).limit(action.limit).skip(action.skip).toArray(function(err,data){
           if (!err) {
             callback({success:true, data:{list: data, count: count}, count: count})
           } else {
             console.log('adminError: getActivityList:'+ err)
             callback({success: false, err: err})
           }
         })
       } else {
         console.log('adminError: getActivityList:'+ err)
         callback({success: false, err: err})
       }
    })
}

exports.addActivity = async function(action, session, callback) {
  let query = {}
   query.name = action.name;
   query.price = action.price;
   query.imgUrl = action.imgUrl;
   if (action.id) {
     mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY).update({id: action.id}, {$set: query},function(err){
       if (!err) {
         callback({success:true, message:'update commodity success!'}) 
       } else {
         console.log('adminError: updateCommodity:'+ err)
         callback({success: false, err: err})
       }
     })
   } else {
     query.id = uuidv4();
     mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY).insert(query, function(err,data){
       if (!err) {
         callback({success:true, message:'add activity success!'})
       } else {
        console.log('adminError: addActivity:'+ err)
        callback({success: false, err: err})
       }
     }) 
   }
}