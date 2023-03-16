import { IMeta } from '../interfaces/meta.interface';
import { IResource } from '../interfaces/resource.interface';
import { APIError } from '../types/api.error';
import { Response } from '../types/response';
import { Includes } from '../types/includes';

export class ResponseBuilder {
  response: Response;
  setData(value: IResource[]): void {
    this.response.data = value;
  }
  setErrors(value: APIError): void {
    this.response.errors = value;
  }
  setMeta(value: IMeta): void {
    this.response.meta = value;
  }
  setIncludes(value: Includes): void {
    this.response.includes = value;
  }
  setInclude(namedKey: string, value: IResource[]): void {
    this.response.includes = {
      [namedKey]: value,
    };
  }
  appendInclude(namedKey: string, value: IResource): void {
    if (this.response.includes[namedKey]) {
      this.response.includes[namedKey].push(value);
    } else {
      this.response.includes[namedKey] = [value];
    }
  }

  constructor(
    _data?: IResource[],
    _errors?: APIError,
    _meta?: IMeta,
    _includes?: Includes
  ) {
    this.response = {
      data: _data,
      errors: _errors,
      meta: _meta,
      includes: _includes,
    };
  }
  build(): unknown {
    return {
      data: this.response.data,
      errors: this.response.errors?.toJson(),
      meta: this.response.meta,
      includes: this.response.includes,
    };
  }
}
