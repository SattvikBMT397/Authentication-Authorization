
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    readonly name: string;

    @IsOptional()
    @IsEmail()
     email: string;

    @IsOptional()
    @IsString()
    readonly description:string;


}