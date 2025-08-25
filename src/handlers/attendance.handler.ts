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
        // Use new AttendanceTracker transformation
        const { attendanceData, dayColumn, attendanceValue } = await this.transformService.transformAttendanceData(data);
        return await this.dbService.upsertAttendanceTracker(attendanceData, dayColumn, attendanceValue);
      } catch (error) {
        console.error('Error handling attendance upsert:', error);
        throw error;
      }
  }

  async handleAttendanceDelete(data: any): Promise<any> {
      try {
        return await this.dbService.deleteAttendanceTrackerData(data);
      } catch (error) {
        console.error('Error handling attendance delete:', error);
        throw error;
      }
  }
} 