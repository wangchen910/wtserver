var path = require('path')
var rediscli = require(path.join(__baseDir+'/until/redis')).connect
var _APP_SESSION_PREFIX = 'appsession.'
var _ADMIN_SESSION_PREFIX = 'adminsession.'
var _MC_SESSION_PREFIX = 'mcsession.'
var _SESSION_TIMEOUT_SECONDS = 480 * 60;
var config = require(path.join(__baseDir + '/serverConfig.js'))
var request = require(path.join(__baseDir + '/until/request'))
var md5cipher = require(path.join(__baseDir + '/until/crypto')).cipher
var mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
const uuidv1 = require('uuid/v1');
exports.checkSession = function(id){
   return new Promise(function(resolve, reject){
     exports.get(_key(id),function(err,res){
        if(err){
            resolve({err:err});
        }else{
            rediscli.getClient().expire(_key(id),_SESSION_TIMEOUT_SECONDS);
            res = JSON.parse(res)
            resolve(res);
        }
    });
   })
}
exports.checkAdminSession = function(id){
   return new Promise(function(resolve, reject){
     exports.get(_adminkey(id),function(err,res){
        if(err){
            resolve({err:err});
        }else{
            rediscli.getClient().expire(_adminkey(id),_SESSION_TIMEOUT_SECONDS);
            res = JSON.parse(res)
            resolve(res);
        }
    });
   })
}
exports.login = function(action){
   return new Promise((resolve,reject)=>{
      if (!action.data.code){
      var err = 'code error! your shoud check your code!'
      resolve({err:err})
     } else {
      var url='https://api.weixin.qq.com/sns/jscode2session?appid='+config.appId+'&secret='+config.secret+'&js_code='+action.data.code+'&grant_type=authorization_code';  
      request.get(url, function(err, data){
        if (err) {
          resolve({err:err})
        }else{
          var openId = data.openid;
          var session_key = data.session_key;
          var value = {openId: openId, session_key: session_key}
          var key = md5cipher(openId)
          rediscli.getClient().set(_key(key), JSON.stringify(value), function(err,res){
               if(!err){
                 resolve({sessionId:key})  
               }else{
                 resolve({err:err})
               }
          })
        }
      })
   }
   })
}

exports.get = function(id,cb){
    rediscli.getClient().get(id,function(err,res){
        if(err || !res){
            return cb(err || {sessionExpire:true});
        }
        return cb(null,res);
    });
}

function _key(id) {
    return _APP_SESSION_PREFIX+id;
}
function _adminkey(id) {
    return _ADMIN_SESSION_PREFIX+id;
}
function _mckey(id) {
   return _MC_SESSION_PREFIX+id;
}

exports.checkToken = function(upload) {
   return new Promise((resolve, reject)=>{
      if (!upload.Token){
        resolve({err: 'no Token'})
      } else {
        mongo.db('fileToken').collection(fields.TOKEN).findOne({token: upload.Token},function(err, data){
          if (!err&&data){
            resolve({success:true})
          }else{
            resolve({err: 'token not found'})
          }
        })
      }
   })
}

exports.adminLogin = function(action){
  var key = uuidv1()
  var value = action;
  return new Promise((resolve,reject)=>{
    if (action.user === 'wangtao'&&action.pass ==='wangtao'){
      rediscli.getClient().set(_adminkey(key), JSON.stringify(value), function(err,res){
        if(!err){
          resolve({success:true,sessionId:key})  
        }else{
          resolve({err:err})
        }
      })
    }else {
      resolve({err:'pass or user error'})
    }
  })
}



exports.checkMcSession = function(id){
   return new Promise(function(resolve, reject){
     exports.get(_mckey(id),function(err,res){
        if(err){
            resolve({err:err});
        }else{
            rediscli.getClient().expire(_mckey(id),_SESSION_TIMEOUT_SECONDS);
            res = JSON.parse(res)
            resolve(res);
        }
    });
   })
}

exports.mcLogin = function(action){
  var value = action;
  return new Promise(async (resolve,reject)=>{
    var obj = await authMclogin(value)
    if (obj.success) {
      var userInfo = obj.userInfo;
      var key = userInfo.id;
      rediscli.getClient().set(_mckey(key), JSON.stringify(userInfo), function(err,res){
        if(!err){
          resolve({success:true,sessionId:key,data: userInfo})  
        }else{
          resolve({err:err})
        }
      })
    } else {
      resolve({success: false})
    }
  })
}

async function authMclogin (obj) {
  return new Promise(function (resolve, reject){
    var username = obj.user;
    var pass = obj.pass;
    mongo.db(fields.DEFAULT_DB).collection(fields.MERCHANTS).findOne({phone: username},function(err,data){
      if (!err){
        if (data){
          if (data.password === pass){
            resolve({success:true, userInfo:data})
          } else {
            resolve({success: false, message: 'pass or username error!'})
          }
        }else{
          resolve({success:false,message:'not merchants info'})
        }
      }else {
        resolve({success:false,message:err})
      }
    })
  })
}