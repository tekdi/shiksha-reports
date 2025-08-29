import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { TransformService } from 'src/constants/transformation/transform-service';
import {
  UserEventData,
  validateRequired,
  validateString,
  ValidationError,
} from '../types';

@Injectable()
export class UserHandler {
  constructor(
    private readonly dbService: DatabaseService,
    private transformService: TransformService,
  ) {}

  async handleUserUpsert(data: UserEventData) {
    try {
      // Validate required fields
      validateString(data.userId, 'userId');

      // Transform and save user data
      const transformedUserData =
        await this.transformService.transformUserData(data);
      const savedUser =
        await this.dbService.saveUserProfileData(transformedUserData);

      // Transform and save cohort member data if cohorts exist
      if (
        data.cohorts &&
        Array.isArray(data.cohorts) &&
        data.cohorts.length > 0
      ) {
        const cohortMemberData =
          await this.transformService.transformCohortMemberData(data);

        // Save each cohort member relationship
        for (const cohortMember of cohortMemberData) {
          await this.dbService.saveCohortMemberData(cohortMember);
        }
      }

      return savedUser;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(`Validation failed: ${error.message}`);
      }
      throw error;
    }
  }

  async handleUserCreated(data: UserEventData) {
    try {
      // Validate required fields
      validateString(data.userId, 'userId');

      // First handle the regular user upsert
      const savedUser = await this.handleUserUpsert(data);

      // For USER_CREATED events, also save registration tracker data
      if (data.tenantData && Array.isArray(data.tenantData)) {
        const registrationTrackers = await this.transformService.transformRegistrationTrackerData(data);
        
        // Save each registration tracker entry
        for (const registrationTracker of registrationTrackers) {
          await this.dbService.upsertRegistrationTracker(registrationTracker);
        }
      }

      return savedUser;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(`Validation failed: ${error.message}`);
      }
      throw error;
    }
  }

  async handleUserDelete(data: { userId: string }) {
    try {
      validateString(data.userId, 'userId');
      return this.dbService.deleteUserProfileData(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(`Validation failed: ${error.message}`);
      }
      throw error;
    }
  }

  async handleCohortUpsert(data: any) {
    try {
      validateString(data.cohortId, 'cohortId');
      const transformedCohortData =
        await this.transformService.transformCohortData(data);
      return this.dbService.saveCohortData(transformedCohortData);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(`Validation failed: ${error.message}`);
      }
      throw error;
    }
  }

  async handleCohortDelete(data: { cohortId: string }) {
    try {
      validateString(data.cohortId, 'cohortId');
      return this.dbService.deleteCohortData(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(`Validation failed: ${error.message}`);
      }
      throw error;
    }
  }
}
