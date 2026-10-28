import pg from 'pg';
import {Injectable, OnModuleDestroy} from "@nestjs/common";

@Injectable()
export class Database implements OnModuleDestroy {
    pool: pg.Pool;
    constructor(){
this.pool = new pg.Pool({connectionString:process.env.DATABASE_URL});
    }

async health(){
    try {
        await this.pool.query(`SELECT 1`);
        return true;
    } catch (error) {
        console.error(error);
        return false
    }
    }

async onModuleDestroy(){
    await this.pool.end();
    }
}
