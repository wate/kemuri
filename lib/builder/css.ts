import { sassBuilder, sassBuilderOption } from './css/sass';

export interface cssBuilderOption extends sassBuilderOption {}
const cssBuilder = new sassBuilder();
export default cssBuilder;
