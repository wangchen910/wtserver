const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')

exports.handleAction = function(payObj) {
  return new Promise((resolve, reject)=>{
    var query = {}
    console.log(payObj)
    console.log('--------')
    query.out_trade_no = payObj.out_trade_no;
    mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).findOne(query,function(err, data){
      if (!err) {
        if (data) {
          mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).update(query,{$set: {payState: true}},function(err){
          	if (!err) {
          		resolve({success: true})
          	} else {
          		console.log('payActionErr: 修改订单状态错误！')
          		resolve({err:err})
          	}
          })
        } else {
          resolve({err: 'payActionErr: 没有生成订单'})	
          console.log('payActionErr: 没有生成订单')
        }
      } else {
        console.log('payActionErr:'+err)
        resolve({err:err})
      }
    })
  })
}