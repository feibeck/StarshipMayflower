import { Story, Meta } from '@storybook/react';
import { Compass, CompassProps } from './compass';

export default {
  component: Compass,
  title: 'Compass',
} as Meta;

const Template: Story<CompassProps> = (args) => <Compass {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  pitch: 0,
  yaw: 0,
};
