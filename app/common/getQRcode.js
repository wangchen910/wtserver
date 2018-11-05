var https=require('https');
var fs=require('fs');
var config=require('../config/appConfig');
var genUrl=require('../../conurl').url;
var until = require('../until/request')
exports.getQRcode=function(data,callback){
    var url=getUrl(config.appid,config.secret);
    getRequest(url,function(re){
        // if(re.access_token){
        //   delete data.sessionId;
        //   postRequest(re.access_token,data,function(e){
        //       callback(e);
        //   })
        // }else{
        //     callback({message:'获取token失败'});
        // }
        callback(re);
    })

}
exports.getQRA=function(data,callback){
    var result = {success:false}
    until.getAccessToken(function(token){
        var url ="https://api.weixin.qq.com/wxa/getwxacode?access_token="+token
        until.sendPost(data,url,function(err,e){
            if (!err) {
                result.success = true
                result.data = e;
                result.message = 'getQR success!'
                result.url = url;
                callback(result)
            }else{
                result.message = err
                callback(result)
            }
        })
    })
}
exports.getQR=function(data,callback){
    var result = {success:false}
    delete data.sessionId
    until.getAccessToken(function(token){
        var url ="https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token="+token
        until.sendPost(data,url,function(err,e){
            if (!err) {
              result.success = true
              result.data = e;
              result.message = 'getQR success !'
              result.url = url;
              result.sendData = data;
              callback(result)
            }else{
              result.message = err
              callback(result)
            }
        },"image")
    })
}
exports.getQRUrl=function(data,callback){
    var result = {success:false}
    delete data.sessionId
    until.getAccessToken(function(token){
        var url ="https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token="+token
        until.sendPost(data,url,function(err,e){
            if (!err) {
                result.success = true
                result.data = e;
                result.message = 'getQR success !!'
                result.url = url;
                result.sendData = data;
                callback(result)
            }else{
                result.message = err
                callback(result)
            }
        })
    })
}

function getUrl(appid,secret){
  return "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+appid+"&secret="+secret
    ;
}


function getRequest(url,callback){
    https.get(url, function(res){
        var statusCode = res;
        var contentType = res.headers['content-type'];
        res.setEncoding('utf8');
        var rawData = '';
        res.on('data', function(chunk){ rawData += chunk; });
        res.on('end', function(){
            try {
                var parsedData = JSON.parse(rawData);
                callback(parsedData);
            }catch (e) {
                console.log('http请求报错');
                console.error(e.message);
            }
        });
    }).on('error', function(e){
        console.error("报错");
    });
}


function postRequest(token,data,callback){
    var data = data;
    data = JSON.stringify(data);
    var opt = {
        method: "POST",
        host: "api.weixin.qq.com",
        path: "/wxa/getwxacodeunlimit?access_token="+token,
        headers: {
            "Content-Type": 'application/json',
            "Content-Length": data.length
        }
    };

    var req = https.request(opt, function (res) {
        console.log(process.cwd()+'/public');
        console.log(genUrl);
        console.log('&&&&&&&&&&&&&&');
        var writeStream = fs.createWriteStream(genUrl+'/public');
        res.on('data', function (data) {
            writeStream.write(data);
        });
        res.on('end',function(err){
            if(!err){
                writeStream.end();
                callback({imgUrl:config.serverUrl+'bb.jpg'})
            }
        })
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req.write(data);
    req.end();
}