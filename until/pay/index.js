var md5 = require(__baseDir+'/until/crypto').cipher
const stringRandom = require('string-random')//获取随机数
const config = require(__baseDir+'/serverConfig.js')
const request = require(__baseDir+'/until/request')
const node_request = require('request')
const parseString = require('xml2js').parseString //转xml 为JSON对象
const fs = require('fs')

exports.pay = function(obj, callback){
  /*
  *obj
  * 参数名
  *body: '商品描述' String
  *fee: '钱' Number 元
  *openId: 小程序用户openId String
  **/  
  return new Promise(function(resolve, reject){
  try{
    var body = obj.body; // 商品描述
    var total_fee = (obj.fee*100).toString(); // 订单价格 单位是 分
    var notify_url = config.pay.notify_url // 支付成功的回调地址  可访问 不带参数
    var nonce_str = stringRandom(16, {numbers: false});; // 随机字符串
    var out_trade_no = getWxPayOrdrID(); // 商户订单号
    var timestamp = Math.round(new Date().getTime()/1000); // 当前时间
    var spbill_create_ip = obj.ip;
    var bodyData = '<xml>';
    bodyData += '<appid>' + config.appId + '</appid>';  // 小程序ID
    bodyData += '<body>' + body + '</body>'; // 商品描述
    bodyData += '<mch_id>' + config.pay.mch_id + '</mch_id>'; // 商户号
    bodyData += '<nonce_str>' + nonce_str + '</nonce_str>'; // 随机字符串
    bodyData += '<notify_url>' + notify_url + '</notify_url>'; // 支付成功的回调地址 
    bodyData += '<openid>' + obj.openId + '</openid>'; // 用户标识
    bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>'; // 商户订单号
    bodyData += '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>'; // 终端IP
    bodyData += '<total_fee>' + total_fee + '</total_fee>'; // 总金额 单位为分
    bodyData += '<trade_type>JSAPI</trade_type>'; // 交易类型 小程序取值如下：JSAPI  
    // 签名
    var sign = paysignjsapi(
        config.appId,
        body, 
        config.pay.mch_id, 
        nonce_str,
        notify_url, 
        obj.openId, 
        out_trade_no, 
        spbill_create_ip, 
        total_fee
    );
    bodyData += '<sign>' + sign + '</sign>';
    bodyData += '</xml>';
    var url = 'https://api.mch.weixin.qq.com/pay/unifiedorder'
    node_request({
      url:url,
      method: 'POST',
      body: bodyData
    },function(err, response, body){
       parseString(body,function(err,body){
         if(!err){
           var payResult = {}
           payResult.out_trade_no = out_trade_no;
           payResult.nonceStr = body.xml.nonce_str[0]
           payResult.timeStamp = timestamp.toString();
           payResult.package = 'prepay_id=' + body.xml.prepay_id[0];
           payResult.signType = 'MD5'
           payResult.paySign = paysignjs(config.appId, payResult.nonceStr, payResult.package, 'MD5',timestamp)
           resolve(payResult)
         } else {
            resolve({err: err})
         }
       })
    })
    }catch(e){
      resolve({err: e})
    }
   })
}
exports.refund = function(obj) {
    /**obj
     * total_fee 订单金额
     * out_trade_no 订单号
     */
    return new Promise(function(resolve, reject){
        try{
          var total_fee = (obj.fee*100).toString(); // 订单价格 单位是 分
          var settlement_refund_fee = (obj.fee*100).toString()
          var refound_fee = (obj.fee*100).toString()
          var nonce_str = stringRandom(16, {numbers: false}) // 随机字符串
          var notify_url = config.pay.refound_notify_url
          // var out_trade_no = getWxPayOrdrID(); // 商户订单号
          // var timestamp = Math.round(new Date().getTime()/1000); // 当前时间
          var bodyData = '<xml>';
          bodyData += '<appid>' + config.appId + '</appid>';  // 小程序ID
          bodyData += '<mch_id>' + config.pay.mch_id + '</mch_id>'; // 商户号
          bodyData += '<nonce_str>' + nonce_str + '</nonce_str>'; // 随机字符串
          bodyData += '<out_trade_no>' + obj.out_trade_no + '</out_trade_no>'; // 商户订单号
          bodyData += '<notify_url>' + notify_url + '</notify_url>';
          bodyData += '<total_fee>' + total_fee + '</total_fee>'; // 总金额 单位为分
          bodyData += '<refund_fee>' + refound_fee + '</refund_fee>'; // 总金额 单位为分 out_refund_no
          bodyData += '<out_refund_no>' + obj.out_trade_no + '</out_refund_no>';
          // 签名
          var sign = refundjsapi(
              config.appId,
              config.pay.mch_id, 
              nonce_str,  
              obj.out_trade_no, 
              total_fee,
              refound_fee,
              obj.out_trade_no,
              notify_url
          );
          bodyData += '<sign>' + sign + '</sign>';
          bodyData += '</xml>';
          var url = 'https://api.mch.weixin.qq.com/secapi/pay/refund'
          node_request({
            url:url,
            method: 'POST',
            body: bodyData,
            agentOptions: {
                pfx: fs.readFileSync('./apiclient_cert.p12'), //微信商户平台证书,
                passphrase: config.pay.mch_id // 商家id
            }
          },function(err, response, body){
             parseString(body,function(err,body){
               if(!err){
                 resolve(body)
               } else {
                  resolve({err: err})
               }
             })
          })
          }catch(e){
            resolve({err: e})
          }
         })
}
//生成订单号
function getWxPayOrdrID(){
        var myDate = new Date();
        var year = myDate.getFullYear();
        var mouth = myDate.getMonth() + 1;
        var day = myDate.getDate();
        var hour = myDate.getHours();
        var minute = myDate.getMinutes();
        var second = myDate.getSeconds();
        var msecond = myDate.getMilliseconds(); //获取当前毫秒数(0-999)
        if(mouth < 10){ /*月份小于10  就在前面加个0*/
            mouth = String(String(0) + String(mouth));
        }
        if(day < 10){ /*日期小于10  就在前面加个0*/
            day = String(String(0) + String(day));
        }
        if(hour < 10){ /*时小于10  就在前面加个0*/
            hour = String(String(0) + String(hour));
        }
        if(minute < 10){ /*分小于10  就在前面加个0*/
            minute = String(String(0) + String(minute));
        }
        if(second < 10){ /*秒小于10  就在前面加个0*/
            second = String(String(0) + String(second));
        }
        if (msecond < 10) {
            msecond = String(String(00) + String(second));
        } else if(msecond >= 10 && msecond < 100){
            msecond = String(String(0) + String(second));
        }

        var currentDate = String(year) + String(mouth) + String(day) + String(hour) + String(minute) + String(second) + String(msecond);
        return currentDate;
    }

