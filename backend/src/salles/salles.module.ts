import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salle } from './salle.entity';
import { SallesService } from './salles.service';
import { SallesController } from './salles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Salle])],
  controllers: [SallesController],
  providers: [SallesService],
  exports: [SallesService],
})
export class SallesModule {}
