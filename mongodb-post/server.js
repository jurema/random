// simple example posting a "name" into a collection

var http = require('http'),
	url = require('url'),
	qs = require('querystring'),
	Db = require('mongodb').Db,
	Server = require('mongodb').Server,
	Connection = require('mongodb').Connection,
	BSON = require('mongodb').BSONNative;

//params from POSTed methods
function params(req, fn) {
	var query = '';
	req.on('data', function(data) {
		query += data;
	});
	req.on('end', function() {
		fn(query);
	});
}

var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : Connection.DEFAULT_PORT,
	db = new Db('node_test_post', new Server('localhost', port, {native_parser:true}));

db.open(function(er, db) {
	if (er) {
		console.log(er);
	}
	db.createCollection('mongodb-post', function(er, col) {
		if (er) {
			console.log(er);
		}
		//http server
		http.createServer(function(req, res) {
			if (url.parse(req.url).pathname === '/save' && req.method === 'POST') {
				params(req, function(p) {
					col.insert({
						name : qs.parse(p).name,
						timestamp : Math.round(((new Date()).getTime()-Date.UTC(1970,0,1))/1000) //timestamp?
					});
					res.writeHead(200, {'content-type':'text/html'});
					res.end('<p>saved: ' + JSON.stringify(qs.parse(p)) + "</p><br /><a href='/'>back</a>");
					console.log('data saved');
				});
			}
			else if (url.parse(req.url).pathname === '/') {
				res.writeHead(200, {'content-type':'text/html'});
				res.end(
					'<h1>mongodb database posting</h1>\n' +
					'<form action="/save" method="post" onsubmit="if (document.getElementById(\'name\').value === \'your name here\' || document.getElementById(\'name\').value === \'\') return false;">\n' +
						'<input id="name" type="text" name="name" value="your name here" onblur="if (this.value === \'\') this.value=\'your name here\'" onfocus="if (this.value === \'your name here\') this.value=\'\'" />\n' +
						'<input type="submit" value="send" />\n' +
					'</form>'
				);
			}
		}).listen(8888);
	});
});

console.log('server running at port 8888');
