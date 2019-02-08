
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

exports.getActivityList = async function(data, session, callback){
  var merchantsId = session.id;
  var limit = data.limit;
  var skip = data.skip;
  console.log(data)	
  mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY).find({"merchants.id": merchantsId}).limit(limit).skip(skip).toArray(function(err, data){
    if (!err) {
      callback({success: true, data: data})
    } else {
      console.log('mcError: getActivityList:'+ err)
      callback({success: false, err: err})
    }
  })
}
exports.getUserList = async function(data, session, callback){
  var activityId = data.activityId;
  mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).find({"activityId": activityId}).toArray(async function(err, data){
    if (!err) {
      if (data.length > 0){
      	var userArr = []
      	for (var i = 0; i < data.length; i++){
      	   var userInfo = await getUserInfo(data[i].participants);
      	   if (userInfo.success){
             userArr.push(userInfo.userInfo) 
      	   }
      	}
      	var partakeLength = await getPartakeLength(activityId);
      	var validateLength = await getPartakeLength(activityId, true);
        var partakeCount = 0;
        var validateCount = 0;
        if (partakeLength.success) {
          partakeCount = partakeLength.count;
          validateCount = validateLength.count;
      	}
        callback({success: true, data:{userList: userArr, partakeLength:partakeCount, validateLength: validateCount}})
      }else{
      	callback({success: true, data: {userList: []}})
      }
    } else {
      console.log('mcError: getActivityList:'+ err)
      callback({success: false, err: err})
    }
  })  
}

async function getPartakeLength(id, type){
  var query = {}
  if (type) {
    query = {activityId: id, validation: true}
  } else {
  	query = {activityId: id}
  }
  return new Promise(function (resolve, reject){
    mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).count(query,function(err,data){
      if (!err){
        resolve({success: true, count: data})
      }else {
        resolve({success:false,message:err})
      }
    })
  })	
}
async function getUserInfo (id) {
  return new Promise(function (resolve, reject){
    mongo.db(fields.DEFAULT_DB).collection(fields.USER).findOne({id: id},function(err,data){
      if (!err){
        if (data&&data.userInfo){
          userInfo = data.userInfo;
          resolve({success:true, userInfo:userInfo})
        }else{
          reject({success:false,message:'not user info'})
        }
      }else {
        reject({success:false,message:err})
      }
    })
  })
}