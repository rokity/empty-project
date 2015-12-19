exports.install = function() {


// define routes with actions

    F.route('/search/{name}/', view_search);
    F.route('/download/{hash}', view_download);
    F.route('/set_folder/*', view_setFolder);
    F.route('/delete/{id}',view_deleteTorrent);


// define global variables
//Example:
//F.global.variable=a;




}


//Url API
const URL = 'https://getstrike.net/api/v2/torrents/search/?phrase=';
/*
 MongoDB global variables
 */
const MongoDB='mongodb://localhost:27017/torrent';
/*
 Web Torrent global variables
 */
const WebTorrent = require('webtorrent');
const client = new WebTorrent();



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







/**
 * /download/{hash}
 * @param hash
 */
function view_download(hash) {

    var self = this;
    self.plain("torrent started!");
    var Utils=require('./modules/Utils');

    function callback(path) {
        var opts={};
        opts['path'] = path;
        client.add(hash,
            opts,
            function (torrent) {

                var files = Utils.getFilesFromTorrent(torrent);
                var downloads = Utils.saveDownloads(torrent, files, MongoDB);

                torrent.on('done',
                    function () {
                        console.log('on done ' + torrent.name);
                        Utils.downloadsUpdateStatus('downloaded',downloads,MongoDB);
                    });

                torrent.on('download',
                    function (chunkSize) {
                        Utils.downloadsUpdate(torrent, downloads, MongoDB);
                        Utils.torrentPrintStatus(torrent, chunkSize);
                    });
            });
    }
    Utils.getPathDefaultFolder(MongoDB,callback);
    }









/*URL    set_folder/*      URL*/
function view_setFolder() {
    var self = this;
    var Utils=require('./modules/Utils');
    Utils.setFolderPath(MongoDB,self.uri.pathname.substring(11, self.uri.pathname.length));
    self.plain('done');
}




/**
 * URL: "/delete/{id}"
 * @param id
 */
function view_deleteTorrent(_id){
    var self=this;


    var Utils=require('./modules/Utils');
    Utils.deleteDownloadsByHash(MongoDB,_id);

    self.plain(_id);

}


