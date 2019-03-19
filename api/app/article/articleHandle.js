
const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')



exports.getArticleInfo = async function(action, session, callback) {
	 var query = {}
   if (action.id) {
     query.id = action.id
   }
	 mongo.db(fields.DEFAULT_DB).collection(fields.ARTICLE).findOne(query,function(err,data){
       if (!err) {
         callback({success:true, data: data})
       } else {
         console.log('appError: getArticleInfo:'+ err)
         callback({success: false, err: err})
       }
    })
}
