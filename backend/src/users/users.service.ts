import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Utilisateur } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Utilisateur)
    private usersRepository: Repository<Utilisateur>,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.mot_de_passe, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      mot_de_passe: hashedPassword,
    });

    try {
      const savedUser = await this.usersRepository.save(user);
      const { mot_de_passe, ...result } = savedUser;
      return result;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Cet email existe déjà');
      }
      throw error;
    }
  }

  async findAll() {
    const users = await this.usersRepository.find();
    return users.map(({ mot_de_passe, ...user }) => user);
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur #${id} introuvable`);
    }
    const { mot_de_passe, ...result } = user;
    return result;
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Utilisateur #${id} introuvable`);
    }
    await this.usersRepository.remove(user);
  }
}
