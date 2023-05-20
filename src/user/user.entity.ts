import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { ArrayMaxSize } from 'class-validator';
import { UserRole, UserStatus } from 'src/common/defaults';
import { Dataset } from 'src/dataset/dataset.entity';
import { RequestPost } from 'src/requestpost/requestpost.entity';
import { Notification } from 'src/notification/notification.entity';
import { Contribution } from 'src/contribution/contribution.entity';
import { BankInformation } from 'src/bankinformation/bankinformation.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => BankInformation, {
        cascade: true,
        nullable: true,
    })
    @JoinColumn()
    bank_information: BankInformation;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: [UserRole.USER],
        array: true,
    })
    roles: UserRole[];

    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.NORMAL,
    })
    status: string;

    @Column({ nullable: true })
    image: string;

    @Column({ default: 0 })
    current_balance: number;

    @Column({ default: 0 })
    total_earnings: number;

    @Column({ default: false })
    email_is_valid: boolean;

    @Column({ nullable: true })
    email_verification_code: string;

    @Column({ nullable: true })
    email_verification_code_expiration: Date;

    @Column({ nullable: true })
    new_password: string;

    @Column({ nullable: true })
    password_change_verification_code: string;

    @Column({ nullable: true })
    password_change_code_expiration: Date;

    @Column({ default: false })
    google_authenticated: boolean;

    @Column('varchar', { array: true, default: [] })
    @ArrayMaxSize(3)
    // relationship ????
    recently_viewed: string[];

    @OneToMany(() => Notification, (notification) => notification.user, {
        cascade: true,
    })
    notifications: Notification[];

    @OneToMany(() => Contribution, (contribution) => contribution.user)
    contributions: Contribution[];

    @OneToMany(() => Dataset, (dataset) => dataset.user)
    datasets: Dataset[];

    @OneToMany(() => RequestPost, (requestpost) => requestpost.user)
    request_posts: RequestPost[];

    @ManyToMany(() => Dataset, (dataset) => dataset.upvoted_by)
    @JoinTable({
        name: 'user_dataset_upvotes',
    })
    upvoted_datasets: Dataset[];

    @ManyToMany(() => Dataset, (dataset) => dataset.downvoted_by)
    @JoinTable({
        name: 'user_dataset_downvotes',
    })
    downvoted_datasets: Dataset[];

    @ManyToMany(() => RequestPost, (requestpost) => requestpost.upvoted_by)
    @JoinTable({
        name: 'user_requestpost_upvotes',
    })
    upvoted_request_posts: RequestPost[];

    @ManyToMany(() => RequestPost, (requestpost) => requestpost.downvoted_by)
    @JoinTable({
        name: 'user_requestpost_downvotes',
    })
    downvoted_request_posts: RequestPost[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
