namespace Tag {
  declare const OpaqueTagSymbol: unique symbol;
  declare class OpaqueTag<S extends symbol> {
    private [OpaqueTagSymbol]: S;
  }

  export type OpaqueType<T, S extends symbol> = T & OpaqueTag<S>;
}

export type Opaque<T, S extends symbol> = Tag.OpaqueType<T, S>;

declare const UUIDTag: unique symbol;
export type UUID = Opaque<string, typeof UUIDTag>;

const foo = (id: UUID): void => {
  console.log('Got id:', id);
};

foo('42'); // => Type '"42"' is not assignable to type 'OpaqueTag<unique symbol>'.
foo('42' as UUID);

/**
 * Conditional: if `T` extends `U`, then returns `True` type, otherwise `False` type
 */
export type If<T, U, True, False> = [T] extends [U] ? True : False;

/**
 * If `T` is defined (not `never`), then resulting type is equivalent to `True`, otherwise to `False`.
 */
export type IfDef<T, True, False> = If<T, never, False, True>;

/**
 * If `MaybeNever` type is `never`, then a `Fallback` is returned. Otherwise `MaybeNever` type is returned as is.
 */
export type OrElse<MaybeNever, Fallback> = IfDef<MaybeNever, MaybeNever, Fallback>;

type Ex1 = IfDef<string & never, 't', 'f'>; // => 'f’
type Ex2 = IfDef<string | never, 't', 'f'>; // => 't’
type Ex3 = OrElse<Intersect<{ foo: string }, { bar: number }>, string>; // => string
type Ex4 = OrElse<Intersect<{ foo: string }, { foo: number }>, string>; // => { foo: string }


/**
 * Intersection of types
 */
export type Intersect<A extends {}, B extends {}> =
  Pick<A, Exclude<keyof A, Exclude<keyof A, keyof B>>> extends { [x: string]: never } & { [x: number]: never } ?
  never :
  Pick<A, Exclude<keyof A, Exclude<keyof A, keyof B>>>;

/**
 * Makes a sum type out of given partial type, in which at least one field is required.
 */
export type AtLeastOne<T, Keys extends keyof T = keyof T> = Partial<T> & { [K in Keys]: Required<Pick<T, K>> }[Keys];

/**
 * Ensures that T never widens S.
 */
export type Exact<S extends {}, T extends S> = S & Record<Exclude<keyof T, keyof S>, never>;

// Type-level assertions which is possible to compile only if parameter is inferred to a non-bottom type:
export const assertType = <T>(expect: [T] extends [never] ? never : T): T => expect;

/*
Example: you are writing a CRUD for working with users. Your analyst gives you this models:
*/
export interface UserModel {
  id: UUID;
  name: string;
  surname: string;
  age: number;
}

export interface PatchUserModel {
  id: UUID;
  name?: string;
  surname?: string;
  age?: number;
}

// This one is much better for PATCH request modelling:
type UpdateUser = Pick<UserModel, 'id'> & AtLeastOne<Omit<UserModel, 'id'>>;

const id = '1' as UUID;
const updateName: UpdateUser = { id, name: 'Yuriy' }; // => Ok
const updateSurname: UpdateUser = { id, surname: 'Bogomolov' }; // => Ok
const updateAge: UpdateUser = { id, age: 30 }; // => Ok
const updateEmpty: UpdateUser = { id }; // => Property 'age' is missing in type '{ ... }'

/*
Example: types A and B should never intersect:
*/
const neverIntersect = <
  A extends {},
  B extends {},
  NeverIntersect extends IfDef<Intersect<A, B>, never, {}> = IfDef<Intersect<A, B>, never, {}>
>(
  a: A & NeverIntersect,
  b: B & NeverIntersect,
): A & B & NeverIntersect => ({ ...a, ...b });

interface A { foo: string; }
interface B { bar: number; }
const a1: A = { foo: 'foo' };
const b1: B = { bar: 42 };
const c1 = neverIntersect<A, B>(a1, b1); // => A & B
const c2 = neverIntersect<A, A>(a1, a1); // => Argument of type 'A' is not assignable to parameter of type 'never'

