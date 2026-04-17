-- ===============================================================
-- 9. SÉCURITÉ (RLS)
-- ===============================================================

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossier_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizen_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE signalements ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrondissements ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrondissement_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunites ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations_stade ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_stands ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- POLITIQUESuser_profiles (Fix Recursion)
CREATE POLICY "Chef Arrondissement can manage their arrondissement" ON user_profiles FOR ALL USING (
    (get_my_role() = 'ca_admin' AND arrondissement_id = get_my_arrondissement_id()) OR
    is_admin_for_tenant(tenant_id)
);
CREATE POLICY "Super admins can manage all profiles" ON user_profiles FOR ALL USING (
    get_my_role() = 'super_admin'
);
CREATE POLICY "Profiles viewable by owner or staff" ON user_profiles FOR SELECT USING (
    auth.uid() = id OR 
    is_admin_for_tenant(tenant_id) OR
    get_my_role() = 'super_admin'
);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (
    (auth.uid() = id OR auth.uid() IS NULL)
);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- POLITIQUES citizen_profiles
CREATE POLICY "Citizen profiles viewable by owner or staff" ON citizen_profiles FOR SELECT USING (
    auth.uid() = id OR 
    is_admin_for_tenant((SELECT tenant_id FROM user_profiles WHERE id = citizen_profiles.id))
);
CREATE POLICY "Users can insert their own citizen profile" ON citizen_profiles FOR INSERT WITH CHECK (
    (auth.uid() = id OR auth.uid() IS NULL)
);
CREATE POLICY "Users can update their own citizen profile" ON citizen_profiles FOR UPDATE USING (auth.uid() = id);

-- POLITIQUES MARCHÉS
CREATE POLICY "Market stands are viewable by everyone" ON market_stands FOR SELECT USING (true);
CREATE POLICY "Staff can manage stands" ON market_stands FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Users can view their own market registrations" ON market_registrations FOR SELECT USING (auth.uid() = citizen_id);
CREATE POLICY "Users can apply for stands" ON market_registrations FOR INSERT WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Staff can manage market registrations" ON market_registrations FOR ALL USING (is_staff_for_tenant(tenant_id));

-- POLITIQUES FONCIER
CREATE POLICY "Land dossiers are viewable by owner or staff" ON land_dossiers FOR SELECT USING (auth.uid() = citizen_id OR is_staff_for_tenant(tenant_id));
CREATE POLICY "Users can submit land dossiers" ON land_dossiers FOR INSERT WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Staff can manage land dossiers" ON land_dossiers FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Field visits are viewable by staff or dossier owner" ON field_visits FOR SELECT USING (
    is_staff_for_tenant(tenant_id) OR 
    EXISTS (SELECT 1 FROM land_dossiers WHERE id = land_dossier_id AND citizen_id = auth.uid())
);
CREATE POLICY "Staff can manage field visits" ON field_visits FOR ALL USING (is_staff_for_tenant(tenant_id));

-- POLITIQUES TENANTS & SERVICES
CREATE POLICY "Tenants are viewable by everyone" ON tenants FOR SELECT USING (true);
CREATE POLICY "Super admins can manage tenants" ON tenants FOR ALL USING (get_my_role() = 'super_admin');
CREATE POLICY "Public services are viewable by everyone" ON public_services FOR SELECT USING (true);
CREATE POLICY "Super admins can manage public services" ON public_services FOR ALL USING (get_my_role() = 'super_admin');
CREATE POLICY "Tenant services are viewable by everyone" ON tenant_services FOR SELECT USING (true);
CREATE POLICY "Staff can manage tenant services" ON tenant_services FOR ALL USING (is_staff_for_tenant(tenant_id));

