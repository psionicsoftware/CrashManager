SET local check_function_bodies = off;

CREATE TABLE "public"."audit_logs" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"        uuid,
  "action_type"    text                     NOT NULL,
  "entity_type"    text                     NOT NULL,
  "entity_id"      uuid,
  "payload_before" jsonb,
  "payload_after"  jsonb,
  "created_at"     timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."audit_logs"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."direct_sales" (
  "id"                  uuid          NOT NULL DEFAULT gen_random_uuid(),
  "ticket_number"       text          NOT NULL,
  "product_id"          uuid          NOT NULL,
  "quantity"            integer       NOT NULL,
  "unit_price_snapshot" numeric(12,2) NOT NULL,
  "total_amount"        numeric(12,2) GENERATED ALWAYS AS (round(((quantity)::numeric * unit_price_snapshot), 2)) STORED,
  CONSTRAINT "direct_sales_pkey" PRIMARY KEY (id),
  CONSTRAINT "direct_sales_quantity_check" CHECK ((quantity > 0)),
  CONSTRAINT "direct_sales_unit_price_snapshot_check" CHECK ((unit_price_snapshot >= (0)::numeric))
);

ALTER TABLE "public"."direct_sales"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."products" (
  "id"          uuid NOT NULL DEFAULT gen_random_uuid(),
  "supplier_id" uuid,
  "name"        text NOT NULL,
  "description" text,
  CONSTRAINT "products_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."products"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profiles" (
  "id"           uuid NOT NULL,
  "full_name"    text NOT NULL,
  "cashier_code" text,
  CONSTRAINT "profiles_cashier_code_key" UNIQUE (cashier_code),
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."reservations" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "table_id"         uuid                     NOT NULL,
  "customer_name"    text                     NOT NULL,
  "customer_phone"   text,
  "players_count"    integer                  NOT NULL DEFAULT 2,
  "reserved_for"     timestamp with time zone NOT NULL,
  "duration_minutes" integer                  NOT NULL DEFAULT 60,
  CONSTRAINT "reservations_duration_minutes_check" CHECK ((duration_minutes > 0)),
  CONSTRAINT "reservations_pkey" PRIMARY KEY (id),
  CONSTRAINT "reservations_players_count_check" CHECK (((players_count >= 1) AND (players_count <= 4)))
);

ALTER TABLE "public"."reservations"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."session_items" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "session_id"          uuid                     NOT NULL,
  "ticket_number"       text                     NOT NULL,
  "product_id"          uuid                     NOT NULL,
  "quantity"            integer                  NOT NULL,
  "unit_price_snapshot" numeric(12,2)            NOT NULL,
  "subtotal"            numeric(12,2)            GENERATED ALWAYS AS (round(((quantity)::numeric * unit_price_snapshot), 2)) STORED,
  "notes"               text,
  "served_by_user_id"   uuid                     NOT NULL,
  "served_at"           timestamp with time zone NOT NULL DEFAULT now(),
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "session_items_pkey" PRIMARY KEY (id),
  CONSTRAINT "session_items_quantity_check" CHECK ((quantity > 0)),
  CONSTRAINT "session_items_unit_price_snapshot_check" CHECK ((unit_price_snapshot >= (0)::numeric))
);

