const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
exports.addAddress = async function(action, session, callback){
	let address = action.address;
	let id = session.openId;
  mongo.db('xiangning').collection(fields.USER).update({id: id},{$set:{address: address}},{upsert:true},function(err){
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
  mongo.db('xiangning').collection(fields.USER).findOne({id: id},function(err,data){
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