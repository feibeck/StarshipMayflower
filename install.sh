cd ./game-server && npm install -d
echo '============   game-server npm installed ============'
cd ..
cd ./web-server && npm install -d && bower install && bower update && grunt less
echo '============   web-server npm installed ============'
