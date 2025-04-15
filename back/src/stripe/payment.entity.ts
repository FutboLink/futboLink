import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  stripeSessionId: string;

  @Column()
  customerEmail: string;

  @Column()
  amountTotal: number;

  @Column()
  currency: string;

  @Column()
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
