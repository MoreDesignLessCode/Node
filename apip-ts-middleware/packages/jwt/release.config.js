const name = 'jwt';
const srcRoot = `packages/${name}`;

module.exports = {
  extends: 'release.config.base.js',
  pkgRoot: `dist/${srcRoot}`,
  tagFormat: name + '-v${version}',
  commitPaths: [`${srcRoot}/*`],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          name: 'conventionalchangelog',
          issuePrefixes: ['APIP-'],
          issueUrlFormat:
            'https://jira-pg.atlassian.net/browse/{{prefix}}{{id}}',
        },
      },
    ],
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: `${srcRoot}/CHANGELOG.md`,
      },
    ],
    '@semantic-release/npm',
    [
      '@semantic-release/git',
      {
        assets: [`${srcRoot}/package.json`, `${srcRoot}/CHANGELOG.md`],
        message:
          `release(${name}): release apip-${name}-middleware ` +
          '${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};
