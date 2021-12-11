import { render } from '@testing-library/react';

import Compass from './compass';

describe('Compass', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Compass />);
    expect(baseElement).toBeTruthy();
  });
});
