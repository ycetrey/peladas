import { IsEmail, IsString } from "class-validator";

export class AddGroupMemberDto {
  @IsString()
  @IsEmail()
  email!: string;
}
