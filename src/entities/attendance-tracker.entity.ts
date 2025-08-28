import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'AttendanceTracker' })
export class AttendanceTracker {
  @PrimaryGeneratedColumn({ name: 'ATNDID' })
  atndId: number;

  @Column({ name: 'TenantID', type: 'uuid', nullable: false })
  tenantId: string;

  @Column({ name: 'Context', type: 'text', nullable: true })
  context?: string;

  @Column({ name: 'ContextID', type: 'uuid', nullable: true })
  contextId?: string;

  @Column({ name: 'UserID', type: 'uuid', nullable: false })
  userId: string;

  @Column({ name: 'Year', type: 'int4', nullable: false })
  year: number;

  @Column({ name: 'Month', type: 'int4', nullable: false })
  month: number;

  // Day columns 01-31
  @Column({ name: '01', type: 'text', nullable: true })
  day01?: string;

  @Column({ name: '02', type: 'text', nullable: true })
  day02?: string;

  @Column({ name: '03', type: 'text', nullable: true })
  day03?: string;

  @Column({ name: '04', type: 'text', nullable: true })
  day04?: string;

  @Column({ name: '05', type: 'text', nullable: true })
  day05?: string;

  @Column({ name: '06', type: 'text', nullable: true })
  day06?: string;

  @Column({ name: '07', type: 'text', nullable: true })
  day07?: string;

  @Column({ name: '08', type: 'text', nullable: true })
  day08?: string;

  @Column({ name: '09', type: 'text', nullable: true })
  day09?: string;

  @Column({ name: '10', type: 'text', nullable: true })
  day10?: string;

  @Column({ name: '11', type: 'text', nullable: true })
  day11?: string;

  @Column({ name: '12', type: 'text', nullable: true })
  day12?: string;

  @Column({ name: '13', type: 'text', nullable: true })
  day13?: string;

  @Column({ name: '14', type: 'text', nullable: true })
  day14?: string;

  @Column({ name: '15', type: 'text', nullable: true })
  day15?: string;

  @Column({ name: '16', type: 'text', nullable: true })
  day16?: string;

  @Column({ name: '17', type: 'text', nullable: true })
  day17?: string;

  @Column({ name: '18', type: 'text', nullable: true })
  day18?: string;

  @Column({ name: '19', type: 'text', nullable: true })
  day19?: string;

  @Column({ name: '20', type: 'text', nullable: true })
  day20?: string;

  @Column({ name: '21', type: 'text', nullable: true })
  day21?: string;

  @Column({ name: '22', type: 'text', nullable: true })
  day22?: string;

  @Column({ name: '23', type: 'text', nullable: true })
  day23?: string;

  @Column({ name: '24', type: 'text', nullable: true })
  day24?: string;

  @Column({ name: '25', type: 'text', nullable: true })
  day25?: string;

  @Column({ name: '26', type: 'text', nullable: true })
  day26?: string;

  @Column({ name: '27', type: 'text', nullable: true })
  day27?: string;

  @Column({ name: '28', type: 'text', nullable: true })
  day28?: string;

  @Column({ name: '29', type: 'text', nullable: true })
  day29?: string;

  @Column({ name: '30', type: 'text', nullable: true })
  day30?: string;

  @Column({ name: '31', type: 'text', nullable: true })
  day31?: string;
}
