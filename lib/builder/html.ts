import { nunjucksBuilder, nunjucksBuilderOption } from './html/nunjucks';

export interface htmlBuilderOption extends nunjucksBuilderOption {}
const htmlBuilder = new nunjucksBuilder();
export default htmlBuilder;
