import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import * as XLSX from 'xlsx';
import { Player } from '../entities/player.entity';
import { PlayerStats } from '../entities/player-stats.entity';
import {
  CreatePlayerDto,
  UpdatePlayerDto,
  PlayerQueryDto,
} from './dto/player.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(PlayerStats)
    private statsRepository: Repository<PlayerStats>,
  ) {}

  async findAll(query: PlayerQueryDto) {
    const { name, club, position, nationality, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const qb = this.playerRepository
      .createQueryBuilder('player')
      .leftJoinAndSelect(
        'player.stats',
        'stats',
        'stats.fifa_version = (SELECT MAX(s2.fifa_version) FROM player_stats s2 WHERE s2.player_id = player.id)',
      )
      .skip(skip)
      .take(limit);

    if (name) {
      qb.andWhere(
        '(player.short_name LIKE :name OR player.long_name LIKE :name)',
        { name: `%${name}%` },
      );
    }
    if (club) {
      qb.andWhere('player.club LIKE :club', { club: `%${club}%` });
    }
    if (position) {
      qb.andWhere('player.positions LIKE :position', {
        position: `%${position}%`,
      });
    }
    if (nationality) {
      qb.andWhere('player.nationality LIKE :nationality', {
        nationality: `%${nationality}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const player = await this.playerRepository.findOne({
      where: { id },
      relations: ['stats'],
    });
    if (!player) {
      throw new NotFoundException(`Player #${id} not found`);
    }
    // Sort stats by fifa_version
    player.stats = player.stats.sort((a, b) => a.fifa_version - b.fifa_version);
    return player;
  }

  async getTimeline(id: number) {
    const player = await this.playerRepository.findOne({ where: { id } });
    if (!player) {
      throw new NotFoundException(`Player #${id} not found`);
    }
    const stats = await this.statsRepository.find({
      where: { player_id: id },
      order: { fifa_version: 'ASC' },
    });
    return { player, stats };
  }

  async create(dto: CreatePlayerDto) {
    const player = this.playerRepository.create({
      short_name: dto.short_name,
      long_name: dto.long_name,
      age: dto.age,
      nationality: dto.nationality,
      club: dto.club,
      overall: dto.overall,
      potential: dto.potential,
      positions: dto.positions,
      gender: dto.gender || 'M',
    });
    const saved = await this.playerRepository.save(player);

    // Create stats entry for current year (2023)
    if (
      dto.pace !== undefined ||
      dto.shooting !== undefined ||
      dto.passing !== undefined ||
      dto.dribbling !== undefined ||
      dto.defending !== undefined ||
      dto.physic !== undefined
    ) {
      const stats = this.statsRepository.create({
        player_id: saved.id,
        fifa_version: 2023,
        pace: dto.pace,
        shooting: dto.shooting,
        passing: dto.passing,
        dribbling: dto.dribbling,
        defending: dto.defending,
        physic: dto.physic,
      });
      await this.statsRepository.save(stats);
    }

    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdatePlayerDto) {
    const player = await this.findOne(id);

    // Update player fields
    const playerFields: Partial<Player> = {};
    if (dto.short_name !== undefined) playerFields.short_name = dto.short_name;
    if (dto.long_name !== undefined) playerFields.long_name = dto.long_name;
    if (dto.age !== undefined) playerFields.age = dto.age;
    if (dto.nationality !== undefined) playerFields.nationality = dto.nationality;
    if (dto.club !== undefined) playerFields.club = dto.club;
    if (dto.overall !== undefined) playerFields.overall = dto.overall;
    if (dto.potential !== undefined) playerFields.potential = dto.potential;
    if (dto.positions !== undefined) playerFields.positions = dto.positions;

    if (Object.keys(playerFields).length > 0) {
      await this.playerRepository.update(id, playerFields);
    }

    // Update or create stats for latest version
    const statsFields: Partial<PlayerStats> = {};
    if (dto.pace !== undefined) statsFields.pace = dto.pace;
    if (dto.shooting !== undefined) statsFields.shooting = dto.shooting;
    if (dto.passing !== undefined) statsFields.passing = dto.passing;
    if (dto.dribbling !== undefined) statsFields.dribbling = dto.dribbling;
    if (dto.defending !== undefined) statsFields.defending = dto.defending;
    if (dto.physic !== undefined) statsFields.physic = dto.physic;

    if (Object.keys(statsFields).length > 0) {
      // Find the most recent stats
      const latestStats = await this.statsRepository.findOne({
        where: { player_id: id },
        order: { fifa_version: 'DESC' },
      });
      if (latestStats) {
        await this.statsRepository.update(latestStats.id, statsFields);
      } else {
        await this.statsRepository.save({
          player_id: id,
          fifa_version: 2023,
          ...statsFields,
        });
      }
    }

    return this.findOne(id);
  }

  async exportCsv(query: PlayerQueryDto): Promise<Buffer> {
    // Get all matching players (no pagination for export)
    const fullQuery = { ...query, page: 1, limit: 10000 };
    const { data } = await this.findAll(fullQuery);

    const rows = data.map((p) => {
      const latestStats = p.stats?.[p.stats.length - 1] || {};
      return {
        ID: p.id,
        Name: p.short_name,
        'Full Name': p.long_name,
        Age: p.age,
        Nationality: p.nationality,
        Club: p.club,
        Overall: p.overall,
        Potential: p.potential,
        Positions: p.positions,
        Gender: p.gender === 'M' ? 'Male' : 'Female',
        Pace: (latestStats as any).pace,
        Shooting: (latestStats as any).shooting,
        Passing: (latestStats as any).passing,
        Dribbling: (latestStats as any).dribbling,
        Defending: (latestStats as any).defending,
        Physic: (latestStats as any).physic,
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Players');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async importCsv(buffer: Buffer): Promise<{ imported: number; errors: string[] }> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws);
    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        const name = row['short_name'] || row['Name'] || row['name'];
        if (!name) {
          errors.push(`Row ${i + 2}: Missing player name`);
          continue;
        }
        const player = this.playerRepository.create({
          short_name: String(name),
          long_name: row['long_name'] || row['Full Name'] || null,
          age: row['age'] ? Number(row['age']) : null,
          nationality: row['nationality'] || row['Nationality'] || null,
          club: row['club'] || row['Club'] || null,
          overall: row['overall'] ? Number(row['overall']) : null,
          potential: row['potential'] ? Number(row['potential']) : null,
          positions: row['positions'] || row['Positions'] || null,
          gender: row['gender'] === 'F' || row['Gender'] === 'Female' ? 'F' : 'M',
        });
        const saved = await this.playerRepository.save(player);

        // Import stats if present
        const fifaVersion = row['fifa_version'] ? Number(row['fifa_version']) : 2023;
        const hasStats =
          row['pace'] || row['shooting'] || row['passing'] ||
          row['dribbling'] || row['defending'] || row['physic'];
        if (hasStats) {
          await this.statsRepository.save({
            player_id: saved.id,
            fifa_version: fifaVersion,
            pace: row['pace'] ? Number(row['pace']) : null,
            shooting: row['shooting'] ? Number(row['shooting']) : null,
            passing: row['passing'] ? Number(row['passing']) : null,
            dribbling: row['dribbling'] ? Number(row['dribbling']) : null,
            defending: row['defending'] ? Number(row['defending']) : null,
            physic: row['physic'] ? Number(row['physic']) : null,
          });
        }
        imported++;
      } catch (err) {
        errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }
    return { imported, errors };
  }
}
