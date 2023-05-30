import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class BankInformation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    account_name: string;

    @Column()
    account_number: string;

    @Column()
    bank_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
