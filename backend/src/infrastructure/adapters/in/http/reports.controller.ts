import { Body, Controller, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { CREATE_REPORT_USE_CASE } from '../../../../domain/ports/in/create-report.use-case';
import type { CreateReportUseCase } from '../../../../domain/ports/in/create-report.use-case';
import { GET_ACTIVE_REPORTS_USE_CASE } from '../../../../domain/ports/in/get-active-reports.use-case';
import type { GetActiveReportsUseCase } from '../../../../domain/ports/in/get-active-reports.use-case';
import { UPDATE_REPORT_STATUS_USE_CASE } from '../../../../domain/ports/in/update-report-status.use-case';
import type { UpdateReportStatusUseCase } from '../../../../domain/ports/in/update-report-status.use-case';
import { CreateReportDto } from './dtos/create-report.dto';
import { ReportStatus } from '../../../../domain/entities/report.entity';

@Controller('reports')
export class ReportsController {
  constructor(
    @Inject(CREATE_REPORT_USE_CASE)
    private readonly createReportUseCase: CreateReportUseCase,
    @Inject(GET_ACTIVE_REPORTS_USE_CASE)
    private readonly getActiveReportsUseCase: GetActiveReportsUseCase,
    @Inject(UPDATE_REPORT_STATUS_USE_CASE)
    private readonly updateReportStatusUseCase: UpdateReportStatusUseCase,
  ) {}

  @Post()
  async createReport(@Body() dto: CreateReportDto) {
    return this.createReportUseCase.execute(dto);
  }

  @Get()
  async getActiveReports() {
    return this.getActiveReportsUseCase.execute();
  }

  @Patch(':id/status')
  async updateReportStatus(
    @Param('id') id: string,
    @Body('status') status: ReportStatus,
  ) {
    return this.updateReportStatusUseCase.execute(id, status);
  }
}
