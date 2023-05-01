import { Controller, HttpException, HttpStatus, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { UserRole } from 'src/common/defaults';
import { Roles } from 'src/decorators/roles.decorator';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Roles(UserRole.ADMIN)
    @Put('make-admin/:id')
    async makeUserAdmin(@Param('id', ParseUUIDPipe) userId: string){
        let user = await this.userService.findById(userId);
        if(!user){
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const roles = user.roles;

        if(roles.includes(UserRole.ADMIN)){
            return "User already is an Admin"
        }
        roles.push(UserRole.ADMIN);
        let updatedUser = await this.userService.update(userId, {
            roles: roles
        });
        return "User given Admin privilege";
    }
    
}
