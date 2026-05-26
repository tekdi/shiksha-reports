import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';

@Injectable()
export class CohortAcademicYearHandler {
  private readonly logger = new Logger(CohortAcademicYearHandler.name);

  constructor(private readonly dbService: DatabaseService) {}

  async handleCohortAcademicYearCreated(data: any) {
    try {
      this.logger.debug(
        `Incoming cohort academic year created event: ${JSON.stringify(data)}`,
      );

      // Map to entity fields: cohortAcYrMappingId, cohortId, acYrId, tenantId
      const cohortAcYrMappingId = data?.cohortAcademicYearId;
      const acYrId = data?.academicYearId;
      const cohortId = data?.cohortId;
      const tenantId = data?.tenantId;
      if (!cohortAcYrMappingId) {
        this.logger.warn('Missing cohortAcademicYearId in COHORT_ACADEMIC_YEAR_CREATED event');
        return;
      }

      if (!acYrId || !cohortId || !tenantId) {
        this.logger.warn(
          `Missing required fields | academicYearId=${acYrId} | cohortId=${cohortId} | tenantId=${tenantId}`,
        );
        return;
      }

      const payload = {
        cohortAcYrMappingId,
        acYrId,
        cohortId,
        tenantId 
      };

      await this.dbService.saveCohortAcademicYearData(payload);
      this.logger.log(
        `Saved cohort academic year mapping | cohortAcYrMappingId=${cohortAcYrMappingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle cohort academic year created: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
