
const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
const uuidv4 = require('uuid/v1')
const until = require(__baseDir+'/api/until/untilHandle')
const qr = require('qr-image');

// type1 手机号营销
// type2 集赞营销
// ActState:1 手机号活动：1,集赞活动：2,支付领取：3
// Someone: 2 朋友:1, 自己:2
// QRState: 2 集赞中：1 ,已集满:2,已领取:3,活动已经结束:0

exports.getActivityInfo = async function(action, session, callback){
  var query = {};
  //action.activityId = 'dc6d0050-14e8-11e9-a275-c1c5f786cef5'
	if (action.activityId) {
      query.id = action.activityId;
	} else {
     if (action.scene){
       var sceneData = await until.getSceneData(action.scene);
       if (sceneData.success) {
         query.id = sceneData.data.activityId;
         action = sceneData.data;
       } else {
         return callback({success: false, message: 'scene不存在或者获取错误'})
       }
     } else {
       return callback({success: false, message: '请传活动id或者scene'})
     }
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
          //判断是否存在 参与id
          var partakeQuery = {};
          if (action.partakeId){
            partakeQuery = {
              id: action.partakeId
            };
          } else {
            partakeQuery = {
              activityId: action.activityId,
              participants: session.openId
            };
          }
          mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).findOne(partakeQuery, async function(err,data){
            if (!err) {
              var userInfo = {}
              if (data) {
                  var partakeData = data;
                  var Someone = partakeData.participants === session.openId;
                  if (!Someone && activityData.type === 'type2') {
                    userInfo = await getUserInfo(partakeData.participants);
                  }
                  var state = getActivityType(activityData, partakeData, Someone, session.openId)
                  callback({success:true, data: {activity: activityData, activityState: state, partakeId: partakeData.id, userInfo:userInfo}})
              } else {
                var insertData = {};
                insertData.id = uuidv4();
                insertData.activityId = activityData.id;
                insertData.participants = session.openId;
                mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).insert(insertData, function(err,data){
                  if (!err) {
                    insertData.type = activityData.type;
                    var state = getActivityType(insertData, activityData, true) 
                    callback({success:true, data: {activity: activityData, activityState: state, partakeId: insertData.id, userInfo: userInfo},message:'add activity_partake success!'})
                  } else {
                    console.log('activityError: activity_partake error:'+ err)
                    callback({success: false, err: err})
                  }
                })
              }
            } else {
              console.log('appError: getActivityInfo:'+ err)
              callback({success: false, err: err})
            }
          })
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
  } else if (activityObj.type === 'type3') {
    activityState.ActState = 3;
    if (partake.validation) {
       activityState.QRState = 3
    } else {
       if (partake.payState) {
         activityState.QRState = 2
       } else {
         activityState.QRState = 1
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
  var activityType = action.actionType;
  if (activityType === 'type1') {
    var partakeId = action.partakeId;
    var query = {}
    query.activityId = action.activityId;
    query.phone = action.phone;
    delete action.ip;
    delete action.partakeId;
    delete action.activityId;
    mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).findOne(query, function(err,data){
      if (!err){
         if (data) {
           callback({success:false, message:'手机号已参加！'})
         } else {
           action.partakeType = 'success'
           mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).update({id: partakeId}, {$set: action},function(err){
             if (!err) {
               callback({success:true, message:'update Merchants success!'}) 
             } else {
               console.log('appError: partakeActivity:'+ err)
               callback({success: false, err: err})
             }
           })
         }
      } else {
        callback({success: false, err: err})
      }  
    })
  } else if (activityType === 'type2') {
    let partakeId = action.partakeId;
    let userId = session.openId;
    mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).findOne({id: partakeId},function(err, data){
      if (!err) {
        if (data.user_like_arr && data.user_like_arr.indexOf(userId)!==-1){
           callback({success:true, data:{likeRepeat: true}}) 
        } else {
           var likeLenth = data.user_like_arr ? data.user_like_arr.length + 1 : 1;
           var setQuery = {}
           if (likeLenth >= action.type2nums) {
             setQuery = {$addToSet: {user_like_arr: userId}, $set: {partakeType: 'success'}}
           } else {
             setQuery = {$addToSet: {user_like_arr: userId}}
           }
           mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).update({id: partakeId}, setQuery,function(err){
             if (!err) {
               callback({success:true, message:'user like success!'}) 
             } else {
               console.log('appError: partakeActivityLike:'+ err)
               callback({success: false, err: err})
             }
           }) 
        } 
      } else {
        console.log('appError: partakeActivityLike:'+ err)
        callback({success: false, err: err})
      }
    })
  } else if (activityType === 'type3') {
    var partakeId = action.partakeId;
    delete action.ip;
    delete action.partakeId;
    delete action.activityId;
    action.partakeType = 'success';
    mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).update({id: partakeId}, {$set: action},function(err){
      if (!err) {
        callback({success:true, message:'update payState success!'}) 
      } else {
        console.log('appError: partakeActivity:'+ err)
        callback({success: false, err: err})
      }
    })
  } else {
    callback({success: false, err: 'no activity Type'})
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
   var qr_svg = qr.imageSync(data.str, { type: 'png' });
   var base64 = 'data:image/png;base64,'+qr_svg.toString('base64');
   callback(base64)
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

exports.getLikeUserList = async function(action, session, callback){
   var partakeId = action.partakeId;
   var limit = 5;
   var skip = (action.page - 1)*limit;
   mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).findOne({id: partakeId}, async function(err, data){
     if (!err) {
      var userList = []
      if (data && data.user_like_arr){
        var more = (skip + limit) < data.user_like_arr.length;
        var length =  (skip + limit) <= data.user_like_arr.length ? (skip + limit) : data.user_like_arr.length;
        for (var i = skip; i < length; i++) {
          var userInfo = await getUserInfo(data.user_like_arr[i])
          if (userInfo.success){
            userList.push(userInfo.userInfo)
          }
        }
        callback({success: true, data: {userList: userList, more:more, userLikeNum: data.user_like_arr.length}})
      }else{
        callback({success: true, data: {userList: [], more: false}}) 
      }
     } else {
       console.log('appError: getLikeUserList:'+ err)
       callback({success: false, err: err})
     }
   })
}

