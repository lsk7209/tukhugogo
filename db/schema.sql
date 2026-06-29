-- Turso/libSQL starting schema for 특허고고 patent-map data.
-- Keep source/date fields with every aggregate to satisfy the design's compliance rule.

create table if not exists tech_fields (
  id text primary key,
  ipc text not null,
  name text not null,
  short_name text not null,
  description text
);

create table if not exists applicants (
  id text primary key,
  name text not null,
  tag text,
  normalized_name text,
  created_at text not null default (datetime('now'))
);

create table if not exists field_applicant_metrics (
  tech_field_id text not null references tech_fields(id),
  applicant_id text not null references applicants(id),
  filing_count integer not null,
  registration_rate real,
  source_label text not null,
  source_url text,
  as_of text not null,
  primary key (tech_field_id, applicant_id, as_of)
);

create table if not exists field_year_metrics (
  tech_field_id text not null references tech_fields(id),
  year integer not null,
  filing_count integer not null,
  source_label text not null,
  source_url text,
  as_of text not null,
  primary key (tech_field_id, year, as_of)
);

create table if not exists validation_gates (
  id text primary key,
  gate_name text not null,
  status text not null check (status in ('pending', 'passed', 'failed', 'blocked')),
  evidence_url text,
  note text,
  updated_at text not null default (datetime('now'))
);
