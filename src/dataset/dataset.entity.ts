import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    ManyToMany,
} from 'typeorm';
import { DataType, DatasetAccess } from 'src/common/defaults';
import { User } from 'src/user/user.entity';

@Entity()
export class Dataset {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

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

    // @Column()
    // upvotes: number;

    @Column()
    dataset_size: number;

    @Column({
        type: 'enum',
        enum: DatasetAccess,
    })
    access: string;

    @Column({ type: 'money' })
    price: number;

    @ManyToMany(() => User, (user) => user.liked_datasets)
    liked_by: User[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
