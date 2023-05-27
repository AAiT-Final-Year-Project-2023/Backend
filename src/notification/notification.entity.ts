import { NotificationType } from 'src/common/defaults';
import { User } from 'src/user/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({ name: 'to_user_id' })
    to: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'from_user_id' })
    from: User;

    @Column()
    title: NotificationType;

    @Column()
    describtion: string;

    @Column({ default: false })
    seen: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
