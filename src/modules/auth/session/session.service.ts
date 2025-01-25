import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verify } from 'argon2'
import type { Request } from 'express'

import { PrismaService } from '@/src/core/prisma/prisma.service'

import { LoginInput } from './inputs/login.input'

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService
	) {}
	public async login(req: Request, input: LoginInput) {
		const { login, password } = input

		const user = await this.prismaService.user.findFirst({
			where: {
				OR: [
					{ username: { equals: login } },
					{ email: { equals: login } }
				]
			}
		})

		if (!user) {
			throw new NotFoundException('Invalid Username or email')
		}

		const isValidPassword = await verify(user.password, password)

		if (!isValidPassword) {
			throw new UnauthorizedException('Invalid Password')
		}

		return new Promise((resolver, reject) => {
			req.session.regenerate(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Error creating session'
						)
					)
				}

				req.session.createAt = new Date()
				req.session.userId = user.id

				req.session.save(err => {
					if (err) {
						return reject(
							new InternalServerErrorException(
								'Error saving session'
							)
						)
					}
					resolver(user)
				})
			})
		})
	}

	public async logout(req: Request) {
		return new Promise((resolver, reject) => {
			if (!req.session) {
				return resolver(true)
			}

			req.session.regenerate(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Error regenerating session'
						)
					)
				}

				req.session.destroy(err => {
					if (err) {
						return reject(
							new InternalServerErrorException(
								'Error destroying session'
							)
						)
					}
					req.res?.clearCookie(
						this.configService.getOrThrow<string>('SESSION_NAME')
					)
					resolver(true)
				})
			})
		})
	}
}
