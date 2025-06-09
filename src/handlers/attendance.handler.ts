import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { TransformService } from 'src/constants/transformation/transform-service';

@Injectable()
export class AttendanceHandler {
  constructor(
    private readonly dbService: DatabaseService,
    private transformService: TransformService
  ) {}

  async handleAttendanceUpsert(data: any): Promise<any> {
      try {
        const transformedData = await this.transformService.transformDailyAttendanceData(data);
        return await this.dbService.saveDailyAttendanceData(transformedData);
      } catch (error) {
        // Log error and handle appropriately
        throw error;
      }
  }

  async handleAttendanceDelete(data: any): Promise<any> {
      try {
        return await this.dbService.deleteDailyAttendanceData(data);
      } catch (error) {
        // Log error and handle appropriately
        throw error;
      }
  }
} 