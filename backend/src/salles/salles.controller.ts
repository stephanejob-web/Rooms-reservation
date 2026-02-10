import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SallesService } from './salles.service';
import { CreateSalleDto } from './dto/create-salle.dto';

@UseGuards(JwtAuthGuard)
@Controller('salles')
export class SallesController {
  constructor(private readonly sallesService: SallesService) {}

  @Post()
  create(@Body() createSalleDto: CreateSalleDto) {
    return this.sallesService.create(createSalleDto);
  }

  @Get()
  findAll() {
    return this.sallesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sallesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sallesService.remove(id);
  }
}
