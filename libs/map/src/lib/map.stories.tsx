import { Story, Meta } from '@storybook/react';
import { Map, MapProps } from './map';

export default {
  component: Map,
  title: 'Map',
} as Meta;

const Template: Story<MapProps> = (args) => <Map {...args} />;

export const Primary = Template.bind({});
Primary.args = {};

export const WithShip = Template.bind({});
WithShip.args = {
  ship: {
    id: 1,
    name: 'My ship',
    position: {
      x: 149597870,
      y: 149597870,
      z: 149597870,
    },
    heading: {
      x: 0,
      y: 0,
      z: 1,
    },
    shipX: {
      x: 1,
      y: 0,
      z: 0,
    },
    shipY: {
      x: 0,
      y: 1,
      z: 0,
    },
  },
};

export const WithOtherShips = Template.bind({});
WithOtherShips.args = {
  mapObjects: [
    {
      id: 2,
      name: 'Object 1',
      position: {
        x: 149597870,
        y: 149597870,
        z: 149597870,
      },
      heading: {
        x: 0,
        y: 0,
        z: 1,
      },
    },
    {
      id: 3,
      name: 'Object 2',
      position: {
        x: 149597870 * 0.5,
        y: 149597870 * 0.5,
        z: 149597870,
      },
      heading: {
        x: 0,
        y: 0,
        z: 1,
      },
    },
  ],
};
