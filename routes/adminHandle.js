var adminHandle = require(__baseDir+'/api/app/admin/adminHandle')
var adminOrderHandle = require(__baseDir+'/api/app/admin/adminOrderHandle')
var adminActivityHandle = require(__baseDir+'api/app/admin/adminActivityHandle')
var actions = {
   commodity: {
     getCommodityList: adminHandle.getCommodityList,
     addCommodity: adminHandle.addCommodity,
     removeCommodity: adminHandle.removeCommodity,
     removeImage: adminHandle.removeImage
   },
   order: {
     getOrderList: adminOrderHandle.getOrderList
   },
   activity: adminActivityHandle.getActivityList
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