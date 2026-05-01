UPDATE auth.users
SET encrypted_password = crypt('adminn', gen_salt('bf')),
    updated_at = now()
WHERE email = 'leo.arce89@gmail.com';