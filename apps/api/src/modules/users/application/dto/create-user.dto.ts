export class CreateUserDto {
  email!: string;
  passwordHash!: string;
  fullName?: string;
  avatarUrl?: string;
}
