// db-config.js
require('dotenv').config();

const dbConfig = {
  source: {
    user: process.env.SOURCE_DB_USER,
    password: process.env.SOURCE_DB_PASSWORD,
    host: process.env.SOURCE_DB_HOST,
    port: parseInt(process.env.SOURCE_DB_PORT || '5432'),
    database: process.env.SOURCE_DB_NAME
  },
  destination: {
    user: process.env.DEST_DB_USER,
    password: process.env.DEST_DB_PASSWORD,
    host: process.env.DEST_DB_HOST,
    port: parseInt(process.env.DEST_DB_PORT || '5555'),
    database: process.env.DEST_DB_NAME
  },
  attendance_source: {
    user: process.env.ATTENDANCE_SOURCE_DB_USER,
    password: process.env.ATTENDANCE_SOURCE_DB_PASSWORD,
    host: process.env.ATTENDANCE_SOURCE_DB_HOST,
    port: parseInt(process.env.ATTENDANCE_SOURCE_DB_PORT || '5432'),
    database: process.env.ATTENDANCE_SOURCE_DB_NAME
  },
  attendance_destination: { 
    user: process.env.ATTENDANCE_DESTINATION_DB_USER,
    password: process.env.ATTENDANCE_DESTINATION_DB_PASSWORD,
    host: process.env.ATTENDANCE_DESTINATION_DB_HOST,
    port: parseInt(process.env.ATTENDANCE_DESTINATION_DB_PORT || '5432'),
    database: process.env.ATTENDANCE_DESTINATION_DB_NAME
  },
  assessment_source: {
    user: process.env.ASSESSMENT_SOURCE_DB_USER,
    password: process.env.ASSESSMENT_SOURCE_DB_PASSWORD,
    host: process.env.ASSESSMENT_SOURCE_DB_HOST,
    port: parseInt(process.env.ASSESSMENT_SOURCE_DB_PORT || '5432'),
    database: process.env.ASSESSMENT_SOURCE_DB_NAME
  },
  assessment_destination: { 
    user: process.env.ASSESSMENT_DESTINATION_DB_USER,
    password: process.env.ASSESSMENT_DESTINATION_DB_PASSWORD,
    host: process.env.ASSESSMENT_DESTINATION_DB_HOST,
    port: parseInt(process.env.ASSESSMENT_DESTINATION_DB_PORT || '5432'),
    database: process.env.ASSESSMENT_DESTINATION_DB_NAME
  },
  user_source: {
    user: process.env.USER_SOURCE_DB_USER,
    password: process.env.USER_SOURCE_DB_PASSWORD,
    host: process.env.USER_SOURCE_DB_HOST,
    port: parseInt(process.env.USER_SOURCE_DB_PORT || '5432'),
    database: process.env.USER_SOURCE_DB_NAME
  },
  user_destination: { 
    user: process.env.USER_DESTINATION_DB_USER,
    password: process.env.USER_DESTINATION_DB_PASSWORD,
    host: process.env.USER_DESTINATION_DB_HOST,
    port: parseInt(process.env.USER_DESTINATION_DB_PORT || '5432'),
    database: process.env.USER_DESTINATION_DB_NAME
  },
  event_source: {
    user: process.env.EVENT_SOURCE_DB_USER,
    password: process.env.EVENT_SOURCE_DB_PASSWORD,
    host: process.env.EVENT_SOURCE_DB_HOST,
    port: parseInt(process.env.EVENT_SOURCE_DB_PORT || '5432'),
    database: process.env.EVENT_SOURCE_DB_NAME
  },
  event_destination: { 
    user: process.env.EVENT_DESTINATION_DB_USER,
    password: process.env.EVENT_DESTINATION_DB_PASSWORD,
    host: process.env.EVENT_DESTINATION_DB_HOST,
    port: parseInt(process.env.EVENT_DESTINATION_DB_PORT || '5432'),
    database: process.env.EVENT_DESTINATION_DB_NAME
  }
};

module.exports = dbConfig;