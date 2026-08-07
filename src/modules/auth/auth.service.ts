import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from 'src/models/user.model';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: Record<string, unknown>;
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResult> {
    const email = registerDto.email.trim().toLowerCase();
    const existingUser = await this.userModel.findOne({ email }).exec();

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = new this.userModel({
      fullname: registerDto.fullName.trim(),
      email,
      phoneNumber: registerDto.phoneNumber,
      password: registerDto.password,
      role: registerDto.role,
    });

    await user.save();
    this.logger.log(`User registered successfully: ${user.email}`);

    return this.createAuthResult(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const email = loginDto.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email }).select('+password').exec();

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createAuthResult(user);
  }

  async logout(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1 },
    });
  }

  private async createAuthResult(user: UserDocument): Promise<AuthResult> {
    return {
      user: this.sanitizeUser(user),
      tokens: await this.generateTokens(user),
    };
  }

  private async generateTokens(user: UserDocument): Promise<AuthTokens> {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: 7 * 24 * 60 * 60,
    });

    await this.userModel.findByIdAndUpdate(user._id, {
      refreshToken: await bcrypt.hash(refreshToken, 12),
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: UserDocument): Record<string, unknown> {
    const safeUser = user.toObject() as Record<string, unknown>;
    delete safeUser.password;
    delete safeUser.refreshToken;
    return safeUser;
  }
}
