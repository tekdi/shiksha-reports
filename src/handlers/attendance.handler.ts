import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { TranformService } from 'src/constants/transformation/transform-service';

@Injectable()
export class AttendanceHandler {
  constructor(
    private readonly dbService: DatabaseService,
    private tranformServie: TranformService
  ) {}

  async handleAttendanceUpsert(data: any) {
    const transformedData = await this.tranformServie.transformDailyAttendanceData(data);
    return this.dbService.saveDailyAttendanceData(transformedData);
  }

  async handleAttendanceDelete(data: any) {
    return this.dbService.deleteDailyAttendanceData(data);
  }
} 