#!/usr/bin/env node
import snippetBuilder from './builder/snippet';
import configLoader from './config';
import * as dotenv from 'dotenv';
dotenv.config();


const builderOption = configLoader.getSnippetOption();
snippetBuilder.setOption(builderOption);

snippetBuilder.build();
