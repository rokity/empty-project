/**
 * Downloads Schema
 * @param url
 * @returns {Model}
 */
module.exports=function(url) {
        /**Initialize Connection **/
    var mongoose = require('mongoose');
    var db = mongoose.createConnection(url);
    /**Declare Fields of Collection **/
    var DownloadsSchema = new mongoose.Schema({
            infoHash:String,
            nome:String,
            content:[],
            progress:String,
            status:String
    });
    /**Declare Methods of Schema **/



    /** Define Model **/
    var Downloads = db.model('Downloads', DownloadsSchema);
    return Downloads;
}








