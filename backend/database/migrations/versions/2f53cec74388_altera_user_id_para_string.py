"""altera_user_id_para_string

Revision ID: 2f53cec74388
Revises: f2121f64ae22
Create Date: 2025-07-08 11:49:44.399887

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2f53cec74388'
down_revision: Union[str, Sequence[str], None] = 'f2121f64ae22'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Cria uma nova tabela com id como String
    op.create_table(
        'users_tmp',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('username', sa.String(), unique=True, nullable=False),
        sa.Column('password', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
    )

    # Copia os dados da tabela antiga (convertendo id para string)
    op.execute("""
        INSERT INTO users_tmp (id, username, password, created_at, updated_at)
        SELECT CAST(id AS TEXT), username, password, created_at, updated_at FROM users
    """)

    # Remove a antiga e renomeia a nova
    op.drop_table('users')
    op.rename_table('users_tmp', 'users')


def downgrade() -> None:
    """Downgrade schema."""
    op.create_table(
        'users_old',
        sa.Column('id', sa.INTEGER(), primary_key=True, nullable=False),
        sa.Column('username', sa.String(), unique=True, nullable=False),
        sa.Column('password', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
    )

    op.execute("""
        INSERT INTO users_old (id, username, password, created_at, updated_at)
        SELECT CAST(id AS INTEGER), username, password, created_at, updated_at FROM users
    """)

    op.drop_table('users')
    op.rename_table('users_old', 'users')
    pass
