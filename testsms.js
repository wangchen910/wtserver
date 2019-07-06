var QcloudSms = require("qcloudsms_js");

// 短信应用SDK AppID
var appid = 1400229179;  // SDK AppID是1400开头

// 短信应用SDK AppKey
var appkey = "b868402f74ee285c20944148f204bf00";

// 需要发送短信的手机号码
var phoneNumbers = ["13934691550", "15735801586"];

// 短信模板ID，需要在短信应用中申请
var templateId = 367428;  // NOTE: 这里的模板ID`7839`只是一个示例，真实的模板ID需要在短信控制台中申请

// 签名
var smsSign = "么么校园";  // NOTE: 这里的签名只是示例，请使用真实的已申请的签名, 签名参数使用的是`签名内容`，而不是`签名ID`

// 实例化QcloudSms
var qcloudsms = QcloudSms(appid, appkey);
var smsType = 0;  // Enum{0: 普通短信, 1: 营销短信}
var msender = qcloudsms.SmsMultiSender();
var params = ["发车时间测试", "发车地点", "8888"]


// 设置请求回调处理, 这里只是演示，用户需要自定义相应处理回调
let callback = function (err, res, resData) {
    if (err) {
        console.log("err: ", err);
    } else {
        console.log("request data: ", res.req);
        console.log("response data: ", resData);
    }
}

msender.sendWithParam("86", phoneNumbers, templateId, params, smsSign, '', '', callback);