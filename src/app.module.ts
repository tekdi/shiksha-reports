import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaConsumerService } from './kafka/kafka-consumer';
import { DatabaseService } from './services/database.service';
import { UserProfileReport } from './entities/user-profile.entity';
import { UserHandler } from './handlers/user.handler';
import { TransformService } from './constants/transformation/transform-service';
import { CohortSummaryReport } from './entities/cohort-summary.entity';
import { AttendanceHandler } from './handlers/attendance.handler';
import { DailyAttendanceReport } from './entities/daily-attendance-report.entity';
import { AssessmentTracking } from './entities/assessment-tracking.entity';
import { AssessmentTrackingScoreDetail } from './entities/assessment-tracking-score-detail.entity';
import { AssessmentHandler } from './handlers/assessment.handler';

@Module({
  imports: [
    // First import ConfigModule
    ConfigModule.forRoot({
      isGlobal: true, // makes ConfigModule available everywhere
    }),

    // Then use dynamic config in TypeOrm
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST"),
        port: configService.get("DB_PORT"),
        database: configService.get("DB_DATABASE"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
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
      DailyAttendanceReport,
      AssessmentTracking,
      AssessmentTrackingScoreDetail
    ]),
  ],
  providers: [
    KafkaConsumerService,
    DatabaseService,
    UserHandler,
    AttendanceHandler,
    AssessmentHandler,
    TransformService
  ],
})
export class AppModule {}
