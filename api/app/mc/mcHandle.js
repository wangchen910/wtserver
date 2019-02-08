
const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')

exports.qrValidate = async function(data, session, callback){
  var mcId = session.id;
  var qrId = data.qrId;
  mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).findOne({id: data.qrId}, function(err, data){
    if (!err) {
      if (data) {
      	if (data.validation) {
      	  callback({success: false, message: '此码已经使用过！'})
      	} else {
          mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY).findOne({id: data.activityId}, function(err, activityData){
            if (!err) {
               if (mcId!==activityData.merchants.id){
                 callback({success: false, message: '活动与商家不匹配'})
               } else {
	             mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).update({id: qrId}, {$set: {validation: true}},function(err){
	               if (!err) {
	                 callback({success:true, message:'qrValidate success!'}) 
	               } else {
	                 console.log('mcError: qrValidate:'+ err)
	                 callback({success: false, err: err})
	               }
	             })
               }
            }else{
              callback({success: false, err: err})  		
            }
          })
      	}
      } else {
        callback({success: false, message: '没有此记录'})	
      }
    } else {
      console.log('mcError: qrValidate:'+ err)
      callback({success: false, err: err})
    }
  })	
  // mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).update({id: data.qrId}, {$set: {validation: true}},function(err){
  //   if (!err) {
  //     callback({success:true, message:'qrValidate success!'}) 
  //   } else {
  //     console.log('mcError: qrValidate:'+ err)
  //     callback({success: false, err: err})
  //   }
  // })
}

exports.getLoginState = async function(data, session, callback){
	callback({success: true, message: 'get success!'})
}