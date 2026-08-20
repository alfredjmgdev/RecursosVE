import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CALCULATE_OPTIMAL_ROUTE_USE_CASE } from '../../../../domain/ports/in/calculate-optimal-route.use-case';
import type {
  CalculateOptimalRouteCommand,
  CalculateOptimalRouteUseCase,
  RouteCalculationResult,
} from '../../../../domain/ports/in/calculate-optimal-route.use-case';

@Controller('routes')
export class RoutesController {
  constructor(
    @Inject(CALCULATE_OPTIMAL_ROUTE_USE_CASE)
    private readonly calculateOptimalRouteUseCase: CalculateOptimalRouteUseCase,
  ) {}

  @Post('calculate')
  async calculateRoute(@Body() command: CalculateOptimalRouteCommand): Promise<RouteCalculationResult> {
    return this.calculateOptimalRouteUseCase.execute(command);
  }
}
