import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { ConfigService } from '@nestjs/config';
import { TransformService } from 'src/constants/transformation/transform-service';
const axios = require('axios');

@Injectable()
export class CourseHandler {
  constructor(
    private readonly dbService: DatabaseService,
    private tranformServie: TransformService,
    private configService: ConfigService,
  ) {}


  async handleUserCourseadd(data: any) {
    try {
      // Only save user course certificate data, no need for separate course entity
      return this.dbService.saveUserCourseCertificate(data);
    } catch (error) {
      console.error('Error handling user course add:', error);
      throw error;
    }
  }

  async handleCourseEnrollmentCreated(data: any) {
    try {
      console.log('Course enrollment created:', data);
      // Fetch course details to get course name
      const courseDetails = await this.getCourseName(data.courseId);
      const courseName = courseDetails.result.content.name || 'Unknown Course';
      
      // Transform the data for CourseTracker
      const transformedData = await this.tranformServie.transformCourseTrackerData(data, courseName);
      
      // Upsert course tracker data (update if exists, create if not)
      await this.dbService.upsertCourseTracker(transformedData);
      
      console.log('Course enrollment processed successfully:', {
        userId: data.userId,
        courseId: data.courseId,
        status: data.status
      });
      
    } catch (error) {
      console.error('Error handling course enrollment:', error);
      throw error;
    }
  }
  async handleUserCourseUpdate(data: any) {
    const trandFormedData = await this.tranformServie.transformCourseData(data);
    return this.dbService.updateUserCourseCertificate(trandFormedData);
  }
  
  //get courseName
  async getCourseName(courseId) {
    // const url = https://dev-interface.prathamdigital.org/interface/v1/api/course/v1/hierarchy/do_214374775354441728134
    const url =
      this.configService.get('MIDDLEWARE_SERVICE_BASE_URL') +
      'api/course/v1/hierarchy/' +
      courseId +
      '?mode=edit';
    console.log('url', url);
    const headers = {
      'Content-Type': 'application/json',
    };

    let contentResponse = await axios.get(url, { headers });
    return contentResponse.data;
  }
}
