<h1>TorrentBox</h1>

<h3>Useful Command Line</h3>
# Run App
  _node --harmony debug.js_
# MongoDB
  _mongo_                         #open mongo shell
  _show dbs_                      #show database
  _use namedatabase_              #create new database
 _db.users.save( {username:"riccardo"} )_     #save the database initialized before
 _db.createCollection("downloading",{capped:false,autoIndexId:true})_     #create new collection in DB
#mongo-express
  _cd YOUR_PATH/node_modules/mongo-express/ && node app.js -u user -p password -d database_


#TASKS
1)Finish Realt-Time Section
    /downloads   <-- Socket.io --> /check_update  <--Query MongoDB --> Downloading Collection
2)Use Templating System of TotalJS where it's possible
2)Test on Raspberry
3)enable Play/Pause/Stop Button on Torrent
