import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { DataType } from 'src/common/defaults';

@Entity()
export class FileExtension {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: DataType })
    data_type: DataType;

    @Column()
    extension: string;
}
