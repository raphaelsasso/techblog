import { IsUrl, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateUrlDto {
  @IsNotEmpty()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url: string;

  @IsInt()
  @Min(1)
  id: number;
}
