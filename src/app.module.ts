import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { Player } from './entities/player.entity';
import { PlayerStats } from './entities/player-stats.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER || 'fifa_user',
      password: process.env.DB_PASSWORD || 'fifa_pass',
      database: process.env.DB_NAME || 'fifa_db',
      entities: [Player, PlayerStats, User],
      synchronize: true, // Only for development; use migrations in production
      logging: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    PlayersModule,
  ],
})
export class AppModule {}
