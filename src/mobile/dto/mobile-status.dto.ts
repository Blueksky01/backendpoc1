import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateMobileStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['Active', 'Inactive', 'On Leave'], {
    message: 'status must be either Active, Inactive, or On Leave',
  })
  status!: string;
}
