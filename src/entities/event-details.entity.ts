import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'EventDetails' })
export class EventDetails {
  @PrimaryGeneratedColumn('uuid')
  eventDetailId: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  eventType: string;

  @Column({ default: false })
  isRestricted: boolean;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ nullable: true })
  onlineProvider: string;

  @Column({ default: 0 })
  maxAttendees: number;

  @Column({ type: 'jsonb', nullable: true })
  recordings: any;

  @Column()
  status: string;

  @Column('text')
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  meetingDetails: any;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ nullable: true })
  idealTime: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column('text', { array: true, nullable: true })
  attendees: string[];
}
