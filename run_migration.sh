#!/bin/bash
export PGPASSWORD='Truexpanse1!'
psql "postgresql://postgres@ietshbhcugjtnwqnnptg.supabase.co:5432/postgres?sslmode=require" -f proposals_migration.sql
