import { Resource } from './resource';

export type Data =
  | { type: 'resource'; clazz: Resource }
  | { type: 'resourceCollection'; clazz: Resource[] };
