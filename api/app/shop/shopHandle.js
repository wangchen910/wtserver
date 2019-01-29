const pay = require(__baseDir+'/until/pay')
const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
exports.buy = async function(action, session, callback){
        // action.openId = session.openId
        // let str = await pay.pay(action)
        // callback({success:true, data:str})
        mongo.db().collection('user').find({}).toArray(function(err,data){
           console.log(err)
           console.log(data)
           callback({success:true, data:data})
        })
}


exports.getCommodity = async function(action, session, callback) {
	 var query = {}
   if (action.id) {
    query.id = action.id
   }
	 mongo.db(fields.DEFAULT_DB).collection(fields.COMMODITY).findOne(query,function(err,data){
       if (!err) {
         callback({success:true, data: data})
       } else {
         console.log('appError: getCommodity:'+ err)
         callback({success: false, err: err})
       }
    })
}

exports.getCommodityList = async function(action, session, callback){
  var query = {}
  var commodityQuery = {};
  var limit = action.limit || 5;
  var page = action.page || 1;
  var skip = limit * (page - 1);
  mongo.db(fields.DEFAULT_DB).collection(fields.COMMODITY).find(commodityQuery,{sort: {recNums: -1}, skip: skip, limit: limit}).toArray(function(err,data){
    if (!err) {
      callback({success: true, data: data})
    } else {
      console.log('appError: getCommodityList:'+ err)
      callback({success: false, err: err})
    }
  })
}

exports.getOrderList = async function(action, session, callback){
   var query = {}
   query.userId = session.openId;
   // mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).find(query).limit(action.limit).skip(action.skip).toArray(function(err,data){
   //   if (!err) {
   //     callback({success:true, data:data})
   //   } else {
   //     console.log('getOrderList: getOrderList:'+ err)
   //     callback({success: false, err: err})
   //   }
   // })
  mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).aggregate([{
    $lookup:{
      from: 'commodity',
      localField: 'commodityId',
      foreignField: 'id',
      as: 'list_doc'
   }},{
    $match: query
   },{
    $sort: {
      out_trade_no: -1
    }
   },{
    $skip: action.skip
   },{
    $limit: action.limit
   }]).toArray(function(err,data){
     if (!err) {
       callback({success: true, data:data})
     } else {
       console.log('getOrderList: getOrderList:'+ err)
       callback({success: false, err: err})
     }
   })
}