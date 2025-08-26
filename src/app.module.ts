import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaConsumerService } from './kafka/kafka-consumer';
import { DatabaseService } from './services/database.service';
import { User } from './entities/user.entity';
import { UserHandler } from './handlers/user.handler';
import { TransformService } from './constants/transformation/transform-service';
import { CohortSummaryReport } from './entities/cohort-summary.entity';
import { UserCourseCertificate } from './entities/user-course-data.entity';
import { CourseHandler } from './handlers/course.handler';

import { DailyAttendanceReport } from './entities/daily-attendance-report.entity';
import { AssessmentTracking } from './entities/assessment-tracking.entity';
import { AssessmentTrackingScoreDetail } from './entities/assessment-tracking-score-detail.entity';
import { AttendanceHandler } from './handlers/attendance.handler';
import { AssessmentHandler } from './handlers/assessment.handler';
import { Event } from './entities/event.entity';
import { EventDetails } from './entities/event-details.entity';
import { EventRepetition } from './entities/event-repetition.entity';
import { EventHandler } from './handlers/event.handler';
import { CohortMember } from './entities/cohort-member.entity';
import { Cohort } from './entities/cohort.entity';
import { AttendanceTracker } from './entities/attendance-tracker.entity';
import { AssessmentTracker } from './entities/assessment-tracker.entity';
import { CourseTracker } from './entities/course-tracker.entity';
import { ContentTracker } from './entities/content-tracker.entity';
import { ContentHandler } from './handlers/content.handler';

@Module({
  imports: [
    // First import ConfigModule
    ConfigModule.forRoot({
      isGlobal: true, // makes ConfigModule available everywhere
    }),

    // Then use dynamic config in TypeOrm
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        database: configService.get('DB_DATABASE'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        // entities: [
        //   User
        // ],
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),

    // Register the entity for repository injection
    TypeOrmModule.forFeature([
      CohortSummaryReport,
      UserCourseCertificate,
      User,
      CohortSummaryReport,
      DailyAttendanceReport,
      AssessmentTracking,
      AssessmentTrackingScoreDetail,
      Event,
      EventDetails,
      EventRepetition,
      CohortMember,
      Cohort,
      AttendanceTracker,
      AssessmentTracker,
      CourseTracker,
      ContentTracker,
    ]),
  ],
  providers: [
    KafkaConsumerService,
    DatabaseService,
    UserHandler,
    CourseHandler,
    ContentHandler,
    AttendanceHandler,
    AssessmentHandler,
    EventHandler,
    TransformService,
  ],
})
export class AppModule {}
