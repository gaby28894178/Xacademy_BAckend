import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PlayerStats } from './player-stats.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  short_name: string;

  @Column({ length: 200, nullable: true })
  long_name: string;

  @Column({ nullable: true })
  age: number;

  @Column({ length: 100, nullable: true })
  nationality: string;

  @Column({ length: 150, nullable: true })
  club: string;

  @Column({ nullable: true })
  overall: number;

  @Column({ nullable: true })
  potential: number;

  @Column({ length: 50, nullable: true })
  positions: string;

  @Column({ length: 10, default: 'M' }) // M = Male, F = Female
  gender: string;

  @Column({ nullable: true })
  photo_url: string;

  @OneToMany(() => PlayerStats, (stats) => stats.player, { cascade: true })
  stats: PlayerStats[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
