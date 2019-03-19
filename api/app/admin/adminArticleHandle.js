
const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
const uuidv4 = require('uuid/v1')
const until = require(__baseDir+'/api/until/untilHandle')
exports.getArticleList = async function(action, session, callback){
	let query = {}
    mongo.db(fields.DEFAULT_DB).collection(fields.ARTICLE).find(query).count(function(err, count){
       if (!err){
         mongo.db(fields.DEFAULT_DB).collection(fields.ARTICLE).find(query).limit(action.limit).skip(action.skip).toArray(function(err,data){
           if (!err) {
             callback({success:true, data:{list: data, count: count}, count: count})
           } else {
             console.log('adminError: getAriticList:'+ err)
             callback({success: false, err: err})
           }
         })
       } else {
         console.log('adminError: getAriticList:'+ err)
         callback({success: false, err: err})
       }
    })
}


exports.addArticle = async function(action, session, callback) {
  let query = {}
  query.name = action.name;
  query.code = action.code;
   if (action.id) {
     mongo.db(fields.DEFAULT_DB).collection(fields.ARTICLE).update({id: action.id}, {$set: query},function(err){
       if (!err) {
         callback({success:true, message:'update Article success!'}) 
       } else {
         console.log('adminError: updateArticle:'+ err)
         callback({success: false, err: err})
       }
     })
   } else {
     query.id = uuidv4();
     mongo.db(fields.DEFAULT_DB).collection(fields.ARTICLE).insert(query, function(err,data){
       if (!err) {
         callback({success:true, message:'add Article success!'})
       } else {
        console.log('adminError: addArticle:'+ err)
        callback({success: false, err: err})
       }
     }) 
   }
}

exports.removeArticle = async function(action, session, callback) {
   let query = {};
   query.id = action.id;
   mongo.db(fields.DEFAULT_DB).collection(fields.ARTICLE).remove(query, function(err){
     if (!err) {
       callback({success: true, message: 'remove Article success!'})
     } else {
       console.log('adminError: removeArticle:'+ err)
     }
   })
}

