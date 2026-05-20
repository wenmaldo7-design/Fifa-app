import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,

    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user =
      await this.usersService.findByEmail(
        loginDto.email,
      );

    if (!user) {
      throw new UnauthorizedException(
        'Usuario inválido',
      );
    }

    const passwordMatch =
      await bcrypt.compare(
        loginDto.password,
        user.password,
      );

    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Password inválida',
      );
    }

    const payload = {
      sub: user.id,

      email: user.email,
    };

    return {
      access_token:
        await this.jwtService.signAsync(
          payload,
        ),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }
    await this.usersService.create(createUserDto);
    return { message: 'Usuario creado exitosamente' };
  }
}