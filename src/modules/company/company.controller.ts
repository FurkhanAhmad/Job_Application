import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Company Management')
@ApiBearerAuth()
@Controller('company')
@UseGuards(AuthGuard('jwt'))
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // ----------------------------------------------------
  // CREATE COMPANY
  // ----------------------------------------------------

  @Post()
  @ApiOperation({
    summary: 'Create a company',
  })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'Company already exists.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @CurrentUser() currentUser: { id: string },
  ) {
    return this.companyService.createCompany(createCompanyDto, currentUser.id);
  }

  // ----------------------------------------------------
  // GET MY COMPANIES
  // ----------------------------------------------------

  @Get('my-companies')
  @ApiOperation({
    summary: 'Get companies owned by current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Companies retrieved successfully.',
  })
  async getMyCompanies(@CurrentUser() currentUser: { id: string }) {
    return this.companyService.getCompaniesByUserId(currentUser.id);
  }

  // ----------------------------------------------------
  // GET COMPANY BY ID
  // ----------------------------------------------------

  @Get(':id')
  @ApiOperation({
    summary: 'Get company by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB Company ObjectId',
    example: '68933b46d7c7b8d4f2a12345',
  })
  @ApiResponse({
    status: 200,
    description: 'Company retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found.',
  })
  async getCompanyById(
    @Param('id') companyId: string,
    @CurrentUser() currentUser: { id: string },
  ) {
    return this.companyService.getCompanyById(companyId, currentUser.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update company',
    description:
      'Updates only the fields provided for the current user company.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB Company ObjectId',
    example: '68933b46d7c7b8d4f2a12345',
  })
  @ApiBody({
    type: UpdateCompanyDto,
    description: 'Company fields to update.',
  })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found or does not belong to the current user.',
  })
  async updateCompanyById(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser() currentUser: { id: string },
  ) {
    return await this.companyService.updateCompanyById(
      updateCompanyDto,
      id,
      currentUser.id,
    );
  }
}
