const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
const uuidv4 = require('uuid/v1')
exports.addLineManage = async function(action, session, callback){
    let query = {}
    query.start = action.start;
    query.end = action.end;
    query.num = action.num;
    query.price = action.price;
    query.departureTime = action.departureTime;
    query.departurePlace = action.departurePlace;
    if (action.id) {
        mongo.db(fields.DEFAULT_DB).collection(fields.LINE).update({id: action.id}, {$set: query},function(err){
          if (!err) {
            callback({success:true, message:'update line success!'}) 
          } else {
            console.log('adminError: updateLine:'+ err)
            callback({success: false, err: err})
          }
        })
    } else {
        query.id = uuidv4();
        mongo.db(fields.DEFAULT_DB).collection(fields.LINE).insert(query, function(err,data){
            if (!err) {
            callback({success:true, message:'add activity success!'})
            } else {
            console.log('adminError: addActivity:'+ err)
            callback({success: false, err: err})
            }
        }) 
    }
}

exports.getLineManageList = async function(action, session, callback){
	let query = {}
    mongo.db(fields.DEFAULT_DB).collection(fields.LINE).find(query).count(function(err, count){
       if (!err){
         mongo.db(fields.DEFAULT_DB).collection(fields.LINE).find(query).limit(action.limit).skip(action.skip).toArray(function(err,data){
           if (!err) {
             callback({success:true, data:{list: data, count: count}, count: count})
           } else {
             console.log('adminError: getLineManageList:'+ err)
             callback({success: false, err: err})
           }
         })
       } else {
         console.log('adminError: getLineManageList:'+ err)
         callback({success: false, err: err})
       }
    })
}

exports.removeLine = async function(action, session, callback){
	let query = {};
   query.id = action.id;
   mongo.db(fields.DEFAULT_DB).collection(fields.LINE).remove(query, function(err){
     if (!err) {
         callback({success: true})
     } else {
      console.log('adminError: removeLine:'+ err)
      callback({success: false, err: err})
     }
   })
}