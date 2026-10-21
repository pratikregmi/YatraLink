"""add provider profiles

Revision ID: 0002_add_provider_profiles
Revises: 0001_create_users
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = '0002_add_provider_profiles'
down_revision: str | None = '0001_create_users'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


user_role_enum = sa.Enum(
    'TOURIST',
    'LOCAL_GUIDE',
    'PROVIDER',
    name='userrole',
    native_enum=False,
    create_constraint=True,
)
provider_category_enum = sa.Enum(
    'guide',
    'sherpa',
    'trekking_guide',
    'porter',
    'driver',
    name='providercategory',
    native_enum=False,
    create_constraint=True,
)


def upgrade() -> None:
    with op.batch_alter_table('users', recreate='always') as batch_op:
        batch_op.alter_column(
            'role',
            existing_type=sa.String(length=20),
            type_=user_role_enum,
            existing_nullable=False,
            existing_server_default=sa.text("'TOURIST'"),
        )

    op.create_table(
        'providers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('category', provider_category_enum, nullable=False),
        sa.Column('bio', sa.Text(), nullable=False),
        sa.Column('years_experience', sa.Integer(), nullable=False),
        sa.Column('daily_rate', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id'),
    )
    op.create_index('ix_providers_id', 'providers', ['id'], unique=False)
    op.create_index('ix_providers_user_id', 'providers', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_providers_user_id', table_name='providers')
    op.drop_index('ix_providers_id', table_name='providers')
    op.drop_table('providers')

    with op.batch_alter_table('users', recreate='always') as batch_op:
        batch_op.alter_column(
            'role',
            existing_type=user_role_enum,
            type_=sa.String(length=20),
            existing_nullable=False,
            existing_server_default=sa.text("'TOURIST'"),
        )
