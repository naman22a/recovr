import 'dotenv/config';
import * as path from 'path';
import { Options } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { __prod__ } from '../common/constants';

const config: Options = {
    type: 'postgresql',
    clientUrl: process.env.DATABASE_URL,

    entities: ['dist/**/*.model.js'],
    entitiesTs: ['./src/**/*.model.ts'],
    metadataProvider: TsMorphMetadataProvider,

    // migrations
    migrations: {
        path: path.join(__dirname, '../migrations'),
        pathTs: './src/migrations',
        glob: '!(*.d).js',
        snapshot: false,
    },

    // logging
    debug: !__prod__,
    highlighter: new SqlHighlighter(),
};

export default config;
