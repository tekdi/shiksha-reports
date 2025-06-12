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
      //fetch course details
      const courseDetails = await this.getCourseName(data.courseId);
      const trandFormedData = this.tranformServie.mapContentToCourseEntity(
        courseDetails.result.content,
      );
      await this.dbService.saveCourse(trandFormedData);
      return this.dbService.saveUserCourseCertificate(data);
    } catch (error) {}
  }
  async handleUserCourseUpdate(data: any) {
    const trandFormedData = await this.tranformServie.transformCourseData(data);
    return this.dbService.updateUserCourseCertificate(trandFormedData);
  }
  //get courseName
  async getCourseName(courseId) {
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
