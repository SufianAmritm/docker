import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Database } from './database/database';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly database:Database) {}

  @Get()
  health(): {status: string} {
    return this.appService.health();
  }

  @Get('ready')
  async ready(): Promise<{status: string}> {
   const health = await this.database.health();
    return {status: health ? 'ready':'not-ready' }
  }
}
