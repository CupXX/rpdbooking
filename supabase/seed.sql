insert into programs (order_no, title, song_name, group_name)
values
  (1, 'Drama', 'aespa - Drama', 'A组'),
  (2, 'Supernova', 'aespa - Supernova', 'A组'),
  (3, 'ETA', 'NewJeans - ETA', 'B组')
on conflict do nothing;

insert into dancers (nickname, display_name)
values
  ('小七', '小七'),
  ('小A', '小A'),
  ('Momo', 'Momo')
on conflict (nickname) do update set display_name = excluded.display_name;

insert into photographers (photographer_code, display_name, wechat, sample_url)
values
  ('nico001', 'Nico', null, null),
  ('yuki002', 'Yuki', null, null)
on conflict (photographer_code) do update set display_name = excluded.display_name;

insert into program_dancers (program_id, dancer_id)
select p.id, d.id
from programs p
join dancers d on d.nickname in ('小七', '小A')
where p.title = 'Drama'
on conflict (program_id, dancer_id) do nothing;

insert into program_dancers (program_id, dancer_id)
select p.id, d.id
from programs p
join dancers d on d.nickname in ('小七', 'Momo')
where p.title = 'Supernova'
on conflict (program_id, dancer_id) do nothing;

insert into program_dancers (program_id, dancer_id)
select p.id, d.id
from programs p
join dancers d on d.nickname in ('Momo')
where p.title = 'ETA'
on conflict (program_id, dancer_id) do nothing;
