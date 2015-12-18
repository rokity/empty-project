/**
 * TorrentORM
 * @param _torrent
 * @param _status
 * @constructor
 */
function Torrent(_torrent,_status) {

    if(_torrent)
    this.torrent=_torrent;
    if(_status)
    this.status=_status;





}


/**
 * All ORM class need to have getTableName
 * @returns {string}
 */
Torrent.prototype.getTableName=function(){
    return 'downloading';
}


/**
 * It's a bad method
 * @returns {*}
 */
Torrent.prototype.getTorrent=function(){
    return this.torrent;
};



module.exports = Torrent;