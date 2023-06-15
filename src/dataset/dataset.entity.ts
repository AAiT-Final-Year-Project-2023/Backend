import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    ManyToMany,
    ManyToOne,
    JoinTable,
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { PaymentPlan } from 'src/paymentplan/paymentplan.entity';
import { DataType, DatasetStatus } from 'src/common/defaults';

@Entity()
export class Dataset {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.datasets)
    user: User;

    @ManyToOne(() => PaymentPlan, (payment_plan) => payment_plan.datasets)
    payment_plan: PaymentPlan;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    src: string;

    @Column()
    size: number;

    @Column('varchar', { array: true })
    labels: string[];

    @Column({
        type: 'enum',
        enum: DatasetStatus,
        default: DatasetStatus.PENDING,
    })
    status: DatasetStatus;

    @Column({
        type: 'enum',
        enum: DataType,
    })
    datatype: DataType;

    @Column({ type: 'money', default: 0 })
    price: number;

    @ManyToMany(() => User, (user) => user.purchased_datasets)
    @JoinTable({
        name: 'user_dataset_owned',
    })
    purchased_by: User[];

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
