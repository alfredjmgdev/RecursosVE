import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NeedReportOrmEntity } from './infrastructure/adapters/out/persistence/postgres/entities/report.orm-entity';
import { DisasterZoneOrmEntity } from './infrastructure/adapters/out/persistence/postgres/entities/disaster-zone.orm-entity';
import { RefugeeCampOrmEntity } from './infrastructure/adapters/out/persistence/postgres/entities/refugee-camp.orm-entity';
import { CollectionCenterOrmEntity } from './infrastructure/adapters/out/persistence/postgres/entities/collection-center.orm-entity';
import { DisasterTypeOrmEntity } from './infrastructure/adapters/out/persistence/postgres/entities/disaster-type.orm-entity';
import { VenezuelaStateOrmEntity } from './infrastructure/adapters/out/persistence/postgres/entities/venezuela-state.orm-entity';
import { ReportFeedbackOrmEntity } from './infrastructure/adapters/out/persistence/postgres/entities/report-feedback.orm-entity';
import { DispatchShipmentOrmEntity } from './infrastructure/adapters/out/persistence/postgres/entities/dispatch-shipment.orm-entity';
import { UserOrmEntity } from './infrastructure/adapters/out/persistence/postgres/entities/user.orm-entity';

import { ReportPostgresRepository } from './infrastructure/adapters/out/persistence/postgres/repositories/report.postgres-repository';
import { InventoryPostgresRepository } from './infrastructure/adapters/out/persistence/postgres/repositories/inventory.postgres-repository';
import { DonationPostgresRepository } from './infrastructure/adapters/out/persistence/postgres/repositories/donation.postgres-repository';
import { UserPostgresRepository } from './infrastructure/adapters/out/persistence/postgres/repositories/user.postgres-repository';
import { DisasterZonePostgresRepository } from './infrastructure/adapters/out/persistence/postgres/repositories/disaster-zone.postgres-repository';
import { RefugeeCampPostgresRepository } from './infrastructure/adapters/out/persistence/postgres/repositories/refugee-camp.postgres-repository';
import { CollectionCenterPostgresRepository } from './infrastructure/adapters/out/persistence/postgres/repositories/collection-center.postgres-repository';
import { DisasterTypePostgresRepository } from './infrastructure/adapters/out/persistence/postgres/repositories/disaster-type.postgres-repository';
import { VenezuelaStatePostgresRepository } from './infrastructure/adapters/out/persistence/postgres/repositories/venezuela-state.postgres-repository';

import { REPORT_REPOSITORY_PORT } from './domain/ports/out/report-repository.port';
import { INVENTORY_REPOSITORY_PORT } from './domain/ports/out/inventory-repository.port';
import { DONATION_REPOSITORY_PORT } from './domain/ports/out/donation-repository.port';
import { USER_REPOSITORY_PORT } from './domain/ports/out/user-repository.port';
import { DISASTER_ZONE_REPOSITORY_PORT } from './domain/ports/out/disaster-zone-repository.port';
import { REFUGEE_CAMP_REPOSITORY_PORT } from './domain/ports/out/refugee-camp-repository.port';
import { COLLECTION_CENTER_REPOSITORY_PORT } from './domain/ports/out/collection-center-repository.port';
import { DISASTER_TYPE_REPOSITORY_PORT } from './domain/ports/out/disaster-type-repository.port';
import { VENEZUELA_STATE_REPOSITORY_PORT } from './domain/ports/out/venezuela-state-repository.port';

import { CREATE_REPORT_USE_CASE } from './domain/ports/in/create-report.use-case';
import { GET_ACTIVE_REPORTS_USE_CASE } from './domain/ports/in/get-active-reports.use-case';
import { UPDATE_REPORT_STATUS_USE_CASE } from './domain/ports/in/update-report-status.use-case';
import { ANALYZE_GAPS_USE_CASE } from './domain/ports/in/analyze-gaps.use-case';
import { GET_LEARNING_METRICS_USE_CASE } from './domain/ports/in/get-learning-metrics.use-case';
import { REGISTER_INVENTORY_USE_CASE } from './domain/ports/in/register-inventory.use-case';
import { OFFER_DONATION_USE_CASE } from './domain/ports/in/offer-donation.use-case';
import { LOGIN_USE_CASE } from './domain/ports/in/login.use-case';
import { MANAGE_INFRASTRUCTURE_USE_CASE } from './domain/ports/in/manage-infrastructure.use-case';
import { PROCESS_NLP_REPORT_USE_CASE } from './domain/ports/in/process-nlp-report.use-case';
import { CALCULATE_OPTIMAL_ROUTE_USE_CASE } from './domain/ports/in/calculate-optimal-route.use-case';
import { SUBMIT_FEEDBACK_USE_CASE } from './domain/ports/in/submit-feedback.use-case';
import { ManageShipmentUseCase } from './domain/ports/in/manage-shipment.use-case';

import { CreateReportService } from './application/services/create-report.service';
import { GetActiveReportsService } from './application/services/get-active-reports.service';
import { UpdateReportStatusService } from './application/services/update-report-status.service';
import { AnalyzeGapsService } from './application/services/analyze-gaps.service';
import { GetLearningMetricsService } from './application/services/get-learning-metrics.service';
import { RegisterInventoryService } from './application/services/register-inventory.service';
import { OfferDonationService } from './application/services/offer-donation.service';
import { LoginService } from './application/services/login.service';
import { ManageInfrastructureService } from './application/services/manage-infrastructure.service';
import { ProcessNlpReportService } from './application/services/process-nlp-report.service';
import { CalculateOptimalRouteService } from './application/services/calculate-optimal-route.service';
import { SubmitFeedbackService } from './application/services/submit-feedback.service';
import { ManageShipmentService } from './application/services/manage-shipment.service';

