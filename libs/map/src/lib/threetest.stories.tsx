import { Story, Meta } from '@storybook/react';
import { ThreeTest, ThreeTestProps } from './threetest';

export default {
  component: ThreeTest,
  title: 'ThreeTest',
} as Meta;

const Template: Story<ThreeTestProps> = (args) => <ThreeTest {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
