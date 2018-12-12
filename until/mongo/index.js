
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var config = require(__baseDir+'/serverConfig')
var host = config.mongo.dbIp;
var port = config.mongo.dbPort;
var dbName = config.mongo.dbName;
var dbUsername = config.mongo.dbUserName;
var dbPassword = config.mongo.dbPassword;
var dbPoolSize = 50;


// var reportHost = config.reportDbIp;
// var reportPort = config.reportDbPort;
// var reportDbName = config.reportDbName;
// var reportDbUsername = config.reportDbUserName;
// var reportDbPassword = config.reportDbPassword;
// var reportDbPoolSize = 1;

var DBMaster = "db_master";
var dbClient;
var db = undefined;
var reportDb = undefined;
var server;
var connectedDb = {};
function DB() {
    if (db) {
        return;
    }
    var url = 'mongodb://'+dbUsername+':'+dbPassword+'@'+host+':'+port+'/'+dbName+'?authSource=admin&maxPoolSize='+dbPoolSize;
    MongoClient.connect(url,function(err, client) {
        if(err){
            console.log('connect db failed!'+err);
        }else{
            console.log("Connected correctly to server");
            db = client;
            //initDbConnects();
        }
    });
}

// function reportDB(){
//     if(reportDb){
//         return;
//     }
//     var reportUrl = 'mongodb://'+reportDbUsername+':'+reportDbPassword+'@'+reportHost+':'+reportPort+'/'+reportDbName+'?authSource=admin&maxPoolSize='+reportDbPoolSize;

//     MongoClient.connect(reportUrl,function(err, reportClient) {
//         if(err){
//             console.log('connect reportdb failed!'+err);
//         }else{
//             console.log("Connected reportDb correctly to server");
//             reportDb = reportClient;
//         }
//     });
// }

function initDbConnects(){
    if(!db){
        console.log('db is null! can not init dbConnects!!!!!');
    }else{
        db.collection(DBMaster).findOne({master_key:"db_status"},function(err,doc){
            if(!err){
                var dbs = doc.db_names;
                for(var i =0 ;i<dbs.length;i++){
                    initDB(dbs[i]);
                }
            }else{
                console.log("get db master conf error!");
                console.log(err.stack);
            }
        });
    }
}

function initDB(dbName){
    if(connectedDb[dbName]){
        return;
    }
    var opendb = db.db(dbName);
    connectedDb[dbName] = opendb;
    console.log("connected to db["+dbName+"] success!");
}


exports.connectDb = function () {
    if (!db) {
        DB();
        console.log("connecting to db ....");
        //platformDB();
        //console.log("connecting to platform db ....");
    }
}

exports.connectReportDb = function () {
    if (!reportDb) {
        reportDB();
        console.log("connecting to reportDb ....");
        //platformDB();
        //console.log("connecting to platform db ....");
    }
}

//exports.db = function(dbName){
//    if(dbName){
//        if(typeof dbName == 'string'){
//            return db.db(dbName);
//        }
//    }else{
//        return db;
//    }
//}

exports.reportDb = function(session){
    if(session){

    }else{
        return reportDb;
    }
}

exports.db = function(session){
    if(session){
        if(typeof session == 'object'){
            if(!connectedDb[session.account.dataDB]){
                console.log("dbAnalysisStart:" + JSON.stringify({aid:session._aid}));
                connectedDb[session.account.dataDB] = db.db(session.account.dataDB);
            }
            console.log("dbAnalysisEnd:" + JSON.stringify({aid:session._aid}));
            return connectedDb[session.account.dataDB];
        }else if(typeof session == 'string'){
            if(!connectedDb[session]){
                connectedDb[session] = db.db(session);
            }
            return connectedDb[session];
        }else{
            return db;
        }
    }else{
        return db;
    }
}

exports.writeFileToDb = function(filePath,fileId,fileName,type,callback){
    var db = module.exports.db("uploadFile");
    var gridStore = new mongodb.GridStore(db,fileId,fileName,"w",{metadata:{type:type,date:new Date().getTime()},w:1,fsync:true});
      gridStore.open((err,gridStore)=>{
        if(!err){
            gridStore.writeFile(filePath,function(err,doc){
                if(!err){
                    gridStore.close(function(err,data){
                        callback(err,data);
                    });
                }else{
                    callback(err);
                }
            });
        }else{
            callback(err);
        }
    });
}

exports.readFileFromDb = function(fileId,callback){
    var db = module.exports.db("uploadFile");
    var gridStore = new mongodb.GridStore(db,fileId,"","r");
    gridStore.open(function(err,gridStore){
        if(!err){
            gridStore.read(function(err,data){
                if(!err){
                    var info = {
                        _id:gridStore.fileId,
                        name : gridStore.filename
                    }
                    callback(err,data,info);
                }else{
                    callback(err);
                }
            });
        }else{
            callback(err);
        }
    });
}

exports.removeFileFromDb = function(fileId,callback){
    var db = module.exports.db("uploadFile");
    var gridStore = new mongodb.GridStore(db,fileId,"","r");
    gridStore.open(function(err,gridStore){
        if(!err){
            gridStore.unlink(function(err,result){
                if(!err){
                    callback(null);
                }else{
                    console.log('removeFile error:'+ fileId)
                    callback(err);
                }
            });
        }else{
            console.log('removeFile error:'+ fileId)
            callback(err);
        }
    });
}