ALTER TABLE "public"."session_items"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."session_players" (
  "id"                uuid          NOT NULL DEFAULT gen_random_uuid(),
  "session_id"        uuid          NOT NULL,
  "player_slot"       integer       NOT NULL,
  "player_name"       text          NOT NULL,
  "is_primary_holder" boolean       NOT NULL DEFAULT false,
  "phone_number"      text,
  "split_amount"      numeric(12,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT "session_players_pkey" PRIMARY KEY (id),
  CONSTRAINT "session_players_player_slot_check" CHECK (((player_slot >= 1) AND (player_slot <= 4))),
  CONSTRAINT "session_players_split_amount_check" CHECK ((split_amount >= (0)::numeric)),
  CONSTRAINT "uq_session_player_slot" UNIQUE (session_id, player_slot)
);

ALTER TABLE "public"."session_players"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."stock_movements" (
  "id"         uuid NOT NULL DEFAULT gen_random_uuid(),
  "product_id" uuid NOT NULL,
  "user_id"    uuid,
  CONSTRAINT "stock_movements_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."stock_movements"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."suppliers" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"       text                     NOT NULL,
  "category"   text,
  "email"      text,
  "cellphone"  text,
  "is_active"  boolean                  NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "suppliers_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."suppliers"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."system_settings" (
  "id"                            integer                  NOT NULL DEFAULT 1,
  "default_hourly_rate"           numeric(12,2)            NOT NULL DEFAULT 7000.00,
  "overtime_step_minutes"         integer                  NOT NULL DEFAULT 5,
  "overtime_step_rate"            numeric(12,2)            NOT NULL DEFAULT 1000.00,
  "warning_threshold_minutes"     integer                  NOT NULL DEFAULT 5,
  "reservation_tolerance_minutes" integer                  NOT NULL DEFAULT 15,
  "created_at"                    timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"                    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "system_settings_default_hourly_rate_check" CHECK ((default_hourly_rate >= (0)::numeric)),
  CONSTRAINT "system_settings_id_check" CHECK ((id = 1)),
  CONSTRAINT "system_settings_overtime_step_minutes_check" CHECK ((overtime_step_minutes > 0)),
  CONSTRAINT "system_settings_overtime_step_rate_check" CHECK ((overtime_step_rate >= (0)::numeric)),
  CONSTRAINT "system_settings_pkey" PRIMARY KEY (id),
  CONSTRAINT "system_settings_reservation_tolerance_minutes_check" CHECK ((reservation_tolerance_minutes >= 0)),
  CONSTRAINT "system_settings_warning_threshold_minutes_check" CHECK ((warning_threshold_minutes >= 0))
);

ALTER TABLE "public"."system_settings"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."table_sessions" (
  "id"                   uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "table_id"             uuid                     NOT NULL,
  "opened_by_user_id"    uuid                     NOT NULL,
  "closed_by_user_id"    uuid,
  "started_at"           timestamp with time zone NOT NULL DEFAULT now(),
  "expected_end_at"      timestamp with time zone NOT NULL,
  "paused_at"            timestamp with time zone,
  "total_paused_seconds" integer                  NOT NULL DEFAULT 0,
  "actual_ended_at"      timestamp with time zone,
  "contracted_minutes"   integer                  NOT NULL DEFAULT 60,
  "hourly_rate_snapshot" numeric(12,2)            NOT NULL DEFAULT 7000.00,
  "overtime_amount"      numeric(12,2)            NOT NULL DEFAULT 0.00,
  "discount_amount"      numeric(12,2)            NOT NULL DEFAULT 0.00,
  "total_amount"         numeric(12,2)            NOT NULL DEFAULT 0.00,
  CONSTRAINT "table_sessions_contracted_minutes_check" CHECK ((contracted_minutes > 0)),
  CONSTRAINT "table_sessions_discount_amount_check" CHECK ((discount_amount >= (0)::numeric)),
  CONSTRAINT "table_sessions_hourly_rate_snapshot_check" CHECK ((hourly_rate_snapshot >= (0)::numeric)),
  CONSTRAINT "table_sessions_overtime_amount_check" CHECK ((overtime_amount >= (0)::numeric)),
  CONSTRAINT "table_sessions_pkey" PRIMARY KEY (id),
  CONSTRAINT "table_sessions_total_amount_check" CHECK ((total_amount >= (0)::numeric)),
  CONSTRAINT "table_sessions_total_paused_seconds_check" CHECK ((total_paused_seconds >= 0))
);

ALTER TABLE "public"."table_sessions"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."tables" (
  "id"           uuid    NOT NULL DEFAULT gen_random_uuid(),
  "table_number" integer NOT NULL,
  "name"         text    NOT NULL,
  CONSTRAINT "tables_pkey" PRIMARY KEY (id),
  CONSTRAINT "tables_table_number_check" CHECK (((table_number >= 1) AND (table_number <= 20))),
  CONSTRAINT "tables_table_number_key" UNIQUE (table_number)
);

ALTER TABLE "public"."tables"
  ENABLE ROW LEVEL SECURITY;

CREATE TYPE "public"."payment_method_type" AS ENUM (
  'EFECTIVO',
  'TRANSFERENCIA'
);

ALTER TABLE "public"."direct_sales"
  ADD COLUMN "payment_method" public.payment_method_type NOT NULL DEFAULT 'EFECTIVO'::public.payment_method_type;

ALTER TABLE "public"."direct_sales"
  ADD COLUMN "sold_by_user_id" uuid NOT NULL;

ALTER TABLE "public"."direct_sales"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."direct_sales"
  ADD COLUMN "updated_at" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."table_sessions"
  ADD COLUMN "payment_method" public.payment_method_type;

CREATE TYPE "public"."player_payment_status" AS ENUM (
  'PENDIENTE',
  'PAGADO'
);

ALTER TABLE "public"."session_players"
  ADD COLUMN "payment_status" public.player_payment_status NOT NULL DEFAULT 'PENDIENTE'::public.player_payment_status;

ALTER TABLE "public"."session_players"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."session_players"
  ADD COLUMN "updated_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."product_category" AS ENUM (
  'BEBIDAS',
  'PICADAS',
  'MINUTAS'
);

