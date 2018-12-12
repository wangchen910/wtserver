
const uuidv1 = require('uuid/v1');
const config = require(__baseDir+'/serverConfig')

const mongo = require(__baseDir+'/until/mongo')
exports.handleUpload = function(upload){
	return new Promise((resolve,reject)=>{
       var file = upload.files[0];
       var fileId = uuidv1()
       mongo.writeFileToDb(file.path,fileId,file.name,file.type,function(err,data){
                if(err){
                    resolve({err:err,success:false});
                }else{
                    // var result = {
                    //     filePath : file.path,
                    //     fileName : file.name,
                    //     fileId: fileId,
                    //     success:true
                    // };
                    var result = {
                        success: true,
                        url: config.imgUrl+fileId,
                        fileId: fileId,
                        fileName: file.name
                    }
                    resolve(result);
                }
            });
	})
}