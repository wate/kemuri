import snippetBuilder from './builder/snippet/base';
import * as dotenv from 'dotenv';
import './console';
dotenv.config();

const builder = new snippetBuilder();
builder.build();
