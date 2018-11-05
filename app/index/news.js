/*
* 客服消息
* */

var crypto=require('crypto');
var sha1 = crypto.createHash("sha1");
var request=require('../until/request');


exports.getNews=function(req,res){
    if (req.body.data) {
        //能正确解析 json 格式的post参数
       var jsonStr=req.body.data;
    } else {
        //不能正确解析json 格式的post参数
        var body = '', jsonStr;
        req.on('data', function (chunk) {
            body += chunk; //读取参数流转化为字符串
        });
        req.on('end', function () {
            //读取参数流结束后将转化的body字符串解析成 JSON 格式
            try {
                jsonStr = JSON.parse(body);
            } catch (err) {
                jsonStr = null;
            }
            request.getAccessToken(function(e){
                if(!e.error){
                    console.log(e);
                    console.log('_____accessToken______')
                    //发送消息
                    var sendObj;
                    switch(jsonStr.Content){
                        case '图片':
                               sendObj={
                                "touser":jsonStr.FromUserName,
                                "msgtype":"image",
                                "image":
                                {
                                    "media_id":"_4fNya01LTQHwDKR34VnoZEoGj6-JuRYi3WjIMCNjs-Sz_qmFR6OE5g9bDn0_L9v"
                                }
                            };
                            break;
                        case '图文':
                            sendObj={
                                "touser": jsonStr.FromUserName,
                                "msgtype": "link",
                                "link": {
                                    "title": "Hello World",
                                    "description": "Is Really A Happy Day",
                                    "url": "http://mp.weixin.qq.com/s/pW28pwCOzfG0o1Q4ksmQCw",
                                    "thumb_url": "_4fNya01LTQHwDKR34VnoZEoGj6-JuRYi3WjIMCNjs-Sz_qmFR6OE5g9bDn0_L9v",
                                    "thumb_media_id":"_4fNya01LTQHwDKR34VnoZEoGj6-JuRYi3WjIMCNjs-Sz_qmFR6OE5g9bDn0_L9v"
                                }
                            };
                            break;
                        case '卡片':
                            sendObj={
                                "touser":jsonStr.FromUserName,
                                "msgtype":"miniprogrampage",
                                "miniprogrampage":{
                                    "title":"title",
                                    "pagepath":"pages/index/index",
                                    "thumb_media_id":"_4fNya01LTQHwDKR34VnoZEoGj6-JuRYi3WjIMCNjs-Sz_qmFR6OE5g9bDn0_L9v"
                                }
                            };
                            break;
                        default:
                            sendObj={
                                "touser":jsonStr.FromUserName,
                                "msgtype":"text",
                                "text":
                                {
                                    "content":"Hello World"
                                }
                            };
                    }
                    request.setNews({ACCESS_TOKEN:e,data:sendObj},function(data){
                        console.log(data);
                    })
                }else{
                    console.log(e);
                }
            })
        })
    }
   res.send('success');
}
    // if(data.MsgType=='event'){
    //     //获取accesstoken 用户发送消息；
    //     request.getAccessToken(function(e){
    //         if(!e.error){
    //             //发送消息
    //             request.setNews({ACCESS_TOKEN:e,data:{
    //                 "touser":data.FromUserName,
    //                 "msgtype":"text",
    //                 "text":
    //                 {
    //                     "content":"Hello World"
    //                 }
    //             }},function(data){
    //                 res.send(true);
    //                 console.log(data);
    //                 console.log('###########################');
    //             })
    //         }else{
    //             res.send(true);
    //         }
    //     })
    // }else{
    //     res.send(true);
    // }
/*
* 客服接口验证程序
* */
// var timestamp = data['timestamp'];
// var nonce     = data['nonce'];
// var token     = 'wangtao';
// var signature=data["signature"];
// var arr=[timestamp,nonce,token];
// var objStr=arr.sort().join('');
// sha1.update(objStr);
// var myStr=sha1.digest('hex');
// if(myStr==signature){
//     res.send(data.echostr);
// }