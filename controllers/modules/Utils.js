

/**
 * Get Files Name from Torrent.files of webtorrent module
 * @param torrent   Torrent Object from webtorrent module
 * @returns {Array}    Array of String
 */
exports.getFilesFromTorrent=function(torrent){
    var files = [];
    if (torrent.files.length > 1)
        torrent.files.forEach(function(el, i, array) {
            files[i] = el.name;
        });
    else {
        files[0] = torrent.files[0].name;
    }
    return files;
}


/**
 *  Find on Folder collection and return 'path' field of document
 * @param url   Url of MongoDB
 * @returns {String}  Return path field
 */
exports.getPathDefaultFolder=function(url,callback){
    var Folder=require('./Folder')(url);

        Folder.find(function (err, results) {
            if (err)console.error(err);
            callback(results[0]['path']);
        });




}


/**
 *  Add new Document to Downloads collection
 * @param torrent    Torrent Object from webtorrent module
 * @param files     Array of Files from Torrent.files
 * @param url       MongoDB URL
 * @returns {Model}   Downloads Document
 */

exports.saveDownloads=function(torrent,files,url){
    var Downloads=require('./Downloads')(url);
    var d=new Downloads({
        infoHash:torrent.infoHash,
        nome:torrent.name,
        content:files,
        down_speed:0,
        progress:0,
        tot_down:0,
        status:'started'
    });
    d.save(function(err){
        console.log("Added Torrent");
    });
    return d;
}


/**
 *  Print on console the status of download
 * @param torrent   Object from webtorrent module
 * @param chunkSize  Int from webtorrent function
 */
exports.torrentPrintStatus=function(torrent,chunkSize){
    console.log("torrent " + torrent.name);
    console.log('chunk size: ' + chunkSize);
    console.log('total downloaded: ' + torrent.downloaded);
    console.log('download speed: ' + torrent.downloadSpeed());
    console.log('progress: ' + torrent.progress);
    console.log('======');
};



/**
 * Update a Document of Downloads collection
 * @param torrent    Where take progress fields
 * @param downloads  Document will be update
 * @param url   MongoDB URL
 */
exports.downloadsUpdate=function(torrent,downloads,url){
    var Downloads=require('./Downloads.js')(url);
    Downloads.findOneAndUpdate({_id:downloads.id},{
            down_speed:torrent.downloadSpeed(),
            progress:torrent.progress,
            tot_down:torrent.downloaded

        },{},function(err,doc){
        if(err)console.error(err);
        });


}


/**
 *  Update status of Document inside Downloads collection
 * @param _status  String that rappresent status of torrent
 * @param downloads Document will be update
 * @param url   Url of MongoDB
 */
exports.downloadsUpdateStatus=function(_status,downloads,url){
    var Downloads=require('./Downloads.js')(url);
    Downloads.findOneAndUpdate({_id:downloads.id},{
    status:_status
    },{},function(err,doc){
        if(err)console.error(err);
    });
}


/**
 * delete document from Downloads collection
 * @param url  Url of MongoDB
 * @param _infoHash   Filed of Collection (Condiction)
 */
exports.deleteDownloadsByHash=function(url,_infoHash){
    var Downloads=require('./Downloads.js')(url);
    Downloads.findOneAndRemove({infoHash:_infoHash},{},function(err){
        if(err)console.error(err);
    })
}

/**
 * Set the path of folder where download Torrent
 * @param _url Url of MongoDB
 * @param _path  Path of Folder
 */
exports.setFolderPath=function(_url,_path){
    var Folder=require('./Folder')(_url);
    Folder.findOneAndRemove({},{},function(err){
        if(err)console.error(err);
        var a=new Folder({path:_path});
        a.save(function(err){
            if(err)console.error(err);
        });
    });
}



exports.getAllDownloads=function(_url,callback) {
    var Downloads = require('./Downloads.js')(_url);
    Downloads.find({}, callback);
}