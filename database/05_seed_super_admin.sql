-- ===============================================================
-- 10. FONCTIONS DE BOOTSTRAP SUPER ADMIN
-- ===============================================================

-- Fonction pour s'auto-promouvoir super_admin (Sécurisée par email)
-- NOTE: Remplacez l'email par le vôtre si nécessaire.
CREATE OR REPLACE FUNCTION bootstrap_super_admin()
RETURNS void AS $$
BEGIN
    -- Seul l'email du créateur peut s'auto-promouvoir via cette fonction
    IF (SELECT email FROM auth.users WHERE id = auth.uid()) = 'piushononta05@gmail.com' THEN
        UPDATE user_profiles 
        SET role = 'super_admin' 
        WHERE id = auth.uid();
    ELSE
        RAISE EXCEPTION 'Non autorisé : Seul le propriétaire de la plateforme peut utiliser cette fonction.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Pour l'utiliser : SELECT bootstrap_super_admin();
