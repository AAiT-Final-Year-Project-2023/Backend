import {
    HttpException,
    HttpStatus,
    Injectable,
    NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestpostService } from 'src/requestpost/requestpost.service';
import { isValidUUID } from 'src/common/functions';

@Injectable()
export class ContributionUploadMiddleware implements NestMiddleware {
    constructor(private requestPostService: RequestpostService) {}
    async use(req: Request, res: Response, next: NextFunction) {
        // validate the request ID in the request params "id"
        const requestPostId = req.params.id;
        if (!requestPostId || !isValidUUID(requestPostId)) {
            throw new HttpException(
                'Invalid Request Post ID provided',
                HttpStatus.BAD_REQUEST,
            );
        }
        const requestPost = await this.requestPostService.findById(
            requestPostId,
        );
        if (!requestPost) {
            throw new HttpException(
                'Request Post not found',
                HttpStatus.NOT_FOUND,
            );
        }
        next();
    }
}
