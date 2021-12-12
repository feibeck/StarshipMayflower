import { Player } from './Player';

describe('Player model', () => {
  it('Constructor', () => {
    const player = new Player(5, 'Foo', 'server1');

    expect(player.getId()).toBe(5);
    expect(player.getName()).toBe('Foo');
    expect(player.getServerId()).toBe('server1');
  });

  it('Can be serialized', () => {
    const player = new Player(5, 'Foo', 'server1');

    expect(player.serialize()).toEqual({ id: 5, name: 'Foo' });
  });
});
