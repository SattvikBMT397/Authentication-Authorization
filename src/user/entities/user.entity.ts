import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { RoleEntity } from './role.entity';
import { UserStatus } from '../../enum/permission-enum';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', nullable: false })
    name: string;

    @Column({ unique: true, type: 'varchar'})
    email: string;

    @Exclude()
    @Column({ type: 'varchar' })
    password: string;
    
    @Column({type:'varchar'})
    description:string;
    
    @ManyToOne(() => RoleEntity, (role) => role.user)
    role: RoleEntity;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    status: UserStatus;

    @Exclude()
    @DeleteDateColumn()
    deletedAt?: Date;
}
