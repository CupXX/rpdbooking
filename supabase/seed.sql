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
  ('一木', '一木', null, null),
  ('陌轩', '陌轩', null, null),
  ('胖虎', '胖虎', null, null),
  ('熊星', '熊星', null, null),
  ('CupX', 'CupX', null, null),
  ('nico', 'nico', null, null),
  ('可乐', '可乐', null, null),
  ('Roy', 'Roy', null, null),
  ('一维', '一维', null, null),
  ('迷弟', '迷弟', null, null),
  ('寿司', '寿司', null, null),
  ('小蒲', '小蒲', null, null)
on conflict (photographer_code) do update set display_name = excluded.display_name, is_active = true;

update photographers
set is_active = false
where photographer_code not in ('鲨鱼', 'OR', '致键', '老李', '一木', '陌轩', '胖虎', '熊星', 'CupX', 'nico', '可乐', 'Roy', '一维', '迷弟', '寿司', '小蒲');

insert into program_dancers (program_id, dancer_id)
select p.id, d.id
from programs p
join dancers d on d.nickname in ('慈慈', '西西', '慈禧', '西慈')
where p.title = '第一组'
on conflict (program_id, dancer_id) do nothing;

with camera_positions(display_name, camera_position) as (
  values
    ('鲨鱼', '前排左侧'),
    ('OR', '前排左侧'),
    ('致键', '前排左侧'),
    ('OLDLILI', '前排左侧'),
    ('一木', '前排右侧'),
    ('陌轩', '前排右侧'),
    ('胖虎', '前排右侧'),
    ('熊星', '前排右侧'),
    ('Rxxxh', '高空左侧'),
    ('CupX', '高空左侧'),
    ('nico', '高空左侧'),
    ('可乐', '高空左侧'),
    ('一维', '高空右侧'),
    ('迷弟', '高空右侧'),
    ('寿司', '高空右侧'),
    ('小蒲', '高空右侧'),
    ('Roy', '高空中间')
)
update photographers p
set camera_position = camera_positions.camera_position
from camera_positions
where p.display_name = camera_positions.display_name;

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
