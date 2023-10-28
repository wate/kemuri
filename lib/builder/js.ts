import { typescriptBuilder, typescriptBuilderOption } from './js/typescript';

export interface jsBuilderOption extends typescriptBuilderOption {}
const jsBuilder = new typescriptBuilder();
export default jsBuilder;
