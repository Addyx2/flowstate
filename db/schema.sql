-- Flowstate / Honor schema
-- Run once in the Vercel Postgres SQL editor (or via a migration).

-- Organisations: agencies, employers, community groups, families.
-- Regulation is OPTIONAL: compliance_framework NULL means no regulator.
-- Nothing in Flowstate requires an organisation to be CQC (or any) registered.
CREATE TABLE IF NOT EXISTS organisations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT DEFAULT 'provider',      -- provider | employer | community | family
  compliance_framework TEXT,         -- NULL | 'cqc' | 'care-inspectorate' | 'ciw' | 'rqia'
  registration_ref TEXT,             -- optional regulator registration number
  created_at TIMESTAMPTZ DEFAULT now()
);

-- People: carers, clients, family caregivers, managers
CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,            -- 'carer' | 'family_caregiver' | 'client' | 'manager'
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Carer profile — the substrate for Persona Intelligence / Aultrum Layers
CREATE TABLE IF NOT EXISTS carer_profiles (
  id SERIAL PRIMARY KEY,
  person_id INTEGER REFERENCES people(id),
  headline TEXT,
  bio TEXT,
  skills JSONB DEFAULT '[]',      -- [{name, level}]
  qualifications JSONB DEFAULT '[]', -- [{name, issuer, year}]
  tier TEXT DEFAULT 'Silver',      -- Silver | Gold | Platinum
  choral_balance INTEGER DEFAULT 0,
  rating NUMERIC(3,2),            -- 0..5
  consent_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- A carer may hold up to ~3 active jobs (or family caregiving roles)
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  carer_id INTEGER REFERENCES carer_profiles(id),
  organisation TEXT,
  organisation_id INTEGER REFERENCES organisations(id), -- optional link
  role TEXT,
  start_date DATE,
  end_date DATE,                 -- null = current
  is_family_role BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active'   -- active | ended
);

-- Verifiable references from managers / care receivers
CREATE TABLE IF NOT EXISTS references_x (
  id SERIAL PRIMARY KEY,
  carer_id INTEGER REFERENCES carer_profiles(id),
  author_person_id INTEGER REFERENCES people(id),
  author_role TEXT,              -- manager | care_receiver | family
  content TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Applause -> choral reward (recognition + points)
CREATE TABLE IF NOT EXISTS chorals (
  id SERIAL PRIMARY KEY,
  carer_id INTEGER REFERENCES carer_profiles(id),
  from_person_id INTEGER REFERENCES people(id),
  points INTEGER DEFAULT 1,
  message TEXT,
  channel TEXT,                  -- manager | receiver | family
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Points redeemed for training discounts / perks
CREATE TABLE IF NOT EXISTS redemptions (
  id SERIAL PRIMARY KEY,
  carer_id INTEGER REFERENCES carer_profiles(id),
  points_spent INTEGER,
  item TEXT,                     -- e.g. 'training_discount'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Telephony / call audit (existing)
CREATE TABLE IF NOT EXISTS calls (
  id SERIAL PRIMARY KEY,
  call_sid TEXT UNIQUE,
  phone_from TEXT,
  phone_to TEXT,
  status TEXT,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
