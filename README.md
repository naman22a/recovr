# Recovr

> AI-powered payment recovery and revenue protection platform built for the Razorpay AI Revenue Recovery Buildathon 2026.

Recovr helps businesses recover revenue from failed payments by combining **AI-powered failure analysis**, **bounded recovery strategies**, **deterministic safety rules**, and **automated background processing**.

Instead of blindly retrying failed payments, Recovr analyzes the payment failure and decides what recovery action is appropriate:

- Retry the payment
- Ask the customer to retry
- Escalate for manual review
- Stop recovery when continuing is unsafe or the maximum attempt limit is reached

Every recovery decision is recorded, explainable, and traceable.

---

## Problem

Failed payments directly translate into lost revenue.

A simple retry mechanism is not enough because different failures require different actions:

- Temporary gateway failures may succeed when retried.
- Customer-action failures may require the customer to retry.
- Repeated failures should not result in unlimited automated attempts.
- Low-confidence AI decisions should not directly trigger financial actions.

Recovr addresses this by putting AI in the role of **decision support**, while deterministic application logic remains responsible for **safety and execution**.

---

## Solution

Recovr follows this flow:

```text
Razorpay Payment Failure
        │
        ▼
   Webhook Handler
        │
        ▼
   Payment Database
        │
        ▼
 AI Recovery Decision
        │
        ├── Retry Payment
        │
        ├── Customer Retry
        │
        └── Manual Review
        │
        ▼
 Safety Validation
        │
        ▼
 Recovery Attempt
        │
        ▼
      BullMQ
        │
        ▼
 Recovery Worker
        │
        ▼
 Recovery Action
        │
        ├── Recovered
        ├── Waiting for Customer
        ├── Failed
        └── Stopped
        │
        ▼
 Analytics / Audit / Dashboard
```

## Key Features

### AI-powered recovery decisions

Recovr uses an LLM to analyze payment failure context including:

- Payment amount
- Currency
- Payment method
- Razorpay error code
- Error description
- Current attempt number
- Maximum allowed attempts
- Previous recovery attempts

The AI returns a structured decision containing:

```json
{
    "strategy": "retry_payment",
    "confidence": 0.95,
    "reason": "The error is a transient gateway issue and the maximum attempt limit has not been reached."
}
```

### Explainable AI

Every AI recovery decision stores:

- Strategy
- Confidence
- Reason
- Decision source
- Attempt number
- Payment information
- Result

This makes every automated recovery decision explainable instead of treating the AI as a black box.

### Bounded recovery

Recovr does not allow unlimited payment retries.

Each recovery attempt has a maximum attempt limit.

If the maximum number of attempts is reached:

```txt
Recovery → STOPPED
```

The system can also stop recovery when the AI decision fails safety validation.

This prevents uncontrolled automated payment activity.

### Deterministic safety layer

The AI recommends a recovery strategy, but it does not have unrestricted control over payment execution.

The application validates:

- Whether the strategy is supported
- Whether AI confidence meets the minimum threshold
- Whether the maximum attempt limit has been reached
- Whether the recovery flow is allowed to continue

This provides a separation between:

```txt
AI → Recommendation
Application → Safety + Execution
```

### Background processing

Recovery actions are processed asynchronously using BullMQ.

This allows the API to remain responsive while recovery work is handled by background workers.

The processing pipeline supports:

- Queuing recovery attempts
- Exponential retry backoff
- Failed job handling
- Recovery status tracking
- Bounded worker retries

### Recovery analytics

The dashboard provides business-level recovery metrics including:

- Amount recovered
- Recovery rate
- Successful recoveries
- Payments at risk
- Total recovery attempts
- Waiting-for-customer recoveries
- Failed recoveries
- Stopped recoveries
- Average attempts per successful recovery

The analytics dashboard uses live backend data rather than hardcoded demo values.

### Recovery history

Every recovery attempt is recorded and can be inspected through the dashboard.

The history includes:

