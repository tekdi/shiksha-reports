import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'UserProfileReport' })
export class UserProfileReport {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'varchar', nullable: true })
  username?: string;

  @Column({ type: 'varchar', nullable: true })
  fullName?: string;

  @Column({ type: 'varchar', nullable: true })
  email?: string;

  @Column({ type: 'varchar', nullable: true })
  mobile?: string;

  @Column({ type: 'varchar', nullable: true })
  dob?: string;

  @Column({ type: 'varchar', nullable: true })
  gender?: string;

  @Column({ type: 'uuid', nullable: true })
  tenantId?: string;

  @Column({ type: 'varchar', nullable: true })
  tenantName?: string;

  @Column({ type: 'varchar', nullable: true })
  status?: string;

  @Column({ type: 'timestamp', nullable: true })
  createdAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: string;

  @Column({ type: 'uuid', nullable: true })
  roleId?: string;

  @Column({ type: 'varchar', nullable: true })
  roleName?: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  cohorts?: Record<string, any>;

  @Column({ type: 'boolean', nullable: true })
  automaticMember?: boolean;

  @Column({ type: 'varchar', nullable: true })
  state?: string;

  @Column({ type: 'varchar', nullable: true })
  district?: string;

  @Column({ type: 'varchar', nullable: true })
  block?: string;

  @Column({ type: 'varchar', nullable: true })
  village?: string;

  @Column({ type: 'uuid', nullable: true })
  cohortId?: string;

  @Column({ type: 'text', nullable: true })
  cohortName?: string;

  @Column({ type: 'uuid', nullable: true })
  batchId?: string;

  @Column({ type: 'text', nullable: true })
  batchName?: string;

  @Column({ type: 'text', nullable: true })
  academicYear?: string;
}
