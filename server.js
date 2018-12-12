var port = 18080;

global.__baseDir = __dirname;
const Koa = require('koa');
const app = new Koa();
const koaBody = require('koa-body');
const koaRoute = require('koa-route');
const routes = require('./routes')
const config = require('./serverConfig')

//初始化redis数据库

require("./until/redis").connect.init(config.redis.redisIp,config.redis.redisPort, config.redis.redisPwd);

require('./until/mongo').connectDb()

app.use(koaBody({multipart: true}))

app.use(koaRoute.get('/action', routes.routeAction))

app.use(koaRoute.post('/action', routes.routeAction))

app.use(koaRoute.post('/fileUpload', routes.uploadFile))

app.use(koaRoute.get('/fileDownload', routes.downloadFile))
// app.use(routes.routeAction)
app.use(koaRoute.post('/adminAction', routes.adminAction))

app.listen(port);



