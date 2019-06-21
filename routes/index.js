var path = require('path')
var redis = require(path.join(__baseDir+'/until/redis'))
var rediscli = redis.connect
var appsession = require(path.join(__baseDir+'/until/appSession'))
var actionHandle = require('./actionHandle')
var adminHandle = require('./adminHandle')
var fs = require('fs')
var uploadHandler = require('./uploadHandler')
var untilHandle = require('./untilHandle')
var downloadHandle = require('./downloadHandle')
var payHandle = require('./payHandle')
var mcHandle = require('./mcHandle')
var crypto = require(__baseDir+'/until/crypto')
var _APP_SESSION_PREFIX = 'appsession.'
exports.routeAction = async (ctx) => {
     var action = parseActionData(ctx.request,ctx);
     if (action.err){
        ctx.response.body = action;
     } else {
        if (action.sessionId){ 
            var sessionData = await appsession.checkSession(action.sessionId);
            if (!sessionData.err){
                var result = await actionHandle.handleAction(action, sessionData)
                if(result.err){
                    ctx.response.body = {success: false, message:result.err, err: true}
                }else{
                    ctx.response.body = result
                }
            }else if(sessionData.err && sessionData.err.sessionExpire){
               ctx.response.body = {success:false,sessionExpire:true,message:'session sessionExpire'}
            }else{
               ctx.response.body = {success: false,message:sessionData.err} 
            }
        } else if (action.name === 'login') {
           var callback = await appsession.login(action)
           ctx.response.status = 200
           ctx.response.body = callback
        } else if (action.name === 'until') {
           var callback = await untilHandle.handleAction(action)
           ctx.response.status = 200
           ctx.response.body = callback;
        } else {
           ctx.response.body = {success: false, message: 'sessionId not fond! action name is not fond'}
        }
     }
}


function parseActionData(req,ctx) {
    var action = {};
    try {
        var query = req.query;
        if (req.method === 'POST') {
            query = req.body;
        }
        if (query.action && query.data) {
            action.name = query.action;
            action.data = query.data
            action.data.ip = ctx.req.headers['x-forwarded-for'] || ctx.req.connection.remoteAddress ||ctx.req.socket.remoteAddress ||ctx.req.connection.socket.remoteAddress;
            if(typeof query.data === 'string') {
              console.log(query.data)
              action.data = JSON.parse(query.data);
            }
            action.sessionId = query.sessionId;
        } else {
            action.err = 'param error! your shoud check your param!';
        }
    } catch (e) {
        console.log("json parse error:", e);
        action.err = e.message;
    }
    return action;
}

function _key(id) {
    return _APP_SESSION_PREFIX+id;
}




exports.uploadFile = async (ctx) => {
   let query = parseUploadData(ctx)
   let TokenData = await appsession.checkToken(query)
   if (!TokenData.err){
     let result = await uploadHandler.handleUpload(query)
     ctx.response.body = result
   } else {
     ctx.response.body = TokenData
   }
   cleanUploadFile(query)
}

exports.downloadFile = async (ctx) => {
  let query = parseDownloadData(ctx)
  let result = await downloadHandle.handleDownload(query)
  ctx.response.body = result.data;
  ctx.response.type = result.type;
}
function parseDownloadData(ctx) {
    var download = {};
    var req = ctx.request;
    try {
        var query = req.query;
        download.sessionId = query.sessionId;
        download.type = query.type;
        download.file = query.file;
        download.name = query.name;
        download.fileId = query.fileId;
    } catch (e) {
        console.log("parse request error", e);
        download.err = e;
    }
    return download;
}



function parseUploadData(ctx) {
    var req = ctx.request;
    var upload = {};
    try {
        var query = req.body;
        var urlQuery = req.query;
        upload.files = []
        for (var k in req.files){
          upload.files.push(req.files[k]) 
        }
        upload.type = query.type || urlQuery.type;
        upload.module = query.module || urlQuery.module;
        upload.Token = query.Token || urlQuery.Token;
        delete query.type;
        delete  urlQuery.type;
        delete query.sessionId;
        delete  urlQuery.sessionId;
        upload.data = query || urlQuery || {};
    } catch (e) {
        upload.err = e;
    }
    return upload;
}

function cleanUploadFile(upload) {
    if (upload.files) {
        try {
            fs.unlinkSync(upload.files[0].path);
            console.log("uploadFile:remove file[" + upload.files[0].path + "] success!")
        } catch (e) {
            console.log("remove file[" + upload.files[0].path + "] error!", e);
        }
    }
}

