import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { ConfigService } from '@nestjs/config';
import { TransformService } from 'src/constants/transformation/transform-service';
import {
  CourseEnrollmentData,
  validateRequired,
  validateString,
  ValidationError,
} from '../types';
const axios = require('axios');

@Injectable()
export class CourseHandler {
  constructor(
    private readonly dbService: DatabaseService,
    private transformService: TransformService,
    private configService: ConfigService,
  ) {}



  async handleCourseEnrollmentCreated(data: CourseEnrollmentData) {
    try {
      // Validate required fields
      validateString(data.userId, 'userId');
      validateString(data.tenantId, 'tenantId');
      validateString(data.courseId, 'courseId');
      validateString(data.status, 'status');

      console.log(
        'Course enrollment created for user:',
        data.userId,
        'course:',
        data.courseId,
      );
      // Fetch course details to get course name
      const courseDetails = await this.getCourseName(data.courseId);
      const courseName = courseDetails.result.content.name || 'Unknown Course';

      // Transform the data for CourseTracker
      const transformedData =
        await this.transformService.transformCourseTrackerData(
          data,
          courseName,
        );

      // Upsert course tracker data (update if exists, create if not)
      await this.dbService.upsertCourseTracker(transformedData);
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(
          'Validation failed in handleCourseEnrollmentCreated:',
          error.message,
        );
        throw new Error(`Validation failed: ${error.message}`);
      }
      console.error('Error handling course enrollment:', error);
      throw error;
    }
  }

  async handleCourseStatusUpdated(data: any) {
    try {
      // Validate required identifiers
      validateString(data.userId, 'userId');
      validateString(data.tenantId, 'tenantId');
      validateString(data.courseId, 'courseId');
      validateString(data.status, 'status');
      validateString(data.certificateId, 'certificateId');
      // Map usercertificateId -> certificateId (if present)

      // Optionally refresh course name if we don't have a record; here we only update existing
      const update = {
        status: data.status,
        createdOn: data.createdOn || data.createdAt || null,
        completedOn: data.completedOn || data.issuedOn || null,
        certificateId: data.certificateId || null,
      };

      const result = await this.dbService.updateCourseTrackerStatus(
        {
          tenantId: data.tenantId,
          userId: data.userId,
          courseId: data.courseId,
        },
        update,
      );

      // No upsert fallback: only update existing record as requested
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error('Validation failed in handleCourseStatusUpdated:', error.message);
        throw new Error(`Validation failed: ${error.message}`);
      }
      console.error('Error handling course status update:', error);
      throw error;
    }
  }

  //get courseName
  async getCourseName(courseId: string) {
    try {
      const baseUrl = this.configService.get('MIDDLEWARE_SERVICE_BASE_URL');
      if (!baseUrl) {
        throw new Error('MIDDLEWARE_SERVICE_BASE_URL not configured');
      }

      const url = new URL(
        `api/course/v1/hierarchy/${courseId}?mode=edit`,
        baseUrl,
      );

      const headers = {
        'Content-Type': 'application/json',
      };

      let contentResponse = await axios.get(url.toString(), {
        headers,
        timeout: 10000, // 10 second timeout
      });
      return contentResponse.data;
    } catch (error) {
      console.error(
        'Error fetching course name for courseId:',
        courseId,
        error.message,
      );
      throw error;
    }
  }
}
