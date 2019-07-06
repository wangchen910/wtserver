const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
const uuidv4 = require('uuid/v1')
const notify = require(__baseDir+'/until/notify')
exports.addLineManage = async function(action, session, callback){
    let query = {}
    query.start = action.start;
    query.end = action.end;
    query.num = action.num;
    query.price = action.price;
    query.departureTime = action.departureTime;
    query.departurePlace = action.departurePlace;
    query.contacts_name = action.contacts_name;
    query.contacts_phone = action.contacts_phone;
    query.licensePlate = action.licensePlate
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

exports.smsNotice = async function(action, session, callback){
  let query = {};
   query.lineId = action.id;
   mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).find(query).toArray(function(err, data){
     if (!err) {
        let orderList = data;
        let queryInfo = {}
        queryInfo.id = action.id
        mongo.db(fields.DEFAULT_DB).collection(fields.LINE).findOne(queryInfo, function(err, info){
          if (!err) {
             let lineInfo = info;
             notify.smsNotify(info, orderList)
             callback({success: true})
          } else {
           console.log('smsNotice: smsNotice:'+ err)
           callback({success: false, err: err})
          }
        })
     } else {
      console.log('smsNotice: smsNotice:'+ err)
      callback({success: false, err: err})
     }
   })
}

exports.updateOrAddCity = async function(action, session, callback){
	 let data = action.data
   mongo.db(fields.DEFAULT_DB).collection(fields.CITY).update({type: 'city'},{$set:{city: data}},{upsert:true},function(err){
    if (!err){
    	callback({success:true,message:'add city success'})
    }else {
    	callback({success:false,message:err})
    }
  })
}