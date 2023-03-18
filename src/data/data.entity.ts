import { DataType } from 'src/common/defaults';
import { Dataset } from 'src/dataset/dataset.entity';
import {
    CreateDateColumn,
    Entity,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from 'typeorm';

@Entity()
export class Data {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Dataset)
    @JoinColumn()
    dataset: string;

    @Column({
        type: 'enum',
        enum: DataType,
    })
    type: string;

    @Column()
    src: string;

    @Column()
    label_src: string;

    @Column()
    information: string;

    @Column()
    size: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
