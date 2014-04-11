#!/bin/sh
cd ./game-server && npm install -d
echo '============   game-server npm installed ============'
cd ..
cd ./web-server && npm install -d
echo '============   game-server npm installed ============'
node_modules/.bin/bower update && node_modules/.bin/bower install
echo '============   web-server npm installed ============'

