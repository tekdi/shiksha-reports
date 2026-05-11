import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity({ name: 'SurveyList' })
@Index('idx_surveylist_tenant', ['tenantId'])
@Index('idx_surveylist_active', ['isActive'])
@Index('idx_surveylist_context', ['context'])
@Index('idx_surveylist_created_at', ['createdAt'])
export class SurveyList {
  @PrimaryColumn('uuid', { name: 'SurveyID' })
  surveyId: string;

  @Column({ name: 'SurveyName', type: 'varchar', length: 255, nullable: false })
  surveyName: string;

  @Column({ name: 'TenantID', type: 'uuid', nullable: false })
  tenantId: string;

  @Column({ name: 'TargetRole', type: 'jsonb', default: '[]' })
  targetRole: string[];

  @Column({ name: 'TargetGeo', type: 'jsonb', nullable: true, default: null })
  targetGeo: any;

  @Column({ name: 'Context', type: 'varchar', length: 30, nullable: true, default: null })
  context: string;

  @Column({ name: 'ContextId', type: 'varchar', length: 255, nullable: true, default: null })
  contextId: string;

  @Column({ name: 'Type', type: 'varchar', length: 50, nullable: true, default: null })
  type: string;

  @Column({ name: 'CreatedAt', type: 'timestamptz', nullable: false })
  createdAt: Date;

  @Column({ name: 'CreatedBy', type: 'uuid', nullable: false })
  createdBy: string;

  @Column({ name: 'SurveyRolloutStartDate', type: 'timestamptz', nullable: true, default: null })
  surveyRolloutStartDate: Date;

  @Column({ name: 'SurveyRolloutEndDate', type: 'timestamptz', nullable: true, default: null })
  surveyRolloutEndDate: Date;

  @Column({ name: 'IsActive', type: 'boolean', nullable: false, default: false })
  isActive: boolean;

  @Column({ name: 'SurveyForm', type: 'jsonb', default: '[]' })
  surveyForm: any[];
}
