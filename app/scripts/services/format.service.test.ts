import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import formatService, { TimeFormatDetails } from './format.service';

describe('FormatService', () => {
  // ---------------------------------------------------------------------------
  // Controlling "now" in tests
  //
  // The Jest version of this file replaced the global `Date` constructor with a
  // mock. Vitest doesn't allow that pattern (an arrow function can't be
  // `new`-ed), and it's fragile anyway. The idiomatic way is fake timers:
  //
  //   vi.useFakeTimers()        -> swap in a fake clock
  //   vi.setSystemTime(date)    -> make `new Date()` / `Date.now()` return `date`
  //   vi.useRealTimers()        -> put the real clock back
  //
  // Only the clock is faked; `new Date(2023, 0, 1)` etc. still works normally.
  // ---------------------------------------------------------------------------
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getDay', () => {
    it('returns the current day name when no argument is provided', () => {
      vi.setSystemTime(new Date(2023, 10, 26)); // Sunday, Nov 26 2023
      expect(formatService.getDay()).toBe('Sunday');
    });

    // `it.each` runs the same test once per row: a compact way to cover a table
    // of inputs/outputs. `$index`/`$name` interpolate into the test title.
    it.each([
      { index: 0, name: 'Sunday' },
      { index: 1, name: 'Monday' },
      { index: 2, name: 'Tuesday' },
      { index: 3, name: 'Wednesday' },
      { index: 4, name: 'Thursday' },
      { index: 5, name: 'Friday' },
      { index: 6, name: 'Saturday' },
    ])('returns $name for index $index', ({ index, name }) => {
      expect(formatService.getDay(index)).toBe(name);
    });
  });

  describe('getMonth', () => {
    it('returns the current month name when no argument is provided', () => {
      vi.setSystemTime(new Date(2023, 0, 15)); // January
      expect(formatService.getMonth()).toBe('January');
    });

    it.each([
      [0, 'January'],
      [1, 'February'],
      [2, 'March'],
      [3, 'April'],
      [4, 'May'],
      [5, 'June'],
      [6, 'July'],
      [7, 'August'],
      [8, 'September'],
      [9, 'October'],
      [10, 'November'],
      [11, 'December'],
    ])('returns the right name for index %i (%s)', (index, name) => {
      expect(formatService.getMonth(index)).toBe(name);
    });
  });

  describe('getFormat', () => {
    const morning: TimeFormatDetails = { currentTime: 'morning', greeting: 'Good Morning!', backgroundColor: 'efdf7e', dateColor: '665800' };
    const afternoon: TimeFormatDetails = { currentTime: 'afternoon', greeting: 'Good Afternoon!', backgroundColor: 'efdf7e', dateColor: '665800' };
    const evening: TimeFormatDetails = { currentTime: 'evening', greeting: 'Good Evening!', backgroundColor: 'ff851b', dateColor: 'ffbe84' };
    const night: TimeFormatDetails = { currentTime: 'night', greeting: 'Good Night!', backgroundColor: '001f3f', dateColor: '0074d9' };

    // Boundary-value testing: check the hours right at the edges of each
    // range, where off-by-one bugs (`>` vs `>=`) like to hide.
    it.each([
      { hour: 5, expected: night }, // 5 AM is still night (`> 5`)
      { hour: 6, expected: morning },
      { hour: 8, expected: morning },
      { hour: 11, expected: morning },
      { hour: 12, expected: afternoon },
      { hour: 14, expected: afternoon },
      { hour: 16, expected: afternoon },
      { hour: 17, expected: evening },
      { hour: 18, expected: evening },
      { hour: 19, expected: night },
      { hour: 22, expected: night },
      { hour: 0, expected: night },
    ])('at $hour:00 returns "$expected.currentTime"', ({ hour, expected }) => {
      vi.setSystemTime(new Date(2023, 0, 15, hour));
      expect(formatService.getFormat()).toEqual(expected);
    });
  });

  describe('celsiusFahrenheit', () => {
    it.each([
      [25, 77],
      [0, 32], // freezing point
      [100, 212], // boiling point
      [-40, -40], // the one place both scales meet
      [21, 69], // 69.8 is floored to 69
    ])('converts %i°C to %i°F', (celsius, fahrenheit) => {
      expect(formatService.celsiusFahrenheit(celsius)).toBe(fahrenheit);
    });
  });
});
