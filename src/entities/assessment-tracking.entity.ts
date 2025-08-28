import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'assessment_tracking' })
export class AssessmentTracking {
  @PrimaryColumn({ name: 'assessmentTrackingId' })
  assessmentTrackingId: string;

  @Column({ name: 'userId', nullable: true })
  userId: string;

  @Column({ name: 'courseId', nullable: true })
  courseId: string;

  @Column({ name: 'contentId', nullable: true })
  contentId: string;

  @Column({ name: 'attemptId', nullable: true })
  attemptId: string;

  @Column({
    name: 'createdOn',
    nullable: true,
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdOn: Date;

  @Column({
    name: 'lastAttemptedOn',
    nullable: true,
    type: 'timestamptz',
    default: () => 'now()',
  })
  lastAttemptedOn: Date;

  @Column({ name: 'assessmentSummary', nullable: true, type: 'jsonb' })
  assessmentSummary: any;

  @Column({ name: 'totalMaxScore', nullable: true, type: 'float8' })
  totalMaxScore: number;

  @Column({ name: 'totalScore', nullable: true, type: 'float8' })
  totalScore: number;

  @Column({
    name: 'updatedOn',
    nullable: true,
    type: 'timestamptz',
    default: () => 'now()',
  })
  updatedOn: Date;

  @Column({ name: 'timeSpent', nullable: true, type: 'numeric' })
  timeSpent: number;

  @Column({ name: 'unitId', nullable: true })
  unitId: string;

  @Column({ name: 'name', nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ name: 'domain', nullable: true })
  domain: string;

  @Column({ name: 'subDomain', nullable: true })
  subDomain: string;

  @Column({ nullable: true })
  channel: string;

  @Column({ name: 'assessmentType', nullable: true })
  assessmentType: string;

  @Column({ name: 'program', nullable: true })
  program: string;

  @Column({ name: 'targetAgeGroup', nullable: true })
  targetAgeGroup: string;

  @Column({ name: 'assessmentName', nullable: true })
  assessmentName: string;

  @Column({ name: 'contentLanguage', nullable: true })
  contentLanguage: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  framework: string;

  @Column({ name: 'summaryType', nullable: true })
  summaryType: string;
}
