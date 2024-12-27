import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/create-user.dto';
import * as bcrypt from "bcrypt" 

@Injectable()
export class UserService {  constructor(
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
) {}

async register(registerUserDto: RegisterUserDto): Promise<User> {
  const { email, password, ...otherDetails } = registerUserDto;

  const existingUser = await this.userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw new ConflictException('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = this.userRepository.create({
    email,
    password: hashedPassword,
    ...otherDetails,
  });

  return this.userRepository.save(newUser);
}

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }


  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
