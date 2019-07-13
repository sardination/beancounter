from django.db import models

from userinfo.models import User

# TODO: finish a money tracking framework by end of week of 7/7

class Account(models.Model):
    """
    Tracked accounts. This includes bank accounts, investments, cash assets, etc.
    """
    name = models.CharField(
        max_length=256,
        help_text="Name of this account"
    )
    user = models.ForeignKey(
        User,
        related_name='accounts',
        on_delete=models.CASCADE,
        blank=False
    )
    value = models.DecimalField(
        max_digits=50,
        decimal_places=2,
        help_text="Total amount of money in this account"
    )

class Movement(models.Model):
    """
    Any type of movement of money. This could be a transaction, a transfer, a deposit, etc.
    """
    user = models.ForeignKey(
        User,
        related_name='movements',
        on_delete=models.CASCADE,
        blank=False
    )
    source = models.ForeignKey(
        Account,
        related_name='movements_out',
        on_delete=models.SET_NULL,  # possibly replace this with a function that fills the description
        blank=True,
        null=True
    )
    source_description = models.CharField(
        max_length=512,
        help_text="Description for source esp. when source is None"
    )
    # destination - both source and destination could be within tracked accounts or external (?)
    destination = models.ForeignKey(
        Account,
        related_name='movements_in',
        on_delete=models.SET_NULL,  # possibly replace this with a function that fills the description
        blank=True,
        null=True
    )
    destination_description = models.CharField(
        max_length=512,
        help_text="Description for destination esp. when destination is None"
    )
    amount = models.DecimalField(
        max_digits=30,
        decimal_places=2
    )

