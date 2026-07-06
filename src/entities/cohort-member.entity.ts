import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'CohortMember', schema: 'public' })
export class CohortMember {
  @PrimaryGeneratedColumn('uuid')
  CohortMemberID: string;

  @Column({ type: 'uuid', nullable: false })
  CohortID: string;

  @Column({ type: 'uuid', nullable: false })
  UserID: string;
 
  @Column({ type: 'varchar', length: 50, nullable: false })
  MemberStatus: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  StatusReason: string;

  @Column({ type: 'uuid', nullable: false })
  AcademicYearID: string;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  UpdatedAt: Date;
}
