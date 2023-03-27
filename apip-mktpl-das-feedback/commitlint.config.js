module.exports = {
    extends: [
        '@commitlint/config-conventional',
        '@commitlint/config-nx-scopes',
    ],
    rules: {
        'body-max-line-length': [2, 'always', 360],
        'type-enum': [
            2,
            'always',
            [
                'chore',
                'feat',
                'fix',
                'docs',
                'style',
                'refactor',
                'test',
                'revert',
                'release',
            ],
        ],
    },
};
