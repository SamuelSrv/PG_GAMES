-- ============================================================
-- Hub de Mini-games — SQL (rode no SQL Editor do Supabase)
-- Serve para instalação nova E para atualizar a tabela já criada.
-- ============================================================

create table if not exists public.scores (
  id           bigint generated always as identity primary key,
  game_id      text        not null,
  nickname     text        not null check (char_length(nickname) between 2 and 16),
  character_id smallint    not null check (character_id between 0 and 99),
  score        integer     not null check (score >= 0 and score <= 100000),
  created_at   timestamptz not null default now()
);

-- Novo: vínculo com a conta (preenchido automaticamente com o usuário logado)
alter table public.scores
  add column if not exists user_id uuid default auth.uid() references auth.users(id) on delete cascade;

-- Mais personagens (antes só 0 a 2)
alter table public.scores drop constraint if exists scores_character_id_check;
alter table public.scores add constraint scores_character_id_check check (character_id between 0 and 99);

-- Os 5 jogos
alter table public.scores drop constraint if exists scores_game_id_check;
alter table public.scores add constraint scores_game_id_check
  check (game_id in ('corrida','muros','pesca','davi','sansao'));

create index if not exists scores_game_score_idx on public.scores (game_id, score desc);

-- RLS: todos leem o ranking; só quem está logado grava, e apenas como si mesmo
alter table public.scores enable row level security;
drop policy if exists "scores_select_anon" on public.scores;
drop policy if exists "scores_insert_anon" on public.scores;
drop policy if exists "scores_insert_own"  on public.scores;
create policy "scores_select_anon" on public.scores for select to anon, authenticated using (true);
create policy "scores_insert_own"  on public.scores for insert to authenticated with check (user_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on public.scores to anon, authenticated;
grant insert on public.scores to authenticated;
revoke insert on public.scores from anon;
