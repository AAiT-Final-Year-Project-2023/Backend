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
    @PrimaryGeneratedColumn()
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
        default: UserRole.USER,
    })
    role: string;

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

    @OneToMany(() => RequestPost, (requestpost) => requestpost.user)
    request_posts: RequestPost[];

    @ManyToMany(() => Dataset, (dataset) => dataset.liked_by)
    @JoinTable({
        name: 'user_dataset_likes',
    })
    liked_datasets: Dataset[];

    @ManyToMany(() => RequestPost, (requestpost) => requestpost.liked_by)
    @JoinTable({
        name: 'user_requestpost_likes',
    })
    liked_request_posts: RequestPost[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
