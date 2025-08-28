import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { EventDetails } from './event-details.entity';

@Entity({ name: 'EventRepetition' })
export class EventRepetition {
  @PrimaryGeneratedColumn('uuid')
  eventRepetitionId: string;

  @Column({ type: 'uuid', nullable: true })
  eventId: string;

  @Column({ type: 'uuid', nullable: true })
  eventDetailId: string;

  @Column({ type: 'jsonb', nullable: true })
  onlineDetails: any;

  @Column({
    type: 'timestamptz',
    default: () => "timezone('utc'::text, now())",
    nullable: true,
  })
  startDateTime: Date;

  @Column({
    type: 'timestamptz',
    default: () => "timezone('utc'::text, now())",
    nullable: true,
  })
  endDateTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ type: 'jsonb', default: '{}', nullable: true })
  erMetaData: any;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => EventDetails)
  @JoinColumn({ name: 'eventDetailId' })
  eventDetails: EventDetails;
}
