import { DefaultConfig } from './default';
import { ProductionConfig } from './prod';

export const Config = Object.assign({}, DefaultConfig ,process.env.NODE_ENV !== 'production'?null:ProductionConfig);
