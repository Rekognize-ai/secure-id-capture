-- Update handle_new_user to include badge_number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, badge_number)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'badge_number'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'officer');
  
  RETURN NEW;
END;
$$;