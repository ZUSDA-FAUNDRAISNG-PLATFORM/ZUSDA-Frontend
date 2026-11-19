DROP POLICY IF EXISTS "Anyone can submit prayer signup"
  ON public.prayer_signups;

DROP POLICY IF EXISTS "Anyone can register as missionary"
  ON public.missionary_registrations;

DROP POLICY IF EXISTS "Anyone can create donation"
  ON public.donations;
