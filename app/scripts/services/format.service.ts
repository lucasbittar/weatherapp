/**
 * Project Name: Weather App | Format Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 */

'use strict';

// Days Array
const days: string[] = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
// Months
const months: string[] = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

// Interface for the object returned by getFormat
export interface TimeFormatDetails {
  currentTime: string;
  greeting: string;
  backgroundColor: string;
  dateColor: string;
}

// Returns a string with the day of the week
const getDay = function(day?: number): string {
  const currentDate = new Date();
  return days[ day !== undefined ? day : currentDate.getDay()];
}

// Returns a string with the month
const getMonth = function(month?: number): string {
  const currentDate = new Date();
  return months[ month !== undefined ? month : currentDate.getMonth()];
}

// Returns format based on current time
const getFormat = function(): TimeFormatDetails {
  const currentDate = new Date();
  const currentHours = currentDate.getHours();

  if ( currentHours > 5 && currentHours < 12) {
    return {
      currentTime: 'morning',
      greeting: 'Good Morning!',
      backgroundColor: 'efdf7e',
      dateColor: '665800'
    };
  } else if ( currentHours >= 12 && currentHours < 17 ) {
    return {
      currentTime: 'afternoon',
      greeting: 'Good Afternoon!',
      backgroundColor: 'efdf7e',
      dateColor: '665800'
    };
  } else if ( currentHours >= 17 && currentHours < 19 ) {
    return {
      currentTime: 'evening',
      greeting: 'Good Evening!',
      backgroundColor: 'ff851b',
      dateColor: 'ffbe84'
    };
  } else {
    return {
      currentTime: 'night',
      greeting: 'Good Night!',
      backgroundColor: '001f3f',
      dateColor: '0074d9'
    };
  }
}

// Converts Fahrenheit to Celsius
const celsiusFahrenheit = function(tempC: number): number {
  const tempF = Math.floor(tempC * 1.8 + 32);
  return tempF;
}

interface FormatService {
  getDay: (day?: number) => string;
  getMonth: (month?: number) => string;
  getFormat: () => TimeFormatDetails;
  celsiusFahrenheit: (tempF: number) => number;
}

const formatService: FormatService = {
  getDay: getDay,
  getMonth: getMonth,
  getFormat: getFormat,
  celsiusFahrenheit: celsiusFahrenheit
};

export default formatService;
