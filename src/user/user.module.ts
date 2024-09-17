import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user-repository';
import { RoleEntity } from './entities/role.entity';
// import { Permission } from './entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, RoleEntity])],
  providers: [UserRepository, UserService,],
  controllers: [UserController],
  exports: [UserRepository, TypeOrmModule]
})
export class UserModule { }
