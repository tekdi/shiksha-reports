import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'AssessmentTracker' })
export class AssessmentTracker {
  @PrimaryColumn('uuid', { name: 'AssesTrackingID' })
  assessTrackingId: string;

  @Column({ name: 'AssessmentID', type: 'text', nullable: false })
  assessmentId: string;

  @Column({ name: 'CourseID', type: 'text', nullable: false })
  courseId: string;

  @Column({ name: 'AssessmentName', type: 'text', nullable: true })
  assessmentName: string;

  @Column({ name: 'UserID', type: 'uuid', nullable: false })
  userId: string;

  @Column({ name: 'TenantID', type: 'uuid', nullable: true })
  tenantId?: string;

  @Column({
    name: 'TotalMaxScore',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  totalMaxScore: number;

  @Column({
    name: 'TotalScore',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  totalScore: number;

  @Column({ name: 'TimeSpent', type: 'int4', nullable: true, default: 0 })
  timeSpent?: number;

  @Column({ name: 'AssessmentSummary', type: 'text', nullable: true })
  assessmentSummary?: string;

  @Column({ name: 'NumOfAttempt', type: 'int4', nullable: true, default: 0 })
  numOfAttempt?: number;

  @Column({
    name: 'AssessmentType',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  assessmentType: string;

  @Column({ name: 'AttemptID', type: 'text', nullable: true })
  attemptId?: string;
}
