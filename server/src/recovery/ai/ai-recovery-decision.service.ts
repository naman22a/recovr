import { Injectable } from '@nestjs/common';
import { ChatOllama } from '@langchain/ollama';
import { RecoveryStrategy } from '../../common/enums';

export interface RecoveryContext {
    paymentId: number;
    amount: number;
    currency: string;
    method: string;
    errorCode?: string;
    errorDescription?: string;
    attemptNumber: number;
    maxAttempts: number;
    previousAttempts: number;
}

export interface AIRecoveryDecision {
    strategy: RecoveryStrategy;
    confidence: number;
    reason: string;
}

@Injectable()
export class AIRecoveryDecisionService {
    private readonly model = new ChatOllama({
        model: 'gemma4:12b',
        temperature: 0,
        numPredict: 256,
        think: false,
    });

    async decide(context: RecoveryContext): Promise<AIRecoveryDecision> {
        const prompt = this.buildPrompt(context);

        let response = await this.model.invoke(prompt);

        if (!response.content) {
            console.log('AI returned an empty response. Retrying...');

            response = await this.model.invoke(prompt);
        }

        if (!response.content) {
            throw new Error('AI returned an empty response after retry');
        }

        console.log('Raw AI response:', response.content);

        const rawContent = response.content.toString();

        const jsonContent = rawContent
            .replace(/^```json\s*/, '')
            .replace(/\s*```$/, '');

        const decision = JSON.parse(jsonContent);

        return this.validateDecision(decision);
    }

    private buildPrompt(context: RecoveryContext): string {
        return `
You are an AI payment recovery decision engine.

Analyze the failed payment and recommend exactly one recovery strategy.

Payment:
- ID: ${context.paymentId}
- Amount: ${context.amount} paise
- Currency: ${context.currency}
- Method: ${context.method}
- Error code: ${context.errorCode ?? 'unknown'}
- Error description: ${context.errorDescription ?? 'unknown'}
- Current attempt: ${context.attemptNumber}
- Maximum attempts: ${context.maxAttempts}
- Previous recovery attempts: ${context.previousAttempts}

Allowed strategies:
- retry_payment
- customer_retry
- manual_review

Return ONLY valid JSON in this exact format:
{
  "strategy": "retry_payment | customer_retry | manual_review",
  "confidence": 0.0,
  "reason": "short explanation"
}

Rules:
- confidence must be between 0 and 1
- use only the allowed strategies
- use retry_payment for transient failures such as gateway errors
- use customer_retry when customer action may be required
- use manual_review when repeated attempts have failed or the case is unsafe to automate
- do not recommend retry_payment when the maximum attempt limit has been reached
- keep the reason to one short sentence
- do not explain your reasoning
- return the JSON immediately
`;
    }

    private validateDecision(decision: unknown): AIRecoveryDecision {
        if (typeof decision !== 'object' || decision === null) {
            throw new Error('AI returned an invalid decision');
        }

        const value = decision as Record<string, unknown>;

        if (
            typeof value.strategy !== 'string' ||
            !Object.values(RecoveryStrategy).includes(
                value.strategy as RecoveryStrategy,
            )
        ) {
            throw new Error(
                `AI returned an invalid recovery strategy: ${String(value.strategy)}`,
            );
        }

        if (
            typeof value.confidence !== 'number' ||
            value.confidence < 0 ||
            value.confidence > 1
        ) {
            throw new Error(
                `AI returned invalid confidence: ${String(value.confidence)}`,
            );
        }

        if (
            typeof value.reason !== 'string' ||
            value.reason.trim().length === 0
        ) {
            throw new Error('AI returned an invalid reason');
        }

        const confidence = Math.min(value.confidence, 0.95);

        return {
            strategy: value.strategy as RecoveryStrategy,
            confidence,
            reason: value.reason,
        };
    }
}
