import { IResource } from '../interfaces/resource.interface';
import { Data } from './data';

class Foo implements IResource {
  name: string;
  active: boolean;
  constructor(name: string, active: boolean) {
    this.name = name;
    this.active = active;
  }
}

class User implements IResource {
  name: string;
  active: boolean;
  constructor(name: string, active: boolean) {
    this.name = name;
    this.active = active;
  }
}

describe('Data Type Testing', () => {
  it('should be of type<Foo>', () => {
    const f: Foo = new Foo('test', true);
    const result: Data<Foo> = { type: 'resource', value: f };
    expect(() => {
      return result.value instanceof Foo;
    }).toBeTruthy();
  });
  it("shouldn't be of type<Foo>", () => {
    const f: User = new User('test', true);
    const result: Data<Foo> = { type: 'resource', value: f };
    expect(result.value instanceof Foo).not.toBeTruthy();
  });
});
