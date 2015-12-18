/**
 * This is a ORM class that manage the operations with DB ,
 * @param _url
 * @constructor
 */
function DatabaseManager(_url){

    var MongoClient = require('mongodb').MongoClient;
    var assert = require('assert');
    var ObjectId = require('mongodb').ObjectID;

    this.url = _url;
    this.MongoClient = require('mongodb').MongoClient, this.assert = require('assert');
}


/**
 * Write a object on DB , persist object inside Collection from object.getTableName()
 * @param object
 */
DatabaseManager.prototype.persist=function(object){

    this.MongoClient.connect(this.url, function(err, db) {
        console.log("Connected correctly to server");
        var collection=db.collection(object.getCollectionName());
        collection.insertOne(object,function(err,result){
            if(err) return err;
        });
        db.close();
    });
};


/**
 * Update rows with same filed of the value parameter
 * @param _id
 * @param field
 * @param value
 * @param coll
 */
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


/**
 * Confront object with table and find similar
 * @param object
 * @param callback
 */
DatabaseManager.prototype.confront=function(object,callback){






        this.MongoClient.connect(this.url, function (err, db) {
            console.log("Connected correctly to server");
            var collection = db.collection(object.getCollectionName());
            var results = collection.find(object);
            db.close();
            callback(results);
        });




};






module.exports=DatabaseManager;