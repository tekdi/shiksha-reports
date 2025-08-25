import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'UserProfileReport' })
export class UserProfileReport {
  @PrimaryColumn('uuid')
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

  // Additional custom fields from Kafka message
  @Column({ type: 'varchar', length: 150, nullable: true })
  userMotherName?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  userWorkDomain?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  userFatherName?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  userSpouseName?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  userWhatDoYouWantToBecome?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  userClass?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userPreferredLanguage?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  userParentPhone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userGuardianRelation?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  userSubjectTaught?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  userMaritalStatus?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  userGrade?: string;

  @Column({ type: 'boolean', nullable: true })
  userTrainingCheck?: boolean;

  @Column({ type: 'text', nullable: true })
  userDropOutReason?: string;

  @Column({ type: 'boolean', nullable: true })
  userOwnPhoneCheck?: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userEnrollmentNumber?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  userDesignation?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userBoard?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  userSubject?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  userMainSubject?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userMedium?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  userGuardianName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  userPreferredModeOfLearning?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phoneTypeAccessible?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  familyMemberDetails?: string;

  @Column({ type: 'uuid', nullable: true })
  centerId?: string;

  @Column({ type: 'varchar', nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', nullable: true })
  middleName?: string;

  @Column({ type: 'varchar', nullable: true })
  lastName?: string;
}
