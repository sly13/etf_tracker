import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { ApplicationsModule } from './applications/applications.module';
import { UsersModule } from './users/users.module';
import { ImageGeneratorModule } from './services/image-generator/image-generator.module';

@Module({
  imports: [AdminModule, ApplicationsModule, UsersModule, ImageGeneratorModule],
  exports: [AdminModule, ApplicationsModule, UsersModule, ImageGeneratorModule],
})
export class AdminPanelModule {}
