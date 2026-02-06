import { Injectable, Logger, OnModuleInit, OnModuleDestroy, ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { QuestionSet } from '../entities/question-set.entity';
import { Content } from '../entities/content.entity';
import { ExternalApiService } from './external-api.service';
import { TransformService } from '../constants/transformation/transform-service';
import { DatabaseService } from './database.service';
import { CronJobStatus, ExternalApiResponse, PrathamContentData } from '../types/cron.types';
import { StructuredLogger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import { console } from 'inspector';

@Injectable()
export class CronJobService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new StructuredLogger('CronJobService');
  private readonly config: any;
  private jobStatus: CronJobStatus = {
    isRunning: false,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly externalApiService: ExternalApiService,
    private readonly transformService: TransformService,
    private readonly databaseService: DatabaseService,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(QuestionSet)
    private readonly questionSetRepo: Repository<QuestionSet>,
    @InjectRepository(Content)
    private readonly contentRepo: Repository<Content>,
  ) {
    this.config = this.configService.get('cron');
  }

  async onModuleInit() {
    this.logger.info('CronJobService initialized');

    // Test external API connection on startup
    const isConnected = await this.externalApiService.testConnection();
    if (!isConnected) {
      this.logger.warn('External API connection test failed on startup');
    }
  }

  async onModuleDestroy() {
    this.logger.info('CronJobService shutting down');
  }

  /**
   * Main cron job method - runs at 12 AM IST (midnight) daily
   */
  @Cron('30 18 * * *') // Runs at 12:00 AM IST (18:30 UTC = 00:00 IST)
  async executeCronJob() {
    if (this.jobStatus.isRunning) {
      this.logger.warn('Cron job is already running, skipping this execution');
      return;
    }

    this.jobStatus.isRunning = true;
    this.jobStatus.lastExecution = new Date();
    this.jobStatus.totalExecutions++;

    try {
      this.logger.info('=== Starting daily cron job execution ===');

      //Process Course data
      const courseResult = await this.processCourseData();

      // Process QuestionSet data
      const questionSetResult = await this.processQuestionSetData();

      // Process Content data
      const contentResult = await this.processContentData();

      this.jobStatus.lastSuccess = new Date();
      this.jobStatus.successfulExecutions++;
      this.jobStatus.lastError = undefined;

      this.logger.info('=== Daily cron job completed successfully ===', {
        courses: courseResult.totalProcessed,
        questionSets: questionSetResult.totalProcessed,
        content: contentResult.totalProcessed,
        duration: `${((Date.now() - this.jobStatus.lastExecution.getTime()) / 1000 / 60).toFixed(2)} minutes`,
      });

    } catch (error) {
      this.jobStatus.failedExecutions++;
      this.jobStatus.lastError = error.message;

      this.logger.error('=== Daily cron job failed ===', error);
    } finally {
      this.jobStatus.isRunning = false;
    }
  }

  /**
   * Process course data from Pratham Digital API
   * Processes Live (created), Retired (updated), and Unlisted (updated) courses
   */
  private async processCourseData(): Promise<{
    totalProcessed: number;
    duration: number;
  }> {
    const startTime = Date.now();
    let totalProcessed = 0;
    let createdCount = 0;
    let retiredCount = 0;
    let unlistedCount = 0;
    const failedCourses: Array<{ identifier: string; name: string; error: string; errorDetail: any }> = [];

    try {
      this.logger.info('→ Fetching course data (Live + Retired + Unlisted)');

      // Fetch data from external API (combines Live, Retired, and Unlisted)
      const apiResponse = await this.externalApiService.fetchCourseData();
      if (!apiResponse.success || !apiResponse.data || apiResponse.data.length === 0) {
        this.logger.info('No course data available');
        return { totalProcessed: 0, duration: Date.now() - startTime };
      }

      const totalCourses = apiResponse.data.length;
      this.logger.info(`Processing ${totalCourses} courses...`);

      // Transform and save each course individually
      for (let i = 0; i < apiResponse.data.length; i++) {
        const courseData = apiResponse.data[i];
        
        try {
          const transformedCourse = await this.transformService.transformExternalCourseData(courseData);

          // Track count by status
          const status = transformedCourse.status?.toLowerCase();
          if (status === 'retired') {
            retiredCount++;
          } else if (status === 'unlisted') {
            unlistedCount++;
          } else {
            createdCount++;
          }

          // Enrich with hierarchy (level arrays + childnodes)
          const hierarchy = await this.externalApiService.getCourseHierarchy(courseData.identifier);
          if (hierarchy) {
            const levels = this.externalApiService.mapCourseLevelsByChannel(hierarchy);
            (transformedCourse as any).level1 = levels.level1 || null;
            (transformedCourse as any).level2 = levels.level2 || null;
            (transformedCourse as any).level3 = levels.level3 || null;
            (transformedCourse as any).level4 = levels.level4 || null;
            (transformedCourse as any).childnodes = hierarchy.children ? JSON.stringify(hierarchy.children) : (transformedCourse as any).childnodes || null;
          }

          await this.saveCourseData(transformedCourse);
          totalProcessed++;
        } catch (error) {
          // Track failed course details
          failedCourses.push({
            identifier: courseData.identifier || 'UNKNOWN',
            name: courseData.name || 'UNKNOWN',
            error: error.message || 'Unknown error',
            errorDetail: {
              code: error.code,
              constraint: error.constraint,
              detail: error.detail,
            },
          });
          
          this.logger.error(`Failed to process course: ${courseData.identifier}`, error);
        }
      }

      // Log summary with failed courses details
      this.logger.info('✓ Course processing completed', {
        total: totalProcessed,
        live: createdCount,
        retired: retiredCount,
        unlisted: unlistedCount,
        failed: failedCourses.length,
      });

      // Log detailed failed courses information if any
      if (failedCourses.length > 0) {
        this.logger.error(`Failed to process ${failedCourses.length} courses`, null, {
          failedCourses: failedCourses,
        });

        // Write failed courses to a file for easy reference
        await this.writeFailedCoursesToFile(failedCourses);
      }

    } catch (error) {
      this.logger.error('Failed to process course data', error);
      throw error;
    }

    const duration = Date.now() - startTime;
    return { totalProcessed, duration };
  }

  // Build flat rows for QuestionSet hierarchy:
  // Output: Array of rows with exact keys:
  // - "section Index Number"
  // - "Section ID"
  // - "Section name"
  // - "Question Index Number"
  // - "Question DO_ID"
  // - "Question Name"
  // - "Question Type"
  // Each row represents one Question under its nearest Section.
  // Missing values are represented as empty string "".
  private buildCompactQuestionSetChildren(root: any): any[] {
    const ensureString = (v: any): string => (v === undefined || v === null ? '' : String(v));
    const ensureIndex = (v: any): number | string => (v === undefined || v === null ? '' : v);
    const stripHtml = (s: any): string => {
      const text = ensureString(s);
      return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    };
    const extractQuestionTitle = (node: any, sectionName: string): string => {
      // Prefer editorState.question/body when available, then title/name fallbacks
      const candidates = [
        node?.editorState?.question,
        node?.editorState?.body,
        node?.body,
        node?.title,
        node?.metadata?.name,
        node?.name, // last fallback
      ];
      for (const c of candidates) {
        const cleaned = stripHtml(c);
        if (cleaned && cleaned.length > 0 && cleaned !== sectionName) {
          return cleaned;
        }
      }
      return '';
    };

    const rows: any[] = [];

    type SectionCtx = {
      sectionIndex: number | string;
      sectionId: string;
      sectionName: string;
    } | null;

    const visit = (node: any, ctx: SectionCtx) => {
      if (!node || typeof node !== 'object') return;

      if (node.objectType === 'QuestionSet') {
        const newCtx: SectionCtx = {
          sectionIndex: ensureIndex((node as any).index),
          sectionId: ensureString(node.identifier),
          sectionName: ensureString(node.name),
        };
        if (Array.isArray(node.children)) {
          for (const child of node.children) {
            visit(child, newCtx);
          }
        }
        return;
      }

      if (node.objectType === 'Question') {
        const sectionName = ctx ? ctx.sectionName : '';
        rows.push({
          'section Index Number': ctx ? ctx.sectionIndex : '',
          'Section do_id': ctx ? ctx.sectionId : '',
          'Section name': ctx ? ctx.sectionName : '',
          'Question Index Number': ensureIndex((node as any).index),
          'Question do_id': ensureString(node.identifier),
          'Question Name': extractQuestionTitle(node, sectionName),
          'Question Type': ensureString((node as any).qType),
        });
        return;
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          visit(child, ctx);
        }
      }
    };

    visit(root, null);
    return rows;
  }

  /**
   * Process question set data from Pratham Digital API (for future use)
   * Processes Live (created), Retired (updated), and Unlisted (updated) question sets
   */
  private async processQuestionSetData() {
    const startTime = Date.now();
    let totalProcessed = 0;
    let createdCount = 0;
    let retiredCount = 0;
    let unlistedCount = 0;
    let failedCount = 0;

    try {
      this.logger.info('→ Fetching question set data (Live + Retired + Unlisted)');

      // Fetch data from external API (combines Live, Retired, and Unlisted)
      const apiResponse = await this.externalApiService.fetchQuestionSetData(); 

      if (!apiResponse.success || !apiResponse.data || apiResponse.data.length === 0) {
        this.logger.info('No question set data available');
        return { totalProcessed: 0, duration: Date.now() - startTime };
      }

      const totalItems = apiResponse.data.length;
      this.logger.info(`Processing ${totalItems} question sets...`);
      
      for (let i = 0; i < apiResponse.data.length; i++) {
        const questionSetData = apiResponse.data[i];
        
        try {
          const transformedQuestionSet = await this.transformService.transformQuestionSetData(questionSetData);

          // Track count by status
          const status = transformedQuestionSet.status?.toLowerCase();
          if (status === 'retired') {
            retiredCount++;
          } else if (status === 'unlisted') {
            unlistedCount++;
          } else {
            createdCount++;
          }

          // Enrich with hierarchy (level arrays + child_nodes)
          const qs = await this.externalApiService.getQuestionSetHierarchy(questionSetData.identifier);
          if (qs) {
            const levels = this.externalApiService.mapQuestionSetLevelsByFramework(qs);
            (transformedQuestionSet as any).level1 = levels.level1 || null;
            (transformedQuestionSet as any).level2 = levels.level2 || null;
            (transformedQuestionSet as any).level3 = levels.level3 || null;
            (transformedQuestionSet as any).level4 = levels.level4 || null;
            // Build compact childNodes JSON: sections with minimal fields and their questions
            const compact = this.buildCompactQuestionSetChildren(qs);
            (transformedQuestionSet as any).childNodes = compact.length > 0 ? JSON.stringify(compact) : (transformedQuestionSet as any).childNodes || null;
          }

          await this.saveQuestionSetData(transformedQuestionSet);
          totalProcessed++;
        } catch (error) {
          failedCount++;
          this.logger.error(`Failed to process question set: ${questionSetData.identifier}`, error);
        }
      }

      this.logger.info('✓ Question set processing completed', {
        total: totalProcessed,
        live: createdCount,
        retired: retiredCount,
        unlisted: unlistedCount,
        failed: failedCount,
      });

    } catch (error) {
      this.logger.error('Failed to process question set data', error);
      throw error;
    }

    const duration = Date.now() - startTime;
    return { totalProcessed, duration };
  }

  /**
   * Process content data from Pratham Digital API
   * Processes Live (created), Retired (updated), and Unlisted (updated) content items
   */
  private async processContentData(): Promise<{
    totalProcessed: number;
    duration: number;
  }> {
    const startTime = Date.now();
    let totalProcessed = 0;
    let createdCount = 0;
    let retiredCount = 0;
    let unlistedCount = 0;
    let failedCount = 0;

    try {
      this.logger.info('→ Fetching content data (Live + Retired + Unlisted)');

      // Fetch data from external API (combines Live, Retired, and Unlisted)
      const apiResponse = await this.externalApiService.fetchContentData();

      if (!apiResponse.success || !apiResponse.data || apiResponse.data.length === 0) {
        this.logger.info('No content data available');
        return { totalProcessed: 0, duration: Date.now() - startTime };
      }

      const totalItems = apiResponse.data.length;
      this.logger.info(`Processing ${totalItems} content items...`);

      // Transform and save each content item individually
      for (let i = 0; i < apiResponse.data.length; i++) {
        const contentData = apiResponse.data[i];
        
        try {
          const transformedContent = await this.transformService.transformContentData(contentData);

          // Track count by status
          const status = transformedContent.status?.toLowerCase();
          if (status === 'retired') {
            retiredCount++;
          } else if (status === 'unlisted') {
            unlistedCount++;
          } else {
            createdCount++;
          }

          await this.saveContentData(transformedContent);
          totalProcessed++;
        } catch (error) {
          failedCount++;
          this.logger.error(`Failed to process content: ${contentData.identifier}`, error);
        }
      }

      this.logger.info('✓ Content processing completed', {
        total: totalProcessed,
        live: createdCount,
        retired: retiredCount,
        unlisted: unlistedCount,
        failed: failedCount,
      });

    } catch (error) {
      this.logger.error('Failed to process content data', error);
      throw error;
    }

    const duration = Date.now() - startTime;
    return { totalProcessed, duration };
  }

  /**
   * Save course data to database
   */
  private async saveCourseData(courseData: Partial<Course>): Promise<void> {
    try {
      // Check if course already exists
      const existingCourse = await this.courseRepo.findOne({
        where: { identifier: courseData.identifier }
      });

      if (existingCourse) {
        // Update existing course
        await this.courseRepo.update(
          { identifier: courseData.identifier },
          {
            ...courseData,
            updated_at: new Date(),
          }
        );
      } else {
        // Create new course
        await this.courseRepo.save(courseData);
      }
    } catch (error) {
      this.logger.error('Failed to save course', error, {
        identifier: courseData.identifier,
      });
      throw error;
    }
  }

  /**
   * Save question set data to database (for future use)
   */
  private async saveQuestionSetData(questionSetData: Partial<QuestionSet>): Promise<void> {
    try {
      // Check if question set already exists
      const existingQuestionSet = await this.questionSetRepo.findOne({
        where: { identifier: questionSetData.identifier }
      });

      if (existingQuestionSet) {
        // Update existing question set
        await this.questionSetRepo.update(
          { identifier: questionSetData.identifier },
          {
            ...questionSetData,
            updated_at: new Date(),
          }
        );
      } else {
        // Create new question set
        await this.questionSetRepo.save(questionSetData);
      }
    } catch (error) {
      this.logger.error('Failed to save question set', error, {
        identifier: questionSetData.identifier,
      });
      throw error;
    }
  }

  /**
   * Save content data to database
   */
  private async saveContentData(contentData: Partial<Content>): Promise<void> {
    try {
      // Check if content already exists
      const existingContent = await this.contentRepo.findOne({
        where: { identifier: contentData.identifier }
      });

      if (existingContent) {
        // Update existing content
        await this.contentRepo.update(
          { identifier: contentData.identifier },
          {
            ...contentData,
            updated_at: new Date(),
          }
        );
      } else {
        // Create new content
        await this.contentRepo.save(contentData);
      }
    } catch (error) {
      this.logger.error('Failed to save content', error, {
        identifier: contentData.identifier,
      });
      throw error;
    }
  }

  /**
   * Get current job status
   */
  getJobStatus(): CronJobStatus {
    return { ...this.jobStatus };
  }

  /**
   * Manually trigger the cron job
   */
  async triggerManualExecution(): Promise<void> {
    this.logger.info('Manual cron job execution triggered');
    await this.executeCronJob();
  }

  /**
   * Write failed courses to a JSON file for easy debugging
   */
  private async writeFailedCoursesToFile(
    failedCourses: Array<{ identifier: string; name: string; error: string; errorDetail: any }>
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const logsDir = path.join(process.cwd(), 'logs');
      
      // Create logs directory if it doesn't exist
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const filename = `failed-courses-${timestamp}.json`;
      const filepath = path.join(logsDir, filename);

      const errorReport = {
        timestamp: new Date().toISOString(),
        totalFailed: failedCourses.length,
        failedCourses: failedCourses,
      };

      fs.writeFileSync(filepath, JSON.stringify(errorReport, null, 2), 'utf8');
      
      this.logger.info(`Failed courses report saved: ${filename}`);
    } catch (error) {
      this.logger.error('Failed to write failed courses to file', error);
    }
  }

  /**
   * Health check method
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: any;
  }> {
    try {
      const apiConnected = await this.externalApiService.testConnection();
      
      return {
        status: apiConnected ? 'healthy' : 'unhealthy',
        details: {
          apiConnected,
          jobStatus: this.jobStatus,
          lastExecution: this.jobStatus.lastExecution,
          lastSuccess: this.jobStatus.lastSuccess,
          lastError: this.jobStatus.lastError,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          jobStatus: this.jobStatus,
        },
      };
    }
  }
}


