import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaConsumerService } from './kafka/kafka-consumer';
import { DatabaseService } from './services/database.service';
import { UserProfileReport } from './entities/user-profile.entity';
import { UserHandler } from './handlers/user.handler';
import { TransformService } from './constants/transformation/transform-service';
import { CohortSummaryReport } from './entities/cohort-summary.entity';
import { UserCourseCertificate } from './entities/user-course-data.entity';
import { CourseHandler } from './handlers/course.handler';
import { Course } from './entities/course.entity';
import { DailyAttendanceReport } from './entities/daily-attendance-report.entity';
import { AssessmentTracking } from './entities/assessment-tracking.entity';
import { AssessmentTrackingScoreDetail } from './entities/assessment-tracking-score-detail.entity';
import { AttendanceHandler } from './handlers/attendance.handler';
import { AssessmentHandler } from './handlers/assessment.handler';
import { Event } from './entities/event.entity';
import { EventDetails } from './entities/event-details.entity';
import { EventRepetition } from './entities/event-repetition.entity';
import { EventHandler } from './handlers/event.handler';
import { CohortHandler } from './handlers/cohort.handler';

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
      UserProfileReport,
      CohortSummaryReport,
      UserCourseCertificate,
      Course,
      UserProfileReport,
      CohortSummaryReport,
      DailyAttendanceReport,
      AssessmentTracking,
      AssessmentTrackingScoreDetail,
      Event,
      EventDetails,
      EventRepetition,
    ]),
  ],
  providers: [
    KafkaConsumerService,
    DatabaseService,
    UserHandler,
    CourseHandler,
    AttendanceHandler,
    AssessmentHandler,
    EventHandler,
    CohortHandler,
    TransformService,
  ],
})
export class AppModule {}
