function Torrent(_torrent,_status) {

    if(_torrent)
    this.torrent=_torrent;
    if(_status)
    this.status=_status;





}



Torrent.prototype.getTableName=function(){
    return 'downloading';
}



Torrent.prototype.getTorrent=function(){
    return this.torrent;
};



module.exports = Torrent;