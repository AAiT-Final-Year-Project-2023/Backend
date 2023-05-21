import {
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Entity,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { DatasetAccess, DataType } from 'src/common/defaults';
import { User } from 'src/user/user.entity';
import { PaymentPlan } from 'src/paymentplan/paymentplan.entity';
import { Contribution } from 'src/contribution/contribution.entity';

@Entity()
export class RequestPost {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.request_posts)
    user: string;

    @ManyToOne(() => PaymentPlan, (payment_plan) => payment_plan.request_posts)
    payment_plan: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column('varchar', { array: true, default: [] })
    labels: string[];

    @Column()
    guidelines: string;

    @Column({
        type: 'enum',
        enum: DataType,
    })
    datatype: string;

    @Column('varchar', { array: true })
    extensions: string[];

    @Column()
    data_size: number;

    @Column({ type: 'money' })
    payment: number;

    @Column({ type: 'date' })
    deadline: Date;

    @Column({
        type: 'enum',
        enum: DatasetAccess,
        default: DatasetAccess.PUBLIC,
    })
    access: DatasetAccess;

    @Column({ default: false })
    closed: boolean;

    @OneToMany(() => Contribution, (contribution) => contribution.request_post)
    contributions: Contribution[];

    @ManyToMany(() => User, (user) => user.upvoted_request_posts)
    @JoinTable({
        name: 'user_requestpost_upvotes',
    })
    upvoted_by: User[];

    @ManyToMany(() => User, (user) => user.downvoted_request_posts)
        @JoinTable({
        name: 'user_requestpost_downvotes',
    })
    downvoted_by: User[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
