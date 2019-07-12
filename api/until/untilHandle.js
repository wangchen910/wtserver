const pay = require(__baseDir+'/until/pay')
const path = require('path')
const mongo = require(__baseDir+'/until/mongo')
const fields = require(__baseDir+'/api/common/fields')
const url = require('url')
const node_request = require('request')
const config = require(__baseDir+'/serverConfig')
const querystring = require('querystring');
const rediscli = require(path.join(__baseDir+'/until/redis')).connect
const md5cipher = require(path.join(__baseDir + '/until/crypto')).cipher
const lineHandle = require(__baseDir+'/api/app/line/lineHandle')
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
           orderObj.type = action.type
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

// exports.bookingPay = async function(action, session, callback){
//   if (!action.ip || !action.fee || !action.body){
//     return callback({success: true, message:'缺少参数'})
//   }else{
//     action.openId = session.openId
//       let payObj = await pay.pay(action)
//       if (!payObj.err) {
//          //下单程序
//          var orderObj = {}
//          orderObj.fee = action.fee
//          orderObj.body = action.body
//          orderObj.commodityId = action.commodityId
//          orderObj.out_trade_no = payObj.out_trade_no
//          orderObj.address = action.address
//          orderObj.userId = action.openId
//          orderObj.type = action.type
//          let order = await exports.produceOrder(orderObj)
//          if (!order.err) {
//            callback({success:true,data:payObj})
//          } else {
//            console.log('payError: 生成订单错误'+ order.err)  
//            callback({success:false,message:'生成订单错误'})
//          }
//       } else {
//         console.log('payError: 预下单错误'+ payObj.err)  
//         callback({success:false, message: '预下单错误'})
//       }
//   }
// }

exports.bookingPay = async function(action, session, callback){
  if (!action.ip || !action.fee || !action.body || !action.type){
    return callback({success: true, message:'缺少参数'})
  }else{
      action.openId = session.openId
      let handleOrder = await exports.handleOrder(action)
      if (!handleOrder.success) {
        return callback({success: false, message: '下单错误', data: {notEnough: true}})
      }
      let payObj = await pay.pay(action)
      if (!payObj.err) {
         //下单程序
         var orderObj = {}
         orderObj.fee = action.fee
         orderObj.body = action.body
         orderObj.lineId = action.lineId
         orderObj.out_trade_no = payObj.out_trade_no
         orderObj.userId = action.openId
         orderObj.type = action.type
         orderObj.phone = action.phone
         orderObj.name = action.name
         orderObj.riderList = action.riderList
         orderObj.formId = action.formId
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

exports.refund = async function (action, session, callback) {
  let orderInfo = action.orderInfo
  let lineInfo = orderInfo.line_info[0]
  console.log(orderInfo)
  let gl = CalculateThePrice(lineInfo.departureTime)
  if (!gl) {
    callback({success: true, data: {Obsolete: true}})
    return   
  }
  console.log(gl, 'gl============')
  let refundObj = {
    fee: orderInfo.fee,
    out_trade_no: orderInfo.out_trade_no,
    proportion: gl
  }
  let refundBackObj = await pay.refund(refundObj)
  if (refundBackObj.xml && refundBackObj.xml.return_code && refundBackObj.xml.return_code[0] === 'SUCCESS') {
    lineHandle.refoundUpdateOrder(orderInfo)
  }
  callback({success: true, data: refundBackObj})
}
/*
*产生订单
*/
exports.produceOrder = async function(obj) {
   return new Promise((resolve, reject) => {
     var query = {}
     query = obj
     mongo.db(fields.DEFAULT_DB).collection(fields.ORDER).insert(query,function(err){
       if (!err) {
         resolve({success:true})
       } else {
         console.log('appError: produceOrder:'+ err)
         resolve({success: false, err: err})
       }
     })
   }) 
}
// 处理订单业务 根据type 处理订单业务
exports.handleOrder = async function(action) {
  return new Promise((resolve, reject) => {
    if (action.type === 'ticket') {
      let result = lineHandle.handleOrder(action)
      resolve(result)
    } else {
      resolve(true)
    }
  }) 
}
/*
* 删除图片
* 参数
* 参数类型 Object
* {url: 图片地址}
*
* */
exports.removeImage = async function(action) {
  return new Promise((resolve, reject) => {
    let parse = url.parse(action.url)
    let md5 = parse.path.replace(/\//,'');
    var imgUrl = 'http://'+parse.host + '/admin?md5='+md5+'&t=1'
    node_request
    .get(imgUrl)
    .on('response', function(response) {
      console.log(response.statusCode) // 200
      console.log('imageDeleteSuccess: '+ md5)
      if (response.statusCode === 200) {
        resolve({success: true, message: 'delSuccess'})
      } else {
        resolve({success: false, message: response.statusCode})
      }
    })
  })
}


exports.getAccessToken = async function(){
  return new Promise((resolve, reject) => {
    rediscli.getClient().get(access_token(),function(err,res){
        if(err || !res){
          if (err) {
            console.log('redis error:' + err)
            return
          }
          var accessUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+config.appId+'&secret='+config.secret;
          node_request(accessUrl, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              var bodyData = JSON.parse(body);
              if (bodyData.expires_in === 7200){
                console.log(bodyData)
                console.log('bodyData')
                rediscli.getClient().set(access_token(), bodyData.access_token, function(err,res){
                  if(!err){
                    rediscli.getClient().expire(access_token(), 60*60);
                    resolve(bodyData.access_token)
                  }else{
                    console.log('getAccessToken error:'+ err)
                  }
                })
              }
            } else {
              console.log('getAccessToken error:'+ error)
            }
          });
        } else {
           resolve(res)
        }
    });
  })
}

function access_token () {
  return 'access_token.'+fields.DEFAULT_DB
}

exports.getQrImage = async function(obj){
  var type = obj.type;
  var sceneObj = await exports.setScene(obj)
  var access_token = await exports.getAccessToken();
  var qrUrl = 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token='+access_token
  var page = 'pages/home/index'
  if (type === 'activity') {
    page = 'pages/activity/index'
  }
  return new Promise((resolve, reject)=>{
    if (sceneObj.success){
      var scene = sceneObj.scene
      node_request({
        url: qrUrl,
        method: "POST",
        encoding: null,
        json: true,
        headers: {
          "content-type": "application/json"
        },
        body: {
          "width": 100,
          "scene": scene,
          "page": page
        }
      }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var base64 = 'data:image/png;base64,'+body.toString('base64')
          resolve(base64)
        }
      });  
    }    
  }) 
}




