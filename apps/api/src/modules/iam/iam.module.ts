import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { IamController } from './iam.controller';
import { IamService } from './iam.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET') || 'super-secret-dev-key',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [IamController],
  providers: [IamService, JwtStrategy],
})
export class IamModule {}