ALTER TABLE "public"."products"
  ADD COLUMN "category" public.product_category NOT NULL;

ALTER TABLE "public"."products"
  ADD COLUMN "sale_price" numeric(12,2) NOT NULL;

ALTER TABLE "public"."products"
  ADD COLUMN "cost_price" numeric(12,2) NOT NULL DEFAULT 0.00;

ALTER TABLE "public"."products"
  ADD COLUMN "current_stock" integer NOT NULL DEFAULT 0;

ALTER TABLE "public"."products"
  ADD COLUMN "min_stock" integer NOT NULL DEFAULT 0;

ALTER TABLE "public"."products"
  ADD COLUMN "is_active" boolean NOT NULL DEFAULT true;

ALTER TABLE "public"."products"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."products"
  ADD COLUMN "updated_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."reservation_status" AS ENUM (
  'PENDIENTE',
  'ACTIVA',
  'CUMPLIDA',
  'CANCELADA',
  'EXPIRADA'
);

ALTER TABLE "public"."reservations"
  ADD COLUMN "status" public.reservation_status NOT NULL DEFAULT 'PENDIENTE'::public.reservation_status;

ALTER TABLE "public"."reservations"
  ADD COLUMN "created_by" uuid NOT NULL;

ALTER TABLE "public"."reservations"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."reservations"
  ADD COLUMN "updated_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."session_status" AS ENUM (
  'ACTIVA',
  'PAUSADA',
  'FINALIZADA',
  'CANCELADA'
);

ALTER TABLE "public"."table_sessions"
  ADD COLUMN "status" public.session_status NOT NULL DEFAULT 'ACTIVA'::public.session_status;

ALTER TABLE "public"."table_sessions"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."table_sessions"
  ADD COLUMN "updated_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."stock_movement_type" AS ENUM (
  'VENTA_MESA',
  'VENTA_MOSTRADOR',
  'REPOSICION',
  'AJUSTE'
);

ALTER TABLE "public"."stock_movements"
  ADD COLUMN "movement_type" public.stock_movement_type NOT NULL;

ALTER TABLE "public"."stock_movements"
  ADD COLUMN "quantity_delta" integer NOT NULL;

ALTER TABLE "public"."stock_movements"
  ADD COLUMN "reference_id" uuid;

ALTER TABLE "public"."stock_movements"
  ADD COLUMN "notes" text;

ALTER TABLE "public"."stock_movements"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."table_status" AS ENUM (
  'LIBRE',
  'EN_JUEGO',
  'POR_TERMINAR',
  'CUMPLIDO',
  'RESERVADA',
  'MANTENIMIENTO'
);

ALTER TABLE "public"."tables"
  ADD COLUMN "status" public.table_status NOT NULL DEFAULT 'LIBRE'::public.table_status;

ALTER TABLE "public"."tables"
  ADD COLUMN "custom_hourly_rate" numeric(12,2);

ALTER TABLE "public"."tables"
  ADD COLUMN "maintenance_reason" text;

