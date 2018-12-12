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
	 mongo.db(fields.DEFAULT_DB).collection(fields.COMMODITY).findOne(query,function(err,data){
       if (!err) {
         callback({success:true, data: data})
       } else {
         console.log('adminError: getCommodity:'+ err)
         callback({success: false, err: err})
       }
    })  
}