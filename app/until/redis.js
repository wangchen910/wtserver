var redis = require('redis');
/*数据库连接信息host,port,user,pwd,dbname(可查询数据库详情页)*/
var username = '6b41aef9514d4c54b027528c79443047';  //用户AK
var password = 'beijixiong';  //用户SK
var db_host = '117.78.45.173';
var db_port = 6378;
var db_name = 'HSOFcByFjKCoeaxNYPXR';   //数据库名称
console.log(db_host);
console.log(db_port);
var options = {"no_ready_check":true};

var client = redis.createClient(db_port, db_host, options);

client.on("error", function (err) {
    console.log("Error " + err);
});

client.auth(password, function(data){
    console.log('REDIS AUTH' + data)
});

function set(key,value,call){
    client.set(key,value);
    call(key);
}

function expire(key,value){
    client.expire(key,1);
}

function get(key,call){
    client.get(key,function(err,result){
        console.log(result);
        console.log('验证session!!!!!');
        if(err){
            console.log('redis get err!');
            console.log(err);
            return;
        }
        if(result){
            var data={};
            data.session=true;
            data.session_key=result.split('-')[0];
            data.openid=result.split('-')[1];
            call(data);   
        }else{
            console.log('session not found session is not found')
            call({session:false,message:'session is not found'});
        }
    })
}

module.exports = {
    get:get,
    set:set,
    expire:expire
};