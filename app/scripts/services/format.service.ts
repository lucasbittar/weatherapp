/**
 * Project Name: Weather App | Format Service
 * Author: Lucas Bittar Magnani
 * Created: 20170201
 */

'use strict';

const now = new Date();
const hours = now.getHours();

// Days Array
const days: string[] = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
// Months
const months: string[] = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

// Interface for the object returned by getFormat
interface TimeFormatDetails {
  currentTime: string;
  greeting: string;
  backgroundColor: string;
  dateColor: string;
}

// Returns a string with the day of the week
const getDay = function(day?: number): string {
  return days[ day !== undefined ? day : now.getDay()];
}

// Returns a string with the month
const getMonth = function(month?: number): string {
  return months[ month !== undefined ? month : now.getMonth()];
}

// Returns format based on current time
const getFormat = function(): TimeFormatDetails {

  if ( hours > 5 && hours < 12) {
    return {
      currentTime: 'morning',
      greeting: 'Good Morning!',
      backgroundColor: 'efdf7e',
      dateColor: '665800'
    };
  } else if ( hours >= 12 && hours < 17 ) {
    return {
      currentTime: 'afternoon',
      greeting: 'Good Afternoon!',
      backgroundColor: 'efdf7e',
      dateColor: '665800'
    };
  } else if ( hours >= 17 && hours < 19 ) {
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
const fahrenheitCelsius = function(tempF: number): number {
  const tempC = Math.floor((tempF - 32) * 5/9);
  return tempC;
}

interface FormatService {
  getDay: (day?: number) => string;
  getMonth: (month?: number) => string;
  getFormat: () => TimeFormatDetails;
  fahrenheitCelsius: (tempF: number) => number;
}

const formatService: FormatService = {
  getDay: getDay,
  getMonth: getMonth,
  getFormat: getFormat,
  fahrenheitCelsius: fahrenheitCelsius
};

export default formatService;
