-- ISOLATED TRIAL MIGRATION. Never run against the current Explore/Blobs stores.
-- Requires a trusted PostgreSQL role administrator. Non-idempotent by design:
-- an existing schema/role collision aborts instead of changing another service.
BEGIN;
CREATE ROLE soraspace_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE soraspace_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE SCHEMA soraspace AUTHORIZATION soraspace_owner;
REVOKE ALL ON SCHEMA soraspace FROM PUBLIC;
SET LOCAL ROLE soraspace_owner;
ALTER DEFAULT PRIVILEGES IN SCHEMA soraspace REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

CREATE TABLE soraspace.workspaces (
 id uuid PRIMARY KEY,
 name text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
 state text NOT NULL DEFAULT 'active' CHECK (state IN ('active','suspended','closed')),
 created_at timestamptz NOT NULL DEFAULT statement_timestamp()
);
CREATE TABLE soraspace.memberships (
 workspace_id uuid NOT NULL REFERENCES soraspace.workspaces(id),
 account_id text NOT NULL CHECK (length(account_id) BETWEEN 1 AND 200),
 role text NOT NULL CHECK (role IN ('owner','admin','editor','viewer')),
 state text NOT NULL DEFAULT 'active' CHECK (state IN ('active','revoked')),
 valid_until timestamptz,
 PRIMARY KEY (workspace_id,account_id)
);
-- Multiple owners/ownership transfer and invitations require a dedicated,
-- transactional provisioning workflow; the runtime cannot edit memberships.
CREATE UNIQUE INDEX one_active_owner_per_workspace ON soraspace.memberships(workspace_id)
 WHERE role='owner' AND state='active';

CREATE FUNCTION soraspace.current_account_id() RETURNS text LANGUAGE sql STABLE
 SET search_path=pg_catalog AS $$
 SELECT CASE WHEN length(current_setting('soraspace.account_id',true)) BETWEEN 1 AND 200
 THEN current_setting('soraspace.account_id',true) ELSE NULL END
$$;
CREATE FUNCTION soraspace.current_workspace_id() RETURNS uuid LANGUAGE sql STABLE
 SET search_path=pg_catalog AS $$
 SELECT CASE WHEN current_setting('soraspace.workspace_id',true) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
 THEN current_setting('soraspace.workspace_id',true)::uuid ELSE NULL END
$$;
-- This narrowly scoped definer lookup intentionally uses the NOLOGIN table
-- owner's membership/workspace RLS bypass, avoiding recursive policies. It
-- cannot look up another account or a workspace outside transaction context.
CREATE FUNCTION soraspace.membership_role(target uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER
 SET search_path=pg_catalog AS $$
 SELECT m.role FROM soraspace.memberships m
 JOIN soraspace.workspaces w ON w.id=m.workspace_id
 WHERE m.workspace_id=target AND target=soraspace.current_workspace_id()
 AND m.account_id=soraspace.current_account_id() AND m.state='active'
 AND (m.valid_until IS NULL OR m.valid_until>statement_timestamp()) AND w.state='active'
$$;
ALTER TABLE soraspace.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE soraspace.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspace_read ON soraspace.workspaces FOR SELECT TO soraspace_runtime
 USING (soraspace.membership_role(id) IS NOT NULL);
CREATE POLICY membership_read ON soraspace.memberships FOR SELECT TO soraspace_runtime
 USING (soraspace.membership_role(workspace_id) IS NOT NULL AND
 (account_id=soraspace.current_account_id() OR soraspace.membership_role(workspace_id) IN ('owner','admin')));

CREATE TABLE soraspace.resources (
 workspace_id uuid NOT NULL,
 id uuid NOT NULL,
 owner_account_id text NOT NULL,
 resource_type text NOT NULL CHECK (resource_type IN ('document','file','site-draft')),
 visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','workspace')),
 title text NOT NULL CHECK (length(title) BETWEEN 1 AND 250),
 body jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(body)='object' AND octet_length(body::text)<=65536),
 -- Server namespace only; reserving metadata does not upload or publish bytes.
 storage_key text GENERATED ALWAYS AS ('soraspace/v1/workspaces/' || workspace_id::text || '/objects/' || id::text) STORED,
 version integer NOT NULL DEFAULT 1 CHECK (version>0),
 created_at timestamptz NOT NULL DEFAULT statement_timestamp(),
 updated_at timestamptz NOT NULL DEFAULT statement_timestamp(),
 PRIMARY KEY (workspace_id,id),
 FOREIGN KEY (workspace_id,owner_account_id) REFERENCES soraspace.memberships(workspace_id,account_id)
);
CREATE INDEX resources_owner ON soraspace.resources(workspace_id,owner_account_id,id);
ALTER TABLE soraspace.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE soraspace.resources FORCE ROW LEVEL SECURITY;
CREATE POLICY resource_read ON soraspace.resources FOR SELECT TO soraspace_runtime
 USING (soraspace.membership_role(workspace_id) IS NOT NULL AND
 (owner_account_id=soraspace.current_account_id() OR visibility='workspace'));
