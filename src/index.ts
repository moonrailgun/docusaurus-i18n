import { options, whitelist } from './config';
import { loadSiteConfig } from './utils';
import path from 'path';
import fg from 'fast-glob';
import matter from 'gray-matter';
import fs from 'fs-extra';
import md5 from 'md5';
import { translate } from './translate';
import os from 'os';

const siteDir = options.project;

async function main() {
  const config = await loadSiteConfig(siteDir);
  if (!config.i18n) {
    throw new Error(
      'Run `docusaurus-i18n` need docusaurus.config.js has i18n config'
    );
  }

  const { defaultLocale, locales } = config.i18n;
  const targetLocales = locales.filter((l) => l !== defaultLocale);

  if (targetLocales.length === 0) {
    throw new Error(
      'Please make sure you have more than one locale exclude default locale'
    );
  }

  for (const locale of targetLocales) {
    console.group(`Translating ${locale}:`);

    await translateDocs(locale);
    await translateJSON(
      locale,
      path.resolve(
        siteDir,
        './i18n',
        locale,
        './docusaurus-plugin-content-docs/current.json'
      ),
      ['sidebar.tutorialSidebar.category.']
    );
    await translateJSON(
      locale,
      path.resolve(
        siteDir,
        './i18n',
        locale,
        './docusaurus-theme-classic/footer.json'
      ),
      ['link.title.', 'link.item.label.']
    );
    await translateJSON(
      locale,
      path.resolve(
        siteDir,
        './i18n',
        locale,
        './docusaurus-theme-classic/navbar.json'
      ),
      ['item.label.']
    );

    console.groupEnd();
  }
}

main();

/**
 * translate docs
 * @param locale
 */
async function translateDocs(locale: string) {
  const sourceDir = path.resolve(siteDir, './docs');
  const targetDir = path.resolve(
    siteDir,
    './i18n',
    locale,
    './docusaurus-plugin-content-docs/current'
  );

  const documents = await fg(
    os.platform() === 'win32'
      ? fg.convertPathToPattern(path.resolve(sourceDir, './**/*.md')) // use `convertPathToPattern` to add window support
      : path.resolve(sourceDir, './**/*.md')
  );

  if (documents.length === 0) {
    console.warn(
      `No any docs found which end with .md under ${sourceDir}, please checkout your path.`
    );
    return;
  }

  for (const sourcePath of documents) {
    const targetFile = path.relative(sourceDir, sourcePath);
    const targetPath = path.resolve(targetDir, targetFile);

    const { data, content } = matter.read(sourcePath);
    const filehash = md5(content);

    if (await fs.exists(targetPath)) {
      // translated file existed and not changed, skip
      const { data: targetData } = matter.read(targetPath);

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
      'Writed translated file into:',
      targetPath,
      ', token usage:',
      usage
    );
  }
}

async function translateJSON(
  locale: string,
  jsonPath: string,
  prefixList: string[]
) {
  if (!(await fs.exists(jsonPath))) {
    console.warn(
      'Skip translation json config because you need to run `docusaurus write-translations` first, locale:',
      locale
    );
    return;
  }

  console.log('Checking json....:', path.relative(siteDir, jsonPath));

  const json = await fs.readJson(jsonPath);

  let modified = false;
  for (const key of Object.keys(json)) {
    for (const prefix of prefixList) {
      if (
        key.startsWith(prefix) &&
        json[key]?.message &&
        key.substring(prefix.length) === json[key].message
      ) {
        if (
          whitelist.some(
            (word) =>
              word.toLowerCase() === String(json[key].message).toLowerCase()
          )
        ) {
          // if word is in whitelist, skip
          continue;
        }

        // should be translate
        json[key].message = (
          await translate(json[key].message, locale)
        ).content;
        modified = true;
      }
    }
  }

  if (modified) {
    await fs.writeJson(jsonPath, json, { spaces: 2 });
    console.log(
      'Writed translated file into:',
      path.relative(siteDir, jsonPath)
    );
  } else {
    console.log(
      'No need to translate, Skip:',
      path.relative(siteDir, jsonPath)
    );
  }
}
