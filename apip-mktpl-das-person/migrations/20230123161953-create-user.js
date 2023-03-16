'use strict';

/* eslint-disable @typescript-eslint/no-var-requires, must-use-await/must-use-await */
const formatString = require('../utils/string');
const fs = require('fs');
const path = require('path');
var Promise;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = (options) => {
    Promise = options.Promise;
};

exports.up = (db) => {
    var filePath = path.join(
        __dirname,
        'sqls',
        '20230123161953-create-user-up.sql'
    );
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
            if (err) return reject(err);

            const formattedData = formatString(
                data,
                process.env.PERSON_DAS_DB_PASSWORD
            );

            resolve(formattedData);
        });
    }).then((data) => db.runSql(data));
};

exports.down = (db) => {
    var filePath = path.join(
        __dirname,
        'sqls',
        '20230123161953-create-user-down.sql'
    );
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
            if (err) return reject(err);

            const formattedData = formatString(
                data,
                process.env.PERSON_DAS_DB_PASSWORD
            );

            resolve(formattedData);
        });
    }).then((data) => {
        return db.runSql(data);
    });
};

exports._meta = {
    version: 1,
};
