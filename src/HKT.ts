import { Functor2 } from 'fp-ts/lib/Functor';

export const URI = 'Result';
export type URI = typeof URI;

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    Result: Result<E, A>;
  }
}

// Result container (Either):
export type Failure<E> = { tag: 'Failure', error: E };
export type Success<A> = { tag: 'Success'; value: A };
export type Result<E, A> = Failure<E> | Success<A>;

export const failure = <E, A>(error: E): Result<E, A> => ({ tag: 'Failure', error });
export const success = <E, A>(value: A): Result<E, A> => ({ tag: 'Success', value });

// Functorial map (fmap)
export const map = <E, A, B>(
  fa: Result<E, A>,
  f: (a: A) => B,
): Result<E, B> => {
  switch (fa.tag) {
    case 'Failure':
      return fa;
    case 'Success':
      return success(f(fa.value));
  }
};

// Functor instance for Result container:
export const result: Functor2<URI> = {
  URI,
  map,
};
