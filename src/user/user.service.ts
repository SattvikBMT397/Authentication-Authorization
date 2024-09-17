import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from './repositories/user-repository';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ERROR_MESSAGES } from './messages/error-messages-constant';
import { SUCCESS_MESSAGES } from './messages/success-messges-constant';
import {
    CreateUserResponse,
    DeleteUserResponse,
    FindAllUsersResponse,
    FindSingleUsersResponse,
    UpdateUserResponse
} from './utils/success-response';
import { plainToClass } from 'class-transformer';
import { UserStatus } from '../enum/permission-enum';

@Injectable()
export class UserService {
    private readonly saltRounds = 10;

    constructor(
        private readonly userRepository: UserRepository,
    ) { }

    // Create user
    async create(userData: CreateUserDto): Promise<CreateUserResponse> {
        try {
            const user = await this.userRepository.createUser(userData);
            return { message: SUCCESS_MESSAGES.USER_CREATED, user: plainToClass(User, user) };
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
    async createAdmin(adminData: CreateUserDto): Promise<CreateUserResponse> {
        try {
            const admin = await this.userRepository.createAdmin(adminData);
            return { message: SUCCESS_MESSAGES.ADMIN_CREATED, user: plainToClass(User, admin) };
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
    // Find all users
    async findAll(): Promise<FindAllUsersResponse> {
        try {
            const users = await this.userRepository.findAll();
            const usersWithoutSensitiveInfo = users.map(user => plainToClass(User, user));
            return { message: SUCCESS_MESSAGES.USER_RETRIEVED, users: usersWithoutSensitiveInfo };
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    // Find single user
    async findById(id: number): Promise<FindSingleUsersResponse> {
        try {
            const user = await this.userRepository.findById(id);

            if (!user) {
                throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND.replace('{id}', id.toString()));
            }

            return {
                message: SUCCESS_MESSAGES.USER_RETRIEVED,
                user: plainToClass(User, user)
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(error.message);
        }
    }

    async update(id: number, updateUserData: UpdateUserDto): Promise<UpdateUserResponse> {
        try {
            // Fetch the updated user after the update operation
            const updatedUser = await this.userRepository.updateOne(id, updateUserData);
    
            // Check if the user was found and updated
            if (!updatedUser) {
                throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
            }
    
            // Return success response with the updated user data
            return {
                message: SUCCESS_MESSAGES.USER_UPDATED,
                user: plainToClass(User, updatedUser), // Use class-transformer to transform user
            };
        } catch (error) {
            // Handle known exceptions
            if (error instanceof NotFoundException) {
                throw error;
            }
            // Catch all other errors and throw a server error
            throw new InternalServerErrorException(error.message);
        }
    }
    

    async changeUserStatus(userId: number, status: UserStatus, adminId: number): Promise<void> {
        await this.userRepository.updateUserStatus(userId, status, adminId);
    }
    // Remove user
    async remove(id: number): Promise<DeleteUserResponse> {
        try {
            const user = await this.userRepository.findById(id);

            if (!user) {
                throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND.replace('{id}', id.toString()));
            }

            await this.userRepository.delete(id);
            return { message: SUCCESS_MESSAGES.USER_REMOVED };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(error.message);
        }
    }
}
