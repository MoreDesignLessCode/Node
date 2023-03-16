import { Uuid, parseUuid } from './id';

describe('Uuid Parsing', () => {
  it('should fail when a number', () => {
    expect(() => {
      parseUuid('5');
    }).toThrow();
  });
  it('should fail when invalid uuid', () => {
    expect(() => {
      parseUuid('4b9b3fd2-a5f7-42b2-a5d7-c571913c7594a');
    }).toThrow();
  });
  it('should succeed', () => {
    expect(() => parseUuid(Uuid())).toBeTruthy();
  });
});
