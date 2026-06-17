import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration, { validationSchema } from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { UsersModule } from './users/users.module';
import { AppConfig } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => ({
        type: 'postgres',
        url: configService.get('databaseUrl', { infer: true }),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    UsersModule,
    AuthModule,
    MessagesModule,
  ],
})
export class AppModule {}
