function DatabaseManager(_url){

    var MongoClient = require('mongodb').MongoClient;
    var assert = require('assert');
    var ObjectId = require('mongodb').ObjectID;
    var url = 'mongodb://localhost:27017/torrent';
    this.url = _url;
    this.MongoClient = require('mongodb').MongoClient
        , this.assert = require('assert');
}




DatabaseManager.prototype.persist=function(object){

    this.MongoClient.connect(this.url, function(err, db) {
        console.log("Connected correctly to server");
        var collection=db.collection(object.getTableName());
        collection.insertOne(object,function(err,result){
            if(err) return err;
        });
        db.close();
    });
};

DatabaseManager.prototype.update=function(_id,field,value,coll){

    this.MongoClient.connect(this.url, function(err, db) {
        console.log("Connected correctly to server");
        var collection=db.collection(coll);
        collection.updateOne({
            '_id':_id
        },{$set:{field:value

        }},function(err,results){
            if(err) return err;
        });
        db.close();
    });

};







DatabaseManager.prototype.confront=function(object,callback){






        this.MongoClient.connect(this.url, function (err, db) {
            console.log("Connected correctly to server");
            var collection = db.collection(object.getTableName());
            var results = collection.find(object);
            db.close();
            callback(results);
        });




};






module.exports=DatabaseManager;