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
	var mongoose = require('mongoose');
	mongoose.connect('mongodb://localhost:27017/torrent');
	var Schema = mongoose.Schema;
	var downloadingSchema=new Schema({
		torrent: [{
			id: String,
			nome: String,
			down_speed: Number,
			progress: Number,
			tot_down: Number
		}],
		status: String});
		v


	F.route('/', view_index);
	F.route('/search/{name}/', view_search);
	F.route('/download/{hash}', view_download);
	F.route('/usage/', view_usage);
	F.route('/downloads', view_downloads);
	F.route('/devices', view_devices);
	F.route('/check_update', view_checkUpdate);


}


//Url api
const URL = 'https://getstrike.net/api/v2/torrents/search/?phrase=';

function view_downloads() {
	var self = this;
	var model = [];
	var i = 0;
	var findRestaurants = function(db, callback) {
		var cursor = db.collection('downloading').find();
		cursor.each(function(err, doc) {
			self.global.assert.equal(err, null);
			if (doc != null) {
				model[i] = doc;
				i++;
			} else {
				callback();
			}
		});
	};

	self.global.MongoClient.connect(self.global.url, function(err, db) {
		self.global.assert.equal(null, err);
		findRestaurants(db, function() {
			if (model.length == 0)
				model = null;
			self.view('downloads', {
				array: model
			});
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
		var name = torrent.name;
		/*
		if (torrent.files.length > 1)
			torrent.files.forEach(function(el, i, array) {
				name[i] = el.name;
			});
		else {
			name[0] = torrent.files[0].name;
		}*/


		//CREATE NEW ROW
		var insertDocument = function(db, callback) {
			db.collection('downloading').insertOne({
				"torrent": {
					"id": torrent.infoHash,
					"nome": name,
					"down_speed": 0,
					"progress": 0,
					"tot_down": 0
				},
				"status": "started",

			}, function(err, result) {
				self.global.assert.equal(err, null);
				console.log("Inserted a document into the restaurants collection.");
				callback(result);
			});
		};
		//INSERT NEW ROW
		self.global.MongoClient.connect(self.global.url, function(err, db) {
			self.global.assert.equal(null, err);
			insertDocument(db, function() {
				db.close();
			});
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

function view_devices() {
	var self = this;
}
