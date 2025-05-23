import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserPlan } from '../../modules/user/entities/user.entity';

export class UpdateUserPlanDto {
  @ApiProperty({
    description: 'Email del usuario a actualizar',
    example: 'usuario@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Nuevo plan de suscripción del usuario',
    enum: UserPlan,
    example: UserPlan.SEMIPROFESIONAL,
  })
  @IsNotEmpty()
  @IsEnum(UserPlan)
  newPlan: UserPlan;
} 