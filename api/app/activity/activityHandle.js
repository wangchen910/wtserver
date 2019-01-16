
const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
const uuidv4 = require('uuid/v1')
const until = require(__baseDir+'/api/until/untilHandle')
const qr = require('qr-image');
// type1 手机号营销
// type2 集赞营销
// ActState:1 手机号活动：1,集赞活动：2
// Someone: 2 朋友:1, 自己:2
// QRState: 2 集赞中：1 ,已集满:2,已领取:3,活动已经结束:0

exports.getActivityInfo = async function(action, session, callback){
	var query = {};
	if (action.activityId) {
      query.id = action.activityId;
	}
	mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY).findOne(query, function(err,data){
       if (!err) {
       	  var activityData = data;           
          if (activityData) {
            var overdue= isOverdue(activityData.date)
            if (overdue) {
            	return callback({success: true, data: {isOverdue: true, activity: activityData},message: '活动已过期'})
            }
          }
          if (action.partakeId) {
          	var partakeQuery = {
          		id: action.partakeId
          	};
          	mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).findOne(partakeQuery, function(err,data){
              if (!err) {
              	var partakeData = data;
              	var Someone = partakeData.participants === session.openId;
                var state = getActivityType(activityData, partakeData, Someone, session.openId)
                callback({success:true, data: {activity: activityData, activityState: state}})
              } else {
                console.log('appError: getActivityInfo:'+ err)
                callback({success: false, err: err})
              }
            })
          } else {
            var insertData = {};
            insertData.id = uuidv4();
            insertData.activityId = activityData.id;
            insertData.participants = session.openId;
            mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).insert(insertData, function(err,data){
              if (!err) {
              	var state = getActivityType(insertData, activityData, true)	
                callback({success:true, data: {activity: activityData, activityState: state},message:'add activity success!'})
              } else {
                console.log('adminError: addActivity:'+ err)
                callback({success: false, err: err})
              }
            })
          }
       } else {
        console.log('appError: getActivityInfo:'+ err)
        callback({success: false, err: err})
       }
     })
}


function isOverdue (start) {
	var endTime = new Date(start);
	var curTime = new Date();
    var ret = endTime.getTime() - curTime.getTime();//最后时间的总秒数减去现在时间的秒数
    ret = Math.round( ret/1000 );//round() 方法可把一个数字舍入为最接近的整数。
    if(ret>0){
        return false;
    }else{
        return true;
    }
}


// type1 手机号营销
// type2 集赞营销
// ActState:1 手机号活动：1,集赞活动：2
// Someone: 2 朋友:1, 自己:2
// QRState: 2 集赞中：1 ,已集满:2,已领取:3,活动已经结束:0

function getActivityType(activity, partake, role, userId) {
  var activityObj = activity || {};
  var partake = partake || {};
  var activityState = {
  	ActState: 1,
  	QRState: 1,
  	Someone: 1
  }
  if (activityObj.type === 'type1') {
  	 activityState.ActState = 1;
     if (partake.validation) {
       activityState.QRState = 3
     } else {
     	if (partake.phone) {
          activityState.QRState = 2
     	} else {
          activityState.QRState = 1
     	}
     }
  } else if (activityObj.type === 'type2') {
    activityState.ActState = 2;
    if (partake.validation) {
       activityState.QRState = 3
    } else {
       if (partake.user_like_arr) {
       	 if (partake.user_like_arr.length >= activityObj.conditions.type2nums) {
           activityState.QRState = 2
       	 } else {
           activityState.QRState = 1
       	 }
       }	
    }
  }
  if (role) {
    // role 存在 是代表自己
    activityState.Someone = 2;
  } else {
    if (userId && partake.user_like_arr){
       if (partake.user_like_arr.indexOf(userId)!=-1){
         activityState.QRState = 4;
       }
    }  
  }
  return activityState;
}

exports.partakeActivity = async function(action, session, callback) {
  var activityType = action.activityType;
  if (activityType === 'type1') {
    var id = action.partakeId;
    delete action.ip;
    delete action.partakeId;
    mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).update({id: id}, {$set: action},function(err){
      if (!err) {
        callback({success:true, message:'update Merchants success!'}) 
      } else {
        console.log('appError: partakeActivity:'+ err)
        callback({success: false, err: err})
      }
    })
  } else if (activityType === 'type2') {
    let partakeId = action.partakeId;
    let userId = session.openId;
    let userInfo = action.userInfo;
    mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).update({id: partakeId}, {$addToSet: {user_like_arr: userId}},function(err){
      if (!err) {
        callback({success:true, message:'user like success!'}) 
      } else {
        console.log('appError: partakeActivityLike:'+ err)
        callback({success: false, err: err})
      }
    })
  }
}


exports.partakeActivityLike = async function(action, session, callback) {
  let partakeId = action.partakeId;
  let userId = session.openId;
  mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).update({id: id}, {$set: action, $addToSet: {user_like_arr: userId}},function(err){
    if (!err) {
      callback({success:true, message:'user like success!'}) 
    } else {
      console.log('appError: partakeActivityLike:'+ err)
      callback({success: false, err: err})
    }
  })
}

exports.getQrImage = async function(data, callback) {
   console.log(data.str)
   var qr_svg = qr.imageSync(data.str, { type: 'png' });
   var base64 = 'data:image/png;base64,'+qr_svg.toString('base64');
   callback(base64)
}