CREATE POLICY resource_create ON soraspace.resources FOR INSERT TO soraspace_runtime
 WITH CHECK (soraspace.membership_role(workspace_id) IN ('owner','admin','editor')
 AND owner_account_id=soraspace.current_account_id());
CREATE POLICY resource_update ON soraspace.resources FOR UPDATE TO soraspace_runtime
 USING (soraspace.membership_role(workspace_id) IN ('owner','admin','editor')
 AND (owner_account_id=soraspace.current_account_id() OR visibility='workspace'))
 WITH CHECK (soraspace.membership_role(workspace_id) IN ('owner','admin','editor')
 AND (owner_account_id=soraspace.current_account_id() OR visibility='workspace'));
CREATE POLICY resource_remove ON soraspace.resources FOR DELETE TO soraspace_runtime
 USING (soraspace.membership_role(workspace_id) IN ('owner','admin','editor')
 AND (owner_account_id=soraspace.current_account_id() OR visibility='workspace'));
CREATE FUNCTION soraspace.advance_resource_version() RETURNS trigger LANGUAGE plpgsql
 SET search_path=pg_catalog AS $$
 BEGIN
 NEW.version:=OLD.version+1; NEW.updated_at:=statement_timestamp(); RETURN NEW;
 END
$$;
CREATE TRIGGER resource_version BEFORE UPDATE ON soraspace.resources
 FOR EACH ROW EXECUTE FUNCTION soraspace.advance_resource_version();

CREATE TABLE soraspace.audit_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 workspace_id uuid NOT NULL REFERENCES soraspace.workspaces(id),
 resource_id uuid NOT NULL,
 actor_account_id text,
 action text NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
 resource_version integer NOT NULL,
 occurred_at timestamptz NOT NULL DEFAULT statement_timestamp()
);
ALTER TABLE soraspace.audit_events ENABLE ROW LEVEL SECURITY;
-- No runtime policies: deny even if an accidental table grant is added later.
-- Append in the same transaction; no titles, content, credentials or filenames.
-- No runtime SELECT/UPDATE/DELETE grant on audit rows. Support access is NOT built.
CREATE FUNCTION soraspace.audit_resource() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
 SET search_path=pg_catalog AS $$
 BEGIN
 IF TG_OP='DELETE' THEN
 INSERT INTO soraspace.audit_events(workspace_id,resource_id,actor_account_id,action,resource_version)
 VALUES(OLD.workspace_id,OLD.id,soraspace.current_account_id(),TG_OP,OLD.version);
 RETURN OLD;
 ELSE
 INSERT INTO soraspace.audit_events(workspace_id,resource_id,actor_account_id,action,resource_version)
 VALUES(NEW.workspace_id,NEW.id,soraspace.current_account_id(),TG_OP,NEW.version);
 RETURN NEW;
 END IF;
 END
$$;
CREATE TRIGGER resource_audit AFTER INSERT OR UPDATE OR DELETE ON soraspace.resources
 FOR EACH ROW EXECUTE FUNCTION soraspace.audit_resource();

GRANT USAGE ON SCHEMA soraspace TO soraspace_runtime;
GRANT EXECUTE ON FUNCTION soraspace.current_account_id(),soraspace.current_workspace_id(),soraspace.membership_role(uuid) TO soraspace_runtime;
GRANT SELECT ON soraspace.workspaces,soraspace.memberships,soraspace.resources TO soraspace_runtime;
GRANT INSERT(workspace_id,id,owner_account_id,resource_type,visibility,title,body) ON soraspace.resources TO soraspace_runtime;
GRANT UPDATE(title,body,visibility) ON soraspace.resources TO soraspace_runtime;
GRANT DELETE ON soraspace.resources TO soraspace_runtime;
COMMIT;