-- AUTRES POLITIQUES
CREATE POLICY "Council roles are viewable by everyone" ON council_roles FOR SELECT USING (true);
CREATE POLICY "Council members are viewable by everyone" ON council_members FOR SELECT USING (true);
CREATE POLICY "Arrondissements are viewable by everyone" ON arrondissements FOR SELECT USING (true);
CREATE POLICY "Arrondissement addresses are viewable by everyone" ON arrondissement_addresses FOR SELECT USING (true);
CREATE POLICY "Staff can manage arrondissement addresses" ON arrondissement_addresses FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Locations are viewable by everyone" ON locations FOR SELECT USING (true);
CREATE POLICY "Staff can manage locations" ON locations FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Formulaires are viewable by everyone" ON formulaires FOR SELECT USING (true);
CREATE POLICY "Artisans are viewable by everyone" ON artisans FOR SELECT USING (true);
CREATE POLICY "Opportunites are viewable by everyone" ON opportunites FOR SELECT USING (true);
CREATE POLICY "Agenda events are viewable by everyone" ON agenda_events FOR SELECT USING (true);
CREATE POLICY "Reports are viewable by everyone" ON reports FOR SELECT USING (true);
CREATE POLICY "Partners are viewable by everyone" ON partners FOR SELECT USING (true);
CREATE POLICY "Staff can manage partners" ON partners FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Flash news are viewable by everyone" ON flash_news FOR SELECT USING (true);
CREATE POLICY "Staff can manage flash news" ON flash_news FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Page sections are viewable by everyone" ON page_sections FOR SELECT USING (true);
CREATE POLICY "Polls are viewable by everyone" ON polls FOR SELECT USING (true);
CREATE POLICY "Staff can manage polls" ON polls FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Poll options are viewable by everyone" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Staff can manage poll options" ON poll_options FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Poll votes are viewable by everyone" ON poll_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own votes" ON poll_votes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Dossier history is viewable by owner and staff" ON dossier_history FOR SELECT USING (
    is_staff_for_tenant(tenant_id) OR 
    EXISTS (SELECT 1 FROM dossiers WHERE id = dossier_id AND citizen_id = auth.uid())
);
CREATE POLICY "Citizen documents are viewable by owner and staff" ON citizen_documents FOR SELECT USING (auth.uid() = citizen_id OR is_staff_for_tenant(tenant_id));
CREATE POLICY "Users can manage their own documents" ON citizen_documents FOR ALL USING (auth.uid() = citizen_id);
CREATE POLICY "Notification targets are viewable by recipient" ON notification_targets FOR SELECT USING (auth.uid() = user_id OR is_staff_for_tenant(tenant_id));
CREATE POLICY "Users can update their own notification status" ON notification_targets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "News are viewable by everyone" ON news FOR SELECT USING (true);
CREATE POLICY "Staff can manage news" ON news FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "News comments are viewable by everyone" ON news_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON news_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own comments" ON news_comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "News likes are viewable by everyone" ON news_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON news_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON news_likes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "News bookmarks are viewable by owner" ON news_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can bookmark" ON news_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove bookmarks" ON news_bookmarks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Knowledge base is viewable by everyone" ON knowledge_base FOR SELECT USING (true);
CREATE POLICY "Staff can manage knowledge base" ON knowledge_base FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Users can manage their own subscriptions" ON user_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "AI interactions are private" ON ai_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff can view audit logs" ON audit_logs FOR SELECT USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Users can view their own audiences" ON audiences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert an audience" ON audiences FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can view all audiences for their tenant" ON audiences FOR SELECT USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Users can view their own reservations" ON reservations_stade FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can reserve" ON reservations_stade FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can view all reservations for their tenant" ON reservations_stade FOR SELECT USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Public can verify transport registrations" ON transport_registrations FOR SELECT USING (true);
CREATE POLICY "Users can view their own transport registrations" ON transport_registrations FOR SELECT USING (auth.uid() = citizen_id);
CREATE POLICY "Users can register transport" ON transport_registrations FOR INSERT WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY "Staff can manage transport for their tenant" ON transport_registrations FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Public can view official documents by hash" ON dossiers FOR SELECT USING (true);
CREATE POLICY "Dossiers viewable by owner or staff" ON dossiers FOR SELECT USING (citizen_id = auth.uid() OR is_staff_for_tenant(tenant_id));
CREATE POLICY "Users can create their own dossiers" ON dossiers FOR INSERT WITH CHECK (auth.uid() = citizen_id OR is_staff_for_tenant(tenant_id));
CREATE POLICY "Staff can update dossiers" ON dossiers FOR UPDATE USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Signalements are viewable by owner and staff" ON signalements FOR SELECT USING (citizen_id = auth.uid() OR is_staff_for_tenant(tenant_id));
CREATE POLICY "Anyone can create signalements" ON signalements FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can manage signalements" ON signalements FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Super admins can manage invitations" ON invitations FOR ALL USING (get_my_role() = 'super_admin');
CREATE POLICY "Budget projects are viewable by everyone" ON budget_projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can propose projects" ON budget_projects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage budget projects" ON budget_projects FOR ALL USING (is_staff_for_tenant(tenant_id));
CREATE POLICY "Budget votes are viewable by everyone" ON budget_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON budget_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own votes" ON budget_votes FOR DELETE USING (auth.uid() = user_id);
