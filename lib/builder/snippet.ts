import vscodeSnippet from './snippet/vscode';
import emmetSnippet from './snippet/emmet';
import glob from 'glob';

class snippetBuilder
{
    constructor() {
        this.snippet = vscodeSnippet;
    }

    public build(snippet: string): string {
        return this.snippet(snippet);
    }
}
