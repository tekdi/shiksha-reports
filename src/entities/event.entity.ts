import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EventDetails } from './event-details.entity';

@Entity({ name: 'Events' })
export class Event {
  @PrimaryGeneratedColumn('uuid')
  eventId: string;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  recurrenceEndDate: Date;

  @Column({ type: 'jsonb' })
  recurrencePattern: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false, nullable: true })
  autoEnroll: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  registrationStartDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  registrationEndDate: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'uuid', nullable: true })
  eventDetailId: string;

  @ManyToOne(() => EventDetails)
  @JoinColumn({ name: 'eventDetailId' })
  eventDetails: EventDetails;
}
