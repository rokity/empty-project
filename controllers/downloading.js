/**
 * downloading
 * @param _torrent
 * @param _status
 * @constructor
 */
function downloading(_torrent,_status) {

    if(_torrent)
    this.torrent=_torrent;
    if(_status)
    this.status=_status;





}


/**
 * All ORM class need to have getTableName
 * @returns {string}
 */
downloading.prototype.getCollectionName=function(){
    return downloading.constructor.name;
}


/**
 * It's a bad method
 * @returns {*}
 */
downloading.prototype.getTorrent=function(){
    return this.torrent;
};



module.exports = downloading;