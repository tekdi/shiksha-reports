import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { TransformService } from 'src/constants/transformation/transform-service';

@Injectable()
export class CohortHandler {
  constructor(
    private readonly dbService: DatabaseService,
    private transformService: TransformService,
  ) {}

  async handleCohortUpsert(data: any) {
    try {
      const transformedData = await this.transformService.transformCohortSummaryData(data);
      return this.dbService.saveCohortSummaryData(transformedData);
    } catch (error) {
      console.error('Error handling cohort upsert:', error);
      throw error;
    }
  }

  async handleCohortDelete(data: any) {
    try {
      return this.dbService.deleteCohortSummaryData(data);
    } catch (error) {
      console.error('Error handling cohort delete:', error);
      throw error;
    }
  }

  async handleCohortUpdate(data: any) {
    try {
      const transformedData = await this.transformService.transformCohortSummaryData(data);
      // For update, we need to use the cohortId as the identifier
      const { cohortId, ...updateData } = transformedData;
      return this.dbService.updateCohortSummaryData(cohortId, updateData);
    } catch (error) {
      console.error('Error handling cohort update:', error);
      throw error;
    }
  }
} 