import { IsString, IsEmail, IsNotEmpty, IsPhoneNumber, MinLength, IsOptional } from 'class-validator';
import { Role } from '../../enum/role-enum';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @MinLength(8)
    readonly password: string;
    
    @IsString()
    readonly description:string

    @IsOptional()
    readonly role: string;
}
