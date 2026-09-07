import {
  Matches,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class VerifyEmailDto {
  @IsUUID()
  userId: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code: string;
}
