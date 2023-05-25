import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    JoinTable,
} from 'typeorm';
import { DataType } from 'src/common/defaults';
import { User } from 'src/user/user.entity';
import { PaymentPlan } from 'src/paymentplan/paymentplan.entity';

@Entity()
export class Dataset {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.datasets)
    user: User;

    @ManyToOne(() => PaymentPlan, (payment_plan) => payment_plan.request_posts)
    payment_plan: PaymentPlan;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column('varchar', { array: true })
    labels: string[];

    @Column({
        type: 'enum',
        enum: DataType,
    })
    datatype: string;

    @Column()
    dataset_size: number;

    @Column({ type: 'money' })
    price: number;

    @ManyToMany(() => User, (user) => user.upvoted_datasets)
    @JoinTable({
        name: 'user_dataset_upvotes',
    })
    upvoted_by: User[];

    @ManyToMany(() => User, (user) => user.downvoted_datasets)
    @JoinTable({
        name: 'user_dataset_downvotes',
    })
    downvoted_by: User[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
