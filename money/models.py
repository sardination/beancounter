from __future__ import unicode_literals

from django.db import models

from userinfo.models import User

# Create your models here.

# TODO: finish a money tracking framework by end of week of 7/7

class Account(models.Model):
    """
    Tracked accounts. This includes bank accounts, investments, cash assets, etc.
    """
    name = models.CharField(
        help_text="Name of this account"
    )
    user = models.ForeignKey(
        User,
        related_name='accounts',
        on_delete=models.CASCADE,
        blank=False
    )

class Movement(models.Model):
    """
    Any type of movement of money. This could be a transaction, a transfer, a deposit, etc.
    """
    source = models.ForeignKey(
        Account,
        related_name='movements_out',
        on_delete=models.SET_NULL,  # possibly replace this with a function that fills the description
        blank=True
    )
    source_description = models.CharField(
        help_text="Description for source esp. when source is None"
    )
    # destination - both source and destination could be within tracked accounts or external (?)
    destination = models.ForeignKey(
        Account,
        related_name='movements_in',
        on_delete=models.SET_NULL,  # possibly replace this with a function that fills the description
        blank=True
    )
    destination_description = models.CharField(
        help_text="Description for destination esp. when destination is None"
    )
    amount = models.DecimalField(
        decimal_places=2
    )

