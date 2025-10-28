-- Add admin role for user serbiyan012@gmail.com
INSERT INTO public.user_roles (user_id, role) 
VALUES ('9dc248f9-59f8-4420-aecd-42497c3afdea', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;