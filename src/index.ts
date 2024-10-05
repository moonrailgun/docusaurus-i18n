import { options } from './config';
import { loadSiteConfig } from './utils';
import path from 'path';
import fg from 'fast-glob';
import matter from 'gray-matter';
import fs from 'fs-extra';
import md5 from 'md5';
import { translate } from './translate';

async function main() {
  const siteDir = options.project;
  const config = await loadSiteConfig(siteDir);
  if (!config.i18n) {
    throw new Error(
      'Run `docusaurus-i18n` need docusaurus.config.js has i18n config'
    );
  }

  const { defaultLocale, locales } = config.i18n;
  const targetLocales = locales.filter((l) => l !== defaultLocale);

  for (const locale of targetLocales) {
    console.group(`Translating ${locale}:`);

    // translate docs
    const sourceDir = path.resolve(siteDir, './docs');
    const targetDir = path.resolve(
      siteDir,
      './i18n',
      locale,
      './docusaurus-plugin-content-docs/current'
    );

    const documents = await fg(path.resolve(sourceDir, './**/*.md'));

    for (const sourcePath of documents) {
      const targetFile = path.relative(sourceDir, sourcePath);
      const targetPath = path.resolve(targetDir, targetFile);

      const { data, content } = matter.read(sourcePath);
      const filehash = md5(content);

      if (await fs.exists(targetPath)) {
        // translated file existed and not changed, skip
        const { data: targetData } = matter.read(sourcePath);

        if (!targetData._i18n_hash) {
          console.log('This file is created manual, skip:', targetFile);
          continue;
        }

        if (targetData._i18n_hash === filehash) {
          console.log('This source file not changed, skip:', targetFile);
          continue;
        }
      }

      console.log('Translating....', targetFile);

      const { usage, content: translatedContent } = await translate(
        content,
        locale
      );

      await fs.mkdirp(path.dirname(targetPath));
      await fs.writeFile(
        targetPath,
        matter.stringify(
          {
            content: translatedContent,
          },
          {
            ...data,
            _i18n_hash: filehash,
          }
        ),
        'utf8'
      );
      console.log(
        'Writed translated file into',
        targetPath,
        ', token usage:',
        usage
      );
    }

    console.groupEnd();
  }
}

main();
