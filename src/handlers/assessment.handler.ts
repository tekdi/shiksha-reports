import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { DatabaseService } from '../services/database.service';
import { TransformService } from 'src/constants/transformation/transform-service';

@Injectable()
export class AssessmentHandler {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly transformService: TransformService,
  ) { }

  async handleAssessmentUpsert(data: any) {
    try {
      const identifier = data?.courseId; // Adjust key if it's nested elsewhere

      if (!identifier) {
        throw new Error('Identifier is required for API call');
      }
       
       const apiResponse = await axios.post(
         process.env.MIDDLEWARE_SERVICE_BASE_URL + 'action/composite/v3/search',
         {
           request: {
             filters: {
               identifier: [identifier],
             },
           },
         },
       );

       if (!(apiResponse.data as any)?.result?.QuestionSet?.[0]) {
        throw new Error('Invalid API response structure or empty QuestionSet');
      }
      const externalData = (apiResponse.data as any)?.result?.QuestionSet?.[0];

      const enrichedData = {
        ...data,
        // Add metadata from API with safe access
        assessmentName: externalData?.name || null,
        description: externalData?.description || null,
        subject: Array.isArray(externalData?.subject) ? externalData.subject[0] : externalData?.subject || null,
        domain: externalData?.domain || null,
        subDomain: Array.isArray(externalData?.subDomain) ? externalData.subDomain[0] : externalData?.subDomain || null,
        channel: externalData?.channel || null,
        assessmentType: externalData?.assessmentType || null,
        program: Array.isArray(externalData?.program) ? externalData.program[0] : externalData?.program || null,
        targetAgeGroup: Array.isArray(externalData?.targetAgeGroup) ? externalData.targetAgeGroup[0] : externalData?.targetAgeGroup || null,
        contentLanguage: Array.isArray(externalData?.contentLanguage) ? externalData.contentLanguage[0] : externalData?.contentLanguage || null,
        status: externalData?.status || null,
        framework: externalData?.framework || null,
        summaryType: externalData?.summaryType || null
      };

      // Step 2: Transform data using new AssessmentTracker structure
      const { assessmentData, scoreDetails } = await this.transformService.transformAssessmentTrackerData(enrichedData);

      // Step 3: Save assessment tracker data
      await this.dbService.upsertAssessmentTracker(assessmentData);

    } catch (error) {
      console.error('Error handling assessment upsert:', error);
      throw error;
    }
  }

  async handleAssessmentDelete(data: any) {
    return this.dbService.deleteAssessmentTrackerData(data);
  }
}
