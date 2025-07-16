-- Create a function to update tutor ratings based on feedback
CREATE OR REPLACE FUNCTION update_tutor_rating(tutor_uuid UUID)
RETURNS void AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    rating_count INTEGER;
BEGIN
    -- Calculate average rating and count for the tutor
    SELECT 
        COALESCE(AVG(f.rating), 0),
        COUNT(f.rating)
    INTO avg_rating, rating_count
    FROM feedback f
    INNER JOIN sessions s ON f.session_id = s.id
    WHERE s.tutor_id = tutor_uuid AND f.rating IS NOT NULL;
    
    -- Update the tutor's profile with calculated values
    UPDATE profiles 
    SET 
        rating = avg_rating,
        total_ratings = rating_count,
        updated_at = NOW()
    WHERE id = tutor_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to automatically update tutor ratings when feedback is added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_tutor_rating()
RETURNS TRIGGER AS $$
DECLARE
    tutor_uuid UUID;
BEGIN
    -- Get the tutor_id from the session
    IF TG_OP = 'DELETE' THEN
        SELECT s.tutor_id INTO tutor_uuid
        FROM sessions s
        WHERE s.id = OLD.session_id;
        
        -- Update the tutor's rating
        PERFORM update_tutor_rating(tutor_uuid);
        RETURN OLD;
    ELSE
        SELECT s.tutor_id INTO tutor_uuid
        FROM sessions s
        WHERE s.id = NEW.session_id;
        
        -- Update the tutor's rating
        PERFORM update_tutor_rating(tutor_uuid);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS feedback_rating_update ON feedback;
CREATE TRIGGER feedback_rating_update
    AFTER INSERT OR UPDATE OR DELETE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_tutor_rating();

-- Update all existing tutor ratings based on current feedback
DO $$
DECLARE
    tutor_record RECORD;
BEGIN
    FOR tutor_record IN 
        SELECT DISTINCT id FROM profiles WHERE role = 'tutor'
    LOOP
        PERFORM update_tutor_rating(tutor_record.id);
    END LOOP;
END $$;
