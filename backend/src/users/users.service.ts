import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/sequelize';

import * as bcrypt from 'bcrypt';

import { User } from './user.model';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword =
      await bcrypt.hash(
        createUserDto.password,
        10,
      );

    return this.userModel.create({
      email: createUserDto.email,

      password: hashedPassword,
    });
  }

  findByEmail(email: string) {
    return this.userModel.findOne({
      where: { email },
    });
  }
}