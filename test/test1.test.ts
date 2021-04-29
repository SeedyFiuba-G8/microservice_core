import sum from '../src/sum';

test('1 + 1 equals 2', () => {
    expect(sum(1, 1)).toBe(2);
});

test('2+3 equals 5', () => {
    expect(sum(2, 3)).toBe(5);
});
