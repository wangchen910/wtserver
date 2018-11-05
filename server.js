var port = 18080;


const Koa = require('koa');
const app = new Koa();
const koaBody = require('koa-body');
const koaRoute = require('koa-route');
const routes = require('./routes')

app.use(koaBody({multipart: true}))

app.use(koaRoute.get('/',ctx=>{
   let res = ctx.response;
   res.body = ctx.request;
}))

// app.use(routes.routeAction)

app.listen(port);