ALTER TABLE "public"."tables"
  ADD COLUMN "maintenance_est_end" timestamp WITH time zone;

ALTER TABLE "public"."tables"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."tables"
  ADD COLUMN "updated_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE TYPE "public"."user_role" AS ENUM (
  'ADMIN',
  'GERENTE',
  'EMPLEADO'
);

ALTER TABLE "public"."profiles"
  ADD COLUMN "role" public.user_role NOT NULL DEFAULT 'EMPLEADO'::public.user_role;

ALTER TABLE "public"."profiles"
  ADD COLUMN "is_active" boolean NOT NULL DEFAULT true;

ALTER TABLE "public"."profiles"
  ADD COLUMN "created_at" timestamp WITH time zone NOT NULL DEFAULT now();

ALTER TABLE "public"."profiles"
  ADD COLUMN "updated_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.get_my_role()
  RETURNS public.user_role
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
    SELECT role FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_active = true;
$function$;

CREATE OR REPLACE FUNCTION public.guard_table_rate_modification()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
    IF NEW.custom_hourly_rate IS DISTINCT FROM OLD.custom_hourly_rate THEN
        IF public.get_my_role() NOT IN ('ADMIN', 'GERENTE') THEN
            RAISE EXCEPTION 'Solo ADMIN o GERENTE pueden modificar tarifas personalizadas de mesa.';
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_manual_stock_adjustment()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
    IF NEW.movement_type IN ('REPOSICION', 'AJUSTE') THEN
        UPDATE public.products
        SET current_stock = current_stock + NEW.quantity_delta
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'EMPLEADO'
    );
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_sale_stock_deduction()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
DECLARE
    v_current_stock int;
    v_movement_type public.stock_movement_type;
    v_actor_id uuid;
BEGIN
    -- Bloqueo pesimista sobre el producto para evitar race conditions en ventas simultáneas
    SELECT current_stock INTO v_current_stock
    FROM public.products
    WHERE id = NEW.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto % no encontrado', NEW.product_id;
    END IF;

    IF v_current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto % (Disponible: %, Solicitado: %)',
            NEW.product_id, v_current_stock, NEW.quantity;
    END IF;

    -- Descontar stock en catálogo
    UPDATE public.products
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.product_id;

    -- Determinar origen de la venta
    IF TG_TABLE_NAME = 'session_items' THEN
        v_movement_type := 'VENTA_MESA';
        v_actor_id := NEW.served_by_user_id;
    ELSE
        v_movement_type := 'VENTA_MOSTRADOR';
        v_actor_id := NEW.sold_by_user_id;
    END IF;

    -- Registrar movimiento inmutable en el ledger
    INSERT INTO public.stock_movements (
        product_id, user_id, movement_type, quantity_delta, reference_id
    ) VALUES (
        NEW.product_id, v_actor_id, v_movement_type, -NEW.quantity, NEW.id
    );

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_ledger_modification()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
BEGIN
    RAISE EXCEPTION 'Los registros de % son inmutables y no pueden ser modificados ni eliminados.', TG_TABLE_NAME;
END;
$function$;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
  RETURNS event_trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog'
  AS $function$
DECLARE
  cmd record;
  tbl name;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        SELECT c.relname INTO tbl FROM pg_catalog.pg_class c WHERE c.oid = cmd.objid;
        EXECUTE format('alter table if exists %I.%I enable row level security', cmd.schema_name, tbl);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

ALTER TABLE "public"."products"
  ADD CONSTRAINT "products_cost_price_check" CHECK ((cost_price >= (0)::numeric));

ALTER TABLE "public"."products"
  ADD CONSTRAINT "products_current_stock_check" CHECK ((current_stock >= 0));

ALTER TABLE "public"."products"
  ADD CONSTRAINT "products_min_stock_check" CHECK ((min_stock >= 0));

ALTER TABLE "public"."direct_sales"
  ADD CONSTRAINT "direct_sales_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;

