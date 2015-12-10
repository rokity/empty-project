<h1>TorrentBox</h1>

<h3>Setup</h3>
#Download NodeJS 5.1.0
https://nodejs.org
#Install NodeJS
Prerequisites:

* `gcc` and `g++` 4.8 or newer, or
* `clang` and `clang++` 3.4 or newer
* Python 2.6 or 2.7
* GNU Make 3.81 or newer
* libexecinfo (FreeBSD and OpenBSD only)

```text
$ ./configure
$ make
$ [sudo] make install
```

#Download/Install/Setup MongoDB
```text
https://docs.mongodb.org/manual/installation/
```
# Run App
```text
  node --harmony debug.js
```
# MongoDB
  _mongo_                         #open mongo shell
  _show dbs_                      #show database
  _use torrent_              #create new database
 _db.users.save( {username:"riccardo"} )_     #save the database initialized before
 _db.createCollection("downloading",{capped:false,autoIndexId:true})_     #create new collection in DB
#mongo-express
  _cd node_modules/mongo-express/ && node app.js -u riccardo -p ciao -d torrent_


#TASKS
1)Finish Realt-Time Section
    /downloads   <-- Socket.io --> /check_update  <--Query MongoDB --> Downloading Collection
2)Use Templating System of TotalJS where it's possible
2)Test on Raspberry
3)enable Play/Pause/Stop Button on Torrent
