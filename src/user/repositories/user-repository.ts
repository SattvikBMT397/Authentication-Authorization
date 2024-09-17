import { Repository } from 'typeorm';
import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';
import { Role } from '../../enum/role-enum';
import { UserStatus } from '../../enum/permission-enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {

    constructor(
        @InjectRepository(User) private readonly repository: Repository<User>,
        @InjectRepository(RoleEntity) private readonly roleRepository: Repository<RoleEntity>,
    ) {}

    async createUser(userData: CreateUserDto): Promise<User> {
        try {
            const { password, ...rest } = userData;
            const hashedPassword = await bcrypt.hash(password, 10);
            const role = await this.getRole(Role.USER);

            const user = this.repository.create({ ...rest, password: hashedPassword, role });
            await this.repository.save(user);
            return user;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async createAdmin(adminData: CreateUserDto): Promise<User> {
        try {
            const { password, ...rest } = adminData;
            const hashedPassword = await bcrypt.hash(password, 10);
            const role = await this.getRole(Role.ADMIN);

            const admin = this.repository.create({ ...rest, password: hashedPassword, role });
            await this.repository.save(admin);
            return admin;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async findAll(): Promise<User[]> {
        try {
            const allUsers = await this.repository.find({
                relations: ['role']
            });

            return allUsers.filter(user => user.role?.name !== 'admin');
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async getRole(roleName: Role): Promise<RoleEntity> {
        try {
            const role = await this.roleRepository.findOne({ where: { name: roleName } });
            if (!role) throw new NotFoundException('Role not found');
            return role;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async findById(id: number): Promise<User> {
        try {
            const user = await this.repository.findOne({ where: { id }, relations: ['role'] });
            if (!user) throw new NotFoundException('User not found');
            return user;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async findOneByEmail(email: string): Promise<User> {
        try {
            const user = await this.repository.findOne({ where: { email }, relations: ['role'] });
            if (!user) throw new NotFoundException('User not found');
            return user;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async updateOne(id: number, updateUserData: UpdateUserDto): Promise<User | null> {
        try {
            await this.repository.update(id, updateUserData);
            const updatedUser = await this.repository.findOne({ where: { id } });
            if (!updatedUser) throw new NotFoundException('User not found');
            return updatedUser;
        } catch (error) {
            if (error.code === '23505') {  // PostgreSQL unique violation code
                throw new ConflictException('Email already exists');
            }
            throw new InternalServerErrorException(error.message);
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await this.repository.softDelete(id);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async updateUserStatus(userId: number, status: UserStatus, adminId: number): Promise<void> {
        try {
            if (!(await this.isAdmin(adminId))) {
                throw new NotFoundException('Only admins can change user status');
            }
            await this.repository.update(userId, { status });
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async isAdmin(userId: number): Promise<boolean> {
        try {
            const user = await this.findById(userId);
            return user?.role?.name === Role.ADMIN;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
}
