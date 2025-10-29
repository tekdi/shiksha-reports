import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'Events' })
export class Event {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100 })
  eventDetailId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  shortDescription: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  eventType: string | null;

  @Column({ type: 'boolean', default: false })
  isRestricted: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  onlineProvider: string | null;

  @Column({ type: 'int', nullable: true })
  maxAttendees: number | null;

  @Column({ type: 'jsonb', nullable: true })
  recordings: any | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  meetingDetails: any | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  idealTime: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any | null;

  @Column({ type: 'jsonb', nullable: true })
  attendees: any | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  eventId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  startDateTime: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endDateTime: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  onlineDetails: any | null;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  recurrenceEndDate: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  recurrencePattern: any | null;

  @Column({ type: 'boolean', default: false })
  autoEnroll: boolean;

  @Column({ type: 'jsonb', nullable: true })
  extra: any | null;

  @Column({ type: 'timestamptz', nullable: true })
  registrationStartDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  registrationEndDate: Date | null;
}
