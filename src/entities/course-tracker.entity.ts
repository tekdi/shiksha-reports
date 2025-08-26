import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'CourseTracker' })
export class CourseTracker {
  @PrimaryGeneratedColumn({ name: 'CourseTrackerID' })
  courseTrackerId: string;

  @Column({ name: 'UserID', type: 'uuid', nullable: false })
  userId: string;

  @Column({ name: 'TenantID', type: 'uuid', nullable: false })
  tenantId: string;

  @Column({ name: 'CourseID', type: 'uuid', nullable: false })
  courseId: string;

  @Column({ name: 'CourseName', type: 'varchar', length: 255, nullable: false })
  courseName: string;

  @Column({ name: 'CourseTrackingStatus', type: 'varchar', length: 50, nullable: false })
  courseTrackingStatus: string;

  @Column({ name: 'CertificateID', type: 'uuid', nullable: true })
  certificateId?: string;

  @Column({ name: 'CourseTrackingStartDate', type: 'timestamp', nullable: true })
  courseTrackingStartDate?: Date;

  @Column({ name: 'CourseTrackingEndDate', type: 'timestamp', nullable: true })
  courseTrackingEndDate?: Date;
}