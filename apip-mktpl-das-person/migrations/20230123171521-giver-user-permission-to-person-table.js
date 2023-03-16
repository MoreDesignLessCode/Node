'use strict';

/* eslint-disable @typescript-eslint/no-var-requires, must-use-await/must-use-await */
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
        '20230123171521-giver-user-permission-to-person-table-up.sql'
    );
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
            if (err) return reject(err);

            resolve(data);
        });
    }).then((data) => db.runSql(data));
};

exports.down = (db) => {
    var filePath = path.join(
        __dirname,
        'sqls',
        '20230123171521-giver-user-permission-to-person-table-down.sql'
    );
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
            if (err) return reject(err);

            resolve(data);
        });
    }).then((data) => db.runSql(data));
};

exports._meta = {
    version: 1,
};
