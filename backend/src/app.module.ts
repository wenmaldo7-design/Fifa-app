import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { SequelizeModule } from '@nestjs/sequelize';
import { Player } from './players/player.model';
import { PlayersModule } from './players/players.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { User } from './users/user.model';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    SequelizeModule.forRoot({
      dialect: 'mysql',
      models: [Player, User],
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3307,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'fifa_db',
      autoLoadModels: true,
      synchronize: true, // solo desarrollo — desactivar en producción
    }),
    PlayersModule,
    AuthModule,
    UsersModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    const exists = await this.usersService.findByEmail('admin@fifa.com');
    if (!exists) {
      await this.usersService.create({ email: 'admin@fifa.com', password: 'admin123' });
      console.log('Usuario por defecto creado → admin@fifa.com / admin123');
    }
  }
}