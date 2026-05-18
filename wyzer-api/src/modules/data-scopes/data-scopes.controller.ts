import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export interface DataScope {
  id: string;
  label: string;
  description: string;
  triggeredFrameworkSlugs: string[];
}

// Data scopes are static definitions — they map data types to the compliance
// frameworks that become relevant when that type of data is handled.
const DATA_SCOPES: DataScope[] = [
  {
    id: 'pii',
    label: 'Personal Data (PII)',
    description: 'Names, emails, addresses, IP addresses, or any data that can identify an individual.',
    triggeredFrameworkSlugs: ['gdpr', 'ndpr', 'soc2'],
  },
  {
    id: 'phi',
    label: 'Health Data (PHI)',
    description: 'Medical records, diagnoses, treatment data, or any Protected Health Information.',
    triggeredFrameworkSlugs: ['hipaa', 'soc2'],
  },
  {
    id: 'financial',
    label: 'Financial & Payment Data',
    description: 'Credit card numbers, bank account details, or payment card industry data.',
    triggeredFrameworkSlugs: ['pci-dss', 'soc2'],
  },
  {
    id: 'general',
    label: 'General Business Data',
    description: 'Operational data, business metrics, or internal records without regulated sensitivity.',
    triggeredFrameworkSlugs: ['soc2', 'iso27001'],
  },
];

@ApiTags('Data Scopes')
@UseGuards(JwtAuthGuard)
@Controller('data-scopes')
export class DataScopesController {
  @Get()
  @ApiOperation({ summary: 'List all data scope options with the compliance frameworks they activate' })
  findAll(): DataScope[] {
    return DATA_SCOPES;
  }
}
