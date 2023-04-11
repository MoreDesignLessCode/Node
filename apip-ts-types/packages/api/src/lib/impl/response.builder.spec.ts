import { APIError } from '../types/api.error';
import { Uuid } from '../types/id';
import { ResponseBuilder } from './response.builder';
import { Response } from '../types/response';

describe('Response Builder', () => {
  it('no args', () => {
    expect(new ResponseBuilder()).toBeInstanceOf(ResponseBuilder);
  });

  it('pass data in constructor', () => {
    const data = [{ id: Uuid(), name: 'test' }];
    expect(new ResponseBuilder(data)).toBeInstanceOf(ResponseBuilder);
  });

  it('use setData instead of constructor', () => {
    const data = [{ id: Uuid(), name: 'test' }];
    const fixture = new ResponseBuilder();
    fixture.setData(data);
    expect(fixture).toBeInstanceOf(ResponseBuilder);
    expect((fixture.build() as Response).data).toEqual(data);
  });

  it('pass error in constructor', () => {
    class NewError extends APIError {
      constructor(_code: string, ...innerErrors: unknown[]) {
        super(
          _code,
          Uuid(),
          'NEW ERROR',
          'GENERAL API ERROR',
          '',
          ...innerErrors
        );

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, NewError.prototype);
      }
    }
    const error: NewError = new NewError('code');
    const fixture = new ResponseBuilder(null, error);
    expect(fixture).toBeInstanceOf(ResponseBuilder);
    expect((fixture.build() as Response).errors.code).toEqual(error.code);
  });

  it('test setErrors', () => {
    class NewError extends APIError {
      constructor(_code: string, ...innerErrors: unknown[]) {
        super(
          _code,
          Uuid(),
          'NEW ERROR',
          'GENERAL API ERROR',
          '',
          ...innerErrors
        );

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, NewError.prototype);
      }
    }
    const error: NewError = new NewError('code');
    const fixture = new ResponseBuilder();
    fixture.setErrors(error);
    expect(fixture).toBeInstanceOf(ResponseBuilder);
    expect((fixture.build() as Response).errors.code).toEqual(error.code);
  });

  it('test setMeta', () => {
    const paging = {
      limit: 10,
      offset: 0,
      total: 100,
    };
    const sorting = {
      asc: [],
      desc: [],
    };
    const fields = {
      omitted: [],
      requested: [],
    };
    const filtering = {
      none: {
        operator: '',
        value: '',
      },
    };
    const meta = {
      paging: paging,
      sorting: sorting,
      fields: fields,
      filters: filtering,
    };
    const fixture = new ResponseBuilder();
    fixture.setMeta(meta);
    expect(fixture).toBeInstanceOf(ResponseBuilder);
    expect((fixture.build() as Response).meta).toEqual(meta);
  });
  it('test setMeta Partial', () => {
    const paging = {
      limit: 10,
      offset: 0,
      total: 100,
    };
    const sorting = {
      asc: ['foo'],
    };
    const filtering = {
      none: {
        operator: '',
        value: '',
      },
    };
    const meta = {
      paging: paging,
      sorting: sorting,
      filters: filtering,
    };
    const fixture = new ResponseBuilder();
    fixture.setMeta(meta);
    expect(fixture).toBeInstanceOf(ResponseBuilder);
    expect((fixture.build() as Response).meta).toEqual(meta);
  });

  [{
      name: 'Set Includes',
      given: {
          includes: {
            foo: [{ id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' }]
          }
      },
      expected: {
        foo: [
          { id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' },
        ]
      }
  },{
      name: 'Set Null Includes',
      given: {
          includes: null
      },
      expected: null 
  }
  ].forEach(({name, given, expected}) => {
    it(`${name}`, ()=>{
        const fixture = new ResponseBuilder()
        fixture.setIncludes(given.includes);
        expect(fixture).toBeInstanceOf(ResponseBuilder);
        expect((fixture.build() as Response).includes).toEqual(expected);
    })
  });
  
  [{
      name: 'Add to Null Includes',
      given: {
          toBeIncluded: [{ id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' }]
      },
      expected: {
        foo: [
          { id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' },
        ]
      }
  }].forEach(({name, given, expected}) => {
    it(`${name}`, ()=>{
        const fixture = new ResponseBuilder()
        fixture.addIncludes('foo',given.toBeIncluded);
        expect(fixture).toBeInstanceOf(ResponseBuilder);
        expect((fixture.build() as Response).includes).toEqual(expected);
    })
  });
  [{
      name: 'Append to Null Includes',
      given: {
          toBeIncluded: [{ id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' }]
      },
      expected: {
        foo: [
          { id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' },
        ]
      }
  }].forEach(({name, given, expected}) => {
    it(`${name}`, ()=>{
        const fixture = new ResponseBuilder()
        fixture.appendInclude('foo',given.toBeIncluded);
        expect(fixture).toBeInstanceOf(ResponseBuilder);
        expect((fixture.build() as Response).includes).toEqual(expected);
    })
  });

  [
    {
      name: 'add Includes with Array to existing Includes',
      given: {
        includes: {
          foo: [{ id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' }],
        },
        toBeIncluded: [
          { id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2', name: 'foo2' },
        ],
      },
      expected: {
        foo: [
          { id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' },
          { id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2', name: 'foo2' },
        ],
      },
    },{

      name: 'add Includes with Object to existing Includes',
      given: {
        includes: {
          foo: [{ id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' }],
        },
        toBeIncluded: 
          { id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2', name: 'foo2' },
        
      },
      expected: {
        foo: [
          { id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' },
          { id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2', name: 'foo2' },
        ],
      },
    },
    {
      name: 'addIncludes to empty Includes',
      given: {
        includes: {
          buzz: [{ id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'buzz' }],
        },
        toBeIncluded: [
          { id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2', name: 'foo2' },
        ],
      },
      expected: {
        foo: [{ id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2', name: 'foo2' }],
        buzz: [{ id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'buzz' }],
      },
    },
  ].forEach(({ name, given, expected }) => {
    it(`${name}`, () => {
      const fixture = new ResponseBuilder();
      fixture.setIncludes(given.includes);
      fixture.addIncludes('foo', given.toBeIncluded);
      expect(fixture).toBeInstanceOf(ResponseBuilder);
      expect((fixture.build() as Response).includes).toEqual(expected);
    });
  });

  [
    {
      name: 'appendInclude to existing Included',
      given: {
        includes: {
          foo: [{ id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' }],
        },
        toBeIncluded: {
          id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2',
          name: 'foo2',
        },
      },
      expected: {
        foo: [
          { id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' },
          { id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2', name: 'foo2' },
        ],
      },
    },
    {
      name: 'appendInclude with Array to existing Included',
      given: {
        includes: {
          foo: [{ id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' }],
        },
        toBeIncluded: [{
          id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2',
          name: 'foo2',
        }],
      },
      expected: {
        foo: [
          { id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'foo1' },
          { id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2', name: 'foo2' },
        ],
      },
    },
    {
      name: 'appendInclude to non existent Included',
      given: {
        includes: {
          buzz: [{ id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'buzz' }],
        },
        toBeIncluded: 
          { id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2', name: 'foo2' },
        
      },
      expected: {
        foo: [{ id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2', name: 'foo2' }],
        buzz: [{ id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'buzz' }],
      },
    },
    {
      name: 'appendInclude with Array to non existent Included',
      given: {
        includes: {
          buzz: [{ id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'buzz' }],
        },
        toBeIncluded: 
          { id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2', name: 'foo2' },
        
      },
      expected: {
        foo: [{ id: '176a7f37-d6f4-415e-b9e9-1d055bdfe5b2', name: 'foo2' }],
        buzz: [{ id: 'c0efba86-7355-48e4-aac2-f095cd5d48ad', name: 'buzz' }],
      },
    }
  ].forEach(({ name, given, expected }) => {
    it(`${name}`, () => {
      const fixture = new ResponseBuilder();
      fixture.setIncludes(given.includes);
      fixture.appendInclude('foo', given.toBeIncluded);
      expect(fixture).toBeInstanceOf(ResponseBuilder);
      expect((fixture.build() as Response).includes).toEqual(expected);
    });
  });
});
