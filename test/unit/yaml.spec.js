/**
 * Tests for yaml module.
 * @file yaml.spec.js
 */

'use strict';

const chai = require('chai');
const expect = chai.expect;
const filesystem = require('mock-fs');
const fs = require('fs-extra');
const hasher = require('object-hash');
const os = require('os');
const path = require('path');
chai.should();

const yaml = require('./../../lib/yaml')({error: () => {
  throw Error();
}});

describe('yaml', () => {
  describe('#load', () => {
    it('returns data from a YAML file as an Object', () => {
      const content = ['obiwan: kenobi', 'qui:', '- gon', '- jinn'].join(os.EOL);
      filesystem({'/tmp/config1.yml': content});
      const data = yaml.load('/tmp/config1.yml');
      expect(data).to.be.an('Object');
      expect(hasher(data)).to.equal(hasher({obiwan: 'kenobi', qui: ['gon', 'jinn']}));
      filesystem.restore();
    });

    it('errors when file does not exist', () => {
      const bogusville = '/tmp/thisalmostcertainlydoesnotexist-3285-2385.yml';
      expect(() => yaml.load(bogusville)).to.throw(Error);
    });
  });

  describe('#dump', () => {
    beforeEach(() => {
      filesystem();
    });

    it('creates the directory for the file if it does not exist', () => {
      yaml.dump('/tmp/test/file.yml', {});
      expect(fs.existsSync(path.dirname('/tmp/test/file.yml'))).to.equal(true);
    });

    it('writes a valid YAML file to disk for the object', () => {
      const data = {obiwan: 'kenobi', qui: ['gon', 'jinn']};
      yaml.dump('/tmp/test/file.yml', data);
      expect(fs.existsSync('/tmp/test/file.yml')).to.equal(true);
      expect(hasher(yaml.load('/tmp/test/file.yml'))).to.equal(hasher(data));
    });

    it('returns the name of the file', () => {
      const file = yaml.dump('/tmp/test/file.yml', {});
      expect(file).to.equal('/tmp/test/file.yml');
    });

    afterEach(() => {
      filesystem.restore();
    });
  });
});
