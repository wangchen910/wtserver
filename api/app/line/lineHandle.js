const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
const uuidv4 = require('uuid/v1')
exports.getLineManage = async function(action, session, callback) {
     var query = {}
    delete action.ip;
    query = action
	 mongo.db(fields.DEFAULT_DB).collection(fields.LINE).find(query).toArray(function(err,data){
       if (!err) {
         callback({success:true, data: data})
       } else {
         console.log('appError: getLineManage:'+ err)
         callback({success: false, err: err})
       }
    })
}

exports.getOrderList = async function(action, session, callback) {
  var query = {}
 delete action.ip;
 query.userId = session.openId
 // userId
  mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).find(query).sort({time_end: -1}).toArray(function(err,data){
      if (!err) {
        callback({success:true, data: data})
      } else {
        console.log('appError: getLineManage:'+ err)
        callback({success: false, err: err})
      }
  })
}

exports.getRiderList = async function(action, session, callback) {
  var query = {}
  delete action.ip;
  query.userId = session.openId
  mongo.db(fields.DEFAULT_DB).collection(fields.RIDER).find(query).toArray(function(err,data){
      if (!err) {
        callback({success:true, data: data})
      } else {
        console.log('appError: getRiderList:'+ err)
        callback({success: false, err: err})
      }
  })
}

exports.addOrupdateRider = async function(action, session, callback) {
  var query = {}
 delete action.ip;
 query.userId = session.openId
 query.name = action.name
 query.idCard = action.idCard
 query.isDefault = action.isDefault || false
 // userId
 if (action.id) {
  mongo.db(fields.DEFAULT_DB).collection(fields.RIDER).update({id: action.id}, {$set: query},function(err){
      if (!err) {
        callback({success:true, message:'update rider success!'}) 
      } else {
        console.log('appError: addOrupdateRider:'+ err)
        callback({success: false, err: err})
      }
    })
  } else {
    query.id = uuidv4();
    mongo.db(fields.DEFAULT_DB).collection(fields.RIDER).insert(query, function(err,data){
        if (!err) {
        callback({success:true, message:'add rider success!'})
        } else {
        console.log('appError: addOrupdateRider:'+ err)
        callback({success: false, err: err})
        }
    }) 
  }
}

exports.removeRider = async function(action, session, callback) {
  let query = {};
  query.id = action.id;
  mongo.db(fields.DEFAULT_DB).collection(fields.RIDER).remove(query, function(err){
    if (!err) {
        callback({success: true})
    } else {
     console.log('appError: removeRider:'+ err)
     callback({success: false, err: err})
    }
  })
}

exports.setDefaultRider = async function(action, session, callback) {
  let query = {};
  query.userId = session.openId;
  mongo.db(fields.DEFAULT_DB).collection(fields.RIDER).update(query, {$unset:{isDefault: 1}},{multi:true},function(err){
    if (!err){
      let queryId = {}
      queryId.id = action.id
      mongo.db(fields.DEFAULT_DB).collection(fields.RIDER).update(queryId,{$set:{isDefault: true}}, function(err){
        if (!err){
          callback({success: true, message: 'setDefaultRider success'})        
        }else {
          callback({success:false,message:err})
        }
      })
    }else {
      callback({success:false,message:err})
    }
  })
}
