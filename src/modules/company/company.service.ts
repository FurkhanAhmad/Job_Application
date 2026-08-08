import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Company, CompanyDocument } from 'src/models/company.model';

import { User, UserDocument } from 'src/models/user.model';

import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name)
    private readonly companyModel: Model<CompanyDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // ----------------------------------------------------
  // CREATE COMPANY
  // ----------------------------------------------------

  async createCompany(
    createCompanyDto: CreateCompanyDto,
    userId: string,
  ): Promise<CompanyDocument> {
    // Validate userId
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID.');
    }

    // Normalize company name
    const name = createCompanyDto.name.trim();

    if (!name) {
      throw new ConflictException('Company name is required.');
    }

    // Check whether user exists
    const userExists = await this.userModel.exists({
      _id: userId,
    });

    if (!userExists) {
      throw new NotFoundException('User not found.');
    }

    // Check duplicate company
    const existingCompany = await this.companyModel.exists({
      name,
      userId,
    });

    if (existingCompany) {
      throw new ConflictException('You already have a company with this name.');
    }

    try {
      const company = await this.companyModel.create({
        ...createCompanyDto,
        name,
        userId,
      });

      return company;
    } catch (error: unknown) {
      // MongoDB duplicate key
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException('Company with this name already exists.');
      }

      throw new InternalServerErrorException('Failed to create company.');
    }
  }

  // ----------------------------------------------------
  // GET COMPANIES BY CURRENT USER
  // ----------------------------------------------------

  async getCompaniesByUserId(userId: string): Promise<Company[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID.');
    }

    const companies = await this.companyModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // find() returns [] when nothing is found.
    // If you want an empty array response, don't throw here.
    return companies;
  }

  // ----------------------------------------------------
  // GET COMPANY BY ID
  // ----------------------------------------------------

  async getCompanyById(companyId: string, userId: string): Promise<Company> {
    if (!Types.ObjectId.isValid(companyId)) {
      throw new NotFoundException('Invalid company ID.');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID.');
    }

    /*
     * IMPORTANT:
     *
     * We search by both companyId AND userId.
     *
     * This prevents:
     *
     * User A -> accessing User B's company.
     */
    const company = await this.companyModel
      .findOne({
        _id: companyId,
        userId,
      })
      .lean()
      .exec();

    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    return company;
  }

  //Update of the company..
  async updateCompanyById(
    updateCompanyDto: UpdateCompanyDto,
    companyId: string,
    userId: string,
  ): Promise<CompanyDocument> {
    if (!Types.ObjectId.isValid(companyId)) {
      throw new NotFoundException('Invalid company ID.');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID.');
    }

    const company = await this.companyModel
      .findOneAndUpdate(
        { _id: companyId, userId },
        { $set: updateCompanyDto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!company) {
      throw new NotFoundException(
        'Company not found or does not belong to the current user.',
      );
    }

    return company;
  }
}
