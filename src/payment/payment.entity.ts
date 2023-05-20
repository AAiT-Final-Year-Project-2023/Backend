import { IsNotEmpty, IsString } from 'class-validator';
import { UserExists } from 'src/decorators/UserExists.decorator';
import {
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @IsNotEmpty()
    @IsString()
    tx_ref: string;

    @IsNotEmpty()
    @UserExists()
    user: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