ALTER TABLE "public"."products"
  ADD CONSTRAINT "products_sale_price_check" CHECK ((sale_price >= (0)::numeric));

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."audit_logs"
  ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."direct_sales"
  ADD CONSTRAINT "direct_sales_sold_by_user_id_fkey" FOREIGN KEY (sold_by_user_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."reservations"
  ADD CONSTRAINT "reservations_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."session_items"
  ADD CONSTRAINT "session_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;

ALTER TABLE "public"."session_items"
  ADD CONSTRAINT "session_items_served_by_user_id_fkey" FOREIGN KEY (served_by_user_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."stock_movements"
  ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;

ALTER TABLE "public"."stock_movements"
  ADD CONSTRAINT "stock_movements_quantity_delta_check" CHECK ((quantity_delta <> 0));

ALTER TABLE "public"."stock_movements"
  ADD CONSTRAINT "stock_movements_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE "public"."products"
  ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;

ALTER TABLE "public"."table_sessions"
  ADD CONSTRAINT "table_sessions_closed_by_user_id_fkey" FOREIGN KEY (closed_by_user_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."table_sessions"
  ADD CONSTRAINT "table_sessions_opened_by_user_id_fkey" FOREIGN KEY (opened_by_user_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE "public"."session_items"
  ADD CONSTRAINT "session_items_session_id_fkey" FOREIGN KEY (session_id) REFERENCES public.table_sessions(id) ON DELETE CASCADE;

ALTER TABLE "public"."session_players"
  ADD CONSTRAINT "session_players_session_id_fkey" FOREIGN KEY (session_id) REFERENCES public.table_sessions(id) ON DELETE CASCADE;

ALTER TABLE "public"."tables"
  ADD CONSTRAINT "tables_custom_hourly_rate_check" CHECK (((custom_hourly_rate IS NULL) OR (custom_hourly_rate >= (0)::numeric)));

ALTER TABLE "public"."reservations"
  ADD CONSTRAINT "reservations_table_id_fkey" FOREIGN KEY (table_id) REFERENCES public.tables(id) ON DELETE RESTRICT;

ALTER TABLE "public"."table_sessions"
  ADD CONSTRAINT "table_sessions_table_id_fkey" FOREIGN KEY (table_id) REFERENCES public.tables(id) ON DELETE RESTRICT;

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);

CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);

CREATE INDEX idx_direct_sales_created_at ON public.direct_sales USING btree (created_at DESC);

CREATE INDEX idx_direct_sales_product_id ON public.direct_sales USING btree (product_id);

CREATE INDEX idx_direct_sales_sold_by ON public.direct_sales USING btree (sold_by_user_id);

CREATE INDEX idx_products_category_active ON public.products USING btree (category, is_active);

CREATE INDEX idx_products_supplier_id ON public.products USING btree (supplier_id);

CREATE INDEX idx_reservations_created_by ON public.reservations USING btree (created_by);

CREATE INDEX idx_reservations_status_reserved_for ON public.reservations USING btree (status, reserved_for);

CREATE INDEX idx_reservations_table_id ON public.reservations USING btree (table_id);

CREATE INDEX idx_session_items_product_id ON public.session_items USING btree (product_id);

CREATE INDEX idx_session_items_served_by ON public.session_items USING btree (served_by_user_id);

CREATE INDEX idx_session_items_session_id ON public.session_items USING btree (session_id);

CREATE INDEX idx_session_players_session_id ON public.session_players USING btree (session_id);

CREATE INDEX idx_stock_movements_created_at ON public.stock_movements USING btree (created_at DESC);

CREATE INDEX idx_stock_movements_product_id ON public.stock_movements USING btree (product_id);

CREATE INDEX idx_table_sessions_closed_by ON public.table_sessions USING btree (closed_by_user_id);

CREATE INDEX idx_table_sessions_opened_by ON public.table_sessions USING btree (opened_by_user_id);

CREATE INDEX idx_table_sessions_started_at ON public.table_sessions USING btree (started_at DESC);

CREATE INDEX idx_table_sessions_status ON public.table_sessions USING btree (status);

CREATE INDEX idx_table_sessions_table_id ON public.table_sessions USING btree (table_id);

CREATE INDEX idx_tables_status ON public.tables USING btree (status);

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

CREATE TRIGGER trg_audit_logs_immutable
  BEFORE DELETE OR UPDATE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_ledger_modification();

CREATE TRIGGER trg_direct_sales_stock_deduction
  AFTER INSERT ON public.direct_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sale_stock_deduction();

CREATE TRIGGER trg_direct_sales_updated_at
  BEFORE UPDATE ON public.direct_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_session_items_stock_deduction
  AFTER INSERT ON public.session_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sale_stock_deduction();

CREATE TRIGGER trg_session_items_updated_at
  BEFORE UPDATE ON public.session_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_session_players_updated_at
  BEFORE UPDATE ON public.session_players
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_stock_movements_immutable
  BEFORE DELETE OR UPDATE ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_ledger_modification();

CREATE TRIGGER trg_stock_movements_manual_sync
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_manual_stock_adjustment();

CREATE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_table_sessions_updated_at
  BEFORE UPDATE ON public.table_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_guard_table_rate
  BEFORE UPDATE ON public.tables
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_table_rate_modification();

CREATE TRIGGER trg_tables_updated_at
  BEFORE UPDATE ON public.tables
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE POLICY "audit_logs_insert_authenticated" ON "public"."audit_logs"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) OR (( SELECT public.get_my_role() AS get_my_role) = 'ADMIN'::public.user_role)));

