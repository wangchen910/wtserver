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
  if (action.isDefault) {
    query.isDefault = true
  }
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

exports.handleOrder = async function(action) {
  return new Promise((resolve, reject) => {
    let query = {}
    query.id = action.lineId
    console.log(action)
    mongo.db(fields.DEFAULT_DB).collection(fields.LINE).findOne(query, async function(err, obj){
      if (!err) {
        let riderNum = action.riderList.length
        console.log(obj.num - riderNum)
        console.log('减去这次的票还剩多少')
        if (obj.num <=0 || (obj.num - riderNum) < 0) {
          resolve({success: false, message: '票数不够'})  
        } else {
          let updateRusult = await exports.updateLineNum(action.lineId, 'cut', riderNum)
          console.log(updateRusult)
          console.log('更新票数')
          if (updateRusult) {
            resolve({success: true})
          } else {
            resolve({success: false})
          }
        }
      } else {
       console.log('handleOrder: handleOrder:'+ err)
       resolve({success: false, err: err})
      }
    })   
  }) 
}

exports.updateLineNum = function(id, type, num) {
  if (type !== 'add') {
     num = (num * -1)
  }
  console.log(num, 'num')
  let query = {}
  query.id = id;
  return new Promise((resolve, reject) => {
    mongo.db(fields.DEFAULT_DB).collection(fields.LINE).update(query, {$inc: {num: num}}, async function(err){
      if (!err) {
        resolve(true)
      } else {
       console.log('updateLineNum: updateLineNum:'+ err)
       resolve(false)
      }
    })   
  })
}

exports.delOrder = async function(action, session, callback) {
  var query = {}
  delete action.ip;
  query.out_trade_no = action.out_trade_no
  mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).findOne(query, async function(err, obj){
      if (!err) {
        let num = obj.riderList.length || 1
        let lineId = obj.lineId
        let result = await exports.updateLineNum(lineId, 'add', num)
        if (result) {
          mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).remove(query, function(err){
            if (!err) {
              callback({success: true, message: 'updateNum success'})
            } else {
              console.log('appError: delOrder:'+ err)
              callback({success: false, err: err})
            }
          })        
        } else {
          callback({success: false, err: 'update Line Num error'})
        }
      } else {
        console.log('appError: delOrder:'+ err)
        callback({success: false, err: err})
      }
  })
}