
cd game-server
pomelo start >../game-server.log &
cd ..

sleep 5

pomelo list

echo
echo "Gameserver should be running now."
echo "To stop the gameserver use './gameserver-stop.sh' (or just 'pomelo stop')"
echo
echo "Logfile: 'tail -f ./game-server.log'"
echo
echo "You can now start the webserver:"
echo "> cd web-server; node app"
echo