import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'CohortMember' })
export class CohortMember {
  @PrimaryGeneratedColumn('uuid')
  CohortMemberID: string;

  @Column({ type: 'uuid', nullable: false })
  CohortID: string;

  @Column({ type: 'uuid', nullable: false })
  UserID: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  MemberStatus: string;

  @Column({ type: 'uuid', nullable: false })
  AcademicYearID: string;
}