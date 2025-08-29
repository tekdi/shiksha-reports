import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('RegistrationTracker')
export class RegistrationTracker {
  @PrimaryGeneratedColumn({ name: 'REGID' })
  regId: number;

  @Column({ name: 'UserID', type: 'uuid' })
  userId: string;

  @Column({ name: 'RoleID', type: 'uuid' })
  roleId: string;

  @Column({ name: 'TenantID', type: 'uuid', nullable: true })
  tenantId: string;

  @Column({ 
    name: 'PlatformRegnDate', 
    type: 'timestamptz', 
    nullable: true 
  })
  platformRegnDate: Date;

  @Column({ 
    name: 'TenantRegnDate', 
    type: 'timestamptz', 
    nullable: true 
  })
  tenantRegnDate: Date;

  @Column({ 
    name: 'IsActive', 
    type: 'boolean', 
    default: true 
  })
  isActive: boolean;
}