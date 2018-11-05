var https=require('https');
var config=require('../config/appConfig');
var appId=config.appid;
var secret=config.secret;
var url='https://api.weixin.qq.com/sns/jscode2session?appid='+appId+'&secret='+secret+'&js_code=JSCODE&grant_type=authorization_code';

module.exports=function(){
    // https.get(url,function(res){
    //     console.log('状态码：', res.statusCode);
    //     console.log('请求头：', res.headers);
    //     res.on('data', (d) => {
    //         process.stdout.write(d);
    // });
    // }).on('error',function(e){
    //     console.log(e);
    // })
}