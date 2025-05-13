-- Habilitar la extensión UUID si no está habilitada
create extension if not exists "uuid-ossp";

-- Tabla de perfiles de usuario
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text check (role in ('customer', 'seller', 'admin')) not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Crear políticas de seguridad para perfiles
alter table profiles enable row level security;

create policy "Los perfiles son visibles para todos"
  on profiles for select
  using (true);

create policy "Los usuarios pueden editar su propio perfil"
  on profiles for update
  using (auth.uid() = id);

-- Tabla de tiendas
create table stores (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  logo_url text,
  banner_url text,
  is_verified boolean default false,
  commission_rate numeric default 8.0,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Crear políticas de seguridad para tiendas
alter table stores enable row level security;

create policy "Las tiendas son visibles para todos"
  on stores for select
  using (true);

create policy "Los vendedores pueden editar su propia tienda"
  on stores for update
  using (auth.uid() = owner_id);

create policy "Los vendedores pueden crear su tienda"
  on stores for insert
  with check (auth.uid() = owner_id);

-- Tabla de productos
create table products (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid references stores(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric not null,
  original_price numeric,
  category text not null,
  images jsonb default '[]'::jsonb,
  stock integer not null default 0,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Crear políticas de seguridad para productos
alter table products enable row level security;

create policy "Los productos son visibles para todos"
  on products for select
  using (true);

create policy "Los vendedores pueden editar sus propios productos"
  on products for update
  using (auth.uid() in (
    select owner_id from stores where id = products.store_id
  ));

create policy "Los vendedores pueden crear productos en su tienda"
  on products for insert
  with check (auth.uid() in (
    select owner_id from stores where id = products.store_id
  ));

create policy "Los vendedores pueden eliminar sus propios productos"
  on products for delete
  using (auth.uid() in (
    select owner_id from stores where id = products.store_id
  ));

-- Tabla de carrito
create table carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Crear políticas de seguridad para carrito
alter table carts enable row level security;

create policy "Los usuarios pueden ver su propio carrito"
  on carts for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden crear su propio carrito"
  on carts for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar su propio carrito"
  on carts for update
  using (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar su propio carrito"
  on carts for delete
  using (auth.uid() = user_id);

-- Tabla de items de carrito
create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid references carts(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity integer not null default 1,
  price numeric not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Crear políticas de seguridad para items de carrito
alter table cart_items enable row level security;

create policy "Los usuarios pueden ver sus propios items de carrito"
  on cart_items for select
  using (exists (
    select 1 from carts
    where carts.id = cart_items.cart_id and carts.user_id = auth.uid()
  ));

create policy "Los usuarios pueden crear sus propios items de carrito"
  on cart_items for insert
  with check (exists (
    select 1 from carts
    where carts.id = cart_items.cart_id and carts.user_id = auth.uid()
  ));

create policy "Los usuarios pueden actualizar sus propios items de carrito"
  on cart_items for update
  using (exists (
    select 1 from carts
    where carts.id = cart_items.cart_id and carts.user_id = auth.uid()
  ));

create policy "Los usuarios pueden eliminar sus propios items de carrito"
  on cart_items for delete
  using (exists (
    select 1 from carts
    where carts.id = cart_items.cart_id and carts.user_id = auth.uid()
  ));

-- Tabla de pedidos
create table orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) not null default 'pending',
  total_amount numeric not null,
  commission_amount numeric not null,
  shipping_address jsonb not null,
  payment_intent_id text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Tabla de items de pedido
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  store_id uuid references stores(id) on delete set null,
  product_name text not null,
  product_price numeric not null,
  quantity integer not null,
  created_at timestamp with time zone default now() not null
);

-- Crear políticas de seguridad para pedidos
alter table orders enable row level security;

create policy "Los clientes pueden ver sus propios pedidos"
  on orders for select
  using (auth.uid() = customer_id);

create policy "Los vendedores pueden ver los pedidos de sus productos"
  on orders for select
  using (exists (
    select 1 from order_items oi
    join products p on oi.product_id = p.id
    join stores s on p.store_id = s.id
    where oi.order_id = orders.id and s.owner_id = auth.uid()
  ));

create policy "Los clientes pueden crear pedidos"
  on orders for insert
  with check (auth.uid() = customer_id);

-- Crear políticas de seguridad para items de pedido
alter table order_items enable row level security;

create policy "Los clientes pueden ver sus propios items de pedidos"
  on order_items for select
  using (exists (
    select 1 from orders
    where orders.id = order_items.order_id and orders.customer_id = auth.uid()
  ));

create policy "Los vendedores pueden ver los items de pedidos de sus productos"
  on order_items for select
  using (exists (
    select 1 from products p
    join stores s on p.store_id = s.id
    where order_items.product_id = p.id and s.owner_id = auth.uid()
  ));

create policy "Los clientes pueden crear items de pedidos"
  on order_items for insert
  with check (exists (
    select 1 from orders
    where orders.id = order_items.order_id and orders.customer_id = auth.uid()
  ));

-- Tabla de reseñas de productos
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  customer_id uuid references profiles(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default now() not null
);

-- Crear políticas de seguridad para reseñas
alter table reviews enable row level security;

create policy "Las reseñas son visibles para todos"
  on reviews for select
  using (true);

create policy "Los clientes pueden crear reseñas"
  on reviews for insert
  with check (auth.uid() = customer_id);

create policy "Los clientes pueden editar sus propias reseñas"
  on reviews for update
  using (auth.uid() = customer_id);

create policy "Los clientes pueden eliminar sus propias reseñas"
  on reviews for delete
  using (auth.uid() = customer_id);

-- Crear función para manejar nuevos usuarios
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', coalesce(new.raw_user_meta_data->>'role', 'customer'));
  
  -- Si el usuario es un vendedor, crear automáticamente una tienda
  if (new.raw_user_meta_data->>'role' = 'seller') then
    insert into public.stores (owner_id, name, description)
    values (new.id, new.raw_user_meta_data->>'store_name', new.raw_user_meta_data->>'store_description');
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para nuevos usuarios
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Función para actualizar el timestamp de updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers para actualizar updated_at
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at_column();

create trigger update_stores_updated_at
  before update on stores
  for each row execute procedure update_updated_at_column();

create trigger update_products_updated_at
  before update on products
  for each row execute procedure update_updated_at_column();

create trigger update_orders_updated_at
  before update on orders
  for each row execute procedure update_updated_at_column();

create trigger update_carts_updated_at
  before update on carts
  for each row execute procedure update_updated_at_column();

create trigger update_cart_items_updated_at
  before update on cart_items
  for each row execute procedure update_updated_at_column();
