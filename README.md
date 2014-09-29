<a href="https://travis-ci.org/feibeck/StarshipMayflower"><img src="https://travis-ci.org/feibeck/StarshipMayflower.svg?branch=master"></a>
Starship Mayflower
==================

A starship bridge simulator running in your browser.

Prerequisites
=============

Install npm.

Install via npm:
- bower
- pomelo

Install
=======

This project is build using node.js and the Pomelo game server framework. You need to install all dependencies by running the script

```
$ npm-install.sh
```
(or npm-install.bat) in you working copy. This will install grunt, grunt-cli, less and other dependencies.

You can look into the scripts-dir: the install.sh should do all for you.

Run server(s)
==========
Basic grunt task are available from the webserver folder for both servers - game & webserver:

- start, stop and restart

Recommended usage:
```
$ grunt start
```
This task watches for code changes, and restarts the webserver if any change was detected inside the less files.
Furthermore the task will compile valid CSS stylesheets from the defined less sources, before starting the web & gameserver.

Open your browser and visit http://localhost:3001

HF