exports.adminAction = async (ctx) =>{
   var action = parseActionData(ctx.request, ctx);
   console.log(new Date() + ' admin请求参数:',action)
   if (action.err){
     ctx.response.body = action;
   } else {
     if (action.sessionId){
        var sessionData = await appsession.checkAdminSession(action.sessionId);
        if (!sessionData.err){
          var result = await adminHandle.handleAction(action, sessionData)
          if(result.err){
            ctx.response.body = {success: false,message:result.err}
          }else{
            ctx.response.body = result
          }
        }else if(sessionData.err && sessionData.err.sessionExpire){
          ctx.response.status = 401;
          ctx.response.body = {success:false,sessionExpire:true,message:'session sessionExpire'}
        }else{
          ctx.response.status = 401;
          ctx.response.body = {success: false,message:sessionData.err} 
        }
     } else if (action.name === 'login'){
        var callback = await appsession.adminLogin(action.data)
        ctx.response.body = callback;
     }
   }
}


exports.payAction = async (ctx) => {
  var payObj = parsePayData(ctx)
  if (payObj.result_code === 'SUCCESS') {
     var payResult = await payHandle.handleAction(payObj)
     if (!payResult.err) {
       ctx.response.type = 'application/xml'
       ctx.response.body = `<xml>
       <return_code><![CDATA[SUCCESS]]></return_code>
       <return_msg><![CDATA[OK]]></return_msg>
       </xml>`
     } else {
       console.log('内部订单错误：'+ err )
     }
  } 
}
exports.refoundAction = async (ctx) => {
   if (ctx.request.payBody.xml.result_code[0] === 'SUCCESS') {
     let req_info = ctx.request.payBody.xml.req_info[0]
     console.log(req_info)
     console.log('req_info=======')
     let aesDecryptInfo = crypto.aesDecryptInfo(req_info)
     console.log(aesDecryptInfo)
     console.log('aes=======')
     var payResult = await payHandle.refoundAction(aesDecryptInfo)
     if (!payResult.err) {
       ctx.response.type = 'application/xml'
       ctx.response.body = `<xml>
       <return_code><![CDATA[SUCCESS]]></return_code>
       <return_msg><![CDATA[OK]]></return_msg>
       </xml>`
      } else {
       console.log('内部订单错误：'+ err )
      }
   } 
}

function parsePayData(ctx) {
  var req = ctx.request;
  var payObj = {};
  try {
    var query = req.payBody.xml;
    payObj.result_code = query.result_code[0];
    payObj.sign = query.sign[0];
    payObj.out_trade_no = query.out_trade_no[0];
    payObj.openid = query.openid[0];
    payObj.time_end = query.time_end[0];
  } catch (e) {
    payObj.err = e;
  }
  return payObj;
}


exports.untilAction = async (ctx) => {
     var action = parseActionData(ctx.request,ctx);
     if (action.err){
        ctx.response.body = action;
     } else {
        if (action.sessionId){ 
            var sessionData = await appsession.checkSession(action.sessionId);
            if (!sessionData.err){
                var result = await actionHandle.handleAction(action, sessionData)
                if(result.err){
                    ctx.response.body = {success: false,message:result.err}
                }else{
                    ctx.response.body = result
                }
            }else if(sessionData.err && sessionData.err.sessionExpire){
               ctx.response.body = {success:false,sessionExpire:true,message:'session sessionExpire'}
            }else{
               ctx.response.body = {success: false,message:sessionData.err} 
            }
        } else if (action.name === 'login') {
           var callback = await appsession.login(action)
           ctx.response.status = 200
           ctx.response.body = callback
        } else if (action.name === 'until') {
           var callback = await appsession.login(action)
           ctx.response.status = 200
           ctx.response.body = callback
        } else {
           ctx.response.body = {success: false, message: 'sessionId not fond! action name is not fond'}
        }
     }
}

exports.mcAction = async(ctx) => {
  var action = parseActionData(ctx.request, ctx);
   console.log(new Date() + ' mc请求参数:',action)
   if (action.err){
     ctx.response.body = action;
   } else {
     if (action.sessionId){
        var sessionData = await appsession.checkMcSession(action.sessionId);
        if (!sessionData.err){
          var result = await mcHandle.handleAction(action, sessionData)
          if(result.err){
            ctx.response.body = {success: false,message:result.err}
          }else{
            ctx.response.body = result
          }
        }else if(sessionData.err && sessionData.err.sessionExpire){
          ctx.response.status = 401;
          ctx.response.body = {success:false,sessionExpire:true,message:'session sessionExpire'}
        }else{
          ctx.response.status = 401;
          ctx.response.body = {success: false,message:sessionData.err} 
        }
     } else if (action.name === 'login'){
        var callback = await appsession.mcLogin(action.data)
        ctx.response.body = callback;
     }
   }
}

