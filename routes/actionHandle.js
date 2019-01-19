var shopHandle = require(__baseDir+'/api/app/shop/shopHandle')
var untilHandle = require(__baseDir+'/api/until/untilHandle')
var userHandle = require(__baseDir+'/api/app/user/userHandle')
var activityHandle = require(__baseDir+'/api/app/activity/activityHandle')
var actions = {
   app:{
     shop: {
       buy: shopHandle.buy
     },
     until: {
       pay: untilHandle.pay 
     },
     user: {
       addAddress: userHandle.addAddress,
       getAddress: userHandle.getAddress,
       setUserInfo: userHandle.setUserInfo,
       confirmUser: userHandle.confirmUser
     },
     commodity: {
       getCommodity: shopHandle.getCommodity,
       getCommodityList: shopHandle.getCommodityList,
       getOrderList: shopHandle.getOrderList
     },
     activity: {
       getActivityInfo: activityHandle.getActivityInfo,
       partakeActivity: activityHandle.partakeActivity,
       getLikeUserList: activityHandle.getLikeUserList
     }
   }
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
               if (result.err){
                backResult.err = result.err;
               }
               resolve(backResult)
            });
          }catch(e){
            resolve({err:e, success: false})
          }
        } else {
            console.log('error:action is not fond')
            resolve({err:'action is not Fond', success: false})
        }
       } catch (e) {
            resolve({err: e, success: false})
       }
	})
}