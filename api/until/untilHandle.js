const pay = require(__baseDir+'/until/pay')
const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
exports.pay = async function(action, session, callback){
    if (!action.ip || !action.fee || !action.body || !action.address || !action.commodityId){
    	return callback({success: true, message:'缺少参数'})
    }else{
    	action.openId = session.openId
        let payObj = await pay.pay(action)
        if (!payObj.err) {
           //下单程序
           var orderObj = {}
           orderObj.fee = action.fee
           orderObj.body = action.body
           orderObj.commodityId = action.commodityId
           orderObj.out_trade_no = payObj.out_trade_no
           orderObj.address = action.address
           orderObj.userId = action.openId
           let order = await exports.produceOrder(orderObj)
           if (!order.err) {
             callback({success:true,data:payObj})
           } else {
             console.log('payError: 生成订单错误'+ order.err)  
             callback({success:false,message:'生成订单错误'})
           }
        } else {
          console.log('payError: 预下单错误'+ payObj.err)  
          callback({success:false, message: '预下单错误'})
        }
    }
}

exports.produceOrder = async function(obj) {
   return new Promise((resolve, reject) => {
     var query = {}
     query = obj
     mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).insert(query,function(err){
       if (!err) {
         resolve({success:true})
       } else {
         console.log('appError: produceOrder:'+ err)
         callback({success: false, err: err})
       }
     })
   }) 
}

