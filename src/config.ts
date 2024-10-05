import { program } from 'commander';

program
  .option(
    '--apiKey [key]',
    'OpenAI Key for translation',
    process.env.OPENAI_API_KEY
  )
  .option(
    '--baseUrl [url]',
    'OpenAI base url which can be change for other use'
  )
  .option(
    '--model [model]',
    'OpenAI Model which use for translation',
    'gpt-4o-mini'
  )
  .option(
    '--project [path]',
    'Root path which put docusaurus.config.js',
    process.cwd()
  )
  .parse();

export const options = program.opts<{
  apiKey?: string;
  baseUrl?: string;
  model: string;
  project: string;
}>();
