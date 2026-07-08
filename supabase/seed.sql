delete from photographer_program_status;
delete from program_dancers;
delete from programs;
delete from dancers;

insert into programs (order_no, title, song_name, group_name)
values
  (1, '第一组', 'aespa - LEMONADE', '第一组'),
  (2, '第二组', 'Hearts2Hearts - RUDE', '第二组'),
  (3, '第三组', 'KISS OF LIFE - Who is She', '第三组'),
  (4, '第四组', 'Hearts2Hearts - RUDE', '第四组'),
  (5, '第五组', 'aespa - LEMONADE', '第五组');

insert into dancers (nickname, display_name)
values
  ('慈慈', '慈慈'),
  ('西西', '西西'),
  ('慈禧', '慈禧'),
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
  ('鱼鳞', '鱼鳞'),
  ('鳗鱼', '鳗鱼'),
  ('呆呆鱼', '呆呆鱼'),
  ('Cici', 'Cici')
on conflict (nickname) do update set display_name = excluded.display_name;

insert into photographers (photographer_code, display_name, wechat, sample_url)
values
  ('鲨鱼', '鲨鱼', null, null),
  ('OR', 'OR', null, null),
  ('致键', '致键', null, null),
  ('老李', '老李', null, null),
  ('主机位', '主机位', null, null),
  ('一木', '一木', null, null),
  ('迷弟', '迷弟', null, null),
  ('陌轩', '陌轩', null, null),
  ('胖虎', '胖虎', null, null),
  ('衍一', '衍一', null, null),
  ('mx', 'mx', null, null),
  ('nico', 'nico', null, null),
  ('Roy', 'Roy', null, null),
  ('一维', '一维', null, null),
  ('可乐', '可乐', null, null),
  ('CupX', 'CupX', null, null)
on conflict (photographer_code) do update set display_name = excluded.display_name;

insert into program_dancers (program_id, dancer_id)
select p.id, d.id
from programs p
join dancers d on d.nickname in ('慈慈', '西西', '慈禧', '西慈')
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
join dancers d on d.nickname in ('鱼鱼', '大鱼', '小鱼', '鱼鳞', '鳗鱼', '呆呆鱼')
where p.title = '第四组'
on conflict (program_id, dancer_id) do nothing;

insert into program_dancers (program_id, dancer_id)
select p.id, d.id
from programs p
join dancers d on d.nickname in ('慈慈', 'Cici', '慈禧', '西慈')
where p.title = '第五组'
on conflict (program_id, dancer_id) do nothing;