import { ReportsController } from './infrastructure/adapters/in/http/reports.controller';
import { AnalyticsController } from './infrastructure/adapters/in/http/analytics.controller';
import { InventoryController } from './infrastructure/adapters/in/http/inventory.controller';
import { DonationsController } from './infrastructure/adapters/in/http/donations.controller';
import { AuthController } from './infrastructure/adapters/in/http/auth.controller';
import { InfrastructureController } from './infrastructure/adapters/in/http/infrastructure.controller';
import { RoutesController } from './infrastructure/adapters/in/http/routes.controller';
import { ShipmentsController } from './infrastructure/adapters/in/http/shipments.controller';
import { UsersController } from './infrastructure/adapters/in/http/users.controller';
import { RoleOrmEntity } from './infrastructure/adapters/out/persistence/postgres/entities/role.orm-entity';

const ORM_ENTITIES = [
  RoleOrmEntity,
  UserOrmEntity,
  NeedReportOrmEntity,
  DisasterZoneOrmEntity,
  RefugeeCampOrmEntity,
  CollectionCenterOrmEntity,
  DisasterTypeOrmEntity,
  VenezuelaStateOrmEntity,
  ReportFeedbackOrmEntity,
  DispatchShipmentOrmEntity,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || process.env.DB_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || process.env.DB_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'Megaman624891*',
      database: process.env.POSTGRES_DB || process.env.DB_NAME || process.env.DB_DATABASE || 'recursosve_db',
      entities: ORM_ENTITIES,
      synchronize: true,
      retryAttempts: 1,
    }),
    TypeOrmModule.forFeature(ORM_ENTITIES),
  ],
  controllers: [
    ReportsController,
    AnalyticsController,
    InventoryController,
    DonationsController,
    AuthController,
    InfrastructureController,
    RoutesController,
    ShipmentsController,
    UsersController,
  ],
  providers: [
    CalculateOptimalRouteService,
    ReportPostgresRepository,
    InventoryPostgresRepository,
    DonationPostgresRepository,
    UserPostgresRepository,
    DisasterZonePostgresRepository,
    RefugeeCampPostgresRepository,
    CollectionCenterPostgresRepository,
    DisasterTypePostgresRepository,
    VenezuelaStatePostgresRepository,
    {
      provide: CALCULATE_OPTIMAL_ROUTE_USE_CASE,
      useClass: CalculateOptimalRouteService,
    },
    {
      provide: REPORT_REPOSITORY_PORT,
      useExisting: ReportPostgresRepository,
    },
    {
      provide: INVENTORY_REPOSITORY_PORT,
      useExisting: InventoryPostgresRepository,
    },
    {
      provide: DONATION_REPOSITORY_PORT,
      useExisting: DonationPostgresRepository,
    },
    {
      provide: USER_REPOSITORY_PORT,
      useExisting: UserPostgresRepository,
    },
    {
      provide: DISASTER_ZONE_REPOSITORY_PORT,
      useExisting: DisasterZonePostgresRepository,
    },
    {
      provide: REFUGEE_CAMP_REPOSITORY_PORT,
      useExisting: RefugeeCampPostgresRepository,
    },
    {
      provide: COLLECTION_CENTER_REPOSITORY_PORT,
      useExisting: CollectionCenterPostgresRepository,
    },
    {
      provide: DISASTER_TYPE_REPOSITORY_PORT,
      useExisting: DisasterTypePostgresRepository,
    },
    {
      provide: VENEZUELA_STATE_REPOSITORY_PORT,
      useExisting: VenezuelaStatePostgresRepository,
    },
    {
      provide: CREATE_REPORT_USE_CASE,
      useClass: CreateReportService,
    },
    {
      provide: GET_ACTIVE_REPORTS_USE_CASE,
      useClass: GetActiveReportsService,
    },
    {
      provide: UPDATE_REPORT_STATUS_USE_CASE,
      useClass: UpdateReportStatusService,
    },
    {
      provide: ANALYZE_GAPS_USE_CASE,
      useClass: AnalyzeGapsService,
    },
    {
      provide: GET_LEARNING_METRICS_USE_CASE,
      useClass: GetLearningMetricsService,
    },
    {
      provide: REGISTER_INVENTORY_USE_CASE,
      useClass: RegisterInventoryService,
    },
    {
      provide: OFFER_DONATION_USE_CASE,
      useClass: OfferDonationService,
    },
    {
      provide: LOGIN_USE_CASE,
      useClass: LoginService,
    },
    {
      provide: MANAGE_INFRASTRUCTURE_USE_CASE,
      useClass: ManageInfrastructureService,
    },
    {
      provide: PROCESS_NLP_REPORT_USE_CASE,
      useClass: ProcessNlpReportService,
    },
    SubmitFeedbackService,
    {
      provide: SUBMIT_FEEDBACK_USE_CASE,
      useClass: SubmitFeedbackService,
    },
    ManageShipmentService,
    {
      provide: ManageShipmentUseCase,
      useClass: ManageShipmentService,
    },
  ],
})
export class AppModule {}
