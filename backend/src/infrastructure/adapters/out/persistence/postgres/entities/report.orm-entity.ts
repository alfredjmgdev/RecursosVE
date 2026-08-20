import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { NeedReport, ReportStatus, ResourceCategory } from '../../../../../../domain/entities/report.entity';

@Entity('need_reports')
export class NeedReportOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  tipo: string;

  @Column('jsonb')
  zona: {
    lat: number;
    lng: number;
    campamento: string;
    infrastructureId?: string;
    infrastructureType?: 'CAMPAMENTO' | 'ACOPIO';
  };

  @Column('jsonb')
  recurso: {
    categoria: ResourceCategory;
    item: string;
    cantidadRequerida: number;
    unidad: string;
  };

  @Column('jsonb')
  metadataUrgencia: {
    poblacionVulnerable: boolean;
    horasSinCobertura: number;
    confirmacionesLocales: number;
    donacionesEnTransito?: number;
    volumenPoblacionNormalizado?: number;
  };

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.SIN_COBERTURA,
  })
  status: ReportStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  static fromDomain(domain: NeedReport): NeedReportOrmEntity {
    const entity = new NeedReportOrmEntity();
    entity.id = domain.id;
    entity.tipo = domain.tipo;
    entity.zona = domain.zona;
    entity.recurso = domain.recurso;
    entity.metadataUrgencia = domain.metadataUrgencia;
    entity.status = domain.status;
    entity.createdAt = domain.createdAt;
    entity.resolvedAt = domain.resolvedAt;
    return entity;
  }

  toDomain(): NeedReport {
    return new NeedReport(
      this.id,
      this.tipo,
      this.zona,
      this.recurso,
      this.metadataUrgencia,
      this.status,
      this.createdAt,
      this.resolvedAt ? new Date(this.resolvedAt) : undefined,
    );
  }
}