exports.setScene = async function(obj){
  var scene = md5cipher(obj.scene)
  var query = {}
  query.id = scene;
  delete obj.ip;
  delete obj.scene;
  return new Promise((resolve, reject)=>{
    mongo.db(fields.DEFAULT_DB).collection(fields.SCENE).findOne(query,function(err, data){
       if (!err) {
         if (data) {
           resolve({success:true, scene: scene})
         } else {
           var insertData = obj;
           insertData.id = scene;
           mongo.db(fields.DEFAULT_DB).collection(fields.SCENE).insert(insertData, function(err){
             if (!err) {
               resolve({success: true, scene: scene})
             } else {
               console.log('appError: setScene:'+ err)
               resolve({success: false})
             }
           })       
         }
       } else {
         console.log('appError: setScene:'+ err)
         resolve({success: false})
       }
     })
  })
}

exports.getSceneData = async function(scene){
  var query = {}
  query.id = scene;
  return new Promise((resolve, reject)=>{
    mongo.db(fields.DEFAULT_DB).collection(fields.SCENE).findOne(query,function(err, data){
       if (!err && data) {
         resolve({success: true, data: data})
       } else {
         console.log('appError: getScene:'+ err)
         resolve({success: false})
       }
     })
  })
}


exports.collectFormId = function(formId){
  var query = {}
  query.formId = formId;
  mongo.db(fields.DEFAULT_DB).collection(fields.FORMID).insert(query)
}


exports.sendMessage = async function (formId, openId) {
  var access_token = await exports.getAccessToken();
  var qrUrl = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/uniform_send?access_token='+access_token
  var page = 'pages/home/index'
  return new Promise((resolve, reject)=>{
      node_request({
        url: qrUrl,
        method: "POST",
        encoding: null,
        json: true,
        headers: {
          "content-type": "application/json"
        },
        body: {
          "touser": openId,
          "weapp_template_msg":{
              "template_id":"C_f-0HBf_VqmFTSQwpS5r_NCKKZ5-tEo6rQLagb1svI",
              "page":"pages/OrderList/index",
              "form_id": formId,
              "data":{
                  "keyword1":{
                      "value":"339208499"
                  },
                  "keyword2":{
                      "value":"2015年01月05日 12:30"
                  },
                  "keyword3":{
                      "value":"腾讯微信总部"
                  },
                  "keyword4":{
                      "value":"广州市海珠区新港中路397号"
                  }
              },
              "emphasis_keyword":"keyword1.DATA"
          }
      }
      }, function(error, response, body) {
        console.log(body)
      })
    })
}
// 3060f53c900649ec966f78fa2867224f
// 6ddbf77ec5524561a6a5c0b6a0366187
// 6387f8d6d72441fc9354dc5f67a0d4bc

// setTimeout(function(){
//   exports.sendMessage('6387f8d6d72441fc9354dc5f67a0d4bc', 'olsQQ5Q_GZVREHsZnNoXCHCbFHug')
// }, 5000)

function CalculateThePrice(time) {
  let departureTime = time.split(' ')[0]
  let date = departureTime ? new Date(departureTime) :new Date()
  let date1 = new Date();
  let timp = (date - date1)/1000/60/60/24
  let gl = 0
  if (timp < 0) {
    gl = 0
  } else if (0 <= timp && timp < 1) {
    gl = 0.5
  } else if ( 1 <= timp && timp<= 2) {
    gl = 0.7
  } else if (2 < timp) {
    gl = 0.85
  }
  return gl
}
