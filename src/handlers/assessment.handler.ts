import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { DatabaseService } from '../services/database.service';

@Injectable()
export class AssessmentHandler {
  constructor(
    private readonly dbService: DatabaseService,
  ) {}

  async handleAssessmentUpsert(data: any) {
    const identifier = data?.courseId; // Adjust key if it's nested elsewhere
    
    if (!identifier) {
      throw new Error('Identifier is required for API call');
    }

    // Step 1: Call external API
    const apiResponse = await axios.post(
      process.env.ASSESSMENT_API_URL,
      {
        request: {
          filters: {
            identifier: [identifier],
          },
        },
      },
    );

    if (!apiResponse.data?.result?.QuestionSet?.[0]) {
        throw new Error('Invalid API response structure or empty QuestionSet');
    }
    const externalData = apiResponse.data.result.QuestionSet[0];

    const enrichedData = {
      assessmentTrackingId: data.assessmentTrackingId,
      userId: data.userId,
      courseId: data.courseId,
      contentId: data.contentId,
      attemptId: data.attemptId,
      createdOn: data.createdOn ? new Date(data.createdOn) : new Date(),
      lastAttemptedOn: data.lastAttemptedOn ? new Date(data.lastAttemptedOn) : new Date(),
      assessmentSummary: data.assessmentSummary,
      totalMaxScore: data.totalMaxScore,
      totalScore: data.totalScore,
      updatedOn: data.updatedOn ? new Date(data.updatedOn) : new Date(),
      timeSpent: data.timeSpent,
      unitId: data.unitId,

      name: externalData.name,
      description: externalData.description,
      subject: externalData.subject[0],
      domain: externalData.domain,
      subDomain: externalData.subDomain[0],
      channel: externalData.channel,
      assessmentType: externalData.assessmentType,
      program: externalData.program[0],
      targetAgeGroup: externalData.targetAgeGroup[0],
      // assessmentName: data.assessmentName,
      contentLanguage: externalData.contentLanguage,
      status: externalData.status,
      framework: externalData.framework,
      summaryType: externalData.summaryType
    };

    // Step 3: Transform and save
    // const transformedData = await this.tranformServie.transformAssessmentData(enrichedData);
    this.dbService.saveAssessmentData(enrichedData);
    
    const assessmentTrackingScoreDetailsData = data.scores.map((scoreData) => {

      const assessmentScoreData ={
        id: scoreData?.id || null,
        userId: scoreData?.userId || null,
        assessmentTrackingId: scoreData?.assessmentTrackingId || null,
        questionId: scoreData?.questionId || null,
        pass: scoreData?.pass || null,
        sectionId: scoreData?.sectionId || null,
        resValue: scoreData?.resValue || null,
        duration: scoreData?.duration || null,
        score: scoreData?.score || null,
        maxScore: scoreData?.maxScore || null,
        queTitle: scoreData?.queTitle || null,
      }
      this.dbService.saveAssessmentScoreData(assessmentScoreData);
    })

  }

  async handleAssessmentDelete(data: any) {
    return this.dbService.deleteAssessmentData(data);
  }
}
