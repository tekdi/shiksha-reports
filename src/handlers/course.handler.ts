import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { TranformService } from 'src/constants/transformation/transform-service';

@Injectable()
export class CourseHandler {
  constructor(
    private readonly dbService: DatabaseService,
    private tranformServie: TranformService,
  ) {}

  async handleUserCourseadd(data: any) {
    const trandFormedData = this.tranformServie.mapContentToCourseEntity(
      data.courseData,
    );
    await this.dbService.saveCourse(trandFormedData);
    return this.dbService.saveUserCourseCertificate(data.data);
  }
  async handleUserCourseUpdate(data: any) {
    const trandFormedData = await this.tranformServie.transformCourseData(data);
    return this.dbService.updateUserCourseCertificate(trandFormedData);
  }
}
