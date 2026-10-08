export type Session = {
  id: string;
  name: string;
  join_code: string;
  state: 'active' | 'paused';
};

export type Submission = {
  word: string;
  count: number;
};
