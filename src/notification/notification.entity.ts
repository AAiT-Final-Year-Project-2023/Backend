import { User } from 'src/user/user.entity';
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

@Entity()
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.notifications)
    user: User;

    // ???
    @OneToOne(() => User)
    @JoinColumn()
    from_user: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({ default: false })
    seen: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
