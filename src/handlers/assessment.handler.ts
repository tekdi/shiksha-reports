// import { Injectable } from '@nestjs/common';
// import { DatabaseService } from '../services/database.service';
// import { TranformService } from '../constants/transformation/transform-service';

// @Injectable()
// export class AssessmentHandler {
//   constructor(
//     private readonly dbService: DatabaseService,
//     private readonly tranformServie: TranformService,
//   ) {}

//   async handleAssessmentUpsert(data: any) {
//     const transformedData = await this.tranformServie.transformAssessmentData(data);
//     return this.dbService.saveAssessmentData(transformedData);
//   }

//   async handleAssessmentDelete(data: any) {
//     return this.dbService.deleteAssessmentData(data);
//   }
// } 


import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { DatabaseService } from '../services/database.service';
import { TranformService } from '../constants/transformation/transform-service';

@Injectable()
export class AssessmentHandler {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly tranformServie: TranformService,
  ) {}

  async handleAssessmentUpsert(data: any) {
    const identifier = data?.courseId; // Adjust key if it's nested elsewhere
    
    if (!identifier) {
      throw new Error('Identifier is required for API call');
    }

    // Step 1: Call external API
    const apiResponse = await axios.post(
      'https://qa-interface.prathamdigital.org/interface/v1/action/composite/v3/search',
      {
        request: {
          filters: {
            identifier: [identifier],
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Cookie:
            'AWSALB=c6B+A+Xab3J969D5AKEyxg4pwghw+3S5jIuPlyoBPSY06OpzlB8Sx45e/MRPVHErjqfb23UDS2WalGwmwmtbJfjJBMaHrPQB47RoilfUz+x9VgL1hLQt6F51ZjGE; AWSALBCORS=c6B+A+Xab3J969D5AKEyxg4pwghw+3S5jIuPlyoBPSY06OpzlB8Sx45e/MRPVHErjqfb23UDS2WalGwmwmtbJfjJBMaHrPQB47RoilfUz+x9VgL1hLQt6F51ZjGE',
        },
      }
    );

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
        id: scoreData.id,
        userId: scoreData.userId,
        assessmentTrackingId: scoreData.assessmentTrackingId,
        questionId: scoreData.questionId,
        pass: scoreData.pass,
        sectionId: scoreData.sectionId,
        resValue: scoreData.resValue,
        duration: scoreData.duration,
        score: scoreData.score,
        maxScore: scoreData.maxScore,
        queTitle: scoreData.queTitle,
      }
      this.dbService.saveAssessmentScoreData(assessmentScoreData);
    })

  }

  async handleAssessmentDelete(data: any) {
    return this.dbService.deleteAssessmentData(data);
  }
}
