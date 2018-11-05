var indexHandle=require('./app/index/index.js');
var loginHandle=require('./app/index/login');
var userHandle=require('./app/index/user');
var commonHandle=require('./app/common/getQRcode');
var newsHandle=require('./app/index/news');
var telbookHandle=require('./app/index/telbook');
var priceHandle=require('./app/index/price');
var configHandle=require('./app/index/config')
module.exports=function(action,data,res){
  if(typeof eval(action)=='function'){
  	var actionHandle=eval(action);
  	actionHandle(data,function(back){
  		res.send(back);
  	})
  }else{
  	res.send('not fount action');
  }
}
var app={
	login:loginHandle.login,
	checkSession:loginHandle.checkSession,
	getRunData:indexHandle.getRunData,
	common: {
	  getQR: commonHandle.getQR, 
	  getQRcode:commonHandle.getQRcode,
	  getQRurl:commonHandle.getQRUrl
	},
	user:{
		validateUser:userHandle.validateUser,
		userRemove:userHandle.remove
	},
	/*客服*/
	news:{
		getNews:newsHandle.getNews
	},
	telbook:{
		getTelData:telbookHandle.getTelData,
		addTelList:telbookHandle.addTelList,
		changeDetails:telbookHandle.changeDetails,
		getDetails: telbookHandle.getDetails,
		getTelList: telbookHandle.getTelList,
		searchTelList: telbookHandle.searchTelList
	},
	price:{
		//添加菜价 获取菜价
		addPrice:priceHandle.addPrice,
		getPriceList:priceHandle.getPriceList,
		//添加超市 菜价分类
		addPriceClass:priceHandle.addPriceClass,
		getPriceClass:priceHandle.getPriceClass
	},
	config:{
		addConfig:configHandle.addConfig
	}
 }
