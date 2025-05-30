import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'dailyattendancereport' })
export class DailyAttendanceReport {
  @PrimaryColumn('uuid')
  attendanceId: string;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'uuid', nullable: true })
  cohortId?: string;

  @Column({ type: 'varchar', nullable: true })
  context?: string;

  @Column({ type: 'date', nullable: true })
  date?: Date;

  @Column({ type: 'varchar', nullable: true })
  status?: string;

  @Column({ type: 'varchar', nullable: true })
  metadata?: string;

  @Column({ type: 'timestamp', nullable: true })
  createdAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: string;
} 