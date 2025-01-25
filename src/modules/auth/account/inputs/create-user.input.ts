import { Field, InputType } from '@nestjs/graphql'
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	Matches,
	MinLength
} from 'class-validator'

@InputType()
export class CreateUserInput {
	@Field()
	@IsNotEmpty()
	@IsString()
	@Matches(/^[a-zA-Z0-9]+$/, { message: 'Username must be alphanumeric' })
	public username: string

	@Field()
	@IsEmail()
	@IsString()
	@IsNotEmpty()
	public email: string

	@Field()
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	public password: string
}
