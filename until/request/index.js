var https = require('https')
var node_url = require('url')
var parseString = require('xml2js').parseString;

exports.get = function(url,callback){
	var data = ''
	https.get(url,function(res){
      res.on('data',function(d){
         data+=d;
      })
      res.on('end',function(){
         if (JSON.parse(data).errcode){
            callback(JSON.parse(data))
         }else {
            callback(null,JSON.parse(data))
         }
      })
    }).on('error',function(e){
      callback(e)
    })
}


exports.sendPost= function(url,data){
  console.log(url)
  try{
    var data = data;
    data = JSON.stringify(data);
    var opt = {
        method: "POST",
        host: node_url.parse(url).host,
        path: node_url.parse(url).path,
        headers: {
            "Content-Type": 'text/xml;charset=UTF-8',
            "Content-Length": data.length,
            "Accept": "text/xml;charset=UTF-8"
        }
    };
    var req = https.request(opt, function (res) {
        var body = ''
        res.on('data', function (data) {
            body+=data
        });
        res.on('end',function(err){
            if(!err){
                parseString(body,function(err,data){
                  if (!err){
                    console.log(data)
                    console.log('ddd')
                  }
                })
            }
        })
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
        callback('problem with request :' + e.message)
    });
    req.write(data);
    req.end();
  }catch(e){
    console.log(e)
  }
}
