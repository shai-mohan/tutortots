-- Add points field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Create rewards table for available vouchers
CREATE TABLE IF NOT EXISTS rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  brand TEXT NOT NULL,
  value_rm DECIMAL(10,2) NOT NULL,
  points_required INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'transport', 'shopping', 'entertainment', 'education')),
  image_url TEXT,
  terms_conditions TEXT,
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT -1, -- -1 means unlimited
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create points_transactions table to track point earning/spending
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed')),
  points_amount INTEGER NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('tutoring_session', 'reward_redemption', 'bonus', 'admin_adjustment')),
  source_id UUID, -- Can reference sessions table or rewards_redemptions table
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rewards_redemptions table to track voucher redemptions
CREATE TABLE IF NOT EXISTS rewards_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE NOT NULL,
  points_spent INTEGER NOT NULL,
  voucher_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'used', 'expired')) DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON rewards(is_active);
CREATE INDEX IF NOT EXISTS idx_rewards_category ON rewards(category);
CREATE INDEX IF NOT EXISTS idx_rewards_redemptions_user_id ON rewards_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_redemptions_status ON rewards_redemptions(status);

-- Enable RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rewards (public read for active rewards)
CREATE POLICY "Anyone can view active rewards" ON rewards
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage rewards" ON rewards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for points_transactions
CREATE POLICY "Users can view their own transactions" ON points_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert transactions" ON points_transactions
  FOR INSERT WITH CHECK (true); -- Will be handled by functions

CREATE POLICY "Admins can view all transactions" ON points_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for rewards_redemptions
CREATE POLICY "Users can view their own redemptions" ON rewards_redemptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can redeem rewards" ON rewards_redemptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all redemptions" ON rewards_redemptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to award points for completed sessions
CREATE OR REPLACE FUNCTION award_session_points()
RETURNS TRIGGER AS $$
DECLARE
  session_duration INTERVAL;
  points_to_award INTEGER;
  tutor_points INTEGER;
  student_points INTEGER;
BEGIN
  -- Only award points when session is marked as completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Calculate session duration (assuming 1 hour sessions for now)
    -- In a real system, you might want to store actual duration
    session_duration := INTERVAL '1 hour';
    
    -- Award 10 points per hour (standard rate)
    points_to_award := 10;
    
    -- Award points to tutor
    UPDATE profiles 
    SET points = points + points_to_award 
    WHERE id = NEW.tutor_id;
    
    -- Award points to student  
    UPDATE profiles 
    SET points = points + points_to_award 
    WHERE id = NEW.student_id;
    
    -- Record transactions for tutor
    INSERT INTO points_transactions (
      user_id, 
      transaction_type, 
      points_amount, 
      source_type, 
      source_id, 
      description
    ) VALUES (
      NEW.tutor_id,
      'earned',
      points_to_award,
      'tutoring_session',
      NEW.id,
      'Points earned for completing tutoring session: ' || NEW.subject
    );
    
    -- Record transactions for student
    INSERT INTO points_transactions (
      user_id, 
      transaction_type, 
      points_amount, 
      source_type, 
      source_id, 
      description
    ) VALUES (
      NEW.student_id,
      'earned',
      points_to_award,
      'tutoring_session',
      NEW.id,
      'Points earned for attending tutoring session: ' || NEW.subject
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for awarding points
DROP TRIGGER IF EXISTS award_points_on_session_completion ON sessions;
CREATE TRIGGER award_points_on_session_completion
  AFTER UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION award_session_points();

-- Function to generate unique voucher codes
CREATE OR REPLACE FUNCTION generate_voucher_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT COUNT(*) INTO exists_check 
    FROM rewards_redemptions 
    WHERE voucher_code = code;
    
    -- Exit loop if code is unique
    EXIT WHEN exists_check = 0;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to redeem rewards
CREATE OR REPLACE FUNCTION redeem_reward(reward_uuid UUID, user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  reward_record rewards%ROWTYPE;
  user_points INTEGER;
  voucher_code TEXT;
  redemption_id UUID;
  result JSON;
BEGIN
  -- Get reward details
  SELECT * INTO reward_record 
  FROM rewards 
  WHERE id = reward_uuid AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Reward not found or inactive');
  END IF;
  
  -- Check stock
  IF reward_record.stock_quantity = 0 THEN
    RETURN json_build_object('success', false, 'message', 'Reward out of stock');
  END IF;
  
  -- Get user points
  SELECT points INTO user_points 
  FROM profiles 
  WHERE id = user_uuid;
  
  -- Check if user has enough points
  IF user_points < reward_record.points_required THEN
    RETURN json_build_object('success', false, 'message', 'Insufficient points');
  END IF;
  
  -- Generate voucher code
  voucher_code := generate_voucher_code();
  
  -- Create redemption record
  INSERT INTO rewards_redemptions (
    user_id,
    reward_id,
    points_spent,
    voucher_code,
    expires_at
  ) VALUES (
    user_uuid,
    reward_uuid,
    reward_record.points_required,
    voucher_code,
    NOW() + INTERVAL '90 days' -- Vouchers expire in 90 days
  ) RETURNING id INTO redemption_id;
  
  -- Deduct points from user
  UPDATE profiles 
  SET points = points - reward_record.points_required 
  WHERE id = user_uuid;
  
  -- Record transaction
  INSERT INTO points_transactions (
    user_id,
    transaction_type,
    points_amount,
    source_type,
    source_id,
    description
  ) VALUES (
    user_uuid,
    'redeemed',
    -reward_record.points_required,
    'reward_redemption',
    redemption_id,
    'Redeemed: ' || reward_record.title
  );
  
  -- Update stock if not unlimited
  IF reward_record.stock_quantity > 0 THEN
    UPDATE rewards 
    SET stock_quantity = stock_quantity - 1 
    WHERE id = reward_uuid;
  END IF;
  
  -- Return success with voucher code
  result := json_build_object(
    'success', true,
    'voucher_code', voucher_code,
    'expires_at', (NOW() + INTERVAL '90 days')::text,
    'reward_title', reward_record.title
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_rewards_updated_at();
