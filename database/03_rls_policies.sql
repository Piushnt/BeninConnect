-- ===============================================================
-- 9. SÉCURITÉ (RLS) - VERSION OPTIMISÉE SANS RÉCURSION
-- ===============================================================

-- Désactivation/Réactivation pour nettoyage propre
DROP POLICY IF EXISTS "Profiles viewable by owner or staff" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Chef Arrondissement can manage their arrondissement" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;

-- 1. USER PROFILES (Cœur du système)
-- On utilise auth.uid() directement sans passer par get_my_role() pour éviter la récursion
CREATE POLICY "Profiles are viewable by owner" ON user_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Staff can view profiles for their tenant" ON user_profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND (role = 'super_admin' OR (role IN ('admin', 'agent', 'ca_admin') AND tenant_id = user_profiles.tenant_id))
    )
);

CREATE POLICY "Super admins can manage everything" ON user_profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "Self-registration" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Self-update" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- 2. TENANTS & SERVICES
CREATE POLICY "Public read access to tenants" ON tenants FOR SELECT USING (true);
CREATE POLICY "Public read access to services" ON public_services FOR SELECT USING (true);
CREATE POLICY "Public read access to tenant services" ON tenant_services FOR SELECT USING (true);

-- 3. POLLS & VOTES (Correction pour les votes citoyens)
CREATE POLICY "Polls are public" ON polls FOR SELECT USING (true);
CREATE POLICY "Poll options are public" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Votes are public for counting" ON poll_votes FOR SELECT USING (true);

CREATE POLICY "Anyone authenticated can vote" ON poll_votes FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM polls WHERE id = poll_id)
);

CREATE POLICY "Users can manage their own votes" ON poll_votes FOR DELETE USING (auth.uid() = user_id);

-- 4. DOSSIERS & DOCUMENTS
CREATE POLICY "Anyone can check dossier status" ON dossiers FOR SELECT USING (true);

CREATE POLICY "Dossier owners can view their files" ON dossiers FOR SELECT USING (citizen_id = auth.uid());
CREATE POLICY "Staff can manage dossiers for their tenant" ON dossiers FOR ALL USING (is_staff_for_tenant(tenant_id));

CREATE POLICY "History is viewable by participants" ON dossier_history FOR SELECT USING (
    is_staff_for_tenant(tenant_id) OR 
    EXISTS (SELECT 1 FROM dossiers WHERE id = dossier_id AND citizen_id = auth.uid())
);

-- 5. NEWS & SOCIAL
CREATE POLICY "News are public" ON news FOR SELECT USING (true);
CREATE POLICY "News comments are public" ON news_comments FOR SELECT USING (true);
CREATE POLICY "News likes are public" ON news_likes FOR SELECT USING (true);

CREATE POLICY "Auth users can engage with news" ON news_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth users can like news" ON news_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. AUDIENCES & RÉSERVATIONS
CREATE POLICY "Users can manage their own audiences" ON audiences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Audience creation" ON audiences FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can manage audiences" ON audiences FOR ALL USING (is_staff_for_tenant(tenant_id));

CREATE POLICY "Users can manage their own reservations" ON reservations_stade FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Staff can manage reservations" ON reservations_stade FOR ALL USING (is_staff_for_tenant(tenant_id));

-- 7. INFRASTRUCTURE & ADMIN
CREATE POLICY "Staff can manage notifications" ON notifications FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Staff can manage partners" ON partners FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Staff can manage arrondissement content" ON arrondissements FOR ALL USING (is_staff_for_tenant(tenant_id));

-- 8. SIGNALEMENTS (Droit d'alerte)
CREATE POLICY "Public can signal" ON signalements FOR INSERT WITH CHECK (true);
CREATE POLICY "Signalements viewable by owner/staff" ON signalements FOR SELECT USING (citizen_id = auth.uid() OR is_staff_for_tenant(tenant_id));
CREATE POLICY "Staff manage signalements" ON signalements FOR UPDATE USING (is_staff_for_tenant(tenant_id));

-- 9. PARAMÈTRES & PRÉFÉRENCES
CREATE POLICY "Self-subscription management" ON user_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Staff view subscriptions" ON user_subscriptions FOR SELECT USING (is_staff_for_tenant(tenant_id));

-- Application globale de l'ENABLE RLS (juste au cas où)
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public') LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;
