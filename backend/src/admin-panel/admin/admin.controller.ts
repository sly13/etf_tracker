import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../api/auth/jwt-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    return this.adminService.login(loginDto.username, loginDto.password);
  }

  @Get('admins')
  @UseGuards(JwtAuthGuard)
  async getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Get('admins/:id')
  @UseGuards(JwtAuthGuard)
  async getAdminById(@Param('id') id: string) {
    return this.adminService.getAdminById(id);
  }

  @Post('admins')
  @UseGuards(JwtAuthGuard)
  async createAdmin(
    @Body()
    createAdminDto: {
      username: string;
      password: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    },
  ) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Put('admins/:id')
  @UseGuards(JwtAuthGuard)
  async updateAdmin(
    @Param('id') id: string,
    @Body()
    updateAdminDto: {
      email?: string;
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
    },
  ) {
    return this.adminService.updateAdmin(id, updateAdminDto);
  }

  @Delete('admins/:id')
  @UseGuards(JwtAuthGuard)
  async deleteAdmin(@Param('id') id: string) {
    return this.adminService.deleteAdmin(id);
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard)
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
