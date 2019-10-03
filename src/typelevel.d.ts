// Boolean logic:

type False = 'f';
type True = 't';
type Bool = False | True;

type If<Cond extends Bool, Then, Else> = {
  f: Else;
  t: Then;
}[Cond];
type Not<Cond extends Bool> = If<Cond, False, True>;
type And<Cond1 extends Bool, Cond2 extends Bool> = If<Cond1, Cond2, False>;
type Or<Cond1 extends Bool, Cond2 extends Bool> = If<Cond1, True, Cond2>;
type BoolEq<Cond1 extends Bool, Cond2 extends Bool> = If<Cond1, Cond2, Not<Cond2>>;

// Peano numbers

type Zero = { isZero: True };
type Nat = Zero | { isZero: False, prev: Nat };

type Succ<N extends Nat> = { isZero: False, prev: N };
type Prev<N extends Succ<Nat>> = N['prev'];
type IsZero<N extends Nat> = N['isZero'];

type _0 = Zero;
type _1 = Succ<_0>;
type _2 = Succ<_1>;
type _3 = Succ<_2>;
type _4 = Succ<_3>;
type Add<A extends Nat, B extends Nat> = {
  f: B extends Succ<Nat> ? Succ<Add<A, Prev<B>>> : never;
  t: A;
}[IsZero<B>];

type Mul<A extends Nat, B extends Nat> = {
  f: B extends Succ<Nat> ? Mul<A, Prev<B>> extends infer R ? Add<A, R extends Nat ? R : never> : never : never;
  t: Zero;
}[IsZero<B>];

type _5 = Add<_2, _3>; // => { isZero: "f"; prev: Succ<Succ<Succ<Succ<Zero>>>> }
type _6 = Mul<_2, _3>; // => { isZero: "f"; prev: Succ<Succ<Succ<Succ<Succ<Zero>>>>> }
type _7 = Add<_1, Mul<_2, _3>>; // => { isZero: "f"; prev: Succ<Succ<Succ<Succ<Succ<Succ<Zero>>>>>> }
type _8 = Mul<_2, Add<_1, _3>>; // => { isZero: "f"; prev: Succ<Succ<Succ<Succ<Succ<Succ<Succ<Zero>>>>>>> }
type _9 = Mul<_3, _3>; // => { isZero: "f"; prev: Succ<Succ<Succ<Succ<Succ<Succ<Succ<Succ<Zero>>>>>>>> }

type Lteq<M extends Nat, N extends Nat> = {
  f: If<
    IsZero<N>,
    False,
    Lteq<M extends Succ<Nat> ? Prev<M> : never, N extends Succ<Nat> ? Prev<N> : never>
  >;
  t: IsZero<N>;
}[IsZero<M>];

type NatEq<M extends Nat, N extends Nat> =
  Lteq<M, N> extends infer A ?
  Lteq<N, M> extends infer B ?
  And<A extends Bool ? A : never, B extends Bool ? B : never> : never : never;

type Fib<N extends Nat> = {
  f: If<
    NatEq<_1, N>,
    _1,
    Add<
      Fib<N extends Succ<Nat> ? Prev<N> : never>,
      Fib<N extends Succ<Succ<Nat>> ? Prev<Prev<N>> : never>
    >
  >;
  t: Zero;
}[IsZero<N>];

declare const fib7: Fib<_7>;
// => Succ<Succ<Succ<Succ<Succ<Succ<Succ<Succ<Succ<Succ<Succ<Succ<Succ<Zero>>>>>>>>>>>>>
// => 13

type Fact<N extends Nat> = {
  f: Mul<N, Fact<N extends Succ<Nat> ? Prev<N> : never>>;
  t: _1;
}[Or<IsZero<N>, NatEq<_1, N>>];

declare let fact4: Fact<_4>; // 24 times Succ<...Succ<Zero>>..>

// Heterogeneous lists

type HNil = { isNil: True; };
type HCons = { isNil: False; head: any; tail: HList; };
type HList = HNil | HCons;

type Cons<Head, Tail extends HList> = { isNil: False, head: Head, tail: Tail };
type Head<Xs extends HCons> = Xs['head'];
type Tail<Xs extends HCons> = Xs['tail'];
type IsNil<Xs extends HList> = Xs['isNil'];

type Reverse<Xs extends HList> = Rev<Xs, HNil>;
type Rev<Xs extends HList, T extends HList> = {
  f: Xs extends HCons ? Rev<Tail<Xs>, Cons<Head<Xs>, T>> : HNil;
  t: T;
}[IsNil<Xs>];

type ABC1 = Cons<'a', Cons<'b', Cons<'c', Cons<1, HNil>>>>;
type _1CBA = Reverse<ABC1>; // $ExpectType HCons<1, HCons<'c', HCons<'b', HCons<'a', HNil>>>>

type Length<Xs extends HList> = {
  f: Xs extends HCons ? Succ<Length<Tail<Xs>>> : Zero;
  t: Zero;
}[IsNil<Xs>];

type LengthOfABC1 = Length<ABC1>; // => 4
