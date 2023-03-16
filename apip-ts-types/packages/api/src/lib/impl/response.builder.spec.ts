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

  it('test setIncludes', () => {
    const includesData = [{ id: Uuid(), name: 'test' }];
    const includes = {
      test: includesData,
    };
    const fixture = new ResponseBuilder();
    fixture.setIncludes(includes);
    expect(fixture).toBeInstanceOf(ResponseBuilder);
    expect((fixture.build() as Response).includes).toEqual(includes);
  });
  it('test setInclude', () => {
    const includesData = [{ id: Uuid(), name: 'test' }];
    const includes = {
      test: includesData,
    };
    const fixture = new ResponseBuilder();
    fixture.setInclude('test', includesData);
    expect(fixture).toBeInstanceOf(ResponseBuilder);
    expect((fixture.build() as Response).includes).toEqual(includes);
  });
});
