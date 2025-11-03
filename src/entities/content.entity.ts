import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'Content' })
export class Content {
  @PrimaryColumn({ name: 'identifier', type: 'varchar', length: 255 })
  identifier: string;

  @Column({ name: 'name', type: 'text', nullable: true })
  name?: string;

  @Column({ name: 'author', type: 'varchar', length: 255, nullable: true })
  author?: string;

  @Column({ name: 'primaryCategory', type: 'varchar', length: 255, nullable: true })
  primaryCategory?: string;

  @Column({ name: 'channel', type: 'varchar', length: 255, nullable: true })
  channel?: string;

  @Column({ name: 'status', type: 'varchar', length: 100, nullable: true })
  status?: string;

  @Column({ name: 'contentType', type: 'varchar', length: 100, nullable: true })
  contentType?: string;

  @Column({ name: 'contentLanguage', type: 'text', nullable: true })
  contentLanguage?: string;

  @Column({ name: 'domains', type: 'text', nullable: true })
  domains?: string;

  @Column({ name: 'subdomains', type: 'text', nullable: true })
  subdomains?: string;

  @Column({ name: 'subjects', type: 'text', nullable: true })
  subjects?: string;

  @Column({ name: 'targetAgeGroup', type: 'text', nullable: true })
  targetAgeGroup?: string;

  @Column({ name: 'audience', type: 'text', nullable: true })
  audience?: string;

  @Column({ name: 'program', type: 'text', nullable: true })
  program?: string;

  @Column({ name: 'keywords', type: 'text', nullable: true })
  keywords?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'createdBy', type: 'varchar', length: 255, nullable: true })
  createdBy?: string;

  @Column({ name: 'lastPublishedOn', type: 'timestamp', nullable: true })
  lastPublishedOn?: Date;

  @Column({ name: 'createdOn', type: 'timestamp', nullable: true })
  createdOn?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
