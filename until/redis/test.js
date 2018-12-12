var redis =  require("m7rds");

redis.connect.init("121.40.194.97","6379");


redis.list.lpush("test","32dfrewrer",function(err , data){
    console.log(err);
    console.log(data);
},1);
redis.list.range("test",-1,2,function(err , data){
    console.log(err);
    console.log(data);
})
redis.list.delObj("test",0,{a:123,b:234},function(err , data){
    console.log(err);
    console.log(data);
});
