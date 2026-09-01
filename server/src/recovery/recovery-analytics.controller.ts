import { Controller, Get } from '@nestjs/common';
import { RecoveryAnalyticsService } from './recovery-analytics.service';

@Controller('recovery')
export class RecoveryAnalyticsController {
    constructor(private readonly analyticsService: RecoveryAnalyticsService) {}

    @Get('metrics')
    async getMetrics() {
        return this.analyticsService.getMetrics();
    }
}
