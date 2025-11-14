import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'Users' })
export class User {
  @PrimaryColumn('uuid', { name: 'UserID' })
  userId: string;

  @Column({ name: 'UserName', type: 'varchar', length: 100, nullable: true })
  userName?: string;

  @Column({ name: 'UserFullName', type: 'varchar', length: 200, nullable: true })
  userFullName?: string;

  @Column({ name: 'UserEmail', type: 'varchar', length: 150, nullable: true })
  userEmail?: string;

  @Column({ name: 'UserDoB', type: 'date', nullable: true })
  userDoB?: Date;

  @Column({ name: 'UserMobile', type: 'varchar', length: 20, nullable: true })
  userMobile?: string;

  @Column({ name: 'UserGender', type: 'varchar', length: 20, nullable: true })
  userGender?: string;

  @Column({
    name: 'UserIsActive',
    type: 'boolean',
    nullable: true,
    default: () => 'true',
  })
  userIsActive?: boolean;

  @Column({ name: 'UserStateID', type: 'varchar', length: 50, nullable: true })
  userStateId?: string;

  @Column({ name: 'UserDistrictID', type: 'varchar', length: 50, nullable: true })
  userDistrictId?: string;

  @Column({ name: 'UserBlockID', type: 'varchar', length: 50, nullable: true })
  userBlockId?: string;

  @Column({ name: 'UserVillageID', type: 'varchar', length: 50, nullable: true })
  userVillageId?: string;

  @Column({
    name: 'UserPreferredModeOfLearning',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  userPreferredModeOfLearning?: string;

  @Column({ name: 'UserMotherName', type: 'varchar', length: 150, nullable: true })
  userMotherName?: string;

  @Column({ name: 'UserWorkDomain', type: 'varchar', length: 150, nullable: true })
  userWorkDomain?: string;

  @Column({ name: 'UserFatherName', type: 'varchar', length: 150, nullable: true })
  userFatherName?: string;

  @Column({ name: 'UserSpouseName', type: 'varchar', length: 150, nullable: true })
  userSpouseName?: string;

  @Column({
    name: 'UserWhatDoYouWantToBecome',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  userWhatDoYouWantToBecome?: string;

  @Column({ name: 'UserClass', type: 'varchar', length: 50, nullable: true })
  userClass?: string;

  @Column({ name: 'UserPreferredLanguage', type: 'varchar', length: 100, nullable: true })
  userPreferredLanguage?: string;

  @Column({ name: 'UserParentPhone', type: 'varchar', length: 20, nullable: true })
  userParentPhone?: string;

  @Column({
    name: 'UserGuardianRelation',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  userGuardianRelation?: string;

  @Column({ name: 'UserSubjectTaught', type: 'varchar', length: 200, nullable: true })
  userSubjectTaught?: string;

  @Column({ name: 'UserMaritalStatus', type: 'varchar', length: 50, nullable: true })
  userMaritalStatus?: string;

  @Column({ name: 'UserGrade', type: 'varchar', length: 50, nullable: true })
  userGrade?: string;

  @Column({ name: 'UserTrainingCheck', type: 'boolean', nullable: true })
  userTrainingCheck?: boolean;

  @Column({ name: 'UserDropOutReason', type: 'text', nullable: true })
  userDropOutReason?: string;

  @Column({ name: 'UserOwnPhoneCheck', type: 'boolean', nullable: true })
  userOwnPhoneCheck?: boolean;

  @Column({
    name: 'UserEnrollmentNumber',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  userEnrollmentNumber?: string;

  @Column({ name: 'UserDesignation', type: 'varchar', length: 150, nullable: true })
  userDesignation?: string;

  @Column({ name: 'UserBoard', type: 'varchar', length: 100, nullable: true })
  userBoard?: string;

  @Column({ name: 'UserSubject', type: 'varchar', length: 150, nullable: true })
  userSubject?: string;

  @Column({ name: 'UserMainSubject', type: 'varchar', length: 150, nullable: true })
  userMainSubject?: string;

  @Column({ name: 'UserMedium', type: 'varchar', length: 100, nullable: true })
  userMedium?: string;

  @Column({ name: 'UserGuardianName', type: 'varchar', length: 150, nullable: true })
  userGuardianName?: string;

  @Column({
    name: 'CreatedAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  createdAt?: Date;

  @Column({
    name: 'UpdatedAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  updatedAt?: Date;

  @Column({ name: 'CreatedBy', type: 'varchar', length: 100, nullable: true })
  createdBy?: string;

  @Column({ name: 'UpdatedBy', type: 'varchar', length: 100, nullable: true })
  updatedBy?: string;

  @Column({
    name: 'UserNumOfChildrenWorkingWith',
    type: 'text',
    nullable: true,
  })
  userNumOfChildrenWorkingWith?: string;

  @Column({ name: 'UserPhoneType', type: 'varchar', length: 50, nullable: true })
  userPhoneType?: string;

  @Column({ name: 'UserCustomField', type: 'jsonb', nullable: true })
  userCustomField?: any;

  @Column({ name: 'JobFamily', type: 'varchar', length: 150, nullable: true })
  jobFamily?: string;

  @Column({ name: 'PSU', type: 'varchar', length: 150, nullable: true })
  psu?: string;

  @Column({ name: 'GroupMembership', type: 'varchar', length: 150, nullable: true })
  groupMembership?: string;

  @Column({ name: 'IsManager', type: 'varchar', length: 200, nullable: true })
  isManager?: string;

  @Column({ name: 'EMPManager', type: 'uuid', nullable: true })
  empManager?: string;
}
