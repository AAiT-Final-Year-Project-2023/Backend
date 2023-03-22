import { Controller, Post, Body } from '@nestjs/common';
import { CreateRequestPostDto } from './dtos/create_requestpost.dto';
import { RequestpostService } from './requestpost.service';

@Controller('requestpost')
export class RequestpostController {
    constructor(private requestPostService: RequestpostService){}

    @Post()
    async create(@Body() body: CreateRequestPostDto){
        return body;
    }
}
