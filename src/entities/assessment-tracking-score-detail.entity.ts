import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'assessment_tracking_score_detail' })
export class AssessmentTrackingScoreDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  assessmentTrackingId: string;

  @Column({ type: 'text', nullable: true })
  questionId?: string;

  @Column({ type: 'text', nullable: true })
  pass?: string;

  @Column({ type: 'text', nullable: true })
  sectionId?: string;

  @Column({ type: 'text', nullable: true })
  resValue?: string;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ type: 'int', nullable: true })
  score?: number;

  @Column({ type: 'int', nullable: true })
  maxScore?: number;

  @Column({ type: 'text', nullable: true })
  queTitle?: string;
}
