"""Create database

Revision ID: 1.0.0
Revises:
Create Date: 2021-01-23 17:10:48.237807

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1.0.0'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('asset_account',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=50), nullable=False),
    sa.Column('description', sa.String(length=256), nullable=False),
    sa.Column('open_date', sa.Date(), nullable=False),
    sa.Column('close_date', sa.Date(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('balance_sheet_entry',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('entry_type', sa.Enum('liquid_asset', 'fixed_asset', 'liability', name='balancesheetentrytype'), nullable=False),
    sa.Column('value', sa.Integer(), nullable=False),
    sa.Column('description', sa.String(length=512), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('info',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=128), nullable=False),
    sa.Column('value', sa.String(length=128), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('title')
    )
    op.create_table('month_info',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('year', sa.Integer(), nullable=False),
    sa.Column('month', sa.Integer(), nullable=False),
    sa.Column('income', sa.Integer(), nullable=False),
    sa.Column('expenditure', sa.Integer(), nullable=False),
    sa.Column('investment_income', sa.Integer(), nullable=False),
    sa.Column('assets', sa.BigInteger(), nullable=False),
    sa.Column('liabilities', sa.BigInteger(), nullable=False),
    sa.Column('real_hourly_wage', sa.Integer(), nullable=False),
    sa.Column('completed', sa.Boolean(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('year', 'month', name='_month_info_year_month_uc')
    )
    op.create_table('prior_income',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('amount', sa.Integer(), nullable=False),
    sa.Column('description', sa.String(length=512), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('transaction_category',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=30), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('weekly_job_transaction',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('transaction_type', sa.Enum('income', 'expenditure', name='transactiontype'), nullable=False),
    sa.Column('value', sa.Integer(), nullable=False),
    sa.Column('hours', sa.Integer(), nullable=False),
    sa.Column('description', sa.String(length=50), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('category_month',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('month_info_id', sa.Integer(), nullable=False),
    sa.Column('category_id', sa.Integer(), nullable=False),
    sa.Column('fulfilment', sa.Enum('positive', 'negative', 'neutral', name='fulfilmenttype'), nullable=False),
    sa.ForeignKeyConstraint(['category_id'], ['transaction_category.id'], ),
    sa.ForeignKeyConstraint(['month_info_id'], ['month_info.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('month_info_id', 'category_id', name='_month_category_uc')
    )
    op.create_table('investment_income',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('month_info_id', sa.Integer(), nullable=False),
    sa.Column('investment_income_type', sa.Enum('interest', 'dividend', 'capital_gain', 'rent', 'royalty', name='investmentincometype'), nullable=False),
    sa.Column('value', sa.Integer(), nullable=False),
    sa.Column('description', sa.String(length=50), nullable=False),
    sa.Column('date', sa.Date(), nullable=True),
    sa.ForeignKeyConstraint(['month_info_id'], ['month_info.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('month_asset_account_entry',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('month_info_id', sa.Integer(), nullable=False),
    sa.Column('asset_account_id', sa.Integer(), nullable=False),
    sa.Column('asset_value', sa.BigInteger(), nullable=False),
    sa.Column('liability_value', sa.BigInteger(), nullable=False),
    sa.ForeignKeyConstraint(['asset_account_id'], ['asset_account.id'], ),
    sa.ForeignKeyConstraint(['month_info_id'], ['month_info.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('month_info_id', 'asset_account_id', name='_month_assetaccount_uc')
    )
    op.create_table('month_reflection',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('month_info_id', sa.Integer(), nullable=False),
    sa.Column('q_living_dying', sa.String(length=1024), nullable=True),
    sa.Column('q_employment_purpose', sa.String(length=1024), nullable=True),
    sa.Column('q_spending_evaluation', sa.String(length=1024), nullable=True),
    sa.ForeignKeyConstraint(['month_info_id'], ['month_info.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('month_info_id')
    )
    op.create_table('transaction',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('transaction_type', sa.Enum('income', 'expenditure', name='transactiontype'), nullable=False),
    sa.Column('value', sa.Integer(), nullable=False),
    sa.Column('description', sa.String(length=512), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('category_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['category_id'], ['transaction_category.id'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('transaction')
    op.drop_table('month_reflection')
    op.drop_table('month_asset_account_entry')
    op.drop_table('investment_income')
    op.drop_table('category_month')
    op.drop_table('weekly_job_transaction')
    op.drop_table('transaction_category')
    op.drop_table('prior_income')
    op.drop_table('month_info')
    op.drop_table('info')
    op.drop_table('balance_sheet_entry')
    op.drop_table('asset_account')
