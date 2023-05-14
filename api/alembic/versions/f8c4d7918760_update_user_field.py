"""update user field

Revision ID: f8c4d7918760
Revises: 
Create Date: 2023-05-15 03:51:10.976587

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "f8c4d7918760"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "user",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("deleted", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("update_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("username", sa.String(), nullable=True),
        sa.Column("password", sa.String(), nullable=False),
        sa.Column("birthday", sa.Date(), nullable=True),
        sa.Column("create_time", sa.DateTime(), nullable=True),
        sa.Column("last_login", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_username"), "user", ["username"], unique=True)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_user_username"), table_name="user")
    op.drop_table("user")
    # ### end Alembic commands ###