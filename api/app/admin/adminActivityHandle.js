
const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
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