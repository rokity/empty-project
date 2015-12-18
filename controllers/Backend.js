exports.install = function() {


// define routes with actions

    F.route('/search/{name}/', view_search);
    F.route('/download/{hash}', view_download);
    F.route('/set_folder/*', view_setFolder);
    F.route('/delete/{id}',view_deleteTorrent);


// define global variables

    /*
    Web Torrent global variables
     */
    var WebTorrent = require('webtorrent');
    var client = new WebTorrent();
    F.global.client = client;

    /*
    MongoDB global variables
     */
    var MongoClient = require('mongodb').MongoClient;
    var assert = require('assert');
    var ObjectId = require('mongodb').ObjectID;
    var url = 'mongodb://localhost:27017/torrent';
    F.global.url = url;
    F.global.MongoClient = MongoClient;
    F.global.assert = assert;

}


//Url api
const URL = 'https://getstrike.net/api/v2/torrents/search/?phrase=';



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

var model = [];

var findFolders = function(db, callback) {
    var cursor = db.collection('folder').find();
    var rows = [];
    var i = 0;
    cursor.each(function(err, doc) {

        if (doc != null) {
            rows[i] = doc;
            i++;
        } else {
            callback(rows);
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










function view_download(hash) {

    var self = this;
    self.plain("torrent started!");
    var client = self.global.client;


    var opts = {};

    function read(callback) {
        self.global.MongoClient.connect(self.global.url, function(err, db) {
            self.global.assert.equal(null, err);
            findFolders(db, function(rows) {
                opts["path"] = decodeURIComponent(rows[0]['path']);
                db.close();
                callback();


            });
        });
    }


    function log() {
        client.add(hash, opts,
            function(torrent) {
                console.log("on add" + opts["path"]);


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
    read(log);

}

/*It find rows in collection 'folder' */
var findFolders = function(db, callback) {
    var cursor = db.collection('folder').find();
    var rows = [];
    var i = 0;
    cursor.each(function(err, doc) {

        if (doc != null) {
            rows[i] = doc;
            i++;
        } else {
            callback(rows);
        }
    });
};
/* It create new row in collection 'folder' with parameter the path */
var insertRow = function(db, callback, path) {
    db.collection('folder').insertOne({
        "path": path
    }, function(err, result) {
        console.log("Inserted a document into the folder collection.");
        callback(result);
    });
};

/* Update row inside collection 'folder' with parameter path,id
 *  path means new path
 *  id means id of row
 */
var updateRow = function(db, callback, path, id) {
    db.collection('folder').updateOne({
        "_id": id
    }, {
        $set: {
            "path": path
        }
    }, function(err, results) {
        callback(results);
    });
};

/*URL    set_folder/*      URL*/
function view_setFolder() {
    var self = this;
    self.global.MongoClient.connect(self.global.url, function(err, db) {
        self.global.assert.equal(null, err);
        findFolders(db, function(rows) {

            if (rows.length <= 0) {
                insertRow(db, function(result) {
                    if (result['insertedCount'] == 1)
                        self.plain("done");
                }, self.uri.pathname.substring(11, self.uri.pathname.length));
            } else {
                updateRow(db, function(results) {
                    self.plain("done");
                }, self.uri.pathname.substring(11, self
                    .uri.pathname.length), rows[0]['_id']);
            }
        });

    });
}



/*URL   /delete/*    URL*/
function view_deleteTorrent(id){
    var self=this;
    var downloading=require("./downloading.js");
    var a=new downloading([0,1,2,3,4,5,65],'active');
    var DatabaseManager=require('./DatabaseManager.js');
    var dm=new DatabaseManager(self.global.url);

    function write_(results){
        console.log(results);
        self.plain('ciao');
    };
    dm.confront(a,write_);
}


