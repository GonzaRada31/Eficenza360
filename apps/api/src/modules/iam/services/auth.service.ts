import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: { role: { include: { permissions: { include: { permission: true } } } } }
        }
      }
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, pass);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Resolve Roles & Permissions for RBAC token payload
    const roles = user.userRoles.map(ur => ur.role.name);
    const permissionsInfo = user.userRoles.flatMap(ur => ur.role.permissions.map(rp => rp.permission.name));
    const permissions = [...new Set(permissionsInfo)];

    const payload = {
      userId: user.id,
      tenantId: user.tenantId,
      roles,
      permissions
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      refreshToken: await this.jwtService.signAsync({ userId: user.id }, { expiresIn: '7d' })
    };
  }
}
