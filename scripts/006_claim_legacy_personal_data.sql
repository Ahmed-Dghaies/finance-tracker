-- Migration helper: claim any pre-auth rows for the currently signed-in user.
-- This keeps existing data available after RLS is enabled.

CREATE OR REPLACE FUNCTION claim_legacy_personal_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE expenses SET user_id = current_user_id WHERE user_id IS NULL;
  UPDATE income SET user_id = current_user_id WHERE user_id IS NULL;
  UPDATE investments SET user_id = current_user_id WHERE user_id IS NULL;
  UPDATE investment_contributions SET user_id = current_user_id WHERE user_id IS NULL;
  UPDATE possessions SET user_id = current_user_id WHERE user_id IS NULL;
  UPDATE currency_exchanges SET user_id = current_user_id WHERE user_id IS NULL;
  UPDATE currency_balances SET user_id = current_user_id WHERE user_id IS NULL;
  UPDATE settings SET user_id = current_user_id WHERE user_id IS NULL;
END;
$$;

REVOKE ALL ON FUNCTION claim_legacy_personal_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim_legacy_personal_data() TO authenticated;
