import { DataType } from 'src/common/defaults';
import {
    CreateDateColumn,
    Entity,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';

@Entity()
export class Data {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: DataType,
    })
    type: string;

    @Column()
    extension: string;

    @Column()
    src: string;

    @Column({ type: 'json' })
    label: JSON;

    @Column()
    information: string;

    @Column()
    size: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
