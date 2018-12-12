
const mongo = require(__baseDir+'/until/mongo')
const mime = require('mime')

exports.handleDownload = function (download) {
    if (download.fileId) {
        return downloadNormalFile(download);
    }

}

function  downloadNormalFile(download) {
    return new Promise((resolve,reject)=>{
    try {
        var fileId = download.fileId;
        mongo.readFileFromDb(fileId, function (err, data, info) {
            if (!err) {
                var filename = info.name;
                var mimetype = mime.getType(filename);       //匹配文件格式
                resolve({
                    type:mimetype,
                    data:data,
                    filename: info.name
                })
//                res.jsonp(data.toString());
            } else {
                console.log(err)
                resolve({
                    success: false,
                    err: err
                });
            }
        });
    } catch (e) {
        resolve({
            success: false,
            err: e
        });
    }

    })
}