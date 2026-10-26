-- Tabela de pontuações
create table if not exists public.scores (
  id           bigint generated always as identity primary key,
  game_id      text        not null check (game_id in ('davi','sansao')),
  nickname     text        not null check (char_length(nickname) between 2 and 16),
  character_id smallint    not null check (character_id between 0 and 2),
  score        integer     not null check (score >= 0 and score <= 100000),
  created_at   timestamptz not null default now()
);
create index if not exists scores_game_score_idx on public.scores (game_id, score desc);

-- RLS: leitura e inserção anônimas (sem UPDATE/DELETE)
alter table public.scores enable row level security;
create policy "scores_select_anon" on public.scores for select to anon, authenticated using (true);
create policy "scores_insert_anon" on public.scores for insert to anon, authenticated with check (true);
grant usage on schema public to anon, authenticated;
grant select, insert on public.scores to anon, authenticated;
