import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dtos/create_notification.dto';
import { User } from 'src/user/user.entity';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification) private repo: Repository<Notification>,
    ) {}

    async create(notification: CreateNotificationDto): Promise<Notification> {
        const newNotification = this.repo.create(notification);
        return this.repo.save(newNotification);
    }

    async find(
        user: string,
        page?: number,
        limit?: number,
    ): Promise<Notification[]> {
        const query = this.repo
            .createQueryBuilder('notification')
            .where('notification.user = :user', { user })
            .leftJoinAndSelect(User, 'user', 'user.id = notification.user')
            .leftJoinAndSelect(
                User,
                'from_user',
                'user.id = notification.from_user',
            )
            .select([
                'notification.id',
                'notification.title',
                'notification.description',
                'notification.seen',
                'notification.created_at',
                'user.id',
                'user.username',
                'user.image',
                'from_user.id',
                'from_user.username',
                'from_user.image',
            ]);

        query.orderBy('notification.created_at', 'DESC');

        if (limit) {
            query.take(limit);
            if (page) query.skip((page - 1) * limit);
        }
        return query.getMany();
    }

    async findById(id: string): Promise<Notification> {
        return this.repo.findOne({ where: { id } });
    }

    async update(
        id: string,
        attrs: Partial<Notification>,
    ): Promise<Notification> {
        const notification = await this.findById(id);
        if (!notification)
            throw new HttpException(
                'Notification not found',
                HttpStatus.NOT_FOUND,
            );
        Object.assign(notification, attrs);
        return this.repo.save(notification);
    }

    async remove(id: string): Promise<Notification> {
        const notification = await this.findById(id);
        if (!notification)
            throw new HttpException(
                'Notification not found',
                HttpStatus.NOT_FOUND,
            );
        return this.repo.remove(notification);
    }
}
