import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ContributionStatus } from 'src/common/defaults';
import { User } from 'src/user/user.entity';
import { RequestPost } from 'src/requestpost/requestpost.entity';
import { Data } from 'src/data/data.entity';

@Entity()
export class Contribution {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.contributions)
    user: User;

    @ManyToOne(() => RequestPost, (requestpost) => requestpost.contributions)
    request_post: number;

    @OneToOne(() => Data, { cascade: true })
    @JoinColumn()
    data: number;

    @Column({
        type: 'enum',
        enum: ContributionStatus,
        default: ContributionStatus.PENDING,
    })
    status: string;

    @Column({ type: 'money' })
    earning: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
