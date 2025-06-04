import formatService, { TimeFormatDetails } from './format.service';

describe('FormatService', () => {
  // let formatService: FormatService; // formatService is now imported directly

  // beforeEach(() => { // No longer needed as formatService is imported directly
  //   formatService = new FormatService();
  // });

  describe('getDay', () => {
    it('should return the correct day string when no argument is provided', () => {
      // Mock new Date() to return a specific day (e.g., Sunday)
      const mockDate = new Date(2023, 10, 26); // Sunday
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      expect(formatService.getDay()).toBe('Sunday');
      jest.restoreAllMocks();
    });

    it('should return the correct day string when a day index is provided', () => {
      // Temporarily mock now for these specific calls to getDay(index)
      // to ensure now.getDay() isn't called by mistake if getDay was implemented differently.
      // Although with the current implementation of getDay(index), this is not strictly necessary.
      const originalDate = global.Date;
      const mockDateForIndexTest = new Date(); // Any date is fine here
      global.Date = jest.fn(() => mockDateForIndexTest) as any;

      expect(formatService.getDay(0)).toBe('Sunday');
      expect(formatService.getDay(1)).toBe('Monday');
      expect(formatService.getDay(2)).toBe('Tuesday');
      expect(formatService.getDay(3)).toBe('Wednesday');
      expect(formatService.getDay(4)).toBe('Thursday');
      expect(formatService.getDay(5)).toBe('Friday');
      expect(formatService.getDay(6)).toBe('Saturday');
      global.Date = originalDate; // Restore original Date
    });
  });

  describe('getMonth', () => {
    it('should return the correct month string when no argument is provided', () => {
      // Mock new Date() to return a specific month (e.g., January)
      const mockDate = new Date(2023, 0, 15); // January
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      expect(formatService.getMonth()).toBe('January');
      jest.restoreAllMocks();
    });

    it('should return the correct month string when a month index is provided', () => {
      const originalDate = global.Date;
      const mockDateForIndexTest = new Date(); // Any date is fine here
      global.Date = jest.fn(() => mockDateForIndexTest) as any;

      expect(formatService.getMonth(0)).toBe('January');
      expect(formatService.getMonth(1)).toBe('February');
      expect(formatService.getMonth(2)).toBe('March');
      expect(formatService.getMonth(3)).toBe('April');
      expect(formatService.getMonth(4)).toBe('May');
      expect(formatService.getMonth(5)).toBe('June');
      expect(formatService.getMonth(6)).toBe('July');
      expect(formatService.getMonth(7)).toBe('August');
      expect(formatService.getMonth(8)).toBe('September');
      expect(formatService.getMonth(9)).toBe('October');
      expect(formatService.getMonth(10)).toBe('November');
      expect(formatService.getMonth(11)).toBe('December');
      global.Date = originalDate; // Restore original Date
    });
  });

  describe('getFormat', () => {
    it('should return the correct TimeFormatDetails for morning', () => {
      // Mock new Date() to return 8 AM
      const mockDate = new Date(2023, 0, 15, 8);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      // The actual service returns different properties than what was in the original test
      // I will use the actual return type from format.service.ts
      const expected: TimeFormatDetails = { currentTime: 'morning', greeting: 'Good Morning!', backgroundColor: 'efdf7e', dateColor: '665800' };
      expect(formatService.getFormat()).toEqual(expected);
      jest.restoreAllMocks();
    });

    it('should return the correct TimeFormatDetails for afternoon', () => {
      // Mock new Date() to return 2 PM (14:00)
      const mockDate = new Date(2023, 0, 15, 14);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      const expected: TimeFormatDetails = { currentTime: 'afternoon', greeting: 'Good Afternoon!', backgroundColor: 'efdf7e', dateColor: '665800' };
      expect(formatService.getFormat()).toEqual(expected);
      jest.restoreAllMocks();
    });

    it('should return the correct TimeFormatDetails for evening', () => {
      // Mock new Date() to return 6 PM (18:00)
      const mockDate = new Date(2023, 0, 15, 18);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      const expected: TimeFormatDetails = { currentTime: 'evening', greeting: 'Good Evening!', backgroundColor: 'ff851b', dateColor: 'ffbe84' };
      expect(formatService.getFormat()).toEqual(expected);
      jest.restoreAllMocks();
    });

    it('should return the correct TimeFormatDetails for night', () => {
      // Mock new Date() to return 10 PM (22:00)
      const mockDate = new Date(2023, 0, 15, 22);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      const expected: TimeFormatDetails = { currentTime: 'night', greeting: 'Good Night!', backgroundColor: '001f3f', dateColor: '0074d9' };
      expect(formatService.getFormat()).toEqual(expected);
      jest.restoreAllMocks();
    });
  });

  describe('fahrenheitCelsius', () => {
    it('should convert 32°F to 0°C', () => {
      expect(formatService.fahrenheitCelsius(32)).toBe(0);
    });

    it('should convert 212°F to 100°C', () => {
      expect(formatService.fahrenheitCelsius(212)).toBe(100);
    });

    it('should convert -4°F to -20°C', () => {
      expect(formatService.fahrenheitCelsius(-4)).toBe(-20);
    });

    it('should convert 0°F to -18°C (approximately)', () => {
      expect(formatService.fahrenheitCelsius(0)).toBe(-18); // Actually -17.77... but floors to -18
    });
  });
});
