import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, fireEvent } from '@testing-library/react';
import Counter from '../app/components/Counter';

afterEach(() => {
  cleanup();
});

describe('Counter component', () => {
  it('renders the initial count', () => {
    const { getByText } = render(<Counter initialCount={5} />);

    // getByText will throw if the element is not found, so this is enough
    expect(getByText(/current count: 5/i)).toBeTruthy();
  });

  it('increments the count when the button is clicked', () => {
    const { getByRole, getByText } = render(<Counter initialCount={0} />);

    const button = getByRole('button', { name: /increment/i });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(getByText(/current count: 2/i)).toBeTruthy();
  });
});
