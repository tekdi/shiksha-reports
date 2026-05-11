import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { SurveyList } from './survey-list.entity';

@Entity({ name: 'SurveyTracker' })
@Index('idx_tracker_survey', ['surveyId'])
@Index('idx_tracker_tenant', ['tenantId'])
@Index('idx_tracker_user', ['targetRoleUserId'])
@Index('idx_tracker_status', ['surveyResponseStatusIndividual'])
@Index('idx_tracker_context', ['context', 'contextId'])
export class SurveyTracker {
  @PrimaryColumn('uuid', { name: 'SurveyTrackingID' })
  surveyTrackingId: string;

  @Column({ name: 'SurveyID', type: 'uuid', nullable: false })
  surveyId: string;

  @Column({ name: 'TenantID', type: 'uuid', nullable: false })
  tenantId: string;

  @Column({ name: 'TargetRoleUserId', type: 'uuid', nullable: true, default: null })
  targetRoleUserId: string;

  @Column({ name: 'Context', type: 'varchar', length: 30, nullable: true, default: null })
  context: string;

  @Column({ name: 'ContextId', type: 'varchar', length: 255, nullable: true, default: null })
  contextId: string;

  @Column({ name: 'SurveySummary', type: 'jsonb', nullable: true, default: null })
  surveySummary: Record<string, any>;

  @Column({ name: 'SurveyResponseStatusIndividual', type: 'varchar', length: 20, nullable: false, default: 'in_progress' })
  surveyResponseStatusIndividual: string;

  @Column({ name: 'CreatedAt', type: 'timestamptz', nullable: false })
  createdAt: Date;

  @Column({ name: 'UpdatedAt', type: 'timestamptz', nullable: false })
  updatedAt: Date;

  @ManyToOne(() => SurveyList, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'SurveyID' })
  survey: SurveyList;
}
