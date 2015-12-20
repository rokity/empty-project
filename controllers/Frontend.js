exports.install = function() {
	// define routes with actions
	F.route('/', view_index);
	F.route('/usage/', view_usage);
	F.route('/downloads', view_downloads);
	F.route('/devices/*', view_devices);












}
/*
 MongoDB global variables
 */
const MongoDB='mongodb://localhost:27017/torrent';




function view_downloads() {
	var self = this;
	var Utils=require('./modules/Utils.js');
	Utils.getAllDownloads(MongoDB,function(err,results){
		self.view('downloads', {
			array: results
		});
	});




}




// The action
function view_index() {
	var self = this;


	self.view('index');
}



function view_usage() {
	var self = this;
	self.plain(F.usage(true));
}







function getDevices(callback, self,user) {
	var exec = require('child_process').exec;
	var model = [];

	function puts(error, stdout, stderr) {
		var rows = stdout.split('\n');

		rows.forEach(function(el, index, array) {
			var path = el.substring(0, 9);
			var i = el.indexOf(' LABEL');
			if (i != -1) model.push([path, el.substring(i + 8, el.indexOf('UUID') - 2)]);
		});
		callback(model, self,user);
	}
	exec("sudo blkid", puts);

}

function print(model, self,_user) {
	self.view('devices', {
		user:_user,
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



function getUser(cb){
	var exec = require('child_process').exec;
	var user;
	function callback(err,stdout,stderr){
		if(err)console.error(err);
		user=stdout.split('\n')[0];
		cb(user);
	}
	exec('cd /home && ls',callback);

}


function view_devices() {
	var self = this;
	var split = self.uri.pathname.split('/').length - 1;
	function afterGetUser(user){
		console.log(user);
	if (split > 1)
		getFolder(self.uri.pathname, self);
	if (split == 1)
		getDevices(print, self,user);
	}
	getUser(afterGetUser);



}



