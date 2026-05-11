/*
  # Create Showroom Management System Tables

  ## Summary
  This migration creates the core tables for a vehicle showroom management system.

  ## New Tables

  ### 1. `inventory`
  Stores all vehicles and trailers in the showroom inventory.
  - `id` (uuid, PK) - Unique identifier
  - `date_added` (text) - Date added in DD/MM/YYYY format
  - `sku` (text, unique) - Stock keeping unit identifier (e.g. VEH-2026-1234)
  - `type` (text) - Type: 'vehicle' or 'trailer'
  - `brand` (text) - Vehicle brand/make
  - `model` (text) - Vehicle model
  - `year` (text) - Year of manufacture
  - `color` (text) - Vehicle color
  - `chassis` (text) - Chassis/frame number
  - `trailer_type` (text) - Trailer type if applicable
  - `source` (text) - Country/region of origin
  - `location` (text) - Current physical location
  - `notes` (text) - Additional notes
  - `image` (text) - Image URL or base64 data
  - `price` (numeric) - Purchase price
  - `shipping` (numeric) - Shipping cost
  - `customs` (numeric) - Customs/import fees
  - `clearance` (numeric) - Clearance fees
  - `maintenance` (numeric) - Maintenance costs
  - `others` (numeric) - Other costs
  - `total_cost` (numeric) - Total cost (sum of all costs)
  - `status` (text) - Status: 'متوفر' (available) or 'مباع' (sold)
  - `created_at` (timestamptz)

  ### 2. `sales`
  Records of all vehicle sales transactions.
  - `id` (uuid, PK)
  - `sku` (text) - SKU of sold item
  - `title` (text) - Vehicle title (brand + model)
  - `cost` (numeric) - Total cost of vehicle
  - `price` (numeric) - Sale price
  - `commission` (numeric) - Salesperson commission
  - `buyer` (text) - Buyer name
  - `seller` (text) - Salesperson name
  - `date` (text) - Sale date DD/MM/YYYY
  - `created_at` (timestamptz)

  ### 3. `treasury`
  General ledger for all financial transactions.
  - `id` (uuid, PK)
  - `date` (text) - Transaction date DD/MM/YYYY
  - `account` (text) - Account name
  - `description` (text) - Transaction description
  - `type` (text) - 'in' (receipt) or 'out' (payment)
  - `amount` (numeric) - Transaction amount
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all three tables
  - Public read/write access policies (no auth required for showroom system)
  - All operations allowed for anon role as this is an internal tool
*/

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_added text NOT NULL DEFAULT '',
  sku text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'vehicle',
  brand text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '',
  chassis text NOT NULL DEFAULT '',
  trailer_type text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  shipping numeric NOT NULL DEFAULT 0,
  customs numeric NOT NULL DEFAULT 0,
  clearance numeric NOT NULL DEFAULT 0,
  maintenance numeric NOT NULL DEFAULT 0,
  others numeric NOT NULL DEFAULT 0,
  total_cost numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'متوفر',
  created_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  cost numeric NOT NULL DEFAULT 0,
  price numeric NOT NULL DEFAULT 0,
  commission numeric NOT NULL DEFAULT 0,
  buyer text NOT NULL DEFAULT '',
  seller text NOT NULL DEFAULT '',
  date text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create treasury table
CREATE TABLE IF NOT EXISTS treasury (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date text NOT NULL DEFAULT '',
  account text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'out',
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_treasury_date ON treasury(date);
CREATE INDEX IF NOT EXISTS idx_treasury_type ON treasury(type);

-- RLS Policies for inventory (anon access for internal tool)
CREATE POLICY "Allow anon read inventory"
  ON inventory FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert inventory"
  ON inventory FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update inventory"
  ON inventory FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete inventory"
  ON inventory FOR DELETE
  TO anon
  USING (true);

-- RLS Policies for sales
CREATE POLICY "Allow anon read sales"
  ON sales FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert sales"
  ON sales FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update sales"
  ON sales FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete sales"
  ON sales FOR DELETE
  TO anon
  USING (true);

-- RLS Policies for treasury
CREATE POLICY "Allow anon read treasury"
  ON treasury FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert treasury"
  ON treasury FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update treasury"
  ON treasury FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete treasury"
  ON treasury FOR DELETE
  TO anon
  USING (true);
