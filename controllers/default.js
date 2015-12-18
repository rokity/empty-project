exports.install = function() {
	// define routes with actions
	F.route('/', view_index);
	F.route('/usage/', view_usage);
	F.route('/downloads', view_downloads);
	F.route('/devices/*', view_devices);


	//defince global variables ciao riccardo


	var MongoClient = require('mongodb').MongoClient;
	var assert = require('assert');
	var ObjectId = require('mongodb').ObjectID;
	var url = 'mongodb://localhost:27017/torrent';
	F.global.url = url;
	F.global.MongoClient = MongoClient;
	F.global.assert = assert;





}



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
	exec("sudo blkid", puts);

}

function print(model, self) {
	self.view('devices', {
		array: model
	});
}

function getFolder(path, self) {

	var exec = require('child_process').exec;
	var content = [];
	path = decodeURIComponent(path).substring(8, decodeURIComponent(path).length);

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

