
var activityHandle = require(__baseDir+'/api/app/activity/activityHandle')

var until = {
   getQrImage: activityHandle.getQrImage
}

exports.handleAction = function (action) {
	return new Promise(function(resolve, reject){
       try {
        var actionFun = eval('until.' + action.data.name);
        if (actionFun) {
          try{
             actionFun(action.data, function(result){
               resolve(result)
            });
          }catch(e){
            resolve({err:e})
          }
        } else {
            resolve({err:'action is not Fond'})
        }
       } catch (e) {
            resolve({err: e})
       }
	})
}
