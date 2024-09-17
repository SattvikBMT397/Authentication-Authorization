import { Controller, Post, Body, Get, Param, Delete, Patch, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserResponse, DeleteUserResponse, FindAllUsersResponse, UpdateUserResponse } from './utils/success-response';
import { Public, Roles } from 'src/auth/decorator/public.decorator';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { User } from './interface/interface';
import { ERROR_MESSAGES } from './messages/error-messages-constant';
import { Role } from '../enum/role-enum';
import { UserStatus } from '../enum/permission-enum';

//@Controller('users')
//versioning
@Controller(
    {
        version: ['1', '2'],
        path: 'users'
    })
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Public()
    @Post('create')
    async createUser(@Body() createUserDto: CreateUserDto): Promise<CreateUserResponse> {
        return this.userService.create(createUserDto);
    }

    @Public()
    @Post('admin')
    async createAdmin(@Body() adminData: CreateUserDto): Promise<CreateUserResponse> {
        return this.userService.createAdmin(adminData);
    }

    @Roles(Role.ADMIN)
    @Get()
    async findAll(): Promise<FindAllUsersResponse> {
        return this.userService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: number) {
        return this.userService.findById(id);
    }

@Patch(':id')
async update(
  @Param('id') id: number,
  @Body() updateUserDto: UpdateUserDto,
  @CurrentUser() user: User,
): Promise<UpdateUserResponse> {
    if (user.id !== id) {
        throw new HttpException(ERROR_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    return this.userService.update(id, updateUserDto);
}


    @Patch(':id/status') 
    @Roles(Role.ADMIN)
    async updateStatus(
        @Param('id') userId: number,
        @Body('status') status: UserStatus,
        @CurrentUser() currentUser: User
    ): Promise<void> {
        const adminId = currentUser.id
        await this.userService.changeUserStatus(userId, status, adminId);
    }

    @Delete(':id')
    async remove(@Param('id') id: number, @CurrentUser() user: User): Promise<DeleteUserResponse> {
        if (user.id !== id) {
            throw new HttpException(ERROR_MESSAGES.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }
        return this.userService.remove(user.id);
    }
    @Patch(':id/restore')
    @Roles(Role.ADMIN)
    async restoreUser(@Param('id') id: number): Promise<{ message: string }> {
        return this.userService.restoreUser(id);
    }
}
