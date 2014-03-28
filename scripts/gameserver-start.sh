#!/bin/sh
#
# Documentation, how to start the server as deamon
# Call this script from main-dir
#

cd game-server
pomelo start >../game-server.log &
# you can do that yourself in a shell to see the output:
# pomelo start
#
cd ..

sleep 5

pomelo list

echo
echo "Gameserver should be running now, see above!"
echo "To stop the gameserver use './gameserver-stop.sh' (or just 'pomelo stop')"
echo
echo "Logfile: 'tail -f ./game-server.log'"
echo
echo "You can now start the webserver:"
echo "> cd web-server; node app"
echo