const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')

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
