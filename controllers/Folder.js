/**
 * Folder Schema ORM
 * @param url
 */
module.exports=function(url){
    /**Initialize Connection **/
    var mongoose = require('mongoose');
    var db = mongoose.createConnection(url);

    /**Declare Fields of Collection **/
    var FolderSchema=new mongoose.Schema({
        path:String
    });

    /**Declare Methods of Schema **/

    /** Define Model **/
    var Folder = db.model('folder', FolderSchema);



    return Folder;




};

