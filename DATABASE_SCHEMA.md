# WMS Database Schema (Google Sheets)

This document defines the structure of the Google Sheets used as the database for the WMS application.

## 1. Sheet: `Settings`
Global application settings and company information.
- `key`: Setting name (e.g., `company_name`, `logo_url`, `nif`, `rccm`, `currency`)
- `value`: Setting value

## 2. Sheet: `Users`
- `id`: Unique identifier
- `username`: Login name
- `email`: Primary email
- `password_hash`: SHA-256 hashed password
- `role_id`: Link to Roles sheet
- `store_id`: Primary store assigned
- `status`: `ACTIF`, `BLOQUÉ`, `DÉSACTIVÉ`
- `last_login`: Timestamp
- `failed_attempts`: Counter for security lock

## 3. Sheet: `Roles`
- `id`: Unique identifier
- `name`: Role name (Super Admin, Admin, Gérant, Caissier, Comptable)

## 4. Sheet: `Permissions`
Matrix of permissions per role and module.
- `role_id`: ID of the role
- `module`: Name of the module (Vente, Stock, Inventaire, etc.)
- `level`: `NONE`, `READ`, `WRITE`, `FULL`

## 5. Sheet: `Catalogue`
Product information and master data.
- `SKU`: Unique Stock Keeping Unit
- `barcode`: Barcode for scanning
- `designation`: Product name
- `category`: Product category
- `purchase_price`: Cost price
- `sale_price`: Public selling price
- `unit`: Unit of measure
- `stock_min`: Minimum stock level
- `stock_max`: Maximum stock level
- `alert_threshold_percent`: Percentage for low stock alerts
- `has_lots`: Boolean
- `has_series`: Boolean
- `has_expiration`: Boolean

## 6. Sheet: `Stocks`
Real-time stock levels and localization.
- `SKU`: Link to Catalogue
- `site_id`: Location/Site identifier
- `allee`: Row/Aisle
- `colonne`: Column/Bay
- `etagere`: Shelf level
- `physical_stock`: Current quantity on shelf
- `reserved_stock`: Quantity in pending carts
- `available_stock`: Physical - Reserved

## 7. Sheet: `Journal` (Immutable)
Every movement is recorded here.
- `timestamp`: Server-side timestamp
- `user_id`: Performer of the action
- `type`: `RECEPTION`, `VENTE`, `RETOUR`, `CASSE`, `TRANSFERT`, `INVENTAIRE`
- `SKU`: Product affected
- `site_id`: Site affected
- `variation`: Quantity change (+ or -)
- `balance_after`: Resulting physical stock
- `reference`: Document or Ticket reference
- `lot_num`: Lot number if applicable
- `serial_num`: Serial number if applicable
- `expiration_date`: Expiry date if applicable

## 8. Sheet: `Sales`
- `ticket_id`: Format `SITE-CAISSE-AAMMJJ-SEQUENCE`
- `site`: Site ID
- `caisse`: Register ID
- `date`: Sale date
- `customer_id`: Link to Customers
- `user_id`: Seller ID
- `total_ht`: Total without taxes
- `total_tva`: Total VAT amount
- `total_ttc`: Total with taxes
- `payment_method`: `ESPECE`, `MOBILE_MONEY`, `CARTE`, `CREDIT`

## 9. Sheet: `SaleItems`
- `ticket_id`: Link to Sales
- `SKU`: Product ID
- `quantity`: Amount sold
- `unit_price`: Price at time of sale
- `tva_rate`: VAT applied
- `discount_amount`: Reduction applied

## 10. Sheet: `Customers`
- `id`: Unique identifier
- `name`: Customer name
- `email`: Contact email
- `phone`: Contact phone
- `address`: Full address
- `city`: City
- `country`: Country
- `is_special`: Boolean (Special tax/discount rules)
- `tva_rate`: Custom VAT for special clients
- `manual_discount`: Default discount % for special clients

## 11. Sheet: `Promotions`
- `id`: Unique identifier
- `name`: Campaign name
- `type`: `PERCENTAGE`
- `value`: Discount value
- `start_date`: Start timestamp
- `end_date`: End timestamp
- `active`: Boolean
- `product_skus`: Comma-separated SKUs or "ALL"

## 12. Sheet: `Audit` (Immutable)
- `timestamp`: Server time
- `user_id`: Performer
- `ip`: IP address
- `browser`: User agent
- `action`: Description of action
- `old_state`: Previous data (JSON)
- `new_state`: New data (JSON)

## 13. Sheet: `Sessions`
- `email`: User email
- `token`: Session token
- `last_activity`: Timestamp
- `ip`: Original IP

## 14. Sheet: `Suppliers`
- `id`: Unique identifier
- `name`: Supplier name
- `contact_info`: Phone/Email/Address

## 15. Sheet: `Purchases`
- `id`: Unique identifier
- `supplier_id`: Link to Suppliers
- `date`: Purchase date
- `total_amount`: Total cost
- `status`: `PENDING`, `RECEIVED`, `CANCELLED`