CREATE POLICY "audit_logs_select_admin_only" ON "public"."audit_logs"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = 'ADMIN'::public.user_role));

CREATE POLICY "direct_sales_rw_staff" ON "public"."direct_sales"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role, 'EMPLEADO'::public.user_role])))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role, 'EMPLEADO'::public.user_role])));

CREATE POLICY "products_select_staff" ON "public"."products"
  FOR SELECT
  TO "authenticated"
  USING
    (((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])) OR ((( SELECT public.get_my_role() AS get_my_role) =
    'EMPLEADO'::public.user_role) AND (is_active = true))));

CREATE POLICY "products_write_gerente_admin" ON "public"."products"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])));

CREATE POLICY "profiles_delete_admin_only" ON "public"."profiles"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = 'ADMIN'::public.user_role));

CREATE POLICY "profiles_insert_policy" ON "public"."profiles"
  FOR INSERT
  TO "authenticated"
  WITH
    CHECK
    (((( SELECT public.get_my_role() AS get_my_role) = 'ADMIN'::public.user_role) OR ((( SELECT public.get_my_role() AS get_my_role) = 'GERENTE'::public.user_role) AND (role =
    'EMPLEADO'::public.user_role))));

CREATE POLICY "profiles_select_policy" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING (((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])) OR (id = ( SELECT auth.uid() AS uid))));

CREATE POLICY "profiles_update_policy" ON "public"."profiles"
  FOR UPDATE
  TO "authenticated"
  USING
    (((( SELECT public.get_my_role() AS get_my_role) = 'ADMIN'::public.user_role) OR ((( SELECT public.get_my_role() AS get_my_role) = 'GERENTE'::public.user_role) AND (ROLE <>
    'ADMIN'::public.user_role))))
  WITH
    CHECK
    (((( SELECT public.get_my_role() AS get_my_role) = 'ADMIN'::public.user_role) OR ((( SELECT public.get_my_role() AS get_my_role) = 'GERENTE'::public.user_role) AND (role <>
    'ADMIN'::public.user_role))));

CREATE POLICY "reservations_rw_staff" ON "public"."reservations"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role, 'EMPLEADO'::public.user_role])))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role, 'EMPLEADO'::public.user_role])));

CREATE POLICY "session_items_rw_staff" ON "public"."session_items"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role, 'EMPLEADO'::public.user_role])))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role, 'EMPLEADO'::public.user_role])));

CREATE POLICY "session_players_rw_staff" ON "public"."session_players"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role, 'EMPLEADO'::public.user_role])))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role, 'EMPLEADO'::public.user_role])));

CREATE POLICY "stock_movements_insert_gerente_admin" ON "public"."stock_movements"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])));

CREATE POLICY "stock_movements_select_gerente_admin" ON "public"."stock_movements"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])));

CREATE POLICY "suppliers_rw_gerente_admin" ON "public"."suppliers"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])));

CREATE POLICY "system_settings_read_all_staff" ON "public"."system_settings"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role, 'EMPLEADO'::public.user_role])));

