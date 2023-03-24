import { Dataset } from 'src/dataset/dataset.entity';
import { RequestPost } from 'src/requestpost/requestpost.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaymentPlan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    disk_size: number;

    @Column({ type: 'money' })
    price: number;

    @Column({ type: 'int', default: 0 })
    discount: number;

    @OneToMany(() => RequestPost, (request_post) => request_post.payment_plan)
    request_posts: RequestPost[];

    @OneToMany(() => Dataset, (dataset) => dataset.payment_plan)
    datasets: Dataset[];
}
