import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type FeedbackResultadoType = 'EXITOSO' | 'DEMANDA_SUBESTIMADA' | 'RETRASO_LOGISTICO' | 'RECURSO_EQUIVOCADO';

@Entity('report_feedbacks')
export class ReportFeedbackOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reportId: string;

  @Column('int')
  calificacion: number;

  @Column({ type: 'varchar', default: 'EXITOSO' })
  resultado: FeedbackResultadoType;

  @Column({ type: 'text', nullable: true })
  comentario?: string;

  @Column({ type: 'varchar', nullable: true })
  categoriaInsumo?: string;

  @Column({ type: 'varchar', nullable: true })
  estadoNombre?: string;

  @CreateDateColumn()
  createdAt: Date;
}
