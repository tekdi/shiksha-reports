import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'CohortAcYr_Mapping', schema: 'public' })
export class CohortAcademicYear {
  @PrimaryColumn('uuid', { name: 'CohortAcYrMappingID' })
  cohortAcYrMappingId: string;

  @Column({ name: 'AcYrID', type: 'uuid', nullable: false })
  acYrId: string;

  @Column({ name: 'CohortID', type: 'uuid', nullable: false })
  cohortId: string;

  @Column({ name: 'TenantID', type: 'uuid', nullable: false })
  tenantId?: string;
}
