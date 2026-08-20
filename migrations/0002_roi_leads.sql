create table if not exists roi_leads (
  id           serial primary key,
  user_id      text,
  company      text not null,
  contact      text not null default '',
  email        text not null,
  plan         text not null,
  payback_months numeric not null,
  roi          numeric not null,
  net_benefit  numeric not null,
  annual_cost  numeric not null,
  total_benefits numeric not null,
  created_at   timestamptz not null default now()
);
create index if not exists roi_leads_created_at_idx on roi_leads (created_at desc);
