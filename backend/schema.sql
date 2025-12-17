-- Müşteri Firmaları
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  tax_office VARCHAR(100),
  tax_number VARCHAR(20),
  address TEXT,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  logo_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tedarikçi Firmaları
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  tax_office VARCHAR(100),
  tax_number VARCHAR(20),
  address TEXT,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  general_discount DECIMAL(5,2) DEFAULT 0,
  logistics_method VARCHAR(50),
  payment_terms VARCHAR(100),
  delivery_time VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  google_sheet_id VARCHAR(100), -- Veri merkezindeki sheet ID
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Teklif Gönderen Firmalar
CREATE TABLE sender_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  tax_office VARCHAR(100),
  tax_number VARCHAR(20),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  logo_url TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  template_header TEXT,
  template_footer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teklifler
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  version INTEGER DEFAULT 1,
  customer_id UUID REFERENCES customers(id),
  sender_company_id UUID REFERENCES sender_companies(id),
  quote_date DATE NOT NULL,
  validity_period INTEGER DEFAULT 30,
  status VARCHAR(20) DEFAULT 'draft', -- draft, sent, pending, won, lost, cancelled
  total_amount DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'TRY',
  notes TEXT,
  cost_file_url TEXT, -- Maliyet dosyası Google Drive URL
  quote_file_url TEXT, -- Müşteri teklif dosyası Google Drive URL
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Teklif Detayları (Ürünler)
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  line_number INTEGER,
  supplier_id UUID REFERENCES suppliers(id),
  product_code VARCHAR(100),
  product_description TEXT,
  unit VARCHAR(20),
  quantity DECIMAL(10,2) DEFAULT 1,
  list_price DECIMAL(12,2),
  discount_rate DECIMAL(5,2) DEFAULT 0,
  cost_price DECIMAL(12,2), -- Hesaplanan maliyet
  profit_margin DECIMAL(5,2), -- Kar marjı %
  sale_price DECIMAL(12,2), -- Müşteriye sunulan fiyat
  manual_price BOOLEAN DEFAULT FALSE, -- Manuel fiyat girildi mi?
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teklif Versiyonları (Audit Trail)
CREATE TABLE quote_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id),
  version INTEGER,
  change_description TEXT,
  changed_by UUID,
  changed_at TIMESTAMP DEFAULT NOW(),
  snapshot JSONB -- Tüm teklif verisinin snapshot'ı
);

-- Siparişler
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  quote_id UUID REFERENCES quotes(id),
  customer_id UUID REFERENCES customers(id),
  order_date DATE NOT NULL,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, preparing, shipped, delivered
  total_amount DECIMAL(12,2),
  notes TEXT,
  order_file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sipariş Detayları
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  quote_item_id UUID REFERENCES quote_items(id),
  product_code VARCHAR(100),
  product_description TEXT,
  unit VARCHAR(20),
  quantity DECIMAL(10,2),
  unit_price DECIMAL(12,2),
  total_price DECIMAL(12,2),
  delivery_status VARCHAR(20) DEFAULT 'pending', -- pending, partial, delivered
  delivered_quantity DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teslimatlar
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  delivery_date DATE NOT NULL,
  delivery_note_number VARCHAR(50),
  photo_url TEXT,
  signature_note TEXT,
  delivered_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Faturalar
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  invoice_number VARCHAR(50),
  invoice_date DATE,
  total_amount DECIMAL(12,2),
  vat_amount DECIMAL(12,2),
  grand_total DECIMAL(12,2),
  invoice_file_url TEXT,
  export_file_url TEXT, -- Fatura programı için export dosyası
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ürün Liste Güncellemeleri (Log)
CREATE TABLE product_list_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  file_name VARCHAR(255),
  file_type VARCHAR(20),
  upload_date TIMESTAMP DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  records_count INTEGER
);

-- Ürünler (Stok Listesi)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code VARCHAR(100) UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand VARCHAR(100),
  category VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  critical_stock_level INTEGER DEFAULT 5,
  buying_price DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'TRY',
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
