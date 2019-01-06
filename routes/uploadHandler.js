
const uuidv1 = require('uuid/v1');
const config = require(__baseDir+'/serverConfig')

const mongo = require(__baseDir+'/until/mongo')
const node_request = require('request')
const fs = require('fs')
const cheerio = require('cheerio')
exports.handleUpload = function(upload) {
   return new Promise((resolve,reject)=>{
    var file = upload.files[0];
    var r = node_request.post({url:'http://img.beijixiong.club:4869/upload'}, function optionalCallback(err, httpResponse, body) {
        // console.log(httpResponse)
        const $ = cheerio.load(body)
        let str = $('h1').html()
        console.log(str.split(':')[0])
        if (str.split(':')[0] != 'MD5') { 
           resolve({err:'upload err',success:false});
        } else { 
           var md5 = str.split(':')[1].replace(/\s/, '');
           console.log(md5)
           console.log('^^^^^^^^^^^^6')
           resolve({success: true, md5: md5})
        }
    })
     var form = r.form();
     form.append('userfile', fs.createReadStream(upload.files[0].path), {filename: 'unicycle.jpg'});
})  
}
exports.handleUpload1 = function(upload){
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