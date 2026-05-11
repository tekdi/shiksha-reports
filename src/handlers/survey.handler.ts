import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../services/database.service';

@Injectable()
export class SurveyHandler {
  private readonly logger = new Logger(SurveyHandler.name);

  constructor(private readonly dbService: DatabaseService) {}

  // ─── SurveyList handlers ────────────────────────────────────────────────────

  async handleSurveyCreated(event: any) {
    try {
      const { data, timestamp } = event;
      if (!data?.surveyId) {
        this.logger.warn('SURVEY_CREATED missing surveyId — skipping');
        return;
      }

      const surveyForm = this.extractSurveyForm(data.sections);

      await this.dbService.upsertSurveyList({
        surveyId: data.surveyId,
        surveyName: data.surveyTitle,
        tenantId: data.tenantId,
        targetRole: data.targetRoles ?? [],
        targetGeo: null,
        context: data.contextType ?? null,
        contextId: null,
        type: data.surveyType ?? null,
        createdAt: new Date(data.createdAt || timestamp),
        createdBy: data.createdBy,
        surveyRolloutStartDate: null,
        surveyRolloutEndDate: null,
        isActive: data.status === 'published',
        surveyForm,
      });

      this.logger.log(`SurveyList inserted: ${data.surveyId}`);
    } catch (error) {
      this.logger.error(`handleSurveyCreated failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async handleSurveyUpdated(event: any) {
    try {
      const { data } = event;
      if (!data?.surveyId) {
        this.logger.warn('SURVEY_UPDATED missing surveyId — skipping');
        return;
      }

      const surveyForm = this.extractSurveyForm(data.sections);

      await this.dbService.updateSurveyListMetadata({
        surveyId: data.surveyId,
        surveyName: data.surveyTitle,
        targetRole: data.targetRoles ?? [],
        context: data.contextType ?? null,
        type: data.surveyType ?? null,
        surveyForm,
      });

      this.logger.log(`SurveyList updated: ${data.surveyId}`);
    } catch (error) {
      this.logger.error(`handleSurveyUpdated failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async handleSurveyPublished(event: any) {
    try {
      const { data } = event;
      if (!data?.surveyId) {
        this.logger.warn('SURVEY_PUBLISHED missing surveyId — skipping');
        return;
      }

      await this.dbService.updateSurveyListActiveStatus(data.surveyId, true);
      this.logger.log(`SurveyList published (isActive=true): ${data.surveyId}`);
    } catch (error) {
      this.logger.error(`handleSurveyPublished failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async handleSurveyClosed(event: any) {
    try {
      const { data } = event;
      if (!data?.surveyId) {
        this.logger.warn('SURVEY_CLOSED missing surveyId — skipping');
        return;
      }

      await this.dbService.updateSurveyListActiveStatus(data.surveyId, false);
      this.logger.log(`SurveyList closed (isActive=false): ${data.surveyId}`);
    } catch (error) {
      this.logger.error(`handleSurveyClosed failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async handleSurveyDeleted(event: any) {
    try {
      const { data } = event;
      if (!data?.surveyId) {
        this.logger.warn('SURVEY_DELETED missing surveyId — skipping');
        return;
      }

      await this.dbService.deleteSurveyList(data.surveyId);
      this.logger.log(`SurveyList deleted: ${data.surveyId}`);
    } catch (error) {
      this.logger.error(`handleSurveyDeleted failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ─── SurveyTracker handlers ─────────────────────────────────────────────────

  async handleResponseStarted(event: any) {
    try {
      const { data, timestamp } = event;
      if (!data?.responseId) {
        this.logger.warn('RESPONSE_STARTED missing responseId — skipping');
        return;
      }

      await this.dbService.insertSurveyTracker({
        surveyTrackingId: data.responseId,
        surveyId: data.surveyId,
        tenantId: data.tenantId,
        targetRoleUserId: data.respondentId ?? null,
        context: data.contextType ?? null,
        contextId: data.contextId ?? null,
        surveySummary: null,
        surveyResponseStatusIndividual: 'in_progress',
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
      });

      this.logger.log(`SurveyTracker inserted (RESPONSE_STARTED): ${data.responseId}`);
    } catch (error) {
      this.logger.error(`handleResponseStarted failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async handleResponseUpdated(event: any) {
    try {
      const { data, timestamp } = event;
      if (!data?.responseId) {
        this.logger.warn('RESPONSE_UPDATED missing responseId — skipping');
        return;
      }

      await this.dbService.updateSurveyTrackerProgress({
        surveyTrackingId: data.responseId,
        context: data.contextType ?? null,
        contextId: data.contextId ?? null,
        surveySummary: data.responseData ?? null,
        surveyResponseStatusIndividual: data.status,
        updatedAt: new Date(timestamp),
      });

      this.logger.log(`SurveyTracker updated (RESPONSE_UPDATED): ${data.responseId}`);
    } catch (error) {
      this.logger.error(`handleResponseUpdated failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async handleResponseSubmitted(event: any) {
    try {
      const { data, timestamp } = event;
      if (!data?.responseId) {
        this.logger.warn('RESPONSE_SUBMITTED missing responseId — skipping');
        return;
      }

      await this.dbService.updateSurveyTrackerSubmitted({
        surveyTrackingId: data.responseId,
        context: data.contextType ?? null,
        contextId: data.contextId ?? null,
        surveySummary: data.responseData ?? null,
        surveyResponseStatusIndividual: 'submitted',
        updatedAt: new Date(data.submittedAt || timestamp),
      });

      this.logger.log(`SurveyTracker submitted: ${data.responseId}`);
    } catch (error) {
      this.logger.error(`handleResponseSubmitted failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private extractSurveyForm(sections: any[]): any[] {
    if (!Array.isArray(sections) || sections.length === 0) return [];

    return sections.map((section, sectionIndex) => ({
      sectionId:          section.sectionId,
      sectionTitle:       section.sectionTitle || null,
      sectionDescription: section.sectionDescription || null,
      order:              section.displayOrder ?? sectionIndex,
      fields: Array.isArray(section.fields)
        ? section.fields.map((field, fieldIndex) => ({
            fieldId:     field.fieldId,
            fieldName:   field.fieldName,
            label:       field.fieldLabel,
            type:        field.fieldType,
            required:    field.isRequired ?? false,
            helpText:    field.helpText || null,
            placeholder: field.placeholder || null,
            order:       field.displayOrder ?? fieldIndex,
          }))
        : [],
    }));
  }
}
