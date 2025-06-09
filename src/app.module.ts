import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaConsumerService } from './kafka/kafka-consumer';
import { DatabaseService } from './services/database.service';
import { UserProfileReport } from './entities/user-profile.entity';
import { UserHandler } from './handlers/user.handler';
import { TranformService } from './constants/transformation/transform-service';
import { CohortSummaryReport } from './entities/cohort-summary.entity';
import { UserCourseCertificate } from './entities/user-course-data.entity';
import { CourseHandler } from './handlers/course.handler';
import { Course } from './entities/course.entity';

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
    ]),
  ],
  providers: [
    KafkaConsumerService,
    DatabaseService,
    UserHandler,
    CourseHandler,
    TranformService,
  ],
})
export class AppModule {}
