
const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')

exports.qrValidate = async function(data, session, callback){
  mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).update({id: data.qrId}, {$set: {validation: true}},function(err){
    if (!err) {
      callback({success:true, message:'qrValidate success!'}) 
    } else {
      console.log('mcError: qrValidate:'+ err)
      callback({success: false, err: err})
    }
  })
}

exports.getLoginState = async function(data, session, callback){
	callback({success: true, message: 'get success!'})
}