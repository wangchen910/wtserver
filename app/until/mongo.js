var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
/*数据库连接信息host,port,user,pwd*/
var db_name = 'xiangning'; //数据库名称
var db_host = '117.78.45.173'; //数据库地址
var db_port = '27017'; // 数据库端口
var username = 'xiangning'; //用户AK
var password = 'xiangningpass'; //用户SK
var config=require('../config/appConfig');

var db = new Db(db_name, new Server(db_host, db_port, {}), {
    w: 1
});

//启动时建立连接
db.open(function(err, db) {
    db.authenticate(username, password, function(err, result) {
        if (err) {
            db.close();
            console.log('mongo Authenticate failed!');
            return;
        }
        console.log("open db");
    });
});



exports.collection=function(test){
    var test=test||config.mongoDbName;
    return db.collection(test,function(err,client){
        if(err){
            console.log('数据库错误');
            console.log(err);
        }else{
            console.log('连接成功');
            return client;   
        }
    });
}