//生成统一下单签名
function paysignjsapi(appid,body,mch_id,nonce_str,notify_url,openid,out_trade_no,spbill_create_ip,total_fee) {
    var ret = {
        appid: appid,
        body: body,
        mch_id: mch_id,
        nonce_str: nonce_str,
        notify_url:notify_url,
        openid:openid,
        out_trade_no:out_trade_no,
        spbill_create_ip:spbill_create_ip,
        total_fee:total_fee,
        trade_type: 'JSAPI'
    };
    var str = raw(ret);
    str = str + '&key='+config.pay.pay_key;
    var md5Str = md5(str)
    md5Str = md5Str.toUpperCase();
    return md5Str;
};
// 退款签名
function refundjsapi (appid, mch_id, nonce_str, out_trade_no, total_fee, refund_fee,out_refund_no, notify_url) {
    var ret = {
        appid: appid,
        mch_id: mch_id,
        nonce_str: nonce_str,
        out_trade_no:out_trade_no,
        total_fee:total_fee,
        refund_fee:refund_fee,
        out_refund_no: out_refund_no,
        notify_url: notify_url
    };
    var str = raw(ret);
    str = str + '&key='+config.pay.pay_key;
    var md5Str = md5(str)
    md5Str = md5Str.toUpperCase();
    return md5Str;
}

function raw1(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function(key) {
        newArgs[key] = args[key];
    });

    var str = '';
    for(var k in newArgs) {
        str += '&' + k + '=' + newArgs[k];
    }
    str = str.substr(1);
    return str;
};
//生成小程序端签名
function paysignjs(appid, nonceStr, package, signType, timeStamp) {
    var ret = {
        appId: appid,
        nonceStr: nonceStr,
        package: package,
        signType: signType,
        timeStamp: timeStamp
    };
    var str = raw1(ret);
    str = str + '&key='+config.pay.pay_key;
    return md5(str)
};
function raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort(); 
    var newArgs = {};
    keys.forEach(function(key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var str = '';
    for(var k in newArgs) {
        str += '&' + k + '=' + newArgs[k];
    }
    str = str.substr(1);
    return str;
};