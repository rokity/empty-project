exports.install = function() {
	// define routes with actions


	var WebTorrent = require('webtorrent');
	var client = new WebTorrent();
	F.global.client = client;
	var MongoClient = require('mongodb').MongoClient;
	var assert = require('assert');
	var ObjectId = require('mongodb').ObjectID;
	var url = 'mongodb://localhost:27017/torrent';
	F.global.url = url;
	F.global.MongoClient = MongoClient;
	F.global.assert = assert;



	F.route('/', view_index);
	F.route('/search/{name}/', view_search);
	F.route('/download/{hash}', view_download);
	F.route('/usage/', view_usage);
	F.route('/downloads', view_downloads);
	F.route('/devices/*', view_devices);
	F.route('/check_update', view_checkUpdate);
	F.route('/set_folder/*', view_setFolder);


}


//Url api
const URL = 'https://getstrike.net/api/v2/torrents/search/?phrase=';
//GET ALL ROWS
var model = [];
var findRestaurants = function(db, callback) {
	var cursor = db.collection('downloading').find();
	var i = 0;
	model = [];
	cursor.each(function(err, doc) {
		//self.global.assert.equal(err, null);
		if (doc != null) {
			model[i] = doc;
			i++;
		} else {
			callback();
		}
	});
};
//CREATE NEW ROW
var insertDocument = function(db, callback, torrent, files) {
	db.collection('downloading').insertOne({
		"torrent": {
			"id": torrent.infoHash,
			"nome": torrent.name,
			"content": files,
			"down_speed": 0,
			"progress": 0,
			"tot_down": 0
		},
		"status": "started",

	}, function(err, result) {
		console.log("Inserted a document into the downloading collection.");
		callback(result);
	});
};

function view_downloads() {
	var self = this;

	var i = 0;
	self.global.MongoClient.connect(self.global.url, function(err, db) {
		self.global.assert.equal(null, err);
		findRestaurants(db, function() {
			if (model.length == 0)
				model = null;
			self.view('downloads', {
				array: model
			});
			db.close();
		});

	});


}


function view_checkUpdate() {
	var self = this;
	self.plain('ciao');
	var io = require('socket.io')(F.server);

	io.on('connection', function() {
		console.log("new user");



	});
}

// The action
function view_index() {
	var self = this;

	// The "index" view is routed into the views/index.html
	// ---> Send the response
	self.view('index');
}



function view_usage() {
	var self = this;
	self.plain(F.usage(true));
}



function view_search(name) {
	var self = this;
	var illegal_char = ['-', '_', '.', '!', '~', '*', '\'', '(', ')'];

	for (var i = 0, len = name.length; i < len; i++) {
		if (illegal_char.indexOf(name[i]) > -1)
			name = name.replaceAt(i, ' ');
	}
	name = name.replace(/\s/g, '');
	name = encodeURIComponent(name);

	var url = (URL + name);
	var request = require('request');
	var array = [];
	request(url, function(error, response, body) {
		if (!error && response.statusCode == 200) {


			var Res = JSON.parse(body);
			//.torrent is array of data
			var torrents = Res.torrents;


			for (var i in torrents) {
				var val = torrents[i];
				var element = {
					'hash': val.torrent_hash,
					'title': val.torrent_title,
					'category': val.torrent_category,
					'seeds': val.seeds,
					'leeches': val.leeches,
					'size': val.size,
					'download_count': val.download_count,
					'magnet_uri': val.magnet_uri
				};
				array.push(element);
			}
			self.json(array);


		} else {
			self.view404();
		}

	});

}


function view_download(hash) {

	var self = this;
	self.plain("torrent started!");
	var client = self.global.client;


	var opts = {};
	opts["path"] = "/home/riccardo/Scaricati/";
	client.add(hash, opts, function(torrent) {
		console.log("on add");


		//	LISTA TUTTI I FILE
		var name = [];
		if (torrent.files.length > 1)
			torrent.files.forEach(function(el, i, array) {
				name[i] = el.name;
			});
		else {
			name[0] = torrent.files[0].name;
		}



		//INSERT NEW ROW
		self.global.MongoClient.connect(self.global.url, function(err, db) {
			self.global.assert.equal(null, err);
			insertDocument(db, function() {
				db.close();
			}, torrent, name);
		});


		torrent.on('done', function() {
			console.log('on done ' + torrent.name);

			//EDIT ROW UPDATE
			var updateRestaurants = function(db, callback) {
				db.collection('downloading').updateOne({
					"torrent.id": torrent.infoHash
				}, {
					$set: {
						"status": "downloaded"
					}
				}, function(err, results) {
					//console.log(results);
					callback();
				});
			};
			//UPDATE THE ROW
			self.global.MongoClient.connect(self.global.url, function(err, db) {
				self.global.assert.equal(null, err);
				updateRestaurants(db, function() {
					db.close();
					torrent.destroy();
				});
			});

		});
		torrent.on('download', function(chunkSize) {
			//EDIT ROW UPDATE
			var updateRestaurants = function(db, callback) {
				db.collection('downloading').updateOne({
					"torrent.id": torrent.infoHash
				}, {
					$set: {
						"torrent.down_speed": torrent.downloadSpeed(),
						"torrent.progress": torrent.progress,
						"torrent.tot_down": torrent.downloaded
					}
				}, function(err, results) {
					//console.log(results);
					callback();
				});
			};
			//UPDATE THE ROW
			self.global.MongoClient.connect(self.global.url, function(err, db) {
				self.global.assert.equal(null, err);
				updateRestaurants(db, function() {
					db.close
					console.log("torrent" + torrent.name);
					console.log('chunk size: ' + chunkSize);
					console.log('total downloaded: ' + torrent.downloaded);
					console.log('download speed: ' + torrent.downloadSpeed());
					console.log('progress: ' + torrent.progress);
					console.log('======');
				});
			});

		});

	});


}


function getDevices(callback, self) {
	var exec = require('child_process').exec;
	var model = [];

	function puts(error, stdout, stderr) {
		var rows = stdout.split('\n');

		rows.forEach(function(el, index, array) {
			var path = el.substring(0, 9);
			var i = el.indexOf(' LABEL');
			if (i != -1) model.push([path, el.substring(i + 8, el.indexOf('UUID') - 2)]);
		});
		callback(model, self);
	}
	exec("blkid", puts);

}

function print(model, self) {
	self.view('devices', {
		array: model
	});
}

function getFolder(path, self) {
	var exec = require('child_process').exec;
	var content = [];
	path = decodeURIComponent(path).substring(8, path.length);

	function puts(error, stdout, stderr) {
		stdout.split('\n').forEach(function(el, i, ar) {
			if (el) content.push([path + "/" + el, el]);
		});
		if (content.length < 0) content = null;
		self.view('devices', {
			contents: content
		});
	}
	//need to fix bug with more occurrences of whitespace
	var strange_path = path;
	if (strange_path.indexOf(' ') != -1) strange_path = strange_path.substring(0,
		strange_path.indexOf(' ')) + "\\ " + strange_path.substring(strange_path.indexOf(
		' ') + 1, strange_path.length);
	exec("cd " + strange_path + " && ls", puts);
}


function view_devices() {
	var self = this;
	var split = self.uri.pathname.split('/').length - 1;
	if (split > 1)
		getFolder(self.uri.pathname, self);
	if (split == 1)
		getDevices(print, self);

}



function view_setFolder() {
	var self = this;
	self.global.MongoClient.connect(self.global.url, function(err, db) {
		self.global.assert.equal(null, err);
		checkCollection(db, 'folder', function(names) {
			db.close();
			console.log(names);
		});
	});
}
