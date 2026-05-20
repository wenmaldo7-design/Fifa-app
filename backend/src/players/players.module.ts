import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { Player } from './player.model';

@Module({
  imports: [SequelizeModule.forFeature([Player])],

  controllers: [PlayersController],

  providers: [PlayersService],
})
export class PlayersModule {}