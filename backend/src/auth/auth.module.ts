import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,

    PassportModule,

    JwtModule.register({
      secret: (() => {
        if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET no está definido en las variables de entorno');
        return process.env.JWT_SECRET;
      })(),
      signOptions: { expiresIn: '1d' },
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy],

  exports: [AuthService],
})
export class AuthModule {}