| Field            | Description                          |
| ---------------- | ------------------------------------ |
| Payment          | Payment associated with the recovery |
| Attempt          | Current recovery attempt number      |
| Strategy         | AI-selected recovery strategy        |
| Confidence       | AI confidence score                  |
| Decision Source  | Source of the recovery decision      |
| Reason           | Explainable AI reasoning             |
| Status           | Current recovery status              |
| Result           | Recovery execution result            |
| Amount Recovered | Revenue recovered by the attempt     |
| Created At       | Attempt creation timestamp           |
| Completed At     | Completion timestamp                 |

## Recovery Strategies

Recovr currently supports three recovery strategies:

### retry_payment

Used for failures that are potentially transient, such as gateway or network failures.

```txt
Payment Failed
     ↓
AI identifies transient failure
     ↓
Retry Payment
     ↓
Recovered / Failed
```

### customer_retry

Used when recovery requires customer action.

```txt
Payment Failed
     ↓
Customer action required
     ↓
Waiting for Customer
```

### manual_review

Used when automated recovery should not continue.

This can happen when:

- Recovery confidence is insufficient
- The failure should not be automatically retried
- The recovery flow has reached a safety boundary

## Tech Stack

### Backend

- NestJS
- TypeScript
- PostgreSQL
- MikroORM
- Redis
- BullMQ
- Razorpay Test Mode
- Ollama
- Gemma

### Frontend

- React
- Vite
- TypeScript
- Taste-based UI/design system

### Infrastructure

- Redis
- PostgreSQL
- BullMQ workers

<!-- ## Architecture -->

<!-- TODO: add it later -->

## AI Decision Pipeline

The AI receives structured payment context rather than raw application state.

Example context:

```json
{
    "paymentId": 42,
    "amount": 5000,
    "currency": "INR",
    "method": "card",
    "errorCode": "GATEWAY_ERROR",
    "errorDescription": "Temporary gateway or network error",
    "attemptNumber": 1,
    "maxAttempts": 3,
    "previousAttempts": 0
}
```

The model returns:

```json
{
    "strategy": "retry_payment",
    "confidence": 0.95,
    "reason": "The error is a transient gateway issue and the maximum attempt limit has not been reached."
}
```

The application then validates the response before creating a recovery attempt.

## Safety Model

The AI is intentionally not given unrestricted control over recovery.

```txt
             AI
              │
              │ Recommendation
              ▼
       ┌───────────────┐
       │ Safety Layer  │
       └───────┬───────┘
               │
       ┌───────┴────────┐
       │                │
    Valid             Invalid
       │                │
       ▼                ▼
   Execute            STOP
   Recovery
```

This design reduces the risk of:

- Unlimited retries
- Unsupported recovery actions
- Low-confidence automated actions
- Uncontrolled financial operations

## Database Model

The core entities are:

```txt
Payment
   │
   ├── WebhookEvent
   │
   └── RecoveryAttempt
           │
           ├── Strategy
           ├── Confidence
           ├── Decision Source
           ├── Reason
           ├── Status
           ├── Result
           └── Amount Recovered
```

### Payment

Stores the failed payment and its failure context.

### WebhookEvent

Stores received webhook events and supports reliable webhook processing.

### RecoveryAttempt

Stores every recovery decision and execution attempt.

## Recovery Attempt Lifecycle

```txt
                 ┌─────────┐
                 │ PENDING │
                 └────┬────┘
                      │
                      ▼
               ┌────────────┐
               │ PROCESSING │
               └─────┬──────┘
                     │
          ┌──────────┼───────────┬──────────────┐
          ▼          ▼           ▼              ▼
     COMPLETED    FAILED    WAITING_FOR_    STOPPED
                              CUSTOMER
```

A failed recovery can trigger another AI decision when the attempt limit has not been reached.

## API

### Health

```http
GET /health
```

Returns API health information.

### Recovery History

```http
GET /recovery/history
```

Returns all recovery attempts ordered by newest first.

### Payment Recovery Details

```http
GET /recovery/payments/:paymentId
```

