import { Injectable } from '@nestjs/common';
import { UserProfileReport } from '../../entities/user-profile.entity';



@Injectable()
export class TranformService {
  constructor(){}
  
   async transformUserData(data: any) {
    try {
     const tenant = data.tenantData?.[0] ?? {};
  
      // Extract custom field values
      const extractField = (label: string) =>
        data.customFields?.find((f: any) => f.label === label)?.selectedValues?.[0]?.value ?? null;
  
      const transformedData: Partial<UserProfileReport> = {
        userId: data.userId,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        dob: data.dob,
        gender: data.gender,
        status: data.status,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
        tenantId: tenant.tenantId,
        tenantName: tenant.tenantName,
        roleId: tenant.roleId,
        roleName: tenant.roleName,
        customFields: data.customFields ?? [],
        cohorts: data.cohorts ?? [],
        automaticMember: data.automaticMember ?? false,
        state: extractField('STATE'),
        district: extractField('DISTRICT'),
        block: extractField('BLOCK'),
        village: extractField('VILLAGE'),
      };
      console.log(transformedData)
      return transformedData;
    } catch (error) {
      return error;
    }
  }
  
  
}
