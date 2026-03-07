import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user)
      throw new ForbiddenException('Acesso denegado - Identidad no validada');

    // Contextual Multi-Tenant Authorization extracting custom JWT roles/permissions or from DB strategy
    const userPermissions: string[] = user.permissions || [];

    const hasPermission = () =>
      requiredPermissions.every((perm) => userPermissions.includes(perm));

    if (!hasPermission()) {
      throw new ForbiddenException(
        'Permisos insuficientes en el Tenant actual.',
      );
    }

    return true;
  }
}
