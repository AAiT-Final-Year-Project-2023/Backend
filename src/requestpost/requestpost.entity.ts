import {
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Entity,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
    ManyToOne,
    ManyToMany,
} from 'typeorm';
import { DatasetAccess, DataType } from 'src/common/defaults';
import { User } from 'src/user/user.entity';
import { PaymentPlan } from 'src/paymentplan/paymentplan.entity';
import { Contribution } from 'src/contribution/contribution.entity';

@Entity()
export class RequestPost {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.request_posts)
    user: User;

    @OneToOne(() => PaymentPlan)
    @JoinColumn()
    payment_plan: PaymentPlan;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column('varchar', { array: true })
    labels: string[];

    @Column()
    guidelines: string;

    @Column({
        type: 'enum',
        enum: DataType,
    })
    datatype: string;

    @Column()
    dataset_size: number;

    // @Column()
    // upvotes: number;

    @Column({ type: 'money' })
    payment: number;

    @Column({ type: 'date' })
    deadline: Date;

    @Column({
        type: 'enum',
        enum: DatasetAccess,
        default: DatasetAccess.PRIVATE,
    })
    access: DatasetAccess;

    @OneToMany(
        () => Contribution,
        (contribution) => contribution.request_post,
        { cascade: true },
    )
    contributions: Contribution[];

    @ManyToMany(() => User, (user) => user.liked_request_posts)
    liked_by: User[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
