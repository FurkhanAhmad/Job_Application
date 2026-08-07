// import { IsString } from "class-validator";



// export class CreateProfileDto {
//     @IsString()
//     bio?: string;
    
//     @IsString()
//     skills?: string[];

//     @IsString()
//     resume?: string;

//     @IsString()
//     resumeOriginalName?: string;

//     @IsString()
//     profilePhoto?: string;

//     @IsString()
//     company?: string;

//     @IsString()
//     user?: string;
// }


import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateProfileDto {
  @ApiPropertyOptional({
    example: "Full Stack Developer with 2 years of experience.",
    description: "User bio",
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: ["Node.js", "NestJS", "MongoDB", "React"],
    description: "List of user skills",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({
    example: "https://example.com/resume.pdf",
    description: "Resume URL",
  })
  @IsOptional()
  @IsString()
  resume?: string;

  @ApiPropertyOptional({
    example: "Furkan_Resume.pdf",
    description: "Original resume file name",
  })
  @IsOptional()
  @IsString()
  resumeOriginalName?: string;

  @ApiPropertyOptional({
    example: "https://example.com/profile.jpg",
    description: "Profile photo URL",
  })
  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @ApiPropertyOptional({
    example: '665c2f5a8f4e8b0012345678',
    description: 'Optional MongoDB ID of the linked company',
  })
  @IsOptional()
  @IsMongoId()
  company?: string;
}
