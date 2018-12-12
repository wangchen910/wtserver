
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if(cluster.isMaster) {
	console.log('主进程：',process.pid)
	for (var i = 0; i<numCPUs;i++){
      cluster.fork() 
	}
}else{
	console.log('子进程：',process.pid)
	require('./server')
}

