var https=require('https');
var config=require('../config/appConfig');
var node_url = require('url');
var qs = require('querystring');
var genUrl=require('../../conurl').url;
var fs = require('fs')
exports.setNews=function(data,callback){
    var ACCESS_TOKEN=data.ACCESS_TOKEN;
    var setData=data.data;
    setData=JSON.stringify(setData);
    var options={
        host:'api.weixin.qq.com',
        method:'POST',
        path:'/cgi-bin/message/custom/send?access_token='+ACCESS_TOKEN,
        headers: {
            "Content-Type": 'application/application/x-www-form-urlencoded',
            "Content-Length": Buffer.byteLength(setData)
        }
    }
    var req = https.request(options,function(res){
        var body='';
        res.on('data',function(d){
            body+=d;
        }).on('end',function(){
          callback(JSON.parse(body));  
        })
    });

    req.on('error', function(e){
        callback({error:true,message:e});
    });
    req.write(setData);
    req.end();
}


exports.getAccessToken=function(callback){
    var url='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+config.appid+'&secret='+config.secret+'';
    var req=https.get(url,function(res){
        var body='';
        res.on('data',function(d){
            body+=d;
        }).on('end',function(){
            body=JSON.parse(body);
            if(body.access_token){
                callback(body.access_token);
            }else{
                callback({error:true,meg:body.errcode});
            }
        })
    }).on('error',function(e){
        console.log(e);
    })
    req.end();
}

exports.sendPost=function(data,url,callback,type){
    var data = data;
    data = JSON.stringify(data);
    console.log(node_url.parse(url))
    var opt = {
        method: "POST",
        host: node_url.parse(url).host,
        path: node_url.parse(url).path,
        headers: {
            "Content-Type": 'application/json',
            "Content-Length": data.length
        }
    };

    var req = https.request(opt, function (res) {
        var body = ''
        if (type === 'image'){
          res.setEncoding("base64");
        }
        var writeStream = fs.createWriteStream(genUrl+'/public/server.jpg');
        res.on('data', function (data) {
            body+=data
            writeStream.write(data)
        });
        res.on('end',function(err){
            writeStream.end();
            if(!err){
                if (type ==='image'){
                    body ='data:'+res.headers['content-type']+';base64,'+body;
                    callback(null,body)
                }else{
                    callback(null,config.serverUrl+'server.jpg')
                }
            }
        })
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        callback('problem with request :' + e.message)
    });
    req.write(data);
    req.end();
}