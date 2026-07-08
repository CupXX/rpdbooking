delete from photographer_program_status;
delete from program_dancers;
delete from programs;
delete from dancers;

insert into programs (order_no, title, song_name, group_name)
values
  (1, '第一组', 'aespa - LEMONADE', '第一组'),
  (2, '第二组', 'Hearts2Hearts - RUDE', '第二组'),
  (3, '第三组', 'KISS OF LIFE - Who is She', '第三组'),
  (4, '第四组', 'Hearts2Hearts - RUDE', '第四组');

insert into dancers (nickname, display_name)
values
  ('蕊蕊', '蕊蕊'),
  ('西西', '西西'),
  ('慈洁', '慈洁'),
  ('西慈', '西慈'),
  ('小一', '小一'),
  ('小二', '小二'),
  ('小三', '小三'),
  ('猫猫', '猫猫'),
  ('狗狗', '狗狗'),
  ('兔兔', '兔兔'),
  ('猪猪', '猪猪'),
  ('鱼鱼', '鱼鱼'),
  ('大鱼', '大鱼'),
  ('小鱼', '小鱼'),
  ('鱼鳞', '鱼鳞')
on conflict (nickname) do update set display_name = excluded.display_name;

insert into photographers (photographer_code, display_name, wechat, sample_url)
values
  ('nico001', 'Nico', null, null),
  ('yuki002', 'Yuki', null, null)
on conflict (photographer_code) do update set display_name = excluded.display_name;

insert into program_dancers (program_id, dancer_id)
select p.id, d.id
from programs p
join dancers d on d.nickname in ('蕊蕊', '西西', '慈洁', '西慈')
where p.title = '第一组'
on conflict (program_id, dancer_id) do nothing;

insert into program_dancers (program_id, dancer_id)
select p.id, d.id
from programs p
join dancers d on d.nickname in ('小一', '小二', '小三')
where p.title = '第二组'
on conflict (program_id, dancer_id) do nothing;

insert into program_dancers (program_id, dancer_id)
select p.id, d.id
from programs p
join dancers d on d.nickname in ('猫猫', '狗狗', '兔兔', '猪猪')
where p.title = '第三组'
on conflict (program_id, dancer_id) do nothing;

insert into program_dancers (program_id, dancer_id)
select p.id, d.id
from programs p
join dancers d on d.nickname in ('鱼鱼', '大鱼', '小鱼', '鱼鳞')
where p.title = '第四组'
on conflict (program_id, dancer_id) do nothing;
