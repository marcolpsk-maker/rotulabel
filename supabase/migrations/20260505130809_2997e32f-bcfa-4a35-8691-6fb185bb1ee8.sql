
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Company info (distribuidor / fornecedor data, reusable across labels)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT,
  cnpj TEXT,
  address TEXT,
  sac TEXT,
  responsavel_tecnico TEXT,
  crf TEXT,
  distribuidor TEXT,
  fabricante TEXT,
  website TEXT,
  instagram TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own companies select" ON public.companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own companies insert" ON public.companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own companies update" ON public.companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own companies delete" ON public.companies FOR DELETE USING (auth.uid() = user_id);

-- Label projects
CREATE TABLE public.label_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Novo Rótulo',
  product_type TEXT,
  width_cm NUMERIC NOT NULL DEFAULT 15,
  height_cm NUMERIC NOT NULL DEFAULT 5,
  thumbnail TEXT,
  canvas_data JSONB NOT NULL DEFAULT '{"elements":[]}'::jsonb,
  anvisa_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.label_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own projects select" ON public.label_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own projects insert" ON public.label_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own projects update" ON public.label_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own projects delete" ON public.label_projects FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER companies_updated BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER projects_updated BEFORE UPDATE ON public.label_projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket for uploads (logos / images)
INSERT INTO storage.buckets (id, name, public) VALUES ('label-assets', 'label-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read label-assets" ON storage.objects FOR SELECT USING (bucket_id = 'label-assets');
CREATE POLICY "Auth upload label-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'label-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Owner update label-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'label-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owner delete label-assets" ON storage.objects FOR DELETE USING (bucket_id = 'label-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
