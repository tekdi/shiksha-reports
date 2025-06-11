import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('course')
export class Course {
  @PrimaryGeneratedColumn('uuid', { name: 'courseId' })
  courseId: string;

  @Column({
    name: 'course_do_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  courseDoId: string;

  @Column({
    name: 'course_name',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  courseName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  channel: string;

  @Column({ type: 'json', nullable: true })
  language: string[];

  @Column({ type: 'json', nullable: true })
  program: string[];

  @Column({ name: 'primary_user', type: 'json', nullable: true })
  primaryUser: string[];

  @Column({ name: 'target_age_group', type: 'json', nullable: true })
  targetAgeGroup: string[];

  @Column({ type: 'json', nullable: true })
  keywords: string[];

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;
}
