import * as cors from 'cors';
import { Model } from 'mongoose';

export interface AppConfig {
    ENVIRONMENT: string;
    CLIENT_URL: string;
    JWT_SECRET: string;
    SOCIAL_CREDENTAILS: {};
    CORS_OPTIONS: cors.CorsOptions;
    DEBUG_MODE: boolean;
    CRM_API: string;
    CRM_TOKEN: string;
    PG_DB_URI: string;
}
