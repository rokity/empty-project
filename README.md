<h1>TorrentBox</h1>
#TASKS
* Finish controller view_setFolder
      * Check if row exists
      * Insert row
      * Update row
* Enable Play/Pause/Stop Button on Torrent
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
<h1>MongoDB Setup Commands</h1>
######open mongo shell
  _mongo_
######show database
  _show dbs_
######create new database
  _use torrent_
######save the database initialized before
 _db.users.save( {username:"riccardo"} )_
######create collection downloading
 _db.createCollection("downloading",{capped:false,autoIndexId:true})_
######create collection folder
   _db.createCollection("folder",{capped:false,autoIndexId:true})_
<h1>mongo-express Setup Commands</h1>
######Start mongo-express
  _cd node_modules/mongo-express/ && node app.js -u riccardo -p ciao -d torrent_
