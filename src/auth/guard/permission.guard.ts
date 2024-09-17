
// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { User } from 'src/user/entities/user.entity';
// import { Permission_ROLES_KEY } from '../decorator/public.decorator';

// @Injectable()
// export class PermissionsGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredPermissions = this.reflector.getAllAndOverride<string[]>(Permission_ROLES_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     if (!requiredPermissions) {
//       return true;
//     }

//     const { user }: { user: User } = context.switchToHttp().getRequest();
//     const userPermissions = user.role.permissions.map((perm) => perm.name);

//     if (!requiredPermissions.some((permission) => userPermissions.includes(permission))) {
//       throw new ForbiddenException('You do not have permission to perform this action');
//     }

//     return true;
//   }
// }
