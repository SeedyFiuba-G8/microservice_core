// Example test

const { sum } = require('../src/sum');

describe('Example tests', () => {
  test('adds 1 + 2 should equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });

  test('adds 0 + 0 should equal 0', () => {
    expect(sum(0, 0)).toBe(0);
  });
});
