import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidPaymentPlan } from 'src/decorators/IsValidPaymentPlan.decorator';
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

    @IsValidPaymentPlan()
    payment_plan: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
