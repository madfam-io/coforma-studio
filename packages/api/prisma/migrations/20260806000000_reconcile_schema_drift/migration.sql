-- Reconcile schema.prisma with the migration history.
--
-- Everything below was present in schema.prisma but had never been expressed as
-- a migration, so `prisma migrate deploy` produced a database the Prisma client
-- could not query (P2022). Generated with `prisma migrate diff
-- --from-migrations --to-schema-datamodel` and then hand-reviewed:
--
--   * the `ALTER COLUMN "id" DROP DEFAULT` statements the diff also emitted are
--     deliberately NOT included. They only reflect that `@default(uuid())` is
--     client-side while the init migration also set a DB-side
--     uuid_generate_v4() default. Keeping the DB default is harmless (Prisma
--     always supplies the id) and dropping it across 22 tables is a needless
--     production change.
--   * RLS for the new table was added by hand: `prisma migrate diff` never
--     emits policies, and a tenant-scoped table without one is a data-isolation
--     hole. It follows the indirect-scoping pattern already used by
--     cab_membership_policy.

-- CreateEnum
CREATE TYPE "PersonaRole" AS ENUM ('BUYER', 'END_USER', 'CHAMPION', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE "MembershipExitStatus" AS ENUM ('ACTIVE', 'GRADUATED_TO_PAID', 'CHURNED', 'RENEWED');

-- CreateEnum
CREATE TYPE "EngagementCadence" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY');

-- AlterEnum
ALTER TYPE "IntegrationProvider" ADD VALUE 'PHYNDCRM';

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "phyndcrm_tenant_id" TEXT;

-- AlterTable
ALTER TABLE "cabs" ADD COLUMN     "cohort_label" TEXT,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "min_members" INTEGER,
ADD COLUMN     "start_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "cab_memberships" ADD COLUMN     "capacity_score" INTEGER,
ADD COLUMN     "exit_note" TEXT,
ADD COLUMN     "exit_status" "MembershipExitStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "exited_at" TIMESTAMP(3),
ADD COLUMN     "intake_justification" TEXT,
ADD COLUMN     "persona_role" "PersonaRole",
ADD COLUMN     "phyndcrm_contact_id" TEXT,
ADD COLUMN     "phyndcrm_engagement_id" TEXT,
ADD COLUMN     "representativeness_score" INTEGER,
ADD COLUMN     "urgency_score" INTEGER;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "required_roles" JSONB;

-- CreateTable
CREATE TABLE "partnership_agreements" (
    "id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "scope" TEXT NOT NULL,
    "cadence" "EngagementCadence" NOT NULL DEFAULT 'BIWEEKLY',
    "expected_hours_per_month" INTEGER NOT NULL,
    "effective_start" TIMESTAMP(3) NOT NULL,
    "effective_end" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "accepted_by_email" TEXT,
    "notes" TEXT,

    CONSTRAINT "partnership_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partnership_agreements_membership_id_key" ON "partnership_agreements"("membership_id");

-- CreateIndex
CREATE INDEX "partnership_agreements_effective_end_idx" ON "partnership_agreements"("effective_end");

-- CreateIndex
CREATE INDEX "cab_memberships_phyndcrm_contact_id_idx" ON "cab_memberships"("phyndcrm_contact_id");

-- CreateIndex
CREATE INDEX "cab_memberships_cab_id_exit_status_idx" ON "cab_memberships"("cab_id", "exit_status");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_phyndcrm_tenant_id_key" ON "tenants"("phyndcrm_tenant_id");

-- AddForeignKey
ALTER TABLE "partnership_agreements" ADD CONSTRAINT "partnership_agreements_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "cab_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Row-Level Security for the new table.
-- partnership_agreements has no tenant_id of its own; it is scoped through
-- cab_memberships -> cabs.tenant_id, mirroring cab_membership_policy.
ALTER TABLE partnership_agreements ENABLE ROW LEVEL SECURITY;
CREATE POLICY partnership_agreement_policy ON partnership_agreements
    FOR ALL
    USING (
        membership_id IN (
            SELECT id FROM cab_memberships WHERE cab_id IN (
                SELECT id FROM cabs WHERE tenant_id::text = current_setting('app.tenant_id', true)
            )
        )
    );
