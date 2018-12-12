var shopHandle = require(__baseDir+'/api/app/shop/shopHandle')
var untilHandle = require(__baseDir+'/api/until/untilHandle')
var userHandle = require(__baseDir+'/api/app/user/userHandle')

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
       getAddress: userHandle.getAddress
     },
     commodity: {
       getCommodity: shopHandle.getCommodity
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