Returns payment information and its complete recovery attempt history.

### Recovery Metrics

```http
GET /recovery/metrics
```

Returns aggregate recovery analytics.

Example:

```json
{
    "paymentsAtRisk": 3,
    "totalAmountAtRisk": 7500,
    "totalRecoveryAttempts": 7,
    "successfulRecoveries": 2,
    "amountRecovered": 10000,
    "recoveryRate": 40,
    "waitingForCustomer": 2,
    "failedRecoveries": 1,
    "stoppedRecoveries": 1
}
```

### Recovery Simulation

The project includes a synthetic recovery simulator for demonstrating the system with multiple payment failure scenarios.

```http
POST /recovery/simulate
```

The simulator creates failed payments with different failure conditions and sends them through the AI recovery decision pipeline.

This makes it possible to demonstrate:

- Different AI strategies
- Recovery attempts
- Successful recovery
- Customer waiting states
- Failed recovery
- Stopped recovery
- Analytics

## Local Development

### Prerequisites

Make sure the following are installed:

- Node.js
- pnpm
- PostgreSQL
- Redis
- Ollama

Install the required Ollama model:

```bash
ollama pull gemma4:12b
```

### Install dependencies

```bash
pnpm install
```

### Environment Variables

Create a .env file based on the project's environment configuration.

Typical configuration includes:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<database>?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Start PostgreSQL and Redis

Start the required infrastructure using the project's Docker configuration.

```bash
docker compose up -d
```

### Start the backend

```bash
pnpm dev
```

The NestJS API will start in development mode.

### Start the frontend

From the frontend directory:

```bash
pnpm dev
```

Open the Vite development server in your browser.

## Demo Flow

A typical Recovr demonstration follows this sequence:

1. Show failed payments

The dashboard displays failed payments that are currently at risk.

2. Trigger recovery processing

Run the recovery simulator or process a failed payment.

3. AI analyzes the failure

Ollama + Gemma evaluates the payment failure context.

4. AI recommends a strategy

For example:

```txt
Strategy: Retry Payment
Confidence: 95%
Reason:
The error is a transient gateway issue and the maximum
attempt limit has not been reached.
```

5. Safety layer validates the recommendation

The system checks whether the decision is safe to execute.

6. BullMQ processes the recovery

The recovery attempt is placed into the background processing queue.

7. Recovery worker executes the action

The worker performs the appropriate recovery action.

8. Result is recorded

The attempt becomes one of:

```txt
Recovered
Waiting for Customer
Failed
Stopped
```

9. Dashboard reflects the result

Recovery history and analytics update with:

- Recovery attempts
- AI decisions
- Amount recovered
- Recovery rate
- Payments still at risk

## Why Recovr?

Traditional payment recovery often relies on static retry rules.

Recovr introduces an adaptive decision layer:

```txt
Traditional

Payment Failed
      │
      ▼
Retry
      │
      ▼
Retry Again
      │
      ▼
Stop


Recovr

Payment Failed
      │
      ▼
Understand Failure
      │
      ▼
AI Decision
      │
      ▼
Safety Validation
      │
      ├── Retry
      ├── Customer Action
      └── Manual Review
      │
      ▼
Bounded Recovery
      │
      ▼
Measure Revenue Impact
```

The result is a recovery system that is AI-assisted, explainable, bounded, observable, and focused on measurable revenue recovery.

## Future Improvements

Potential extensions include:

More sophisticated payment failure classification
Historical recovery outcome learning
Customer-specific recovery policies
Adaptive retry timing
Additional payment recovery strategies
Time-series revenue recovery analytics
Production Razorpay payment execution
Advanced fraud and risk signals
Experimentation between recovery strategies
Recovery policy configuration from the dashboard

## Buildathon

Built for the Razorpay AI Revenue Recovery Buildathon 2026.

The project focuses on using AI to make payment recovery decisions while keeping financial execution bounded and controlled by deterministic application logic.

## License

Recovr is [MIT LICENSED](./LICENSE)
