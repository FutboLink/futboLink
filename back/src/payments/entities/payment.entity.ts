import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  PROCESSING = 'processing',
  REFUNDED = 'refunded',
  PAYMENT_REQUIRED = 'payment_required',
}

export enum PaymentType {
  ONE_TIME = 'one_time',
  SUBSCRIPTION = 'subscription',
}

export enum SubscriptionPlan {
  AMATEUR = 'Amateur',
  SEMIPROFESIONAL = 'Semiprofesional',
  PROFESIONAL = 'Profesional',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  stripeSessionId: string;

  @Column({ nullable: true })
  stripeCustomerId?: string;

  @Column({ nullable: true })
  stripePriceId?: string;

  @Column()
  @Index()
  customerEmail: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountTotal: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.ONE_TIME,
  })
  type: PaymentType;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  stripePaymentIntentId?: string;

  @Column({ nullable: true })
  stripeSubscriptionId?: string;

  @Column({ nullable: true })
  subscriptionStatus?: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    nullable: true,
  })
  subscriptionType?: SubscriptionPlan;

  @Column({ nullable: true })
  failureReason?: string;

  @Column({ nullable: true })
  lastInvoiceId?: string;

  @Column({ nullable: true })
  lastPaymentDate?: Date;

  @Column({ nullable: true })
  metadata?: string; // JSON string for additional data

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 