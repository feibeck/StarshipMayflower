import { Ship } from '@starship-mayflower/util';
import { Player } from './models/Player';
import { pinus, Channel as PinusChannel } from 'pinus';
/*
 * Manages pomelo channels to the clients
 */
export class Channel {
  /**
   * Pushes a message to a ship
   */
  pushToShip(ship: Ship, route: string, msg: any) {
    const channel = this.getShipChannel(ship);
    if (channel) {
      channel.pushMessage(route, msg);
    }
  }

  /**
   * Pushes a message to the lobby
   */
  pushToLobby(route: string, msg: any) {
    const channel = this.getLobbyChannel();
    if (channel) {
      channel.pushMessage(route, msg);
    }
  }

  /**
   * Pushes a message to the lobby
   */
  pushToGlobal(route: string, msg: any) {
    const channel = this.getGlobalChannel();
    if (channel) {
      channel.pushMessage(route, msg);
    }
  }

  addToGlobalChannel(id: string, serverId: string) {
    const channel = this.getGlobalChannel();
    console.log('Adding to global channel: ' + id + ' / ' + serverId);
    channel.add(id, serverId);
  }

  /**
   * Adds a player to the lobby channel and notifies the channel
   */
  addPlayerToLobby(player: Player) {
    const channel = this.getLobbyChannel();
    console.log(
      'Adding to lobby channel: ' +
        player.getId() +
        ' / ' +
        player.getServerId()
    );
    channel.add(`${player.getId()}`, player.getServerId());
    channel.pushMessage('PlayerAdded', player.serialize());
  }

  /**
   * Adds a player to the channel of a shio
   */
  addPlayerToShip(ship: Ship, player: Player): void {
    const channel = this.getShipChannel(ship);
    channel.add(`${player.getId()}`, player.getServerId());
    channel.pushMessage('PlayerAddedToShip', player.serialize());
  }

  /**
   * Removes a player from the game and notifies the channel
   */
  removePlayerFromLobby(player: Player) {
    const channel = this.getLobbyChannel();
    channel.leave(`${player.getId()}`, player.getServerId());
    channel.pushMessage('PlayerLeft', player.serialize());
  }

  /**
   * Returns a channel to a ship
   */
  getShipChannel(ship: Ship): PinusChannel {
    return pinus.app
      .get('channelService')
      .getChannel('ship-' + ship.getId(), true);
  }

  /**
   * Returns a channel to the game lobby
   */
  getLobbyChannel(): PinusChannel {
    return pinus.app.get('channelService').getChannel('lobby', true);
  }

  /**
   * Returns a global channel
   */
  getGlobalChannel(): PinusChannel {
    return pinus.app.get('channelService').getChannel('global', true);
  }
}
