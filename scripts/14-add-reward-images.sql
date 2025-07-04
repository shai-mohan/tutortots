-- Add image fields to rewards table
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS image_name TEXT;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS image_type TEXT;
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS image_size INTEGER;

-- Update existing rewards with placeholder images
UPDATE rewards SET 
  image_url = '/placeholder.svg?height=200&width=300',
  image_name = 'placeholder.svg',
  image_type = 'image/svg+xml'
WHERE image_url IS NULL;
