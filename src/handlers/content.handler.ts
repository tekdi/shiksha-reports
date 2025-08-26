import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { ConfigService } from '@nestjs/config';
import { TransformService } from 'src/constants/transformation/transform-service';
const axios = require('axios');

@Injectable()
export class ContentHandler {
  constructor(
    private readonly dbService: DatabaseService,
    private tranformServie: TransformService,
    private configService: ConfigService,
  ) {}

  async handleContentTrackingCreated(data: any) {
    try {
      
      // Fetch content details to get content name
      const contentDetails = await this.getContentName(data.contentId);
      const contentName = contentDetails?.name || 'Unknown Content';
      
      // Transform the data for ContentTracker
      const transformedData = await this.tranformServie.transformContentTrackerData(data, contentName);
      
      // Upsert content tracker data (update if exists and status changed, create if not)
      const result = await this.dbService.upsertContentTracker(transformedData);
      return result;
      
    } catch (error) {
      throw error;
    }
  }
  
  // Get content name using the API
  async getContentName(contentId: string) {
    try {
      
      const apiResponse = await axios.post(
        this.configService.get('MIDDLEWARE_SERVICE_BASE_URL') + 'action/composite/v3/search',
        {
          request: {
            filters: {
              identifier: [contentId],
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );


      // Check for different possible response structures
      let contentData = null;
      
      if (apiResponse.data?.result?.QuestionSet?.[0]) {
        contentData = apiResponse.data.result.QuestionSet[0];
      } else if (apiResponse.data?.result?.content?.[0]) {
        contentData = apiResponse.data.result.content[0];
      } else if (apiResponse.data?.result?.Content?.[0]) {
        contentData = apiResponse.data.result.Content[0];
      }

      if (!contentData) {
        return { name: 'Unknown Content' };
      }

      return contentData;

    } catch (error) {
      return { name: 'Unknown Content' };
    }
  }
}