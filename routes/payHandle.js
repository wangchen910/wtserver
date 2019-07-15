const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
const parseString = require('xml2js').parseString
exports.handleAction = function(payObj) {
  return new Promise((resolve, reject)=>{
    var query = {}
    query.out_trade_no = payObj.out_trade_no;
    mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).findOne(query,function(err, data){
      if (!err) {
        if (data) {
          mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).update(query,{$set: {payState: true, time_end: payObj.time_end}},function(err){
          	if (!err) {
          		resolve({success: true})
          	} else {
          		console.log('payActionErr: 修改订单状态错误！订单号：'+ payObj.out_trade_no)
          		resolve({err:err})
          	}
          })
        } else {
          resolve({err: 'payActionErr: 没有生成订单 订单号：' + payObj.out_trade_no})	
          console.log('payActionErr: 没有生成订单 订单号：'+ payObj.out_trade_no)
        }
      } else {
        console.log('payActionErr: mongoerr 订单号：'+ payObj.out_trade_no)
        resolve({err:err})
      }
    })
  })
}

exports.refoundAction = function(payObj) {
 
  return new Promise((resolve, reject)=>{
    parseString(payObj, function(err, body){
      var query = {}
      let refoundRoot = body.root
      query.out_trade_no = refoundRoot.out_refund_no[0];
      console.log(query)
      console.log('query================')
      mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).findOne(query,function(err, data){
        if (!err) {
          if (data) {
            mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).update(query,{$set: {refound: true, settlement_refund_fee: refoundRoot.settlement_refund_fee[0]}},function(err){
              if (!err) {
                resolve({success: true})
              } else {
                console.log('payActionErr: 修改订单状态错误！订单号：'+ payObj.out_trade_no)
                resolve({err:err})
              }
            })
          } else {
            resolve({err: 'payActionErr: 没有生成订单 订单号：' + payObj.out_trade_no})	
            console.log('payActionErr: 没有生成订单 订单号：'+ payObj.out_trade_no)
          }
        } else {
          console.log('payActionErr: mongoerr 订单号：'+ payObj.out_trade_no)
          resolve({err:err})
        }
      })
    })
  })
}