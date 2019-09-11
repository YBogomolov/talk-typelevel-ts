// Hypothetical syllogism:
// ((p → q) ∧ (q → r)) ⊢ p → r

type HSProof = <P, Q, R>(pq: (p: P) => Q, qr: (q: Q) => R) => (p: P) => R;
const proofHS: HSProof = (pq, qr) => (p) => qr(pq(p));
// Or simply:
// const proofHS: HSProof = (pq, qr) => compose(qr, pq);

// Applying modus ponens:
const proofHS1 = proofHS<number[], number, string>((list) => list.length, (len) => len.toString())([1, 2, 3]);
console.log(proofHS1); // => "3"

// Constructive dilemma:
// ((p → q) ∧ (r → s) ∧ (p ∨ r)) ⊢ q ∨ s

type CDProof<P, Q, R, S> = (
  pq: (p: P) => Q,
  rs: (r: R) => S,
  p_OR_r: P | R,
) => Q | S;
const proofCD = <P, Q, R, S>(isP: (p: P | R) => p is P): CDProof<P, Q, R, S> =>
  (pq, rs, p_OR_r) => isP(p_OR_r) ? pq(p_OR_r) : rs(p_OR_r);

// Constructive dilemma: example
const proof1 = proofCD<number, string, boolean, number>(
  (p): p is number => typeof p === 'number',
)((p) => p.toString(), (r) => r ? 1 : 0, 10); // => "10"

const proof2 = proofCD<number, string, boolean, number>(
  (p): p is number => typeof p === 'number',
)((p) => p.toString(), (r) => r ? 1 : 0, false); // => 0
