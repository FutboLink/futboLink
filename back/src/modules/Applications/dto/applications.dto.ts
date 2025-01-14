import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Job } from 'src/modules/Jobs/entities/jobs.entity';
import { User } from 'src/modules/user/entities/user.entity';

export class CreateApplicationsDto {
  @ApiProperty({
    description: 'Mensaje del jugador explicando por qué aplica al trabajo',
    example:
      'Estoy interesado en unirme a su equipo porque tengo experiencia como delantero en ligas nacionales.',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Id del jugador que está aplicando',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Id de jobs',
  })
  @IsNotEmpty()
  @IsString()
  jobId: string;

  // @ApiProperty({
  //   description: 'Detalles del trabajo al que el jugador está aplicando',
  //   type: () => Job,
  // })
  // jobs: Job;

  // @ApiProperty({
  //   description: 'Detalles del jugador que está aplicando al trabajo',
  //   type: () => User,
  // })
  // users: User;
}
