import { parseUuid, Uuid } from './id';

export abstract class APIError extends Error {
  readonly stack: string;

  readonly innerErrors: Error[];

  private static readonly getErrorReport =
    typeof new Error().stack === 'string'
      ? (err: Error) => err.stack || ''
      : (err: Error) => `${err.name}: ${err.message}`;

  withPointer(value: string): this {
    this._pointer = value;
    return this;
  }

  get pointer(): string {
    return this._pointer || '';
  }

  withReason(value: string): this {
    this._reason = value;
    this.message = value;
    return this;
  }

  get reason(): string {
    return this._reason || '';
  }

  withTitle(value: string): this {
    this._title = value;
    return this;
  }

  get title(): string {
    return this._title || '';
  }

  withInstance(value: string): this {
    try {
      if (parseUuid(value)) {
        this._instance = value;
      }
    } catch (_) {
      throw new Error('Instance Must be UUID');
    }

    return this;
  }

  get instance(): string {
    if (!this._instance) {
      this._instance = Uuid();
    }

    return this._instance;
  }

  withCode(value: string): this {
    this._code = value;
    return this;
  }

  get code(): string {
    return this._code;
  }

  constructor(
    private _code: string,
    private _instance?: string,
    private _title?: string,
    private _reason?: string,
    private _pointer?: string,
    ...innerErrors: unknown[]
  ) {
    const message = 'Generic Error Message that should have beenc changed';
    if (!_reason) {
      _reason = message;
    }

    super(_reason);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, APIError.prototype);

    // TODO: clean up the ===== INNER ERROR and make it into the error objects for "rootCauses".
    // TODO: We may not want to allow the error.stack to be used in the output as well (might be a security vuln)
    const thisErrorReport = APIError.getErrorReport(this);
    if (innerErrors.length === 1) {
      const innerError = toError(innerErrors[0]);
      this.innerErrors = [innerError];
      const errReport = APIError.getErrorReport(innerError);
      this.stack = `${thisErrorReport}\n\n======= INNER ERROR =======\n\n${errReport}`;
      return;
    }
    this.innerErrors = innerErrors.map((err) => toError(err));
    const innerErrorReports = this.innerErrors
      .map((error, idx) => {
        const errReport = APIError.getErrorReport(error);
        return `======= INNER ERROR (${idx + 1} of ${
          innerErrors.length
        }) =======\n\n${errReport}`;
      })
      .join('\n\n');
    this.stack = `${thisErrorReport}\n\n${innerErrorReports}`;
  }

  toJson() {
    return {
      code: this._code,
      instance: `urn:uuid:${this._instance}`,
      pointer: this._pointer,
      title: this._title,
      reason: this._reason,
      rootCauses: this.innerErrors.map((err) => {
        if (err instanceof APIError) {
          return {
            code: err._code,
            instance: `urn:uuid:${err._instance}`,
            pointer: err._pointer,
            title: err._title,
            reason: err._reason,
          };
        } else {
          return {
            code: 'GENERIC-10T',
            instance: '',
            title: 'Generic Error',
            reason: err.message,
          };
        }
      }),
    };
  }
}

/**
 * Returns `err` itself if `err instanceof Error === true`, otherwise attemts to
 * stringify it and wrap into `Error` object to be returned.
 *
 * **This function is guaranteed never to throw.**
 *
 * @param err Possbile `instanceof Error` to return or value of any type that will
 *            be wrapped into a fully-fledged `Error` object.
 */
export function toError(err: unknown): Error;

export function toError(err: unknown) {
  try {
    return err instanceof Error
      ? err
      : new Error(`Value that is not an instance of Error was thrown: ${err}`);
  } catch {
    return new Error(
      'Failed to stringify non-instance of Error that was thrown.' +
        'This is possibly due to the fact that toString() method of the value' +
        "doesn't return a primitive value."
    );
  }
}
