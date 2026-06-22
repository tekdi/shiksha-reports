import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { validateString, ValidationError } from '../types';

export type RegistrationStatus = 'pending' | 'active' | 'inactive';

export interface RegistrationUpsertData {
  userId: string;
  tenantId: string;
  roleId: string;
  status?: RegistrationStatus;
  platformRegnDate?: Date | string;
  tenantRegnDate?: Date | string;
  reason?: string;
}

export interface RegistrationStatusUpdateData {
  userId: string;
  tenantId: string;
  roleId?: string;
  status: RegistrationStatus;
  reason?: string;
}

@Injectable()
export class RegistrationHandler {
  constructor(private readonly dbService: DatabaseService) {}

  async handleRegistrationUpsert(data: RegistrationUpsertData): Promise<any> {
    try {
      validateString(data.userId, 'userId');
      validateString(data.tenantId, 'tenantId');
      validateString(data.roleId, 'roleId');

      const registrationData: any = {
        userId: data.userId,
        tenantId: data.tenantId,
        roleId: data.roleId,
        status: data.status ?? 'active',
        platformRegnDate: data.platformRegnDate ? new Date(data.platformRegnDate) : new Date(),
        tenantRegnDate: data.tenantRegnDate ? new Date(data.tenantRegnDate) : new Date(),
        reason: data.reason,
      };

      const result = await this.dbService.upsertRegistrationTracker(registrationData);

      console.log(
        `[RegistrationHandler] Upserted registration: userId=${data.userId}, tenantId=${data.tenantId}, roleId=${data.roleId}, status=${registrationData.status}`
      );

      return result;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(`Validation failed: ${error.message}`);
      }
      console.error('[RegistrationHandler] Error in handleRegistrationUpsert:', error);
      throw error;
    }
  }

  async handleRegistrationStatusUpdate(data: RegistrationStatusUpdateData): Promise<any> {
    try {
      validateString(data.userId, 'userId');
      validateString(data.tenantId, 'tenantId');

      const validStatuses: RegistrationStatus[] = ['pending', 'active', 'inactive'];
      if (!validStatuses.includes(data.status)) {
        throw new Error(`Invalid status "${data.status}". Must be one of: ${validStatuses.join(', ')}`);
      }

      const registrationData: any = {
        userId: data.userId,
        tenantId: data.tenantId,
        status: data.status,
        reason: data.reason,
      };

      if (data.roleId) {
        registrationData.roleId = data.roleId;
      }

      const result = await this.dbService.upsertRegistrationTracker(registrationData);

      console.log(
        `[RegistrationHandler] Status updated: userId=${data.userId}, tenantId=${data.tenantId}, roleId=${data.roleId ?? 'all'}, status=${data.status}`
      );

      return result;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(`Validation failed: ${error.message}`);
      }
      console.error('[RegistrationHandler] Error in handleRegistrationStatusUpdate:', error);
      throw error;
    }
  }
}
