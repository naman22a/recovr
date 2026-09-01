import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import {
    RecoveryAttempt,
    RecoveryAttemptStatus,
    RecoveryStrategy,
} from '../models/recovery-attempt.model';
import { Payment } from '../models/payment.model';

@Injectable()
export class RecoveryService {
    constructor(private readonly em: EntityManager) {}

    async createAttempt(
        payment: Payment,
        strategy: RecoveryStrategy,
        reason: string,
    ): Promise<RecoveryAttempt> {
        const attempt = new RecoveryAttempt();

        attempt.payment = payment;
        attempt.strategy = strategy;
        attempt.reason = reason;
        attempt.status = RecoveryAttemptStatus.PENDING;

        this.em.persist(attempt);

        await this.em.flush();

        return attempt;
    }
}
