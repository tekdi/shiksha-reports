import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('CohortSummaryReport')
export class CohortSummaryReport {
  @PrimaryColumn('uuid')
  cohortId: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  parentId: string;

  @Column({ type: 'varchar', nullable: true })
  tenantName: string;

  @Column({ type: 'varchar', nullable: true })
  academicYear: string;

  @Column({ type: 'int', nullable: true })
  memberCount: number;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  state: string;

  @Column({ type: 'varchar', nullable: true })
  district: string;

  @Column({ type: 'varchar', nullable: true })
  block: string;

  @Column({ type: 'varchar', nullable: true })
  village: string;
}
