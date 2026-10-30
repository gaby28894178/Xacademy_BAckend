import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlayerDto {
  @ApiProperty({ example: 'Messi' })
  @IsString()
  @MaxLength(100)
  short_name: string;

  @ApiPropertyOptional({ example: 'Lionel Andrés Messi' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  long_name?: string;

  @ApiPropertyOptional({ example: 35 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(50)
  age?: number;

  @ApiPropertyOptional({ example: 'Argentina' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @ApiPropertyOptional({ example: 'Inter Miami' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  club?: string;

  @ApiPropertyOptional({ example: 91 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  overall?: number;

  @ApiPropertyOptional({ example: 91 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  potential?: number;

  @ApiPropertyOptional({ example: 'ST, CF' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  positions?: string;

  @ApiPropertyOptional({ example: 'M', enum: ['M', 'F'] })
  @IsOptional()
  @IsIn(['M', 'F'])
  gender?: string;

  // Skills
  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  pace?: number;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  shooting?: number;

  @ApiPropertyOptional({ example: 91 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  passing?: number;

  @ApiPropertyOptional({ example: 95 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  dribbling?: number;

  @ApiPropertyOptional({ example: 35 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  defending?: number;

  @ApiPropertyOptional({ example: 65 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  physic?: number;
}

export class UpdatePlayerDto {
  @ApiPropertyOptional({ example: 'Messi' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  short_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  long_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(50)
  age?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  club?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  overall?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  potential?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  positions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  pace?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  shooting?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  passing?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  dribbling?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  defending?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  physic?: number;
}

export class PlayerQueryDto {
  @ApiPropertyOptional({ example: 'Messi' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Barcelona' })
  @IsOptional()
  @IsString()
  club?: string;

  @ApiPropertyOptional({ example: 'ST' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ example: 'Argentina' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
