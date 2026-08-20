import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportRepositoryPort } from '../../../../../../domain/ports/out/report-repository.port';
import { NeedReport, ReportStatus, ResourceCategory } from '../../../../../../domain/entities/report.entity';
import { NeedReportOrmEntity } from '../entities/report.orm-entity';

@Injectable()
export class ReportPostgresRepository implements ReportRepositoryPort {
  // In-memory fallback map for dev mode without active database instance
  private readonly inMemoryStore = new Map<string, NeedReport>();

  constructor(
    @InjectRepository(NeedReportOrmEntity)
    private readonly typeOrmRepository?: Repository<NeedReportOrmEntity>,
  ) {
    this.seedInitialData();
  }

  private seedInitialData() {
    // No automatic forced seed data so DB reset is respected
  }

  async save(report: NeedReport): Promise<NeedReport> {
    try {
      if (this.typeOrmRepository) {
        const ormEntity = NeedReportOrmEntity.fromDomain(report);
        const saved = await this.typeOrmRepository.save(ormEntity);
        return saved.toDomain();
      }
    } catch {
      // Fallback to in-memory store if DB is disconnected
    }
    this.inMemoryStore.set(report.id, report);
    return report;
  }

  async findById(id: string): Promise<NeedReport | null> {
    try {
      if (this.typeOrmRepository) {
        const found = await this.typeOrmRepository.findOne({ where: { id } });
        if (found) return found.toDomain();
      }
    } catch {
      // Fallback to memory
    }
    return this.inMemoryStore.get(id) ?? null;
  }

  async findAllActive(): Promise<NeedReport[]> {
    try {
      if (this.typeOrmRepository) {
        const foundList = await this.typeOrmRepository.find();
        return foundList.map((e) => e.toDomain());
      }
    } catch {
      // Fallback to memory if DB is down
    }

    return Array.from(this.inMemoryStore.values());
  }

  async updateStatus(id: string, status: ReportStatus): Promise<NeedReport> {
    const report = await this.findById(id);
    if (!report) {
      // Fallback look in memory
      const memReport = this.inMemoryStore.get(id);
      if (memReport) {
        memReport.status = status;
        if (status === ReportStatus.CUBIERTA) {
          memReport.resolvedAt = new Date();
        } else {
          memReport.resolvedAt = undefined;
        }
        this.inMemoryStore.set(id, memReport);
        return memReport;
      }
      throw new Error(`Report with ID ${id} not found`);
    }

    report.status = status;
    if (status === ReportStatus.CUBIERTA) {
      report.resolvedAt = new Date();
    } else {
      report.resolvedAt = undefined;
    }
    return this.save(report);
  }
}