exports.getQrCode = async function(action, session, callback){
  var img = await until.getQrImage(action)
  callback({success: true, data:{img: img}})
}

exports.getActivityList = async function(action, session, callback){
  var activityQuery = {};
  var limit = action.limit || 5;
  var page = action.page || 1;
  var skip = limit * (page - 1);
  mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY).find(activityQuery,{sort: {recNums: -1}, skip: skip, limit: limit}).toArray(function(err,data){
    if (!err) {
      // mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY).find(activityQuery).toArray(function(err,data){
      //   if (!err) {
      //     callback({success: true, data: {recData: recData[0], activityList: data}})
      //   } else {
      //     console.log('appError: getActivityList:'+ err)
      //     callback({success: false, err: err})
      //   }
      // })
      callback({success: true, data: data})
    } else {
      console.log('appError: getActivityList:'+ err)
      callback({success: false, err: err})
    }
  })
}

exports.getExchangeCard = async function(action, session, callback){
  var query = {};
  var limit = action.limit || 2;
  var skip = action.skip || 0;
  query.participants = session.openId;
  query.partakeType = 'success';
  query.validation = {$ne: true}
  mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY_PARTAKE).find(query).limit(limit).skip(skip).toArray(async function(err, data){
    if (!err) {
      var backArr = [];
      if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          var activityData = await getActivityOne({id: data[i].activityId})
          var backObj = {}
          backObj.id = data[i].id;
          backObj.activity = activityData;
          backArr.push(backObj)
        }
        callback({success: true, data: backArr})
      } else {
        callback({success: true, data: []})
      }
    } else {
      console.log('appError: getExchangeCard:'+ err)
      callback({success: false, err: err})
    }
  })
}

async function getActivityOne(query) {
  return new Promise((resolve, reject)=>{
    mongo.db(fields.DEFAULT_DB).collection(fields.ACTIVITY).findOne(query, function(err,data){
       if (!err) {
          resolve(data)
       } else {
        console.log('appError: getActivityOne:'+ err)
        callback({success: false, err: err})
       }
     })
  })
}
