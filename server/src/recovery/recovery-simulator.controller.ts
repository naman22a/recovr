import { Body, Controller, Post } from '@nestjs/common';
import { RecoverySimulatorService } from './recovery-simulator.service';

@Controller('recovery')
export class RecoverySimulatorController {
    constructor(private readonly simulatorService: RecoverySimulatorService) {}

    @Post('simulate')
    async simulate(
        @Body()
        body: {
            count?: number;
        },
    ) {
        const count = Math.min(body.count ?? 50, 100);
        return this.simulatorService.simulate(count);
    }
}
