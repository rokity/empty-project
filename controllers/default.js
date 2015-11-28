exports.install = function() {
	// define routes with actions
	F.route('/', view_index);
	F.route('/search/{name}/', view_search);
}


//Url api
const URL = 'https://getstrike.net/api/v2/torrents/search/?phrase=';



// The action
function view_index() {
	var self = this;
	// The "index" view is routed into the views/index.html
	// ---> Send the response
	self.view('index');
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
