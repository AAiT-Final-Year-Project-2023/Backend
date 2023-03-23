import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaymentPlan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    disk_size: number;

    @Column({ type: 'money' })
    price: number;

    @Column({ type: 'int', default: 0 })
    discount: number;
}
