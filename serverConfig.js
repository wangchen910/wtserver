module.exports={
	appId: 'wx14b3135d0f6f5212',
	secret: 'cff307b6a1a5d4156ed62129ad9c73b7',
	// appId: 'wx68d1741f811385c1',
  //   secret: 'cccf54eddc93ed32382ce19ccb498ede',

	mongo:{
     dbIp:'117.78.45.173',
     dbPort: 27017,
     dbName: 'admin',
     dbUserName: 'admin',
     dbPassword: 'admin'
	},
	// mongo:{
    //  dbIp:'114.115.206.125',
    //  dbPort: 27017,
    //  dbName: 'admin',
    //  dbUserName: 'admin',
    //  dbPassword: 'admin'
	// },
	redis:{
    redisIp: "117.78.45.173",
	  redisPort: 6378,
	  redisPwd: 'beijixiong',
	},
	pay:{
	  //商户号	
	  mch_id: '1518701051',
	  pay_key: 'aOQDxyJpYedNluHGUHknXLmnsnQLoufc',
	  notify_url: 'https://www.beijixiong.club/payAction',
	  refound_notify_url: 'https://www.beijixiong.club/refoundAction'
	},
	imgUrl: 'https://www.beijixiong.club/fileDownload?fileId='
}
// 支付博客
//https://blog.csdn.net/zhuming3834/article/details/73168056
//https://pay.weixin.qq.com/wiki/doc/api/app/app.php?chapter=9_1