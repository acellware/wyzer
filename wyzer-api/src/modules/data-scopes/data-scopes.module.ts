import { Module } from '@nestjs/common';
import { DataScopesController } from './data-scopes.controller';

@Module({
  controllers: [DataScopesController],
})
export class DataScopesModule {}