CREATE POLICY "system_settings_write_gerente_admin" ON "public"."system_settings"
  FOR ALL
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])));

CREATE POLICY "table_sessions_delete_admin_only" ON "public"."table_sessions"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = 'ADMIN'::public.user_role));

CREATE POLICY "table_sessions_insert_staff" ON "public"."table_sessions"
  FOR INSERT
  TO "authenticated"
  WITH
    CHECK
    (((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])) OR ((( SELECT public.get_my_role() AS get_my_role) =
    'EMPLEADO'::public.user_role) AND (opened_by_user_id = ( SELECT auth.uid() AS uid)))));

CREATE POLICY "table_sessions_select_policy" ON "public"."table_sessions"
  FOR SELECT
  TO "authenticated"
  USING
    (((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])) OR ((( SELECT public.get_my_role() AS get_my_role) =
    'EMPLEADO'::public.user_role) AND
    ((status = ANY (ARRAY['ACTIVA'::public.session_status, 'PAUSADA'::public.session_status])) OR (opened_by_user_id = ( SELECT auth.uid() AS uid))))));

CREATE POLICY "table_sessions_update_staff" ON "public"."table_sessions"
  FOR UPDATE
  TO "authenticated"
  USING
    (((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])) OR ((( SELECT public.get_my_role() AS get_my_role) =
    'EMPLEADO'::public.user_role) AND (status = ANY (ARRAY['ACTIVA'::public.session_status, 'PAUSADA'::public.session_status])))))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role, 'EMPLEADO'::public.user_role])));

CREATE POLICY "tables_delete_gerente_admin" ON "public"."tables"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])));

CREATE POLICY "tables_insert_gerente_admin" ON "public"."tables"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role])));

CREATE POLICY "tables_select_all_staff" ON "public"."tables"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role, 'EMPLEADO'::public.user_role])));

CREATE POLICY "tables_update_operational_staff" ON "public"."tables"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role, 'EMPLEADO'::public.user_role])))
  WITH CHECK ((( SELECT public.get_my_role() AS get_my_role) = ANY (ARRAY['ADMIN'::public.user_role, 'GERENTE'::public.user_role, 'EMPLEADO'::public.user_role])));

DROP EVENT TRIGGER IF EXISTS "ensure_rls";
CREATE EVENT TRIGGER "ensure_rls"
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION "public"."rls_auto_enable"();

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."reservations";

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."session_items";

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."session_players";

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."table_sessions";

ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."tables";

GRANT EXECUTE ON FUNCTION "public"."get_my_role"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."get_my_role"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_my_role"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."get_my_role"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."guard_table_rate_modification"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."guard_table_rate_modification"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."guard_table_rate_modification"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."guard_table_rate_modification"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_manual_stock_adjustment"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_manual_stock_adjustment"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_manual_stock_adjustment"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_manual_stock_adjustment"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_new_auth_user"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_new_auth_user"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_auth_user"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_auth_user"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_sale_stock_deduction"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_sale_stock_deduction"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_sale_stock_deduction"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_sale_stock_deduction"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."handle_updated_at"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."handle_updated_at"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_updated_at"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_updated_at"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."prevent_ledger_modification"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."prevent_ledger_modification"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."prevent_ledger_modification"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."prevent_ledger_modification"() TO "service_role";

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO PUBLIC, "anon", "authenticated";

REVOKE ALL ON FUNCTION "public"."rls_auto_enable"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO "postgres";

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."audit_logs" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."audit_logs" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."audit_logs" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."audit_logs" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."direct_sales" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."direct_sales" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."direct_sales" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."direct_sales" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."products" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."products" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."products" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."products" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."profiles" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."reservations" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."reservations" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."reservations" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."reservations" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."session_items" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."session_items" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."session_items" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."session_items" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."session_players" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."session_players" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."session_players" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."session_players" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."stock_movements" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."stock_movements" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."stock_movements" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."stock_movements" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."suppliers" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."suppliers" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."suppliers" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."suppliers" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."system_settings" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."system_settings" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."system_settings" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."system_settings" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."table_sessions" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."table_sessions" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."table_sessions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."table_sessions" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tables" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."tables" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tables" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tables" TO "service_role";

