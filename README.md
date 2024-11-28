## How to use

Make sure you have the following in your docusaurus config:

```ts
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'fr'],
},
```

If you not init basic i18n config in your docusaurus config, you can checkout this url: [https://docusaurus.io/docs/i18n/introduction](https://docusaurus.io/docs/i18n/introduction)

> BTW: If you dont know what code should locales fill, you can fill it by reference this url: [https://github.com/facebook/docusaurus/tree/main/packages/docusaurus-theme-translations/locales](https://github.com/facebook/docusaurus/tree/main/packages/docusaurus-theme-translations/locales)

Then:

Run this command:

```bash
OPENAI_API_KEY=sk-xxxxxx npx docusaurus-i18n
```

## Get Help

```bash
npx docusaurus-i18n --help
```

## Who is using `docusaurus-i18n`

- [Tianji](https://github.com/msgbyte/tianji/tree/master/website)

## Reference locale code

[https://github.com/facebook/docusaurus/tree/main/packages/docusaurus-theme-translations/locales](https://github.com/facebook/docusaurus/tree/main/packages/docusaurus-theme-translations/locales)
