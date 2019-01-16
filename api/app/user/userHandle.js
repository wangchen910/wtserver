const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
exports.addAddress = async function(action, session, callback){
	let address = action.address;
	let id = session.openId;
  mongo.db(fields.DEFAULT_DB).collection(fields.USER).update({id: id},{$set:{address: address}},{upsert:true},function(err){
    if (!err){
    	callback({success:true,message:'add address success'})
    }else {
    	callback({success:false,message:err})
    }
  })
}


exports.getAddress = async function(action, session, callback){
	let id = session.openId;
	let address = {}
  mongo.db(fields.DEFAULT_DB).collection(fields.USER).findOne({id: id},function(err,data){
    if (!err){
        if (data&&data.address){
        	address = data.address
          callback({success:true,data:address})
        }else{
          callback({success:false,message:'not user address'})
        }
    }else {
    	callback({success:false,message:err})
    }
  })
}

exports.setUserInfo = async function(action, session, callback){
  let userInfo = action.userInfo;
  let id = session.openId;
  mongo.db(fields.DEFAULT_DB).collection(fields.USER).update({id: id},{$set:{userInfo: userInfo}},{upsert:true},function(err){
    if (!err){
      callback({success:true,message:'add userInfo success'})
    }else {
      callback({success:false,message:err})
    }
  })
}


exports.getUserInfo = async function(action, session, callback){
  let id = session.openId;
  mongo.db(fields.DEFAULT_DB).collection(fields.USER).findOne({id: id},function(err,data){
    if (!err){
        if (data&&data.userInfo){
          userInfo = data.userInfo;
          callback({success:true,data:userInfo})
        }else{
          callback({success:false,message:'not user info'})
        }
    }else {
      callback({success:false,message:err})
    }
  })
}

exports.confirmUser = async function(action, session, callback){
  let id = session.openId;
  mongo.db(fields.DEFAULT_DB).collection(fields.USER).findOne({id: id},function(err,data){
    if (!err){
        if (data&&data.userInfo){
          userInfo = data.userInfo;
          callback({success:true,data:userInfo})
        }else{
          mongo.db(fields.DEFAULT_DB).collection(fields.USER).update({id: id},{$set:{userInfo: action.userInfo}},{upsert:true},function(err){
            if (!err){
              callback({success:true,message:'confirmUser userInfo success'})
            }else {
              callback({success:false,message:err})
            }
          })
        }
    }else {
      callback({success:false,message:err})
    }
  })
}


