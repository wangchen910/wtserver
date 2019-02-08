var mcHandle = require(__baseDir+'/api/app/mc/mcHandle')
var actions = {
   qrValidate: mcHandle.qrValidate,
   getLoginState: mcHandle.getLoginState,
   getActivityList: mcHandle.getActivityList,
   getUserList: mcHandle.getUserList
}


exports.handleAction = function (action, session) {
	return new Promise(function(resolve, reject){
       try {
        var actionFun = eval('actions.' + action.name);
        if (actionFun) {
          try{
             actionFun(action.data, session, function(result){
               let backResult = {}
               backResult.success = result.success || false;
               backResult.message = result.success ? result.message || '200 ok!' : result.message || 'unknow error!';
               backResult.data = result.data
               resolve(backResult)
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