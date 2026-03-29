"""Initial schema with all tables

Revision ID: 001
Revises: 
Create Date: 2026-03-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Profiles table (Clerk user sync)
    op.create_table(
        'profiles',
        sa.Column('id', sa.String(255), primary_key=True),
        sa.Column('username', sa.String(100), unique=True, nullable=False),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('full_name', sa.String(255)),
        sa.Column('avatar_url', sa.Text),
        sa.Column('bio', sa.Text),
        sa.Column('website', sa.String(500)),
        sa.Column('role', sa.String(20), default='buyer'),
        sa.Column('lifetime_sales', sa.Numeric(10, 2), default=0.0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_profiles_username', 'profiles', ['username'])
    op.create_index('ix_profiles_email', 'profiles', ['email'])

    # Categories table
    op.create_table(
        'categories',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(100), unique=True, nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('slug', sa.String(100), unique=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_categories_name', 'categories', ['name'])
    op.create_index('ix_categories_slug', 'categories', ['slug'])

    # Products table
    op.create_table(
        'products',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('category_id', sa.String(36), sa.ForeignKey('categories.id', ondelete='SET NULL')),
        sa.Column('seller_id', sa.String(255), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(20), default='draft'),
        sa.Column('product_type', sa.String(20), default='digital_download'),
        sa.Column('image_url', sa.Text),
        sa.Column('sales_count', sa.Integer, default=0),
        sa.Column('view_count', sa.Integer, default=0),
        sa.Column('lemon_squeezy_product_id', sa.String(255)),
        sa.Column('lemon_squeezy_url', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_products_title', 'products', ['title'])
    op.create_index('ix_products_seller_id', 'products', ['seller_id'])
    op.create_index('ix_products_status', 'products', ['status'])

    # Product images table
    op.create_table(
        'product_images',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('product_id', sa.String(36), sa.ForeignKey('products.id', ondelete='CASCADE'), nullable=False),
        sa.Column('storage_path', sa.Text, nullable=False),
        sa.Column('display_order', sa.Integer, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_product_images_product_id', 'product_images', ['product_id'])

    # Carts table
    op.create_table(
        'carts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('profiles.id', ondelete='CASCADE')),
        sa.Column('session_id', sa.String(255)),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_carts_user_id', 'carts', ['user_id'])
    op.create_index('ix_carts_session_id', 'carts', ['session_id'])

    # Cart items table
    op.create_table(
        'cart_items',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('cart_id', sa.String(36), sa.ForeignKey('carts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('product_id', sa.String(36), sa.ForeignKey('products.id', ondelete='CASCADE'), nullable=False),
        sa.Column('quantity', sa.Integer, default=1),
        sa.Column('price_at_add', sa.Numeric(10, 2), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_cart_items_cart_id', 'cart_items', ['cart_id'])
    op.create_index('ix_cart_items_product_id', 'cart_items', ['product_id'])

    # Messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('sender_id', sa.String(255), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('recipient_id', sa.String(255), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('product_id', sa.String(36), sa.ForeignKey('products.id', ondelete='SET NULL')),
        sa.Column('is_read', sa.Boolean, default=False),
        sa.Column('read_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_messages_sender_id', 'messages', ['sender_id'])
    op.create_index('ix_messages_recipient_id', 'messages', ['recipient_id'])
    op.create_index('ix_messages_is_read', 'messages', ['is_read'])

    # Purchases table
    op.create_table(
        'purchases',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('product_id', sa.String(36), sa.ForeignKey('products.id', ondelete='SET NULL')),
        sa.Column('buyer_id', sa.String(255), sa.ForeignKey('profiles.id', ondelete='SET NULL')),
        sa.Column('seller_id', sa.String(255), sa.ForeignKey('profiles.id', ondelete='SET NULL')),
        sa.Column('transaction_id', sa.String(255), unique=True, nullable=False),
        sa.Column('order_id', sa.String(255), nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), default='USD'),
        sa.Column('platform_fee', sa.Numeric(10, 2), nullable=False),
        sa.Column('processing_fee', sa.Numeric(10, 2), nullable=False),
        sa.Column('seller_payout', sa.Numeric(10, 2), nullable=False),
        sa.Column('status', sa.String(20), default='completed'),
        sa.Column('refunded_at', sa.DateTime(timezone=True)),
        sa.Column('refund_amount', sa.Numeric(10, 2)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_purchases_product_id', 'purchases', ['product_id'])
    op.create_index('ix_purchases_buyer_id', 'purchases', ['buyer_id'])
    op.create_index('ix_purchases_seller_id', 'purchases', ['seller_id'])
    op.create_index('ix_purchases_status', 'purchases', ['status'])

    # Reviews table
    op.create_table(
        'reviews',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('product_id', sa.String(36), sa.ForeignKey('products.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('purchase_id', sa.String(36), sa.ForeignKey('purchases.id', ondelete='SET NULL')),
        sa.Column('rating', sa.Integer, nullable=False),
        sa.Column('title', sa.String(255)),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('status', sa.String(20), default='pending'),
        sa.Column('helpful_count', sa.Integer, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_reviews_product_id', 'reviews', ['product_id'])
    op.create_index('ix_reviews_user_id', 'reviews', ['user_id'])
    op.create_index('ix_reviews_status', 'reviews', ['status'])

    # Analytics events table
    op.create_table(
        'analytics_events',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('profiles.id', ondelete='SET NULL')),
        sa.Column('session_id', sa.String(255)),
        sa.Column('product_id', sa.String(36), sa.ForeignKey('products.id', ondelete='SET NULL')),
        sa.Column('seller_id', sa.String(255)),
        sa.Column('metadata', sa.JSON),
        sa.Column('ip_address', sa.String(45)),
        sa.Column('user_agent', sa.Text),
        sa.Column('referrer', sa.Text),
    )
    op.create_index('ix_analytics_events_event_type', 'analytics_events', ['event_type'])
    op.create_index('ix_analytics_events_created_at', 'analytics_events', ['created_at'])
    op.create_index('ix_analytics_events_user_id', 'analytics_events', ['user_id'])
    op.create_index('ix_analytics_events_product_id', 'analytics_events', ['product_id'])
    op.create_index('ix_analytics_events_seller_id', 'analytics_events', ['seller_id'])
    op.create_index('ix_analytics_events_session_id', 'analytics_events', ['session_id'])

    # Notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(255), sa.ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('message', sa.Text, nullable=False),
        sa.Column('data', sa.JSON),
        sa.Column('read', sa.Boolean, default=False),
        sa.Column('read_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_notifications_read', 'notifications', ['read'])


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('analytics_events')
    op.drop_table('reviews')
    op.drop_table('purchases')
    op.drop_table('messages')
    op.drop_table('cart_items')
    op.drop_table('carts')
    op.drop_table('product_images')
    op.drop_table('products')
    op.drop_table('categories')
    op.drop_table('profiles')
