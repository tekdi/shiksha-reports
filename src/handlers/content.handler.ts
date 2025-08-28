import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';
import { ConfigService } from '@nestjs/config';
import { TransformService } from 'src/constants/transformation/transform-service';
import {
  ContentTrackingData,
  validateRequired,
  validateString,
  ValidationError,
} from '../types';
import { StructuredLogger } from '../utils/logger';
const axios = require('axios');

@Injectable()
export class ContentHandler {
  private readonly logger = new StructuredLogger('ContentHandler');

  constructor(
    private readonly dbService: DatabaseService,
    private transformService: TransformService,
    private configService: ConfigService,
  ) {}

  async handleContentTrackingCreated(data: ContentTrackingData) {
    try {
      // Validate required fields
      validateString(data.userId, 'userId');
      validateString(data.tenantId, 'tenantId');
      validateString(data.contentId, 'contentId');

      // Fetch content details to get content name
      const contentDetails = await this.getContentName(data.contentId);
      const contentName = contentDetails?.name || 'Unknown Content';

      // Transform the data for ContentTracker
      const transformedData =
        await this.transformService.transformContentTrackerData(
          data,
          contentName,
        );

      // Upsert content tracker data (update if exists and status changed, create if not)
      const result = await this.dbService.upsertContentTracker(transformedData);

      this.logger.logDatabaseOperation('upsert', 'ContentTracker', {
        userId: data.userId,
        contentId: data.contentId,
        tenantId: data.tenantId,
      });

      return result;
    } catch (error) {
      if (error instanceof ValidationError) {
        this.logger.logValidationError(
          error.field || 'unknown',
          null,
          error.message,
        );
        throw new Error(`Validation failed: ${error.message}`);
      }
      this.logger.error(
        'Error in handleContentTrackingCreated',
        error as Error,
        {
          userId: data.userId,
          contentId: data.contentId,
        },
      );
      throw error;
    }
  }

  // Get content name using the API
  async getContentName(contentId: string) {
    try {
      const baseUrl = this.configService.get('MIDDLEWARE_SERVICE_BASE_URL');
      if (!baseUrl) {
        throw new Error('MIDDLEWARE_SERVICE_BASE_URL not configured');
      }

      const url = new URL('action/composite/v3/search', baseUrl);

      const apiResponse = await axios.post(
        url.toString(),
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
          timeout: 10000, // 10 second timeout
        },
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
      this.logger.warn('Failed to fetch content name, using fallback', {
        contentId,
        error: (error as Error).message,
      });
      return { name: 'Unknown Content' };
    }
  }
}
