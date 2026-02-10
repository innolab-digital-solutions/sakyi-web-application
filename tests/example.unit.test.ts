import { describe, it, expect } from 'vitest';

// Simple function under test. In a real project, this
// would usually be imported from another file.
function add(a: number, b: number) {
  return a + b;
}

describe('add', () => {
  it('adds two positive numbers', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('adds negative numbers', () => {
    expect(add(-5, -7)).toBe(-12);
  });

  it('adds a positive and a negative number', () => {
    expect(add(10, -3)).toBe(7);
  });
});

