import { ApiProperty } from '@nestjs/swagger';

export class SkillEntryDto {
  @ApiProperty() fifa_version: number;
  @ApiProperty() pace: number;
  @ApiProperty() shooting: number;
  @ApiProperty() passing: number;
  @ApiProperty() dribbling: number;
  @ApiProperty() defending: number;
  @ApiProperty() physic: number;
  @ApiProperty() overall: number;
}

export class AnalyzeTimelineDto {
  @ApiProperty({ type: [SkillEntryDto] })
  history: SkillEntryDto[];
}
