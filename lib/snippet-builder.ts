#!/usr/bin/env node
import snippetBuilder from './builder/snippet';
import * as dotenv from 'dotenv';
import './console';
dotenv.config();

snippetBuilder.build();
