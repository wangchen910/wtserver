
const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
const uuidv4 = require('uuid/v1')
const until = require(__baseDir+'/api/until/untilHandle')

exports.getActivityList = async function(action, session, callback){
	let query = {}
    mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY).find(query).count(function(err, count){
       if (!err){
         mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY).find(query).limit(action.limit).skip(action.skip).toArray(function(err,data){
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
// type1 手机领取
// type2 集赞领取

exports.addActivity = async function(action, session, callback) {
  let query = {}
  let merchants = action.merchants || {}
  if (typeof merchants === 'string') {
    merchants = JSON.parse(action.merchants) 
  } else {
    merchants = action.merchants
  }
  query.title = action.title;
  query.imgUrl = action.imgUrl;
  query.shareImgUrl = action.shareImgUrl;
  query.describe = action.describe;
  query.type = action.type;
  query.date = action.date;
  query.nums = action.nums;
  query.isRec = action.isRec;
  query.recNums = action.recNums;
  query.conditions = action.conditions;
  delete merchants._id;
  delete merchants.password;
  query.merchants = merchants;
  query.articleId = action.articleId;
   if (action.id) {
     mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY).update({id: action.id}, {$set: query},function(err){
       if (!err) {
         callback({success:true, message:'update commodity success!'}) 
       } else {
         console.log('adminError: updateActivity:'+ err)
         callback({success: false, err: err})
       }
     })
   } else {
     query.id = uuidv4();
     mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY).insert(query, function(err,data){
       if (!err) {
         callback({success:true, message:'add activity success!'})
       } else {
        console.log('adminError: addActivity:'+ err)
        callback({success: false, err: err})
       }
     }) 
   }
}

exports.removeActivity = async function(action, session, callback) {
   let query = {};
   query.id = action.id;
   mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY).remove(query, function(err){
     if (!err) {
       until.removeImage({url: action.imgUrl}).then((obj) => {
         callback(obj)
       })
     } else {
      console.log('adminError: removeActivity:'+ err)
      callback({success: false, err: err})
     }
   })
}

exports.removeImage = async function(action, session, callback) {
  until.removeImage(action).then((obj) => {
    callback(obj)
  })
}