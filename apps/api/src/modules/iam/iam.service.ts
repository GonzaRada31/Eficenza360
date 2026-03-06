import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { LoginDto } from './dto/login.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
} from './dto/password-reset.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { UserPayload } from '../../common/interfaces/request-with-user.interface';
import { SystemRole } from '@prisma/client';

@Injectable()
export class IamService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createTenant(dto: CreateTenantDto) {
    // Check if user exists already
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Este correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          commercialName: dto.commercialName,
          // Create default subscription
          subscription: {
            create: {
              status: 'PENDING',
              planType: 'MONTHLY',
            },
          },
        },
      });

      // 2. Create Admin User
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          fullName: 'Admin', // Default name, can update later
          role: 'ADMIN',
          tenantId: tenant.id,
        },
      });

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userWithoutPassword } = user;

      return {
        tenant,
        user: userWithoutPassword,
      };
    });
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async inviteUser(dto: InviteUserDto, currentUser: UserPayload) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Este usuario ya existe');
    }

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName || 'Usuario Invitado',
        role: dto.role as SystemRole,
        tenantId: currentUser.tenantId,
        status: 'INVITED',
      },
    });

    // TODO: Send email invitation logic here

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = newUser;
    return result;
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Return success even if user not found to prevent enumeration
      return {
        message: 'Si el correo existe, recibirás un enlace de recuperación.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiration

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expires,
      },
    });

    // TODO: Integrate actual Email Service
    console.log(
      `[MOCK EMAIL] Password Reset Link: http://localhost:5173/reset-password?token=${token}`,
    );

    return {
      message: 'Si el correo existe, recibirás un enlace de recuperación.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token inválido o expirado.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        status: 'ACTIVE', // Activate user if they were INVITED
      },
    });

    return { message: 'Contraseña actualizada exitosamente.' };
  }
}
